from flask import Blueprint, jsonify, request
from database.db_connection import get_db_connection

order_routes = Blueprint("order_routes", __name__)

# 1. Place a New Order (Checkout)
@order_routes.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json()
    user_id = data.get("user_id")
    items = data.get("items") # Expecting a list of {deal_id, quantity, price}
    total_amount = data.get("total_amount")

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Insert into 'orders' table
        order_query = "INSERT INTO orders (user_id, total_amount, status) VALUES (%s, %s, %s)"
        cursor.execute(order_query, (user_id, total_amount, 'Pending'))
        order_id = cursor.lastrowid # Get the ID of the order we just created

        # Insert each product into 'order_items'
        item_query = "INSERT INTO order_items (order_id, deal_id, quantity, price_at_purchase) VALUES (%s, %s, %s, %s)"
        for item in items:
            cursor.execute(item_query, (order_id, item['deal_id'], item['quantity'], item['price']))

        connection.commit()
        return jsonify({"message": "Order placed successfully!", "order_id": order_id}), 201
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# 2. Get Order History for a User
@order_routes.route("/user/<int:user_id>", methods=["GET"])
def get_user_orders(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC"
        cursor.execute(query, (user_id,))
        orders = cursor.fetchall()
        return jsonify(orders), 200
    finally:
        cursor.close()
        connection.close()