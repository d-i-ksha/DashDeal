from database.db_connection import get_db_connection
from werkzeug.security import generate_password_hash

def create_user(name, email, password):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
       
        query = "INSERT INTO users (name, email, password,role) VALUES (%s, %s, %s,%s)"
        values = (name, email, password ,"customer")

        cursor.execute(query, values)
        connection.commit()
        print("User inserted successfully")
        
    except Exception as e:
        
        print(f"Database Error: {e}") 
         
    finally:
        cursor.close()
        connection.close()