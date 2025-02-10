from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'test_db'
}

# Create a database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database']
        )
        if connection.is_connected():
            return connection
    except Error as e:
        raise Exception(f"Error connecting to the database: {e}")

# Endpoint to get all users
@app.route('/users', methods=['GET'])
def get_users():
    """Endpoint to get all users."""
    try:
        # Connect to the database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Execute query to fetch all users
        query = "SELECT id, name, surname, email, active, password FROM Users"
        cursor.execute(query)
        users = cursor.fetchall()

        # Return users as JSON response
        return jsonify(users), 200

    except Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the connection
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

# Endpoint to handle password reset (forgot password)
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Endpoint to handle password reset."""
    try:
        # Extract username and email from the request
        data = request.get_json()
        username = data.get('name')
        email = data.get('email')

        # Connect to the database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check if the user exists in the database by username
        query = "SELECT password FROM Users WHERE name = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()

        # If user exists, send password reset email to provided email address
        if user:
            # Send email with password reset instructions (or password directly, if desired)
            send_password_email(email, user['password'])
            return jsonify({"message": "Password reset instructions sent to email."}), 200
        else:
            return jsonify({"error": "Username not found."}), 404

    except Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the connection
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

# Function to send password email
def send_password_email(recipient_email, password):
    """Function to send the password to the user email."""
    sender_email = "your_email@example.com"  # Your email address
    sender_password = "your_email_password"  # Your email password (for Gmail, use App Password)

    subject = "Password Reset Request"
    body = f"Your password is: {password}"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Send the email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, sender_password)  # Log in to the email server
            text = msg.as_string()  # Convert the message to a string format
            server.sendmail(sender_email, recipient_email, text)  # Send the email
    except Exception as e:
        raise Exception(f"Failed to send email: {e}")

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5500)
