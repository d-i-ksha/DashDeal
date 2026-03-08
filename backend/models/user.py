from database.db_connection import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

def create_user(name, email, password):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        hashed_pw=generate_password_hash(password)
        query = "INSERT INTO users (name, email, password,role) VALUES (%s, %s, %s,%s)"
        cursor.execute(query,(name, email, hashed_pw ,"customer"))
        connection.commit()
        return True
    
    finally:
        cursor.close()
        connection.close()

def verify_user(email,password):
    connection=get_db_connection()
    cursor=connection.cursor(dictionary=True)
    try:
        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password'], password):
            return user
        return None
    finally:
        cursor.close()
        connection.close()
