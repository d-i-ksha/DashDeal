import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="YOUR_DB_PASSWORD",
        database="dashdeal"
    )
    return connection