from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database connection configuration
db_config = {
    'host': 'localhost',       # Replace with your database host
    'user': 'root',            # Replace with your database user
    'password': '1234',        # Replace with your database password
    'database': 'iot_db'       # Replace with your database name
}

# Route to get sensorMaintenance logs
@app.route('/sensor-maintenance', methods=['GET'])
def get_sensor_maintenance_logs():
    user_id = request.args.get('user_id')
    user_role = request.args.get('role')
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # If user is admin, show all logs
        if user_role == 'Admin':
            query = """
                SELECT sm.*, s.name AS sensor_name
                FROM sensorMaintenance sm
                JOIN Sensors s ON sm.sensor_id = s.id
                ORDER BY sm.timestamp DESC
            """
            cursor.execute(query)

        # If user is a regular user, filter by rooms associated with the user
        else:
            # Find the rooms associated with the user
            query = """
                SELECT r.id AS room_id
                FROM Rooms r
                WHERE r.user_id = %s
            """
            cursor.execute(query, (user_id,))
            rooms = cursor.fetchall()

            if rooms:
                room_ids = [str(room['room_id']) for room in rooms]
                room_ids_str = ",".join(room_ids)

                # Query sensor maintenance logs associated with rooms linked to the user
                query = f"""
                    SELECT sm.*, s.name AS sensor_name
                    FROM sensorMaintenance sm
                    JOIN Sensors s ON sm.sensor_id = s.id
                    WHERE s.shelve_id IN (
                        SELECT sh.id FROM Shelves sh
                        JOIN Rooms r ON r.id = sh.room_id
                        WHERE r.id IN ({room_ids_str})
                    )
                    ORDER BY sm.timestamp DESC
                """
                cursor.execute(query)
            else:
                return jsonify({'status': 'error', 'message': 'No rooms found for the user'}), 404

        # Fetch all rows
        logs = cursor.fetchall()

        # Close the database connection
        cursor.close()
        conn.close()

        # Return the logs as JSON
        return jsonify({'status': 'success', 'data': logs}), 200

    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5015)
