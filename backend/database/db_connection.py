import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="diKSha@07#",
        database="dashdeal"
    )
    return connection