
from ..models.feedback import Feedback, FeedbackStatus, FeedbackStatusHistory
from backend.extensions import db
import datetime

def create_feedback(data):
    new_feedback = Feedback(
        project_id=data['project_id'],
        type=data['type'],
        description=data['description'],
        submitter_email=data.get('submitter_email')
    )
    db.session.add(new_feedback)
    db.session.commit()
    # Create an initial status history record
    history_entry = FeedbackStatusHistory(
        feedback_id=new_feedback.id,
        old_status=FeedbackStatus.NEW,  # No old status for a new feedback
        new_status=FeedbackStatus.NEW,
        note="Feedback submitted"
    )
    db.session.add(history_entry)
    db.session.commit()
    return new_feedback

def get_feedback(feedback_id):
    return Feedback.query.get(feedback_id)

def get_all_feedback_for_project(project_id):
    return Feedback.query.filter_by(project_id=project_id).all()

def update_feedback_status(feedback_id, new_status, note=None):
    feedback = get_feedback(feedback_id)
    if not feedback:
        return None, "Feedback not found"

    old_status = feedback.status

    # Status transition validation
    valid_transitions = {
        FeedbackStatus.NEW: [FeedbackStatus.ACCEPTED, FeedbackStatus.REJECTED],
        FeedbackStatus.ACCEPTED: [FeedbackStatus.RESOLVED]
    }

    if old_status not in valid_transitions or new_status not in valid_transitions.get(old_status, []):
        return None, f"Invalid status transition from {old_status.value} to {new_status.value}"

    if new_status == FeedbackStatus.RESOLVED and not note:
        return None, "A note is required to resolve feedback"

    feedback.status = new_status
    if new_status in [FeedbackStatus.RESOLVED, FeedbackStatus.REJECTED]:
        feedback.resolved_at = datetime.datetime.utcnow()

    history_entry = FeedbackStatusHistory(
        feedback_id=feedback.id,
        old_status=old_status,
        new_status=new_status,
        note=note
    )
    db.session.add(history_entry)
    db.session.commit()

    return feedback, None
