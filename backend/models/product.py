from database.db_connection import get_db_connection

def get_all_deals():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = """
            SELECT d.*, c.name AS category_name 
            FROM deals d 
            JOIN categories c ON d.category_id = c.id
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()

def get_deals_by_category(category_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = "SELECT * FROM deals WHERE category_id = %s"
        cursor.execute(query, (category_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()