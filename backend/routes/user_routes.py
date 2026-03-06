from flask import Blueprint, request, jsonify
from models.user import create_user

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data["name"]
    email = data["email"]
    password = data["password"]

    create_user(name, email, password)

    return jsonify({"message": "User registered successfully"})