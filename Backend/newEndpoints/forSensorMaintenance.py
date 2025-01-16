from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'iot_db'
}

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # Corrected query with the latest_value properly included in GROUP BY
        query = """
        SELECT 
            s.id AS sensor_id,
            s.name AS sensor_name,
            s.sensorType AS sensor_type, 
            r.name AS location,
            COALESCE(MAX(sm.timestamp), 'Never') AS last_maintenance,
            -- Subquery for the latest status
            (SELECT sm1.status 
            FROM sensorMaintenance sm1 
            WHERE sm1.sensor_id = s.id 
            ORDER BY sm1.timestamp DESC 
            LIMIT 1) AS status,
            -- Subquery for the latest value
            (SELECT ROUND(dh1.value, 2) 
            FROM dataHistory dh1 
            WHERE dh1.sensor_id = s.id 
            ORDER BY dh1.timestamp DESC 
            LIMIT 1) AS latest_value
        FROM Sensors s
        LEFT JOIN Shelves sh ON s.shelve_id = sh.id
        LEFT JOIN Rooms r ON sh.room_id = r.id
        LEFT JOIN sensorMaintenance sm ON sm.sensor_id = s.id
        GROUP BY s.id, s.name, s.sensorType, r.name
        ORDER BY s.id;
        """

        cursor.execute(query)
        sensors = cursor.fetchall()

        sensor_list = [
            {
                'id': sensor['sensor_id'],
                'name': sensor['sensor_name'],
                'type': sensor['sensor_type'],
                'location': sensor['location'],
                'lastMaintenance': sensor['last_maintenance'],
                'status': sensor['status'],
                'lastValue': sensor['latest_value']  # Renamed to latest_value here too
            }
            for sensor in sensors
        ]

        return jsonify(sensor_list), 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Database error occurred'}), 500

    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
