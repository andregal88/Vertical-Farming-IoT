import requests
from datetime import datetime
import re
import time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS       
import mysql.connector


# MySQL Database connection details
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'QifsaRopt1!',
    'database': 'test_db'
}


# FIWARE Orion Context Broker URL
orion_url = "http://150.140.186.118:1026/v2/entities"
fiware_service_path = "/sensorsdata"


# InfluxDB Configuration
influxdb_config = {
    'url': 'http://labserver.sense-campus.gr:8086',
    'token': 'KXH1kJtKHbEiYA3cAVUt-BW1wTilFYxvrHPiITUiEjpcW4wTAIY1g-tKaNkI37Md96N2B-6v3BK269fFAA1Uaw==',
    'org': 'students',
    'bucket': 'SensorsData'
}


def fetch_data_from_mysql(query):
    """Fetch data from MySQL database based on the given query."""
    connection = mysql.connector.connect(**mysql_config)
    cursor = connection.cursor(dictionary=True)

    cursor.execute(query)
    data = cursor.fetchall()

    cursor.close()
    connection.close()

    return data

def write_to_influxdb(measurement, data, tags=None, fields=None, timestamp_field=None):
    """Write data to InfluxDB."""
    client = InfluxDBClient(url=influxdb_config['url'], token=influxdb_config['token'])
    write_api = client.write_api(write_options=SYNCHRONOUS)

    for record in data:
        point = Point(measurement)

        # Add tags
        if tags:
            for tag in tags:
                point = point.tag(tag, record[tag])

        # Add fields
        if fields:
            for field in fields:
                point = point.field(field, float(record[field]) if isinstance(record[field], (int, float)) else record[field])

        # Add timestamp
        if timestamp_field:
            point = point.time(record[timestamp_field], WritePrecision.NS)

        write_api.write(bucket=influxdb_config['bucket'], org=influxdb_config['org'], record=point)

    client.close()

def migrate_table(table_name, measurement, query, tags=None, fields=None, timestamp_field=None):
    """Migrate a specific table to InfluxDB."""
    print(f"Fetching data from {table_name}...")
    data = fetch_data_from_mysql(query)

    print(f"Fetched {len(data)} records from {table_name}. Writing to InfluxDB...")
    write_to_influxdb(measurement, data, tags, fields, timestamp_field)

    print(f"Data migration for {table_name} complete.")

def run_migrations():
    """Run all data migrations."""
    # Migrate dataHistory table
    migrate_table(
        table_name="dataHistory",
        measurement="dataHistory",
        query="SELECT * FROM dataHistory",
        tags=["sensor_id"],
        fields=["value"],
        timestamp_field="timestamp"
    )

    # Migrate Alerts table
    migrate_table(
        table_name="Alerts",
        measurement="Alerts",
        query="SELECT * FROM Alerts",
        tags=["sensor_id", "alertType"],
        fields=[],
        timestamp_field="alertTime"
    )

    # Migrate sensorMaintenance table
    migrate_table(
        table_name="sensorMaintenance",
        measurement="sensorMaintenance",
        query="SELECT * FROM sensorMaintenance",
        tags=["sensor_id", "status"],
        fields=["review"],
        timestamp_field="datetime_review"
    )



    print("All data migrations completed.")

def main():
    """Main function to run migrations periodically."""
    polling_interval = 60  

    print(f"Starting periodic migrations every {polling_interval} seconds...")
    while True:
        run_migrations()
        print(f"Waiting for the next poll in {polling_interval} seconds...")
        time.sleep(polling_interval)

if __name__ == "__main__":
    main()


# def delete_measurement(measurement_name):
#     """Delete a measurement in InfluxDB."""
#     client = InfluxDBClient(url=influxdb_config['url'], token=influxdb_config['token'])
#     delete_api = client.delete_api()

#     # Delete data from the specified measurement
#     start = "1970-01-01T00:00:00Z"
#     stop = "2100-01-01T00:00:00Z"
#     delete_api.delete(
#         start=start,
#         stop=stop,
#         predicate=f'_measurement="{measurement_name}"',
#         bucket=influxdb_config['bucket'],
#         org=influxdb_config['org']
#     )

#     print(f"Measurement '{measurement_name}' deleted.")
#     client.close()

# # Example: Delete 'dataHistory' measurement
# delete_measurement("dataHistory")
