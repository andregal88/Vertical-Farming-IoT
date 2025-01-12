import mysql.connector
import getpass
from flask import Flask, request, jsonify

# Database connection setup 
db_config = {
    'host': 'localhost',        # MySQL server address 
    'user': 'root',             # MySQL username
    'password': '1234',  # MySQL password 
    'database': 'iot_db'       # Database name 
}

app = Flask(__name__)

# Function to connect to the database
def connect_db():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Function to handle user sign-up
@app.route('/signup', methods=['POST'])
def sign_up():
    data = request.json
    username = data.get('username', '').strip()
    surname = data.get('surname', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not username or not surname or not email or not password:
        return jsonify({"error": "All fields (username, surname, email, password) are required!"}), 400

    # Check if the username already exists in the Users table
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM Users WHERE name = %s", (username,))
        user = cursor.fetchone()

        if user:
            cursor.close()
            connection.close()
            return jsonify({"error": f"User '{username}' already exists!"}), 400

        # Ensure default roles exist in the Role table
        cursor.execute("SELECT COUNT(*) FROM Role WHERE name IN ('Admin', 'User')")
        roles_count = cursor.fetchone()[0]

        if roles_count < 2:
            # Insert roles if not present
            cursor.execute("INSERT INTO Role (name) VALUES ('Admin')")
            cursor.execute("INSERT INTO Role (name) VALUES ('User')")
            connection.commit()

        # Ask for role selection
        role_choice = data.get('role', '2')  # Default to 'User' if no role is provided
        role_id = 1 if role_choice == '1' else 2  # '1' for Admin, '2' for User

        # Insert the new user into the Users table
        cursor.execute(
            "INSERT INTO Users (name, surname, email, password, active) VALUES (%s, %s, %s, %s, %s)",
            (username, surname, email, password, True)
        )
        connection.commit()

        # Get the user_id of the newly created user
        cursor.execute("SELECT id FROM Users WHERE name = %s", (username,))
        user_id = cursor.fetchone()[0]

        # Insert the role entry (user) into the userRoles table
        cursor.execute(
            "INSERT INTO userRoles (user_id, role_id) VALUES (%s, %s)",
            (user_id, role_id)  # Role is determined by user choice
        )
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": f"New user '{username}' with role '{role_choice}' stored successfully."}), 201


# Function to handle user login
@app.route('/login', methods=['POST'])
def log_in():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required!"}), 400

    # Check if the user exists
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        cursor.execute("SELECT id, password FROM Users WHERE name = %s", (username,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            connection.close()
            return jsonify({"error": "User not found!"}), 404

        user_id, stored_password = user

        # Verify password
        if stored_password == password:
            # Get the role of the user from userRoles table
            cursor.execute("SELECT role_id FROM userRoles WHERE user_id = %s", (user_id,))
            role_row = cursor.fetchone()

            if role_row is None:
                cursor.close()
                connection.close()
                return jsonify({"error": "No role assigned to user."}), 400

            role_id = role_row[0]
            cursor.execute("SELECT name FROM Role WHERE id = %s", (role_id,))
            role_name_row = cursor.fetchone()

            if role_name_row is None:
                cursor.close()
                connection.close()
                return jsonify({"error": "Role not found in the Role table!"}), 500

            role_name = role_name_row[0]

            cursor.close()
            connection.close()

            return jsonify({"message": f"Welcome {username} ({role_name} role)!"}), 200
        else:
            cursor.close()
            connection.close()
            return jsonify({"error": "Incorrect password!"}), 401


# Main entry point to start the Flask application
if __name__ == "__main__":
    app.run(debug=True)
