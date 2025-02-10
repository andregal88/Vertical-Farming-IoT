import time
import random
import mysql.connector
import paho.mqtt.client as mqtt_client
import requests
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS       
from flask import Flask, request, jsonify
import threading
from datetime import datetime


app = Flask(__name__)

# Global variables
selected_shelve_ids = []
data_updates = [] # List of current updated sensor data
current_alerts = []  # List of current alerts
current_maintenance = []  # List of current maintenance records

# Global variable to track if data generation is running
data_generation_running = False


# FIWARE Orion Context Broker configuration
orion_url = "http://150.140.186.118:1026/v2/entities"
fiware_service_path = "/sensorsdata"
entity_type = "environment"
headers = {
    "Content-Type": "application/json",
    "fiware-service": "your_service",
    "fiware-servicepath": fiware_service_path
}

# Global variables to store real-time temperature and humidity
real_temperature = None
real_humidity = None

# MQTT setup
broker = '150.140.186.118'
port = 1883
client_id = 'rand_id' + str(random.random())
input_topic = "Environmental/barani-meteohelix-iot-pro:1"

# Global variable to track last alert time
last_alert_time = time.time()  


# Function to check and create entity in FIWARE
def check_and_create_entity(entity_id, attributes, entity_type):
    # Check if the entity exists by making a GET request
    headers = {'Fiware-ServicePath': fiware_service_path}
    response = requests.get(f"{orion_url}/{entity_id}", headers=headers)

    # If the entity does not exist , create it
    if response.status_code == 404:
        print(f"Entity {entity_id} does not exist. Creating it.")
        # Dynamically build the payload based on the entity type
        entity_payload = {
            "id": entity_id,
            "type": entity_type,
        }

        # Add attributes only if they exist in the provided attributes
        for key, value in attributes.items():
            entity_payload[key] = value

        response = requests.post(f"{orion_url}", headers=headers, json=entity_payload)
        if response.status_code == 201:
            print(f"Entity {entity_id} created successfully.")
        else:
            print(f"Failed to create entity {entity_id}: {response.status_code} - {response.text}")
    elif response.status_code == 200:
        print(f"Entity {entity_id} already exists. Updating it.")
        update_entity(entity_id, attributes)


# Function to update the entity in FIWARE
def update_entity(entity_id, attributes):
    headers = {'Fiware-ServicePath': fiware_service_path}
    response = requests.patch(f"{orion_url}/{entity_id}/attrs", headers=headers, json=attributes)


# Function to send data to FIWARE Orion Context Broker with format Data sent to FIWARE: Sensor ID: {sensor_id}, Sensor Type: {sensor_type}, Value: {value}, Shelve ID: {shelve_id} Status: {status} Alert: {alert_type} 
def send_to_fiware(sensor_id, sensor_type, value, shelve_id,status,alert_type):
    entity_id = f"Sensors_{sensor_id}"
    entity_type = "Sensor"
    attributes = {
        "SensorType": {"type": "Text", "value": sensor_type},
        "Value": {"type": "Number", "value": value},
        "ShelveID": {"type": "Number", "value": shelve_id},
        "Status": {"type": "Text", "value": status},
        "Alert": {"type": "Text", "value": alert_type}
    }

    check_and_create_entity(entity_id, attributes, entity_type)
    update_entity(entity_id, attributes)
    # check if the entity sent / updated successfully in FIWARE
    print(f"Data sent to FIWARE: Sensor ID: {sensor_id}, Sensor Type: {sensor_type}, Value: {value}, Shelve ID: {shelve_id}, Status: {status} , Alert: {alert_type}")
    # check url for the entity in FIWARE
    print(f"Check the entity in FIWARE: {orion_url}/{entity_id}")


def send_alert_to_fiware(sensor_id, alert_type, alert_time):
    # Ensure alert_time is in ISO 8601 format
    try:
        # If alert_time is a string, try converting it to a datetime object first
        if isinstance(alert_time, str):
            alert_time = datetime.strptime(alert_time, "%Y-%m-%d %H:%M:%S")

        # Convert to ISO 8601 format (UTC)
        iso_alert_time = alert_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception as e:
        print(f"Error formatting alert_time: {e}")
        return

    entity_id = f"Alerts_{sensor_id}"
    entity_type = "Alert"
    attributes = {
        "AlertType": {"type": "Text", "value": alert_type},
        "AlertTime": {"type": "DateTime", "value": iso_alert_time}  # Use formatted time
    }

    check_and_create_entity(entity_id, attributes, entity_type)
    update_entity(entity_id, attributes)
    # check if the alert sent / updated successfully in FIWARE
    print(f"Alert sent to FIWARE: Alert : {alert_type} for Sensor ID: {sensor_id} at alert_time : {iso_alert_time}")
    # check url for the entity in FIWARE
    print(f"Check the entity in FIWARE: {orion_url}/{entity_id}")

