from flask import Flask
from api.network import network_bp


app = Flask(__name__)

app.register_blueprint(network_bp)

if __name__ == "__main__":
    app.run(debug=True)