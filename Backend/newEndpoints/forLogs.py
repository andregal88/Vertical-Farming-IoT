from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database connection configuration
db_config = {
    'host': 'localhost',       # Replace with your database host
    'user': 'root',            # Replace with your database user
    'password': '1234',  
    'database': 'iot_db'
}

# Route to get sensorMaintenance logs
@app.route('/sensor-maintenance', methods=['GET'])
def get_sensor_maintenance_logs():
    sensor_id = request.args.get('sensor_id')  # Optional filter by sensor_id
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # SQL query to join sensorMaintenance with Sensors to include sensor name
        if sensor_id:
            query = """
                SELECT sm.*, s.name AS sensor_name 
                FROM sensorMaintenance sm
                JOIN Sensors s ON sm.sensor_id = s.id
                WHERE sm.sensor_id = %s
                ORDER BY sm.timestamp DESC
            """
            cursor.execute(query, (sensor_id,))
        else:
            query = """
                SELECT sm.*, s.name AS sensor_name 
                FROM sensorMaintenance sm
                JOIN Sensors s ON sm.sensor_id = s.id
                ORDER BY sm.timestamp DESC
            """
            cursor.execute(query)

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
