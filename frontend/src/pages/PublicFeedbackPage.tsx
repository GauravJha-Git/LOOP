import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { FeedbackType, Project } from '../types';

const PublicFeedbackPage = () => {
  const { public_slug } = useParams<{ public_slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('BUG');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/public/${public_slug}`);
        setProject(response.data);
      } catch (err) {
        setError('Project not found or feedback period expired.');
      }
    };
    fetchProject();
  }, [public_slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/public/${public_slug}/feedback`, { type: feedbackType, description });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit feedback.');
    }
  };

  if (error) return <div className="page-shell"><div className="page-container card">{error}</div></div>;
  if (!project) return <div className="page-shell"><div className="page-container card">Loading...</div></div>;

  if (submitted) return <div className="page-shell"><div className="page-container card">Thank you for your feedback!</div></div>;

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="card stack-md" style={{ maxWidth: '700px', margin: '24px auto' }}>
          <div className="stack-sm">
            <h2 className="page-title">{project.name}</h2>
            <p className="page-subtitle">{project.description}</p>
            <a href={project.product_url} target="_blank" rel="noopener noreferrer">View Product</a>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <h3 className="section-title">Submit Feedback</h3>
            <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}>
              <option value="BUG">Bug</option>
              <option value="FEATURE">Idea</option>
              <option value="SUGGESTION">Other</option>
            </select>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your feedback" required />
            <button className="btn btn-primary" type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicFeedbackPage;
