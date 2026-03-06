from flask import Blueprint, jsonify

order_routes = Blueprint("order_routes", __name__)

@order_routes.route("/orders", methods=["GET"])
def get_orders():
    return jsonify({"message": "Orders route working"})