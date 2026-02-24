
from flask_jwt_extended import create_access_token
from backend.models import FeedbackStatus


def test_invalid_status_transition(test_client, init_database):
    """1. Test an invalid status transition (e.g., NEW to RESOLVED)."""
    # Get the ID of a feedback with NEW status
    feedback_new = init_database.query(Feedback).filter_by(status=FeedbackStatus.NEW).first()

    # Get a token for the user
    access_token = create_access_token(identity=1) # Assuming user id is 1
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    response = test_client.patch(
        f'/api/feedback/{feedback_new.id}/status',
        json={'status': 'RESOLVED', 'note': 'Should fail'},
        headers=headers
    )

    assert response.status_code == 400
    assert "Invalid status transition" in response.get_json()['error']

def test_resolved_without_note(test_client, init_database):
    """2. Test marking feedback as RESOLVED without a note."""
    # Get the ID of a feedback with ACCEPTED status
    feedback_accepted = init_database.query(Feedback).filter_by(status=FeedbackStatus.ACCEPTED).first()

    access_token = create_access_token(identity=1)
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    response = test_client.patch(
        f'/api/feedback/{feedback_accepted.id}/status',
        json={'status': 'RESOLVED'}, # No note provided
        headers=headers
    )

    assert response.status_code == 400
    assert "A note is required" in response.get_json()['error']

def test_expired_feedback_submission(test_client, init_database):
    """3. Test submitting feedback to an expired project."""
    response = test_client.post(
        '/api/public/expired-project/feedback',
        json={'type': 'BUG', 'description': 'This should not be accepted'}
    )

    assert response.status_code == 410
    assert "expired" in response.get_json()['error']
