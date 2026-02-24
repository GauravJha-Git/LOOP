
from flask import Flask
from .extensions import db, jwt
from flask_cors import CORS
from .config import Config
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from .routes.auth import auth_bp
        from .routes.projects import projects_bp
        from .routes.feedback import feedback_bp

        app.register_blueprint(auth_bp)
        app.register_blueprint(projects_bp)
        app.register_blueprint(feedback_bp)

        from . import models

        db.create_all()

    return app
