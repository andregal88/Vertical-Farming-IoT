import time
import mysql.connector
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# MySQL connection details
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'QifsaRopt1!',
    'database': 'test_db'
}

# InfluxDB connection details
influxdb_config = {
    'url': 'http://labserver.sense-campus.gr:8086',
    'token': 'KXH1kJtKHbEiYA3cAVUt-BW1wTilFYxvrHPiITUiEjpcW4wTAIY1g-tKaNkI37Md96N2B-6v3BK269fFAA1Uaw==',
    'org': 'students',
    'bucket': 'SensorsData'
}

# Last processed timestamps for each table
last_processed = {
    "sensorMaintenance": None,
    "dataHistory": None,
    "Alerts": None
}

def fetch_mysql_data(query):
    """Fetch data from MySQL."""
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        column_names = [column[0] for column in cursor.description]
        cursor.close()
        connection.close()
        return rows, column_names
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

def get_last_processed_condition(table, timestamp_column):
    """Build a WHERE clause to fetch only new data based on the last processed timestamp."""
    if last_processed[table]:
        return f"WHERE {timestamp_column} > '{last_processed[table]}'"
    return ""

def update_last_processed(table, data, column_names, timestamp_column):
    """Update the last processed timestamp for the given table."""
    if data:
        timestamps = [row[column_names.index(timestamp_column)] for row in data]
        if timestamps:
            last_processed[table] = max(timestamps)  # Update to the most recent timestamp

if __name__ == "__main__":
    # Mapping of tables to timestamp columns
    timestamp_columns = {
        "sensorMaintenance": "timestamp",
        "dataHistory": "timestamp",
        "Alerts": "alertTime"
    }

    # Polling interval in seconds
    polling_interval = 10  # Fetch new data every 10 seconds

    while True:
        for table, timestamp_column in timestamp_columns.items():
            print(f"Fetching new data for table: {table}")
            
            # Build query with last processed timestamp
            condition = get_last_processed_condition(table, timestamp_column)
            query = f"SELECT * FROM {table} {condition}"

            # Fetch data from MySQL
            data, column_names = fetch_mysql_data(query)
            if data and column_names:
                print(f"Fetched {len(data)} new rows from {table}.")
                
                # Write data to InfluxDB
                write_to_influxdb(data, column_names, table)

                # Update last processed timestamp
                update_last_processed(table, data, column_names, timestamp_column)
                print(f"Updated last processed timestamp for {table}.")
            else:
                print(f"No new data for {table} or an error occurred.")

        # Wait before polling again
        print(f"Sleeping for {polling_interval} seconds...")
        time.sleep(polling_interval)
