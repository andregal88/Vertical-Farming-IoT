import mysql.connector
import getpass

# Database connection setup 
db_config = {
    'host': 'localhost',        # MySQL server address 
    'user': 'root',             # MySQL username
    'password': '1234',  # MySQL password 
    'database': 'iot_db'       # Database name 
}

# Function to connect to the database
def connect_db():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Function to handle user sign-up
def sign_up():
    username = input("Enter a username: ").strip()

    # Check if the username already exists in the Users table
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM Users WHERE name = %s", (username,))
        user = cursor.fetchone()

        if user:
            print(f"User '{username}' already exists!")
            cursor.close()
            connection.close()
            return

        # Ensure default roles exist in the Role table
        cursor.execute("SELECT COUNT(*) FROM Role WHERE name IN ('Admin', 'User')")
        roles_count = cursor.fetchone()[0]

        if roles_count < 2:
            # Insert roles if not present
            cursor.execute("INSERT INTO Role (name) VALUES ('Admin')")
            cursor.execute("INSERT INTO Role (name) VALUES ('User')")
            connection.commit()
            print("Default roles (Admin, User) inserted into the Role table.")

        # Get other user details
        surname = input("Enter your surname: ").strip()
        email = input("Enter your email: ").strip()
        password = getpass.getpass("Enter a password: ")

        # Ask for role selection
        print("Select a role:")
        print("1. Admin")
        print("2. User")
        role_choice = input("Enter the number for your role: ").strip()

        # Default to 'user' if invalid choice
        if role_choice not in ['1', '2']:
            role_choice = '2'

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

        print(f"New user '{username}' with role '{role_choice}' stored successfully.")

        cursor.close()
        connection.close()


# Function to handle user login
def log_in():
    username = input("Enter username: ").strip()

    # Check if the user exists
    connection = connect_db()
    if connection:
        cursor = connection.cursor()

        cursor.execute("SELECT id, password FROM Users WHERE name = %s", (username,))
        user = cursor.fetchone()

        if not user:
            print("User not found!")
            cursor.close()
            connection.close()
            return

        user_id, stored_password = user

        password = getpass.getpass("Enter password: ")

        # Verify password
        if stored_password == password:
            # Get the role of the user from userRoles table
            cursor.execute("SELECT role_id FROM userRoles WHERE user_id = %s", (user_id,))
            role_row = cursor.fetchone()

            if role_row is None:
                print("No role assigned to user.")
            else:
                role_id = role_row[0]
                cursor.execute("SELECT name FROM Role WHERE id = %s", (role_id,))
                role_name_row = cursor.fetchone()

                if role_name_row is None:
                    print("Role not found in the Role table!")
                else:
                    role_name = role_name_row[0]

                    if role_name == 'Admin':
                        print(f"Welcome {username} (Admin role)!")
                    elif role_name == 'User':
                        print(f"Welcome {username} (User role)!")
                    else:
                        print(f"Welcome {username} (Role: {role_name})!")
        else:
            print("Incorrect password!")

        cursor.close()
        connection.close()

# Main function to run the application
def main():
    while True:
        print("\nChoose an option:")
        print("1. Sign Up (Create Account)")
        print("2. Log In")
        print("3. Exit")

        choice = input().strip()

        if choice == '1':
            sign_up()
        elif choice == '2':
            log_in()
        elif choice == '3':
            print("Exiting the system.")
            break
        else:
            print("Invalid choice, please try again.")

# Run the main function
if __name__ == "__main__":
    main()
