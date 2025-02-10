from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'test_db'
}

# Endpoint to Fetch Active Users (ID & Name)
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        query = "SELECT id, name FROM Users WHERE active = TRUE"
        cursor.execute(query)
        users = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({'users': users}), 200

    except mysql.connector.Error as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500


# Run Flask Application
if __name__ == '__main__':
    app.run(debug=True, port=5888)
