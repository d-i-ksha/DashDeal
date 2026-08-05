from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.user_routes import user_routes
from routes.product_routes import product_routes
from routes.order_routes import order_routes
import os

app = Flask(__name__,
            template_folder="../frontend/html",
            static_folder="../frontend")

CORS(app)
app.register_blueprint(user_routes,url_prefix='/api/users')
app.register_blueprint(product_routes,url_prefix='/products')
app.register_blueprint(order_routes,url_prefix='/orders')

@app.route("/")
def home():
    return send_from_directory("../frontend/html","index.html")

@app.route("/product")
def product():
    return send_from_directory("../frontend/html", "product.html")

@app.route("/cart")
def cart():
    return send_from_directory("../frontend/html", "cart.html")

@app.route("/dashboard")
def dashboard():
    return send_from_directory("../frontend/html", "dashboard.html")

@app.route("/login")
def login():
    return send_from_directory("../frontend/html", "login.html")

@app.route("/checkout")
def checkout():
    return send_from_directory("../frontend/html", "checkout.html")

@app.route("/payment")
def payment():
    return send_from_directory("../frontend/html", "payment.html")

@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory("../frontend/css", filename)

@app.route("/js/<path:filename>")
def js(filename):
    return send_from_directory("../frontend/js", filename)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)