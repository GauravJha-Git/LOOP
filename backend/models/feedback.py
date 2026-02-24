
import datetime
import enum
from backend.extensions import db

class FeedbackType(enum.Enum):
    BUG = "bug"
    FEATURE = "feature"
    CONFUSION = "confusion"
    SUGGESTION = "suggestion"

class FeedbackStatus(enum.Enum):
    NEW = "NEW"
    ACCEPTED = "ACCEPTED"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    type = db.Column(db.Enum(FeedbackType), nullable=False)
    description = db.Column(db.Text, nullable=False)
    submitter_email = db.Column(db.String(120), nullable=True)
    status = db.Column(db.Enum(FeedbackStatus), default=FeedbackStatus.NEW, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    history = db.relationship('FeedbackStatusHistory', backref='feedback', lazy=True)

class FeedbackStatusHistory(db.Model):
    __tablename__ = 'feedback_status_history'

    id = db.Column(db.Integer, primary_key=True)
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=False)
    old_status = db.Column(db.Enum(FeedbackStatus), nullable=False)
    new_status = db.Column(db.Enum(FeedbackStatus), nullable=False)
    note = db.Column(db.Text, nullable=True)
    changed_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
