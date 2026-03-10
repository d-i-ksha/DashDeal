from flask import Blueprint, jsonify, request
from database.db_connection import get_db_connection

product_routes = Blueprint("product_routes", __name__)

@product_routes.route("/all", methods=["GET"])
def get_all_products():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = """
            SELECT d.id, d.title, d.description, d.image_url, 
            d.original_price, d.discount_price, c.name as category 
            FROM deals d
            JOIN categories c ON d.category_id = c.id
        """
        cursor.execute(query)
        products = cursor.fetchall()
        
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@product_routes.route("/category/<int:cat_id>", methods=["GET"])
def get_by_category(cat_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM deals WHERE category_id = %s"
        cursor.execute(query, (cat_id,))
        products = cursor.fetchall()
        return jsonify(products), 200
    finally:
        cursor.close()
        connection.close()