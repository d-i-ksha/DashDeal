from flask import Flask
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
    return "DashDeal Backend Running 🚀"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)