def send_maintenance_to_fiware(sensor_id, maintenance_type, maintenance_time, review, status):
    # Ensure maintenance_time is in ISO 8601 format
    try:
        # If maintenance_time is a string, try converting it to a datetime object first
        if isinstance(maintenance_time, str):
            maintenance_time = datetime.strptime(maintenance_time, "%Y-%m-%d %H:%M:%S")

        # Convert to ISO 8601 format (UTC)
        iso_maintenance_time = maintenance_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception as e:
        print(f"Error formatting maintenance_time: {e}")
        return

    entity_id = f"Maintenances_{sensor_id}"
    entity_type = "Maintenance"  # Define the entity type
    attributes = {
        "MaintenanceType": {"type": "Text", "value": maintenance_type},
        "MaintenanceTime": {"type": "DateTime", "value": iso_maintenance_time},  # Use formatted time
        "Review": {"type": "Text", "value": review},
        "Status": {"type": "Text", "value": status}
    }

    check_and_create_entity(entity_id, attributes, entity_type)  # Pass entity_type
    update_entity(entity_id, attributes)
    # check if the maintenance data sent / updated successfully in FIWARE
    print(f"Maintenance sent to FIWARE: Maintenance: {maintenance_type} for Sensor ID: {sensor_id} at maintenance_time: {iso_maintenance_time} with review: {review} and status: {status}")
    # check URL for the entity in FIWARE
    print(f"Check the entity in FIWARE: {orion_url}/{entity_id}")


# Database connection function
def connect_db():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234',
            database='test_db'
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

# MQTT on_connect callback
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}\n")

# MQTT on_message callback
def on_message(client, userdata, msg):
    global real_temperature, real_humidity
    try:
        data = msg.payload.decode()
        message = eval(data) 
        real_data = message.get("object", {})
        real_temperature = real_data.get("Temperature")
        real_humidity = real_data.get("Humidity")
        
        if real_temperature is not None and real_humidity is not None:
            print(f"Received Temperature: {real_temperature}°C, Humidity: {real_humidity}%")
    except Exception as e:
        print(f"Failed to process message: {e}")

# Function to start the MQTT client
def start_mqtt():
    client = mqtt_client.Client(client_id)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker, port)
    client.subscribe(input_topic)
    client.loop_start() 

# Function to fetch available shelve_ids from the Shelves table
def fetch_available_shelves():
    connection = connect_db()
    if connection:
        cursor = connection.cursor()
        try:
            cursor.execute("SELECT id, room_id FROM Shelves")  # Query to get all shelves with room_id
            shelves = cursor.fetchall()
            if shelves:
                print("Available Shelves:")
                for i, shelve in enumerate(shelves, 1):
                    print(f"{i}. Shelve ID: {shelve[0]}, Room ID: {shelve[1]}")
                return shelves  
            else:
                print("No shelves found in the database.")
                return []
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return []
        finally:
            cursor.close()
            connection.close()

# Function to update shelve_id in Sensors table
def update_shelve_id_in_sensors(shelve_id):
    connection = connect_db()
    if connection:
        cursor = connection.cursor()
        try:
            cursor.execute(
                "UPDATE Sensors SET shelve_id = %s WHERE shelve_id IS NULL", (shelve_id,)
            )
            connection.commit()
            print(f"Updated sensors with shelve_id={shelve_id}")
        except mysql.connector.Error as err:
            print(f"Database error during shelve_id update: {err}")
        finally:
            cursor.close()
            connection.close()




