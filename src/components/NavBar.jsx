import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__mark">/&gt;</span> feed
      </Link>
      {isAuthenticated && (
        <div className="navbar__links">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to={`/profile/${user.username}`}>Profile</Link>
          <button className="navbar__logout" onClick={handleLogout}>Log out</button>
        </div>
      )}
    </nav>
  );
}
