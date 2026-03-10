from flask import Blueprint, jsonify, request
from database.db_connection import get_db_connection

order_routes = Blueprint("order_routes", __name__)

@order_routes.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json()
    user_id = data.get("user_id")
    items = data.get("items") 
    total_amount = data.get("total_amount")

    address = data.get("shipping_address")
    phone = data.get("contact_number")
    method = data.get("delivery_method")

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        order_query = "INSERT INTO orders (user_id, total_amount, status,shipping_address, contact_number, delivery_method) VALUES (%s, %s, %s, %s,%s,%s)"
        cursor.execute(order_query, (user_id, total_amount, 'Completed',address,phone,method))
        order_id = cursor.lastrowid 

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

@order_routes.route("/user/<int:user_id>", methods=["GET"])
def get_user_orders(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = """
            SELECT id, created_at, total_amount, status, 
                   shipping_address, contact_number, delivery_method 
            FROM orders 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """
        cursor.execute(query, (user_id,))
        orders = cursor.fetchall()
        return jsonify(orders), 200
    finally:
        cursor.close()
        connection.close()

@order_routes.route("/update-status/<int:order_id>", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get("status") # Expecting "Completed", "Shipped", etc.

    if not new_status:
        return jsonify({"error": "No status provided"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = "UPDATE orders SET status = %s WHERE id = %s"
        cursor.execute(query, (new_status, order_id))
        connection.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"message": "Order not found"}), 404
            
        return jsonify({"message": f"Order #{order_id} updated to {new_status}"}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()