# Function to create sensors for the selected shelves
def create_sensors_if_not_exists(selected_shelve_ids):
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        # Check if sensors already exist for the selected shelves
        format_strings = ",".join(["%s"] * len(selected_shelve_ids))
        query = f"SELECT id, shelve_id FROM Sensors WHERE shelve_id IN ({format_strings})"
        cursor.execute(query, selected_shelve_ids)
        existing_sensors = cursor.fetchall()

        # Create a set of existing shelve_ids to avoid creating new sensors on existing ones
        existing_shelve_ids = {sensor[1] for sensor in existing_sensors}  

        # Loop through selected shelve_ids and create sensors if they do not already exist
        for shelve_id in selected_shelve_ids:
            if shelve_id not in existing_shelve_ids:
                # Insert new sensors for this shelve_id
                sensor_types = ["Temperature", "Humidity", "CO2", "Light_PAR", "Water_Level", "Nutrients_EC", "pH"]  
                for sensor_type in sensor_types:
                    sensor_name = f"{sensor_type}_sensor_{shelve_id}"
                    sensor_barcode = f"BARCODE-{random.randint(1000, 9999)}"  # Generate a random barcode

                    sensor_status = 1  
                    # Print for debugging
                    print(f"Creating sensor: {sensor_name} for shelve_id={shelve_id} with status={sensor_status}")

                    # Insert new sensor with the appropriate status
                    cursor.execute(
                        "INSERT INTO Sensors (sensorBarcode, name, shelve_id, sensorType, status) "
                        "VALUES (%s, %s, %s, %s, %s)",
                        (sensor_barcode, sensor_name, shelve_id, sensor_type, sensor_status)
                    )

        # Commit the changes
        connection.commit()
        cursor.close()
        connection.close()



# Function to generate fake data for non-real sensors
def generate_fake_data(sensor_type):
    if sensor_type == "CO2":
        return random.uniform(300, 1000)  # CO2 sensor data between 300-1000 ppm
    elif sensor_type == "Light_PAR":
        return random.uniform(0, 1500)  # Light intensity in µmol/m²/s
    elif sensor_type == "Water_Level":
        return random.uniform(0, 100)  # Water level in percentage
    elif sensor_type == "Nutrients_EC":
        return random.uniform(0, 3.0)  # Nutrient concentration in mS/cm
    elif sensor_type == "pH":
        return random.uniform(5.5, 8.0)  # pH value between 5.5 and 8.0
    else:
        return None


# Force generate crazy data for a random number of fake sensors to create alerts
def force_generate_crazy_data(selected_shelve_ids):
    fake_sensors = ["CO2", "Light_PAR", "Water_Level", "Nutrients_EC", "pH"]
    connection = connect_db()

    if connection:
        cursor = connection.cursor()

        # Randomly choose how many sensors will have alerts
        num_alert_sensors = random.randint(1, 5)  
        
        # Randomly select a subset of the fake_sensors
        selected_sensors = random.sample(fake_sensors, num_alert_sensors)

        # Generate alerts for the selected sensors
        for sensor_type in selected_sensors:
            # Fetch sensor_id(s) for the sensor_type and selected_shelve_ids
            format_strings = ",".join(["%s"] * len(selected_shelve_ids))
            query = f"SELECT id FROM Sensors WHERE sensorType = %s AND shelve_id IN ({format_strings})"
            cursor.execute(query, [sensor_type, *selected_shelve_ids])
            sensors = cursor.fetchall()

            if not sensors:
                print(f"No sensors found for type: {sensor_type} in selected shelves.")
                continue

            # Force extreme values to trigger alerts based on the sensor type
            if sensor_type == "CO2":
                value = 1000  # Force a very high CO2 value
                alert_type = "High CO2"
            elif sensor_type == "Light_PAR":
                value = 1500  # Force an extremely high light intensity
                alert_type = "Excessive Light"
            elif sensor_type == "Water_Level":
                value = 5  # Force a very low water level
                alert_type = "Low Water Level"
            elif sensor_type == "Nutrients_EC":
                value = 3.5  # Force a very high Nutrients EC value
                alert_type = "High Nutrients EC"
            elif sensor_type == "pH":
                value = 4.0  # Force an extremely low pH value
                alert_type = "Abnormal pH"

            # Insert alert for each selected sensor of the selected type
            for sensor in sensors:
                sensor_id = sensor[0]  # Use the id from the Sensors table
                print(f"Alert: {alert_type} for {sensor_type} sensor with sensor_id={sensor_id} and value={value}")
    
        cursor.close()
        connection.close()

# Function to update the sensorMaintenance table
def update_sensor_maintenance(sensor_id, alert_type):
        # Determine the status and review based on the alert_type
        if alert_type == "Overheat":
            review = "Overheat detected"
            status = "Critical"
        elif alert_type == "High Humidity":
            review = "High humidity detected"
            status = "Warning"
        elif alert_type == "High CO2":
            review = "High CO2 detected"
            status = "Warning"
        elif alert_type == "Low Water Level":
            review = "Low water level detected"
            status = "Warning"
        elif alert_type == "Excessive Light":
            review = "Excessive light detected"
            status = "Warning"
        elif alert_type == "High Nutrients EC":
            review = "High Nutrients EC detected"
            status = "Warning"
        elif alert_type == "Abnormal pH":
            review = "Abnormal pH detected"
            status = "Critical"
        else:
            review = "Routine check"
            status = "Normal"

        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')




