from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS

from config import PORT
from routes.product_routes import product_bp
from routes.health_routes import health_bp

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)

app.register_blueprint(product_bp)
app.register_blueprint(health_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
