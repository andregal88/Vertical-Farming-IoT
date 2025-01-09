from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# Configure the MySQL database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",           # Your MySQL host
        user="root",                # Your MySQL user
        password="QifsaRopt1!",                # Your MySQL password
        database="test_db"     # Your database name
    )

@app.route('/get_last_data', methods=['GET'])
def get_last_data():
    # Get sensor_id from the query parameters
    sensor_id = request.args.get('sensor_id', type=int)

    if not sensor_id:
        return jsonify({"error": "sensor_id parameter is required"}), 400

    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to fetch the latest data for the given sensor_id
        query = """
        SELECT * FROM dataHistory 
        WHERE sensor_id = %s
        ORDER BY timestamp DESC
        LIMIT 1
        """
        cursor.execute(query, (sensor_id,))

        # Fetch the latest row for the given sensor_id
        data = cursor.fetchone()

        # Check if data is found
        if not data:
            return jsonify({"message": "No data found for the given sensor_id"}), 404

        # Return the data in JSON format
        return jsonify({"data": data}), 200

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        # Close the cursor and the connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/get_data_history', methods=['GET'])
def get_data_history():
    # Get sensor_id from the query parameters
    sensor_id = request.args.get('sensor_id', type=int)

    if not sensor_id:
        return jsonify({"error": "sensor_id parameter is required"}), 400

    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to fetch the data history for the given sensor_id
        query = """
        SELECT * FROM dataHistory 
        WHERE sensor_id = %s 
        ORDER BY timestamp DESC
        """
        cursor.execute(query, (sensor_id,))

        # Fetch all the rows for the given sensor_id
        data = cursor.fetchall()

        # Check if data is found
        if not data:
            return jsonify({"message": "No data found for the given sensor_id"}), 404

        # Return the data in JSON format
        return jsonify({"data": data}), 200

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        # Close the cursor and the connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)
