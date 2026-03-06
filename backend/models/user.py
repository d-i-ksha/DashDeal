from database.db_connection import get_db_connection

def create_user(name, email, password):
    connection = get_db_connection()
    cursor = connection.cursor()

    query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
    values = (name, email, password)

    cursor.execute(query, values)
    connection.commit()

    cursor.close()
    connection.close()