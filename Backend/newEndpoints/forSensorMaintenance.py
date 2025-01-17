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

@app.route('/sensors', methods=['GET'])
def get_sensors():
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # Optimized query using window functions to get the latest status and value
        query = """
        WITH LatestStatus AS (
            SELECT 
                sensor_id, 
                status, 
                ROW_NUMBER() OVER (PARTITION BY sensor_id ORDER BY timestamp DESC) AS rn
            FROM sensorMaintenance
        ),
        LatestValue AS (
            SELECT 
                sensor_id, 
                value, 
                ROW_NUMBER() OVER (PARTITION BY sensor_id ORDER BY timestamp DESC) AS rn
            FROM dataHistory
        )
        SELECT 
            s.id AS sensor_id,
            s.name AS sensor_name,
            s.sensorType AS sensor_type, 
            r.name AS location,
            sh.id AS shelve_id,
            COALESCE(MAX(sm.timestamp), 'Never') AS last_maintenance,
            ls.status AS status,
            lv.value AS latest_value
        FROM Sensors s
        LEFT JOIN Shelves sh ON s.shelve_id = sh.id
        LEFT JOIN Rooms r ON sh.room_id = r.id
        LEFT JOIN sensorMaintenance sm ON sm.sensor_id = s.id
        LEFT JOIN LatestStatus ls ON ls.sensor_id = s.id AND ls.rn = 1  -- Latest status
        LEFT JOIN LatestValue lv ON lv.sensor_id = s.id AND lv.rn = 1  -- Latest value
        GROUP BY s.id, s.name, s.sensorType, r.name, sh.id, ls.status, lv.value
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
                'shelve': {
                    'id': sensor['shelve_id'],
                },
                'lastMaintenance': sensor['last_maintenance'],
                'status': sensor['status'],
                'lastValue': sensor['latest_value']
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
