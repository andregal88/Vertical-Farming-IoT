from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error  # Import the Error class

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'test_db'
}

# Endpoint for account creation
@app.route('/create_account', methods=['POST'])
def create_account():
    connection = None  
    try:
        # Parse JSON input
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON input or empty request body'}), 400

        name = data.get('name')
        surname = data.get('surname')
        email = data.get('email')
        password = data.get('password')
        active = data.get('active', True)  
        role_id = data.get('role_id')

        # Validate input
        if not all([name, surname, email, password, role_id]):
            return jsonify({'error': 'All fields (name, surname, email, password, role_id) are required'}), 400

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Insert into Users table
        insert_user_query = (
            "INSERT INTO Users (name, surname, email, password, active) "
            "VALUES (%s, %s, %s, %s, %s)"
        )
        cursor.execute(insert_user_query, (name, surname, email, password, active))

        # Get the last inserted user ID
        user_id = cursor.lastrowid

        # Insert into userRoles table
        insert_role_query = (
            "INSERT INTO userRoles (user_id, role_id) "
            "VALUES (%s, %s)"
        )
        cursor.execute(insert_role_query, (user_id, role_id))

        # Commit the transaction
        connection.commit()

        return jsonify({'message': 'Account and role assigned successfully', 'user_id': user_id}), 201

    except Error as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Database error occurred'}), 500

    finally:
        # Close the database connection
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5200)
