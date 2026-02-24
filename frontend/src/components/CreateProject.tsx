import { useState } from 'react';
import api from '../services/api';

const CreateProject = ({ onProjectCreated }: { onProjectCreated: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [feedbackExpiryDays, setFeedbackExpiryDays] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects/', { name, description, product_url: productUrl, feedback_expiry_days: feedbackExpiryDays });
      onProjectCreated();
      // Clear form
      setName('');
      setDescription('');
      setProductUrl('');
      setFeedbackExpiryDays(7);
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  return (
    <form className="card stack-sm" onSubmit={handleSubmit}>
      <h3 className="section-title">Create a New Project</h3>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" required />
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <input type="url" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="Product URL" required />
      <input type="number" value={feedbackExpiryDays} onChange={(e) => setFeedbackExpiryDays(parseInt(e.target.value))} placeholder="Feedback Expiry (days)" required />
      <button className="btn btn-primary" type="submit">Create Project</button>
    </form>
  );
};

export default CreateProject;
