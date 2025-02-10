import requests
import mysql.connector
from datetime import datetime
import re
import time

# FIWARE Orion Context Broker URL
orion_url = "http://150.140.186.118:1026/v2/entities"
fiware_service_path = "/sensorsdata"

# MySQL Database connection details
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'test_db'
}

# Function to fetch data from FIWARE Orion Context Broker
def fetch_from_fiware(entity_id):
    headers = {
        "fiware-servicepath": fiware_service_path,
    }
    print(f"Fetching data for entity {entity_id}...")
    response = requests.get(f"{orion_url}/{entity_id}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data for entity {entity_id}: {response.status_code}")
        print("Response content:", response.text)  # Print response content for debugging
        return None

# Function to insert sensor data into MySQL
def insert_sensor_data_into_mysql(data, entity_id):
    try:
        sensor_id = int(re.search(r'\d+', entity_id).group())
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()

        insert_query = """
            INSERT INTO dataHistory (sensor_id, value, timestamp)
            VALUES (%s, %s, %s)
        """
  
        value = data.get('Value', {}).get('value', None)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        insert_values = (sensor_id, value, timestamp)

        cursor.execute(insert_query, insert_values)
        connection.commit()

        print(f"Sensor data inserted for {entity_id}.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to insert alert data into MySQL
def insert_alert_data_into_mysql(data, entity_id):
    try:
        sensor_id = int(re.search(r'\d+', entity_id).group())
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()

        insert_query = """
           INSERT INTO Alerts (sensor_id, alertType, alertTime) 
           VALUES (%s, %s, %s)
        """
  
        alert_time = data.get('AlertTime', {}).get('value', None)
        alert_type = data.get('AlertType', {}).get('value', None)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        insert_values = (sensor_id, alert_type, timestamp)

        cursor.execute(insert_query, insert_values)
        connection.commit()

        print(f"Alert data inserted for {entity_id}.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to insert maintenance data into MySQL
def insert_maintenance_data_into_mysql(data, entity_id):
    try:
        sensor_id = int(re.search(r'\d+', entity_id).group())
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()

        insert_query = """
            INSERT INTO sensorMaintenance (sensor_id, review, status, datetime_review, timestamp)
            VALUES (%s, %s, %s, %s, %s)
        """
  
        maintenance_time = data.get('MaintenanceTime', {}).get('value', None)
        maintenance_type = data.get('MaintenanceType', {}).get('value', None)
        review = data.get('Review', {}).get('value', None)
        status = data.get('Status', {}).get('value', None)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        insert_values = (sensor_id, review, status , timestamp, timestamp)

        cursor.execute(insert_query, insert_values)
        connection.commit()

        print(f"Maintenance data inserted for {entity_id}.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to fetch alerts from FIWARE
def fetch_alert_data_from_fiware(entity_id):
    return fetch_from_fiware(entity_id)

# Function to fetch maintenance data from FIWARE
def fetch_maintenance_data_from_fiware(entity_id):
    return fetch_from_fiware(entity_id)

# Function to fetch sensors from the database based on selected shelve IDs
def fetch_sensors_from_db(selected_shelve_ids):
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()

        # Fetch sensors that belong to the selected shelves
        format_strings = ",".join(["%s"] * len(selected_shelve_ids))
        query = f"SELECT * FROM Sensors WHERE shelve_id IN ({format_strings})"
        cursor.execute(query, selected_shelve_ids)
        sensors = cursor.fetchall()

        return sensors  # List of sensor records

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []
    finally:
        # Close the MySQL connection
        if connection.is_connected():
            cursor.close()
            connection.close()



# Function to fetch all shelve IDs from the database
def fetch_all_shelve_ids():
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()

        # Fetch all shelve IDs
        query = "SELECT DISTINCT shelve_id FROM Sensors"
        cursor.execute(query)
        shelve_ids = [row[0] for row in cursor.fetchall()]

        return shelve_ids  # List of shelve IDs

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []
    finally:
        # Close the MySQL connection
        if connection.is_connected():
            cursor.close()
            connection.close()

# Main function to fetch data from FIWARE and insert it into MySQL
def main():
    # Prompt the user to choose between updating all shelves or specific shelves
    choice = input("Do you want to update all shelves? (yes/no): ").strip().lower()

    if choice == 'yes':
        # Fetch all shelve IDs
        selected_shelve_ids = fetch_all_shelve_ids()
    else:
        # List of shelve IDs you want to use to fetch running sensors
        selected_shelve_ids = [1] 

    if not selected_shelve_ids:
        print("No shelves selected or found.")
        return

    while True:
        print("Starting a new fetch and insert cycle...")

        # Fetch the sensors associated with these shelve IDs
        sensors = fetch_sensors_from_db(selected_shelve_ids)
        if sensors:
            for sensor in sensors:
                # Construct the entity_id for the sensor (e.g., 'Sensors_531')
                entity_id = f"Sensors_{sensor[0]}"
                
                # Fetch sensor data from FIWARE and insert into MySQL
                data = fetch_from_fiware(entity_id)
                if data:
                    insert_sensor_data_into_mysql(data, entity_id)
                    
                # Fetch corresponding alert data for the sensor
                alert_entity_id = f"Alerts_{sensor[0]}"  # Construct alert entity_id (e.g., 'Alerts_531')
                alert_data = fetch_alert_data_from_fiware(alert_entity_id)
                if alert_data:
                    insert_alert_data_into_mysql(alert_data, alert_entity_id)
                    
                # Fetch corresponding maintenance data for the sensor
                maintenance_entity_id = f"Maintenances_{sensor[0]}"  # Construct maintenance entity_id (e.g., 'Maintenances_531')
                maintenance_data = fetch_maintenance_data_from_fiware(maintenance_entity_id)
                if maintenance_data:
                    insert_maintenance_data_into_mysql(maintenance_data, maintenance_entity_id)
        else:
            print("No sensors found for the selected shelves.")

        # Wait for a specified period before fetching again (e.g., 10 seconds)
        time.sleep(10)  # Delay in seconds (adjust as needed)

if __name__ == "__main__":
    main()