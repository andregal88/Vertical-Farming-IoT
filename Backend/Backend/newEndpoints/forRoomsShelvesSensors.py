from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def connect_db():
    try:
        connection = mysql.connector.connect(
            host="localhost", 
            user="root", 
            password="1234", 
            database="test_db" 
        )
        if connection.is_connected():
            return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

@app.route('/get_rooms_with_shelves_and_sensors', methods=['GET'])
def get_rooms_with_shelves_and_sensors():
    user_id = request.args.get('user_id')  # Get user_id from request arguments
    user_role = request.args.get('role')  # Get user role from request arguments
    
    print("Request Headers:", request.headers)

    connection = connect_db()
    if connection:
        cursor = connection.cursor(dictionary=True)
        
        try:
            # If user is an Admin, show all rooms, shelves, and sensors
            if user_role == 'Admin':
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
                LEFT JOIN (
                    SELECT sensor_id, value, timestamp
                    FROM dataHistory
                    WHERE (sensor_id, timestamp) IN (
                        SELECT sensor_id, MAX(timestamp)
                        FROM dataHistory
                        GROUP BY sensor_id
                    )
                ) dh ON dh.sensor_id = sn.id;
                """
            else:
                # If the user is not an Admin, filter based on their associated rooms
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
                LEFT JOIN (
                    SELECT sensor_id, value, timestamp
                    FROM dataHistory
                    WHERE (sensor_id, timestamp) IN (
                        SELECT sensor_id, MAX(timestamp)
                        FROM dataHistory
                        GROUP BY sensor_id
                    )
                ) dh ON dh.sensor_id = sn.id
                WHERE r.user_id = %s;  -- Filter by the user_id for non-admin users
                """
            
            cursor.execute(query, (user_id,) if user_role != 'Admin' else ())
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

                # Handle shelves
                shelf = None
                if row['shelf_id']:
                    # Check if shelf already exists for this room
                    for existing_shelf in rooms[room_id]['shelves']:
                        if existing_shelf['shelf_id'] == row['shelf_id']:
                            shelf = existing_shelf
                            break

                    # If shelf doesn't exist, create it
                    if not shelf:
                        shelf = {
                            'shelf_id': row['shelf_id'],
                            'room_id': row['room_id'],
                            'sensors': []
                        }
                        rooms[room_id]['shelves'].append(shelf)
                
                # Add sensor to the shelf
                if row['sensor_id']:
                    sensor = {
                        'sensor_id': row['sensor_id'],
                        'name': row['sensor_name'],
                        'sensor_type': row['sensor_type'],
                        'status': row['sensor_status'],
                        'last_value': row['sensor_value'],
                        'last_value_timestamp': row['sensor_value_timestamp']
                    }

                    # Avoid duplicates: check if sensor is already added
                    if sensor not in shelf['sensors']:
                        shelf['sensors'].append(sensor)

            # Convert the dictionary to the final response format
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
