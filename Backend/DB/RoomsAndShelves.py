import mysql.connector

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
def create_room():
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        # Get available crop types
        cursor.execute("SELECT id, name FROM cropType")
        crop_types = cursor.fetchall()

        if not crop_types:
            print("No crop types found. Please add crop types first.")
            cursor.close()
            connection.close()
            return

        print("Available Crop Types:")
        for idx, (crop_id, crop_name) in enumerate(crop_types, 1):
            print(f"{idx}. {crop_name}")

        # Select crop type
        crop_choice = input("Enter the number for the crop type: ").strip()
        if crop_choice.isdigit() and 1 <= int(crop_choice) <= len(crop_types):
            crop_type_id = crop_types[int(crop_choice) - 1][0]
        else:
            print("Invalid choice. Exiting.")
            cursor.close()
            connection.close()
            return

        # Get available users to assign the room
        cursor.execute("SELECT id, name FROM Users WHERE active = TRUE")
        users = cursor.fetchall()

        if not users:
            print("No active users found. Please add users first.")
            cursor.close()
            connection.close()
            return

        print("Available Users:")
        for idx, (user_id, user_name) in enumerate(users, 1):
            print(f"{idx}. {user_name}")

        # Select user
        user_choice = input("Enter the number to assign the room to a user: ").strip()
        if user_choice.isdigit() and 1 <= int(user_choice) <= len(users):
            user_id = users[int(user_choice) - 1][0]
        else:
            print("Invalid choice. Exiting.")
            cursor.close()
            connection.close()
            return

        # Get room details from the user
        room_name = input("Enter room name: ").strip()
        address = input("Enter room address: ").strip()
        city = input("Enter city: ").strip()
        room_number = input("Enter room number: ").strip()

        # Validate floor number
        while True:
            floor = input("Enter floor number: ").strip()
            if floor.isdigit():
                floor = int(floor)
                break
            else:
                print("Invalid input. Please enter a valid floor number.")

        # Check for duplicate room
        cursor.execute("SELECT id FROM Rooms WHERE roomNumber = %s AND address = %s", (room_number, address))
        if cursor.fetchone():
            print("A room with this number and address already exists. Please try again.")
            cursor.close()
            connection.close()
            return

        # Insert room into the Rooms table
        try:
            cursor.execute(
                "INSERT INTO Rooms (name, address, city, roomNumber, floor, cropType_id, user_id) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (room_name, address, city, room_number, floor, crop_type_id, user_id)
            )
            connection.commit()
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            connection.rollback()
            cursor.close()
            connection.close()
            return

        # Get the ID of the newly created room
        room_id = cursor.lastrowid
        print(f"Room '{room_name}' created successfully with ID: {room_id}")

        # Create shelves for the room
        add_shelves = input("Do you want to add shelves to this room? (y/n): ").strip().lower()
        if add_shelves == 'y':
            while True:
                shelf_name = input("Enter shelf name (or 'done' to finish): ").strip()
                if shelf_name.lower() == 'done':
                    break

                try:
                    cursor.execute(
                        "INSERT INTO Shelves (room_id) VALUES (%s)",
                        (room_id,)
                    )
                    connection.commit()
                    print(f"Shelf '{shelf_name}' added to Room ID: {room_id}")
                except mysql.connector.Error as err:
                    print(f"Error: {err}")
                    connection.rollback()

        cursor.close()
        connection.close()

# Main function to run the application
def main():
    while True:
        print("\nChoose an option:")
        print("1. Create Room and Shelves")
        print("2. Exit")

        choice = input().strip()

        if choice == '1':
            create_room()
        elif choice == '2':
            print("Exiting the system.")
            break
        else:
            print("Invalid choice, please try again.")

# Run the main function
if __name__ == "__main__":
    main()
