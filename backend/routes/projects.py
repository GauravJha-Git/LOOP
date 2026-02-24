
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services import project_service
import datetime

projects_bp = Blueprint('projects_bp', __name__, url_prefix='/api/projects')

def get_current_user_id():
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None

def project_to_json(project):
    expiry_date = project.created_at + datetime.timedelta(days=project.feedback_expiry_days)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "product_url": project.product_url,
        "public_slug": project.public_slug,
        "feedback_expiry_days": project.feedback_expiry_days,
        "created_at": project.created_at.isoformat(),
        "expiry_date": expiry_date.isoformat()
    }

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "name is required"}), 400

    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    data['user_id'] = current_user_id
    
    new_project = project_service.create_project(data)
    
    return jsonify(project_to_json(new_project)), 201

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    projects = project_service.get_all_projects(current_user_id)
    return jsonify([project_to_json(p) for p in projects])

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    project = project_service.get_project(project_id, current_user_id)
    if not project:
        return jsonify({"error": "Project not found or you do not have permission to view it"}), 404
    return jsonify(project_to_json(project))

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    data = request.get_json()
    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    updated_project = project_service.update_project(project_id, current_user_id, data)
    if not updated_project:
        return jsonify({"error": "Project not found or you do not have permission to update it"}), 404
    return jsonify(project_to_json(updated_project))

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    deleted_project = project_service.delete_project(project_id, current_user_id)
    if not deleted_project:
        return jsonify({"error": "Project not found or you do not have permission to delete it"}), 404
    return jsonify({"message": "Project deleted successfully"})
