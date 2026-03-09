from flask import Blueprint, request, jsonify
from models.user import create_user
from models.user import verify_user

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Pass data to your model
        create_user(name, email, password)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        # 4. Handle database errors (e.g., duplicate email)
        return jsonify({"error": str(e)}), 500
    
@user_routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    # This calls the verify_user function we fixed earlier
    user = verify_user(email, password)
    
    if user:
        return jsonify({"message": "Login successful", "user": user}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401