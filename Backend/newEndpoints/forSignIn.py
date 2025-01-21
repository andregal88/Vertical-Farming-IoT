from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'iot_db'
}

# Route for logging in
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # Query to fetch all rooms associated with the user
        query = """
        SELECT 
            Users.id, 
            Users.name, 
            Users.password, 
            Role.name AS role,
            Rooms.id AS room_id,
            Rooms.name AS room_name
        FROM 
            Users
        LEFT JOIN userRoles ON Users.id = userRoles.user_id
        LEFT JOIN Role ON userRoles.role_id = Role.id
        LEFT JOIN Rooms ON Users.id = Rooms.user_id
        WHERE Users.name = %s AND Users.active = TRUE
        """
        
        cursor.execute(query, (username,))
        results = cursor.fetchall()  # Fetch all results
        user = results[0] if results else None  # Get the first result if available
        
        cursor.close()
        connection.close()

        if not user:
            return jsonify({'message': 'Invalid username or password'}), 404

        if user['password'] != password:
            return jsonify({'message': 'Invalid username or password'}), 401

        # Collect all rooms assigned to the user
        rooms = [{'room_id': row['room_id'], 'room_name': row['room_name']} for row in results]

        return jsonify({
            'id': user['id'],
            'username': user['name'],
            'role': user['role'],
            'rooms': rooms  # Return all rooms assigned to the user
        })

    except mysql.connector.Error as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500


# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, port=5111)
