from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)


# Database connection setup (update these with your credentials)
db_config = {
    'host': 'localhost',        
    'user': 'root',             
    'password': '12345678',  
    'database': 'iot_db'       
}

# Function to connect to the database
def connect_db():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# API endpoint to fetch crop types
@app.route('/api/crop_types', methods=['GET'])
def get_crop_types():
    connection = connect_db()
    if connection:
        cursor = connection.cursor(dictionary=True)  # Use dictionary=True for row as a dict
        cursor.execute("SELECT id, name FROM cropType")  # Fetch crop types
        crop_types = cursor.fetchall()  # Retrieve all rows

        cursor.close()
        connection.close()

        return jsonify(crop_types), 200
    else:
        return jsonify({"message": "Failed to connect to the database."}), 500

# Main route to check if the server is running
@app.route('/')
def home():
    return "Welcome to the Room Creation API!"

# Run the Flask server
if __name__ == "__main__":
    app.run(debug=True,port=5009)
