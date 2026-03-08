from database.db_connection import get_db_connection

def create_order_transaction(user_id, total_amount, items):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # 1. Create the main order record
        order_query = "INSERT INTO orders (user_id, total_amount, status) VALUES (%s, %s, %s)"
        cursor.execute(order_query, (user_id, total_amount, 'Pending'))
        order_id = cursor.lastrowid

        # 2. Record each specific item in the order
        item_query = """
            INSERT INTO order_items (order_id, deal_id, quantity, price_at_purchase) 
            VALUES (%s, %s, %s, %s)
        """
        for item in items:
            cursor.execute(item_query, (order_id, item['deal_id'], item['quantity'], item['price']))

        connection.commit()
        return order_id
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()