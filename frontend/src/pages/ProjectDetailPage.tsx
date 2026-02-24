import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { Project, Feedback } from '../types';
import Navbar from '../components/Navbar';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchProjectAndFeedback = async () => {
      try {
        const [projectRes, feedbackRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/feedback`),
        ]);
        setProject(projectRes.data);
        setFeedback(feedbackRes.data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
      }
    };
    fetchProjectAndFeedback();
  }, [id]);

  if (!project) return <div className="page-shell"><div className="page-container card">Loading...</div></div>;

  return (
    <div className="page-shell">
      <div className="page-container stack-lg">
        <Navbar />

        <section className="card stack-sm">
          <h2 className="page-title">{project.name}</h2>
          <p className="page-subtitle">{project.description}</p>
          <p className="muted">
            Public feedback link:{' '}
            <a href={`/public/${project.public_slug}`} target="_blank" rel="noopener noreferrer">
              {`/public/${project.public_slug}`}
            </a>
          </p>
        </section>

        <section className="card stack-sm">
          <h3 className="section-title">Feedback</h3>
          {feedback.length === 0 ? (
            <p className="muted">No feedback received yet.</p>
          ) : (
            <ul className="feedback-list">
              {feedback.map((item) => (
                <li key={item.id} className="feedback-item">
                  <p className="feedback-meta"><strong>{item.type}</strong> - {item.status}</p>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
