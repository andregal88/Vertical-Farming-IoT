from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database connection setup (update these with your credentials)
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
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

# Function to create a room
@app.route('/create_room', methods=['POST'])
def create_room():
    # Connect to the database
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        # Get available crop types
        cursor.execute("SELECT id, name FROM cropType")
        crop_types = cursor.fetchall()

        if not crop_types:
            return jsonify({"message": "No crop types found. Please add crop types first."}), 400

        # Validate crop type choice
        data = request.json
        crop_choice = data.get('crop_choice')

        # Ensure crop_choice is a valid integer within the correct range
        if crop_choice is None or (isinstance(crop_choice, str) and not crop_choice.isdigit()):
            return jsonify({"message": "Invalid crop type choice."}), 400

        # Convert crop_choice to integer if it's a string
        crop_choice = int(crop_choice)

        # Check if the crop_choice is within the valid range of crop types
        if crop_choice < 1 or crop_choice > len(crop_types):
            return jsonify({"message": "Invalid crop type choice."}), 400

        crop_type_id = crop_types[int(crop_choice) - 1][0]

        # Get available users to assign the room
        cursor.execute("SELECT id, name FROM Users WHERE active = TRUE")
        users = cursor.fetchall()

        if not users:
            return jsonify({"message": "No active users found. Please add users first."}), 400

        # Validate user choice
        user_choice = data.get('user_choice')
        # Validate user choice
        if not user_choice or (isinstance(user_choice, str) and not user_choice.isdigit()):
            return jsonify({"message": "Invalid user choice."}), 400

        # Convert user_choice to an integer
        user_choice = int(user_choice)

        # Check if user_choice is within valid range
        if user_choice < 1 or user_choice > len(users):
            return jsonify({"message": "Invalid user choice."}), 400

        user_id = users[int(user_choice) - 1][0]

        # Get room details from the user
        room_name = data.get('room_name')
        address = data.get('address')
        city = data.get('city')
        room_number = data.get('room_number')
        floor = data.get('floor')

        # Check for duplicate room
        cursor.execute("SELECT id FROM Rooms WHERE roomNumber = %s AND address = %s", (room_number, address))
        if cursor.fetchone():
            return jsonify({"message": "A room with this number and address already exists."}), 400

        try:
            cursor.execute(
                "INSERT INTO Rooms (name, address, city, roomNumber, floor, cropType_id, user_id) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (room_name, address, city, room_number, floor, crop_type_id, user_id)
            )
            connection.commit()
        except mysql.connector.Error as err:
            return jsonify({"message": f"Error: {err}"}), 500

        room_id = cursor.lastrowid

        # Get the number of shelves directly from the request (if provided)
        number_of_shelves = data.get('number_of_shelves', 0)  # Default to 0 if not provided
        if not isinstance(number_of_shelves, int) or number_of_shelves < 0:
            return jsonify({"message": "Invalid number of shelves. Please provide a non-negative integer."}), 400

        try:
            # Insert the specified number of shelves for the room
            for _ in range(number_of_shelves):
                cursor.execute("INSERT INTO Shelves (room_id) VALUES (%s)", (room_id,))
            connection.commit()
            print(f"{number_of_shelves} shelves added to Room ID: {room_id}")
        except mysql.connector.Error as err:
            connection.rollback()
            return jsonify({"message": f"Error adding shelves: {err}"}), 500

        cursor.close()
        connection.close()

        return jsonify({"message": f"Room '{room_name}' created successfully with ID: {room_id} and {number_of_shelves} shelf(s)."}), 201

    return jsonify({"message": "Failed to connect to the database."}), 500

# Function to fetch room data
@app.route('/get_rooms', methods=['GET'])
def get_rooms():
    # Connect to the database
    connection = connect_db()
    if connection:
        cursor = connection.cursor(dictionary=True)  # Use dictionary=True for column names in the result
        
        try:
            # Fetch all room data along with their crop type and user details
            query = """
                SELECT 
                    r.id AS room_id,
                    r.name AS room_name,
                    r.address,
                    r.city,
                    r.roomNumber AS room_number,
                    r.floor,
                    ct.name AS crop_type,
                    u.name AS user_name
                FROM Rooms r
                JOIN cropType ct ON r.cropType_id = ct.id
                JOIN Users u ON r.user_id = u.id
            """
            cursor.execute(query)
            rooms = cursor.fetchall()

            if not rooms:
                return jsonify({"message": "No rooms found."}), 404

            return jsonify({"rooms": rooms}), 200

        except mysql.connector.Error as err:
            return jsonify({"message": f"Error: {err}"}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"message": "Failed to connect to the database."}), 500

# Main route to check if the server is running
@app.route('/')
def home():
    return "Welcome to the Room Creation API!"


# Run the Flask server
if __name__ == "__main__":
    app.run(debug=True, port=5006)
