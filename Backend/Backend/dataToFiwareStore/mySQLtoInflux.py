import time
import mysql.connector
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime

# MySQL connection details
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'test_db'
}

# InfluxDB connection details
influxdb_config = {
    'url': 'http://labserver.sense-campus.gr:8086',
    'token': 'KXH1kJtKHbEiYA3cAVUt-BW1wTilFYxvrHPiITUiEjpcW4wTAIY1g-tKaNkI37Md96N2B-6v3BK269fFAA1Uaw==',
    'org': 'students',
    'bucket': 'SensorsData'
}

def fetch_mysql_data(query):
    """Fetch data from MySQL."""
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        cursor.execute(query)

        # For SELECT queries, fetch the data and column names
        if query.strip().upper().startswith("SELECT"):
            rows = cursor.fetchall()
            column_names = [column[0] for column in cursor.description]
            connection.commit()
            cursor.close()
            connection.close()
            return rows, column_names
        else:
            connection.commit()
            cursor.close()
            connection.close()
            return None, None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None, None

def write_to_influxdb(data, column_names, measurement_name):
    """Write data to InfluxDB."""
    client = InfluxDBClient(url=influxdb_config['url'], token=influxdb_config['token'], org=influxdb_config['org'])
    write_api = client.write_api(write_options=SYNCHRONOUS)

    for row in data:
        point = Point(measurement_name)
        for i, col in enumerate(column_names):
            if isinstance(row[i], (int, float)):
                point.field(col, row[i])
            else:
                point.tag(col, str(row[i]))
        write_api.write(bucket=influxdb_config['bucket'], record=point)
    client.close()

def get_last_processed_timestamp():
    """Get the last processed timestamp from the Timestamps table."""
    query = "SELECT MAX(timestamp) FROM Timestamps"
    data, _ = fetch_mysql_data(query)
    if data and data[0][0]:
        return data[0][0]
    return None

def insert_timestamp(timestamp):
    """Insert a new timestamp into the Timestamps table."""
    query = f"INSERT INTO Timestamps (timestamp) VALUES ('{timestamp}')"
    fetch_mysql_data(query)

if __name__ == "__main__":
    # Get the last processed timestamp
    last_processed_timestamp = get_last_processed_timestamp()

    # Current timestamp (used for inserting a new record into Timestamps table)
    current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Mapping of tables to timestamp columns
    timestamp_columns = {
        "dataHistory": "timestamp",
        "sensorMaintenance": "timestamp",
        "Alerts": "alertTime"
    }

    # Polling interval in seconds
    polling_interval = 10

    # Fetch historical data for the first time (only the data between last_processed_timestamp and current_timestamp)
    for table, timestamp_column in timestamp_columns.items():
        print(f"Fetching historical data for table: {table}")

        if last_processed_timestamp:
            query = f"SELECT * FROM {table} WHERE {timestamp_column} > '{last_processed_timestamp}' AND {timestamp_column} <= '{current_timestamp}'"
        else:
            # If there is no last processed timestamp, this part can be skipped or handled differently (if applicable)
            query = f"SELECT * FROM {table} WHERE {timestamp_column} <= '{current_timestamp}'"

        # Fetch data from MySQL
        data, column_names = fetch_mysql_data(query)
        if data and column_names:
            print(f"Fetched {len(data)} historical rows from {table}.")
            write_to_influxdb(data, column_names, table)
        else:
            print(f"No historical data for {table} or an error occurred.")

    # Insert the current timestamp into the Timestamps table
    insert_timestamp(current_timestamp)
    print(f"Inserted new timestamp: {current_timestamp}")

    # After processing the historical data, continue polling for new data
    while True:
        for table, timestamp_column in timestamp_columns.items():
            print(f"Fetching new data for table: {table}")

            # Build query with last processed timestamp to fetch only new data
            if last_processed_timestamp:
                query = f"SELECT * FROM {table} WHERE {timestamp_column} > '{last_processed_timestamp}'"
            else:
                query = f"SELECT * FROM {table}"

            # Fetch new data from MySQL
            data, column_names = fetch_mysql_data(query)
            if data and column_names:
                print(f"Fetched {len(data)} new rows from {table}.")
                write_to_influxdb(data, column_names, table)

                # Update last processed timestamp
                last_processed_timestamp = current_timestamp
            else:
                print(f"No new data for {table} or an error occurred.")

        # Insert the current timestamp into the Timestamps table again
        current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        insert_timestamp(current_timestamp)
        print(f"Inserted new timestamp: {current_timestamp}")

        # Wait before polling again
        print(f"Sleeping for {polling_interval} seconds...")
        time.sleep(polling_interval)
