from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database connection configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'test_db'
}
# Helper function to create a database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# API endpoint to fetch shelves and their latest sensor data for a room

@app.route('/room/<int:room_id>/shelves', methods=['GET'])
def get_room_shelves(room_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)

        # Step 1: Get all shelves for the given room
        cursor.execute("SELECT id AS shelf_id FROM Shelves WHERE room_id = %s", (room_id,))
        shelves = cursor.fetchall()

        if not shelves:
            return jsonify({'message': 'No shelves found for this room'}), 404

        shelf_ids = [shelf['shelf_id'] for shelf in shelves]

        # Step 2: Fetch all sensor data for these shelves, ordered by timestamp (newest first)
        query = """
            SELECT
                s.shelve_id AS shelf_id,
                s.sensorType,
                dh.value AS value,
                dh.timestamp AS timestamp
            FROM Sensors s
            LEFT JOIN dataHistory dh ON s.id = dh.sensor_id
            WHERE s.shelve_id IN (%s)
            ORDER BY s.shelve_id, s.sensorType, dh.timestamp DESC
        """ % (', '.join(['%s'] * len(shelf_ids)))

        cursor.execute(query, shelf_ids)
        sensor_data = cursor.fetchall()

        # Step 3: Structure the response data
        shelves_with_sensors = {shelf['shelf_id']: {'shelf_id': shelf['shelf_id'], 'sensors': {}} for shelf in shelves}

        for sensor in sensor_data:
            shelf_id = sensor['shelf_id']
            sensor_type = sensor['sensorType']

            if shelf_id not in shelves_with_sensors:
                continue

            if sensor_type not in shelves_with_sensors[shelf_id]['sensors']:
                shelves_with_sensors[shelf_id]['sensors'][sensor_type] = []

            # Append the sensor data to the list for that sensor type
            shelves_with_sensors[shelf_id]['sensors'][sensor_type].append({
                'value': sensor['value'],
                'timestamp': sensor['timestamp']
            })

        # Close the cursor and connection
        cursor.close()
        connection.close()

        # Return the response
        return jsonify({
            'room_id': room_id,
            'shelves': list(shelves_with_sensors.values())
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5100)