# Function to generate sensor data
def generate_sensor_data(selected_shelve_ids):
    global real_temperature, real_humidity
    global current_alerts, current_maintenance  # Include global variables for tracking
    current_time = time.time()

    # Generate crazy data every 10 seconds for fake sensors to create alerts
    global last_alert_time
    if current_time - last_alert_time >= 10:
        force_generate_crazy_data(selected_shelve_ids)
        last_alert_time = current_time

    connection = connect_db()
    if connection:
        cursor = connection.cursor()
        try:
            # Fetch all sensors belonging to the selected shelves
            format_strings = ",".join(["%s"] * len(selected_shelve_ids))
            query = f"SELECT * FROM Sensors WHERE shelve_id IN ({format_strings})"
            cursor.execute(query, selected_shelve_ids)
            sensors = cursor.fetchall()

            updates = []  # Collect data for updates
            alerts = []   # Collect data for alerts

            for sensor in sensors:
                sensor_id = sensor[0]
                sensor_type = sensor[4]
                shelve_id = sensor[3]  # Get the shelve_id from the Sensors table
                value = None
                alert_type = None
                review = "Routine check"
                status = "Normal"

                # Handle real-time data for temperature and humidity
                if sensor_type == "Temperature":
                    if real_temperature is not None:
                        value = real_temperature
                        if value > 30:  # Overheat threshold
                            alert_type = "Overheat"
                            status = "Critical"
                            review = "Overheat detected"
                    else:
                        value = random.uniform(18, 30)

                elif sensor_type == "Humidity":
                    if real_humidity is not None:
                        value = real_humidity
                        if value > 80:  # High humidity threshold
                            alert_type = "High Humidity"
                            status = "Warning"
                            review = "High humidity detected"
                    else:
                        value = random.uniform(40, 80)

                # Handle other sensor types (fake data)
                else:
                    value = generate_fake_data(sensor_type)
                    if sensor_type == "CO2" and value >= 800:
                        alert_type = "High CO2"
                        review = "High CO2 detected"
                        status = "Warning"
                    elif sensor_type == "Light_PAR" and value >= 1200:
                        alert_type = "Excessive Light"
                        review = "Excessive light detected"
                        status = "Warning"
                    elif sensor_type == "Water_Level" and value < 20:
                        alert_type = "Low Water Level"
                        review = "Low water level detected"
                        status = "Warning"
                    elif sensor_type == "Nutrients_EC" and value > 2.5:
                        alert_type = "High Nutrients EC"
                        review = "High nutrient concentration detected"
                        status = "Warning"
                    elif sensor_type == "pH" and (value < 5.5 or value > 7.5):
                        alert_type = "Abnormal pH"
                        review = "Abnormal pH detected"
                        status = "Critical"

                # Print status for debugging
                print(f"Sensor {sensor_id} ({sensor_type}): Value={value}, Status={status}, Alert={alert_type}")

                # Collect sensor data
                if value is not None:
                    updates.append((sensor_id, value))

                    # Append the data to `data_updates` for fetch request
                    data_updates.append({
                        "sensor_id": sensor_id,
                        "sensor_type": sensor_type,
                        "value": value,
                        "status": status,
                        "alert_type": alert_type,
                        "review": review
                    })

                    # Send the data to FIWARE Orion Context Broker
                    send_to_fiware(sensor_id, sensor_type, value, shelve_id, status, alert_type)


                    # Collect alert data
                    if alert_type:
                        alerts.append((sensor_id, alert_type, review, status))
                        
                        # Add to current_alerts
                        current_alerts.append({
                            "sensor_id": sensor_id,
                            "alert_type": alert_type,
                            "review": review,
                            "status": status,
                            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
                        })
            
            # Perform data updates
            for update in updates:
                sensor_id, value = update

            # Perform alert inserts and maintenance updates
            for alert in alerts:
                sensor_id, alert_type, review, status = alert
                update_sensor_maintenance(sensor_id, alert_type)
                send_alert_to_fiware(sensor_id, alert_type, time.strftime('%Y-%m-%d %H:%M:%S'))
                send_maintenance_to_fiware(sensor_id, alert_type, time.strftime('%Y-%m-%d %H:%M:%S'), review, status)

                # Add to current_maintenance
                current_maintenance.append({
                    "sensor_id": sensor_id,
                    "review": review,
                    "status": status,
                    "datetime_review": time.strftime('%Y-%m-%d %H:%M:%S'),
                    "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
                })

            # For all other sensors, routine checks are inserted
            for sensor in sensors:
                if sensor[0] not in [alert[0] for alert in alerts]:  # Sensors without alerts
                    maintenance_type = "Routine check"
                    update_sensor_maintenance(sensor[0], maintenance_type)
                    send_maintenance_to_fiware(sensor[0], maintenance_type, time.strftime('%Y-%m-%d %H:%M:%S'), "Routine check", "Normal")

        except mysql.connector.Error as err:
            print(f"Database error during sensor fetch: {err}")
        finally:
            cursor.close()
            connection.close()


     
