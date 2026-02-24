
import datetime
from backend.extensions import db

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    product_url = db.Column(db.String(200), nullable=True)
    public_slug = db.Column(db.String(120), unique=True, nullable=False)
    feedback_expiry_days = db.Column(db.Integer, default=3, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    feedbacks = db.relationship('Feedback', backref='project', lazy=True)
