from flask import Blueprint, jsonify

product_routes = Blueprint("product_routes", __name__)

@product_routes.route("/products", methods=["GET"])
def get_products():
    return jsonify({"message": "Products route working"})