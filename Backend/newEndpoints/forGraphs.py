from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",  # Replace with your database host
        user="root",  # Replace with your database username
        password="QifsaRopt1!",  # Replace with your database password
        database="test_db"  # Replace with your database name
    )

@app.route('/room-data', methods=['GET'])
def fetch_all_rooms_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch all rooms
        cursor.execute("SELECT id, name FROM Rooms")
        rooms = cursor.fetchall()

        if not rooms:
            return jsonify({"error": "No rooms found"}), 404

        result = []

        for room in rooms:
            room_id = room['id']
            room_name = room['name']

            # Fetch shelves in the room
            cursor.execute("SELECT id FROM Shelves WHERE room_id = %s", (room_id,))
            shelves = cursor.fetchall()

            room_data = {
                "room_name": room_name,
                "shelves": []
            }

            for shelf in shelves:
                shelf_id = shelf['id']

                # Fetch sensors in the shelf
                cursor.execute("SELECT id, name FROM Sensors WHERE shelve_id = %s", (shelf_id,))
                sensors = cursor.fetchall()

                shelf_data = {
                    "shelf_id": shelf_id,
                    "sensors": []
                }

                for sensor in sensors:
                    sensor_id = sensor['id']
                    sensor_name = sensor['name']

                    # Fetch the latest 5 data entries for the sensor, including sensor name
                    cursor.execute(
                        """
                        SELECT dh.timestamp, dh.value, s.name AS sensor_name
                        FROM dataHistory dh
                        JOIN Sensors s ON dh.sensor_id = s.id
                        WHERE dh.sensor_id = %s
                        ORDER BY dh.timestamp DESC
                        LIMIT 5
                        """,
                        (sensor_id,)
                    )
                    data_entries = cursor.fetchall()

                    shelf_data["sensors"].append({
                        "sensor_id": sensor_id,
                        "sensor_name": sensor_name,
                        "data": data_entries
                    })

                room_data["shelves"].append(shelf_data)

            result.append(room_data)

        return jsonify(result)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5101)
