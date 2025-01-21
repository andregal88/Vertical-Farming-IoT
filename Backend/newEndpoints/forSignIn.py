from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import jwt  # Import PyJWT
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'iot_db'
}

# Secret key for signing JWTs
SECRET_KEY = "1234"  # Replace this with a strong secret key

# Function to generate JWT
def generate_token(user_id, username, role, rooms):
    payload = {
        "id": user_id,
        "username": username,
        "role": role,
        "rooms": rooms,
        "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token
@app.route('/api/decode-token', methods=['POST'])
def decode_token():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({'message': 'Token is required'}), 400

    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        return jsonify({
            'message': 'Token is valid',
            'data': payload  # Return the decoded payload
        })

    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

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

        if not user:
            cursor.close()
            connection.close()
            return jsonify({'message': 'Invalid username or password'}), 404

        if user['password'] != password:
            cursor.close()
            connection.close()
            return jsonify({'message': 'Invalid username or password'}), 401

        # Collect all rooms assigned to the user
        rooms = [{'room_id': row['room_id'], 'room_name': row['room_name']} for row in results]

        # Generate a JWT token
        token = generate_token(user['id'], user['name'], user['role'], rooms)

        # Save the token in the database
        update_query = "UPDATE Users SET token = %s WHERE id = %s"
        cursor.execute(update_query, (token, user['id']))
        connection.commit()  # Commit the changes to the database

        cursor.close()
        connection.close()

        return jsonify({
            'id': user['id'],
            'username': user['name'],
            'role': user['role'],
            'rooms': rooms,  # Return all rooms assigned to the user
            'token': token   # Include the JWT token in the response
        })

    except mysql.connector.Error as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, port=5111)
