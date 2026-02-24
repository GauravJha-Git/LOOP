
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services import feedback_service, project_service
from backend.models import FeedbackStatus, Project, Feedback
import datetime

feedback_bp = Blueprint('feedback_bp', __name__, url_prefix='/api')

def get_current_user_id():
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None

def feedback_to_json(feedback):
    return {
        "id": feedback.id,
        "project_id": feedback.project_id,
        "type": feedback.type.name,
        "description": feedback.description,
        "status": feedback.status.name,
        "submitter_email": feedback.submitter_email,
        "created_at": feedback.created_at.isoformat(),
        "resolved_at": feedback.resolved_at.isoformat() if feedback.resolved_at else None,
    }

# Public routes
@feedback_bp.route('/public/<public_slug>', methods=['GET'])
def get_project_public(public_slug):
    project = project_service.get_project_by_slug(public_slug)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    expiry_date = project.created_at + datetime.timedelta(days=project.feedback_expiry_days)
    if datetime.datetime.utcnow() > expiry_date:
        return jsonify({"error": "Feedback submission for this project has expired"}), 410

    return jsonify({
        "name": project.name,
        "description": project.description,
        "product_url": project.product_url
    })

@feedback_bp.route('/public/<public_slug>/feedback', methods=['POST'])
def submit_feedback(public_slug):
    project = project_service.get_project_by_slug(public_slug)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    expiry_date = project.created_at + datetime.timedelta(days=project.feedback_expiry_days)
    if datetime.datetime.utcnow() > expiry_date:
        return jsonify({"error": "Feedback submission for this project has expired"}), 410

    data = request.get_json()
    if not data or not data.get('type') or not data.get('description'):
        return jsonify({"error": "type and description are required"}), 400

    data['project_id'] = project.id
    new_feedback = feedback_service.create_feedback(data)

    return jsonify({
        "message": "Feedback submitted successfully",
        "feedback_id": new_feedback.id
    }), 201

# Protected routes
@feedback_bp.route('/projects/<int:project_id>/feedback', methods=['GET'])
@jwt_required()
def get_project_feedback(project_id):
    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    project = project_service.get_project(project_id, current_user_id)
    if not project:
        return jsonify({"error": "Project not found or you do not have permission to view it"}), 404

    feedback_list = feedback_service.get_all_feedback_for_project(project_id)
    return jsonify([feedback_to_json(item) for item in feedback_list])

@feedback_bp.route('/feedback/<int:feedback_id>/status', methods=['PATCH'])
@jwt_required()
def update_feedback_status(feedback_id):
    current_user_id = get_current_user_id()
    if current_user_id is None:
        return jsonify({"error": "Invalid token identity"}), 401
    feedback = feedback_service.get_feedback(feedback_id)
    
    if not feedback:
        return jsonify({"error": "Feedback not found"}), 404

    # Check if the user owns the project this feedback belongs to
    project = project_service.get_project(feedback.project_id, current_user_id)
    if not project:
        return jsonify({"error": "You do not have permission to modify this feedback"}), 403

    data = request.get_json()
    if not data or not data.get('status'):
        return jsonify({"error": "status is required"}), 400

    try:
        new_status = FeedbackStatus(data['status'])
    except ValueError:
        return jsonify({"error": "Invalid status value"}), 400

    note = data.get('note')
    updated_feedback, error = feedback_service.update_feedback_status(feedback.id, new_status, note)

    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": "Feedback status updated successfully"})
