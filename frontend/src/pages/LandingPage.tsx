import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="card stack-md form-card">
          <div>
            <h1 className="page-title">Welcome to LOOP</h1>
            <p className="page-subtitle">The best way to get feedback on your projects.</p>
          </div>
          <div className="topbar-links">
            <Link className="btn btn-link" to="/login">Login</Link>
            <Link className="btn btn-primary btn-link" to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
