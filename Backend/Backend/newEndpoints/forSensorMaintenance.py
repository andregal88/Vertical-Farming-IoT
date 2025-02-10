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
# Route to get sensor maintenance logs
@app.route('/sensors', methods=['GET'])
def get_sensor_maintenance_logs():
    # Extract user_id and role from query parameters
    user_id = request.args.get('user_id')
    user_role = request.args.get('role')
    
    if not user_id or not user_role:
        return jsonify({'status': 'error', 'message': 'Both user_id and role are required'}), 400

    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Query to check the role of the user
        role_query = """
        SELECT r.name AS role
        FROM userRoles ur
        JOIN Role r ON ur.role_id = r.id
        WHERE ur.user_id = %s
        """
        cursor.execute(role_query, (user_id,))
        role_result = cursor.fetchone()

        if not role_result:
            return jsonify({'error': 'User not found'}), 404

        user_role_from_db = role_result['role']

        # Check if the user role matches the passed role
        if user_role_from_db != user_role:
            return jsonify({'status': 'error', 'message': 'Role mismatch'}), 403

        # If user is admin, show all sensors and logs
        if user_role == 'Admin':
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
                LEFT JOIN LatestStatus ls ON ls.sensor_id = s.id AND ls.rn = 1
                LEFT JOIN LatestValue lv ON lv.sensor_id = s.id AND lv.rn = 1
                GROUP BY s.id, s.name, s.sensorType, r.name, sh.id, ls.status, lv.value
                ORDER BY s.id;
            """
            cursor.execute(query)  # Admin query doesn't require user_id for filtering
        else:
            # For normal users, fetch logs associated with rooms related to the user
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
                LEFT JOIN LatestStatus ls ON ls.sensor_id = s.id AND ls.rn = 1
                LEFT JOIN LatestValue lv ON lv.sensor_id = s.id AND lv.rn = 1
                LEFT JOIN userRoles ur ON ur.user_id = %s
                WHERE r.user_id = ur.user_id  -- Only return rooms associated with the user
                GROUP BY s.id, s.name, s.sensorType, r.name, sh.id, ls.status, lv.value
                ORDER BY s.id;
            """
            cursor.execute(query, (user_id,))  # Filter by user_id for normal users

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

        # Close the database connection
        cursor.close()
        conn.close()

        return jsonify(sensor_list), 200

    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5001)
