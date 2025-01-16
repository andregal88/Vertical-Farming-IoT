from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)


def connect_db():
    try:
        connection = mysql.connector.connect(
            host="localhost",  # your DB host, e.g., localhost
            user="root",  # your DB username
            password="1234",  # your DB password
            database="iot_db"  # your DB name
        )
        if connection.is_connected():
            return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None




@app.route('/get_rooms_with_shelves_and_sensors', methods=['GET'])
def get_rooms_with_shelves_and_sensors():
    # Connect to the database
    connection = connect_db()
    if connection:
        cursor = connection.cursor(dictionary=True)  # Use dictionary=True for column names in the result
        
        try:
            # Query to fetch rooms along with their shelves and sensors
            query = """
                SELECT 
                    r.id AS room_id,
                    r.name AS room_name,
                    r.address,
                    r.city,
                    r.roomNumber AS room_number,
                    r.floor,
                    ct.name AS crop_type,
                    u.name AS user_name,
                    s.id AS shelf_id,
                    s.room_id AS shelf_room_id,
                    sn.id AS sensor_id,
                    sn.name AS sensor_name,
                    sn.sensorType AS sensor_type,
                    sn.status AS sensor_status,
                    dh.value AS sensor_value,
                    dh.timestamp AS sensor_value_timestamp
                FROM Rooms r
                JOIN cropType ct ON r.cropType_id = ct.id
                JOIN Users u ON r.user_id = u.id
                LEFT JOIN Shelves s ON s.room_id = r.id
                LEFT JOIN Sensors sn ON sn.shelve_id = s.id
                LEFT JOIN dataHistory dh ON dh.sensor_id = sn.id
                WHERE dh.timestamp = (
                    SELECT MAX(timestamp) FROM dataHistory WHERE sensor_id = sn.id
                )
            """
            cursor.execute(query)
            rows = cursor.fetchall()

            if not rows:
                return jsonify({"message": "No rooms found."}), 404

            # Organize data into rooms with their shelves and sensors
            rooms = {}
            for row in rows:
                room_id = row['room_id']
                
                if room_id not in rooms:
                    rooms[room_id] = {
                        'room_id': room_id,
                        'room_name': row['room_name'],
                        'address': row['address'],
                        'city': row['city'],
                        'room_number': row['room_number'],
                        'floor': row['floor'],
                        'crop_type': row['crop_type'],
                        'user_name': row['user_name'],
                        'shelves': [],
                    }
                
                # Add shelves to the room if not already added
                shelf = None
                if row['shelf_id']:
                    # Check if shelf already exists for this room
                    for existing_shelf in rooms[room_id]['shelves']:
                        if existing_shelf['shelf_id'] == row['shelf_id']:
                            shelf = existing_shelf
                            break
                    
                    # If the shelf does not exist, create a new one
                    if not shelf:
                        shelf = {
                            'shelf_id': row['shelf_id'],
                            'room_id': row['shelf_room_id'],
                            'sensors': []
                        }
                        rooms[room_id]['shelves'].append(shelf)
                
                # Add sensors to the shelf if not already added
                if row['sensor_id']:
                    sensor = {
                        'sensor_id': row['sensor_id'],
                        'name': row['sensor_name'],
                        'sensor_type': row['sensor_type'],
                        'status': row['sensor_status'],
                        'last_value': row['sensor_value'],
                        'last_value_timestamp': row['sensor_value_timestamp']
                    }
                    
                    # Check if sensor is already added to the shelf
                    if sensor not in shelf['sensors']:
                        shelf['sensors'].append(sensor)

            # Convert the dictionary into a list for JSON response
            response_data = list(rooms.values())
            return jsonify({"rooms": response_data}), 200
        
        except mysql.connector.Error as err:
            return jsonify({"message": f"Error: {err}"}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"message": "Failed to connect to the database."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5017)