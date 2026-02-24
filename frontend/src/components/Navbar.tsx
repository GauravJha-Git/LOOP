import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="topbar">
      <div className="topbar-brand">LOOP</div>
      <div className="topbar-links">
        <Link className="topbar-link" to="/dashboard">Dashboard</Link>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