# Function to update shelves
def update_shelve_ids(shelve_ids):
    global selected_shelve_ids
    available_shelves = fetch_available_shelves()
    if isinstance(shelve_ids, list) and "All" in shelve_ids:
        print("Fetching all available shelves...")
        selected_shelve_ids = [shelve[0] for shelve in available_shelves]
    else:
        print(f"Updating shelves to: {shelve_ids}")
        selected_shelve_ids = shelve_ids

    # Ensure sensors exist for the selected shelves
    create_sensors_if_not_exists(selected_shelve_ids)


# Function to continuously generate data 
def start_data_generation():
    global data_generation_running
    data_generation_running = True
    while data_generation_running:
        if selected_shelve_ids:
            generate_sensor_data(selected_shelve_ids)
        time.sleep(5) 

# Endpoint to update shelves
@app.route('/update_shelves', methods=['POST'])
def update_shelves():
    data = request.get_json()
    shelve_ids = data.get("shelve_ids", [])
    if shelve_ids or shelve_ids == 'All':
        update_shelve_ids(shelve_ids)
        return jsonify({"message": "Shelves updated successfully"}), 200
    else:
        return jsonify({"message": "Invalid shelve IDs"}), 400


# Endpoint to start data generation
@app.route('/start_update', methods=['POST'])
def start_update():
    global data_generation_running
    if not data_generation_running:
        # Run the data generation in a separate thread to allow continuous operation
        thread = threading.Thread(target=start_data_generation)
        thread.daemon = True  # Daemon thread will exit when the main program exits
        thread.start()
        return jsonify({"message": "Data generation started"}), 200
    else:
        return jsonify({"message": "Data generation is already running"}), 400

# Endpoint to fetch the data of updated sensors
@app.route('/fetch_data', methods=['GET'])
def fetch_data():
    global data_updates
    
    # Get the sensor_id from the query parameters (if provided)
    sensor_id = request.args.get('sensor_id', type=int)
    
    # If sensor_id is provided, filter the data
    if sensor_id:
        filtered_data = [entry for entry in data_updates if entry['sensor_id'] == sensor_id]
        return jsonify(filtered_data), 200
    
    # If no sensor_id is provided, return all data
    return jsonify(data_updates), 200



@app.route('/fetch_alerts', methods=['GET'])
def fetch_alerts():
    # Get the sensor_id and alert_type from the query parameters (if provided)
    sensor_id = request.args.get('sensor_id', type=int)
    alert_type = request.args.get('alert_type', type=str)

    # Filter the current_alerts based on query parameters
    filtered_alerts = current_alerts
    if sensor_id:
        filtered_alerts = [alert for alert in filtered_alerts if alert['sensor_id'] == sensor_id]
    if alert_type:
        filtered_alerts = [alert for alert in filtered_alerts if alert['alert_type'] == alert_type]

    # Return filtered alerts or a message if no alerts are found
    if filtered_alerts:
        return jsonify(filtered_alerts), 200
    else:
        return jsonify({"message": "No current alerts found"}), 404




@app.route('/fetch_maintenance', methods=['GET'])
def fetch_maintenance():
    # Get the sensor_id and status from the query parameters (if provided)
    sensor_id = request.args.get('sensor_id', type=int)
    status = request.args.get('status', type=str)

    # Filter the current_maintenance records based on query parameters
    filtered_maintenance = current_maintenance
    if sensor_id:
        filtered_maintenance = [record for record in filtered_maintenance if record['sensor_id'] == sensor_id]
    if status:
        filtered_maintenance = [record for record in filtered_maintenance if record['status'] == status]

    # Return filtered maintenance records or a message if no records are found
    if filtered_maintenance:
        return jsonify(filtered_maintenance), 200
    else:
        return jsonify({"message": "No current maintenance records found"}), 404



# Run Flask app
if __name__ == "__main__":
    start_mqtt()
    app.run(host="0.0.0.0", port=5050)
