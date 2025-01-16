from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# Configure the database connection
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'iot_db'
}

# Route to fetch the latest sensor value with sensor name
@app.route('/api/sensors/<int:sensor_id>/data', methods=['GET'])
def get_latest_sensor_data(sensor_id):
    try:
        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Query to fetch the latest sensor data
        query = """
            SELECT 
                Sensors.name AS sensor_name,
                dataHistory.value,
                dataHistory.timestamp
            FROM 
                Sensors
            JOIN 
                dataHistory ON Sensors.id = dataHistory.sensor_id
            WHERE 
                Sensors.id = %s
            ORDER BY 
                dataHistory.timestamp DESC
            LIMIT 1
        """
        cursor.execute(query, (sensor_id,))
        result = cursor.fetchone()

        # Close the connection
        cursor.close()
        connection.close()

        # If no result is found, return an error
        if not result:
            return jsonify({'error': f'No data found for sensor ID {sensor_id}'}), 404

        # Return the latest result as JSON
        return jsonify(result), 200

    except Error as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch sensor data'}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5020)
