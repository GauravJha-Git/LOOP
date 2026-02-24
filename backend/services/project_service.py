
import secrets
import string
from backend.models import Project
from backend.extensions import db

def generate_slug(length=8):
    alphabet = string.ascii_letters + string.digits
    while True:
        slug = ''.join(secrets.choice(alphabet) for _ in range(length))
        if not Project.query.filter_by(public_slug=slug).first():
            return slug

def get_project_by_slug(public_slug):
    return Project.query.filter_by(public_slug=public_slug).first()

def create_project(data):
    new_project = Project(
        user_id=data['user_id'],
        name=data['name'],
        description=data.get('description'),
        product_url=data.get('product_url'),
        public_slug=generate_slug(),
        feedback_expiry_days=data.get('feedback_expiry_days', 3)
    )
    db.session.add(new_project)
    db.session.commit()
    return new_project

def get_project(project_id, user_id):
    return Project.query.filter_by(id=project_id, user_id=user_id).first()

def get_all_projects(user_id):
    return Project.query.filter_by(user_id=user_id).all()

def update_project(project_id, user_id, data):
    project = get_project(project_id, user_id)
    if project:
        project.name = data.get('name', project.name)
        project.description = data.get('description', project.description)
        project.product_url = data.get('product_url', project.product_url)
        project.feedback_expiry_days = data.get('feedback_expiry_days', project.feedback_expiry_days)
        db.session.commit()
    return project

def delete_project(project_id, user_id):
    project = get_project(project_id, user_id)
    if project:
        db.session.delete(project)
        db.session.commit()
    return project
