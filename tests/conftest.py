
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models import User, Project, Feedback, FeedbackStatus
import datetime

@pytest.fixture(scope='module')
def test_client():
    """A test client for the app."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret"
    })

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture(scope='module')
def init_database(test_client):
    """Initialize the database with some test data."""
    user = User(email="test@user.com")
    user.set_password("password")
    db.session.add(user)

    # Expired project
    expired_project = Project(
        user_id=user.id,
        name="Expired Project",
        public_slug="expired-project",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
        feedback_expiry_days=3
    )
    db.session.add(expired_project)

    # Active project
    active_project = Project(
        user_id=user.id,
        name="Active Project",
        public_slug="active-project"
    )
    db.session.add(active_project)
    db.session.commit()

    feedback_new = Feedback(project_id=active_project.id, type="BUG", description="A new bug.")
    feedback_accepted = Feedback(project_id=active_project.id, type="IDEA", description="An accepted idea.", status=FeedbackStatus.ACCEPTED)

    db.session.add(feedback_new)
    db.session.add(feedback_accepted)
    db.session.commit()

    yield db
