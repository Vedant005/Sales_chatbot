from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager 
from config import Config

db = SQLAlchemy()
jwt = JWTManager() 

def create_app():
    app = Flask(__name__)
    jwt.init_app(app)
    app.config.from_object(Config)
    
    db.init_app(app)
    CORS(app)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.routes.product import product_bp
    app.register_blueprint(product_bp, url_prefix='/products')

    from app.routes.chatbot import chatbot_bp
    app.register_blueprint(chatbot_bp, url_prefix='/chatbot') 


    app.jwt_blacklist = set()

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return jti in app.jwt_blacklist

    return app
