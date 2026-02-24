import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem("access_token", response.data.access_token);
      const token = response.data?.access_token;
      if (!token) {
        throw new Error('No access token in login response');
      }
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <form className="card form-card form-grid" onSubmit={handleSubmit}>
          <h2 className="form-title">Login</h2>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button className="btn btn-primary" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
