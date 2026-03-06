from flask import Flask
from routes.user_routes import user_routes
from routes.product_routes import product_routes
from routes.order_routes import order_routes

app = Flask(__name__)

app.register_blueprint(user_routes)
app.register_blueprint(product_routes)
app.register_blueprint(order_routes)

@app.route("/")
def home():
    return "DashDeal Backend Running 🚀"

if __name__ == "__main__":
    app.run(debug=True)