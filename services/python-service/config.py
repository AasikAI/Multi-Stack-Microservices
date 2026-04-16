import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", 3002))
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/productdb")
NODE_SERVICE_URL = os.getenv("NODE_SERVICE_URL", "http://localhost:3001")
JAVA_SERVICE_URL = os.getenv("JAVA_SERVICE_URL", "http://localhost:3003")
