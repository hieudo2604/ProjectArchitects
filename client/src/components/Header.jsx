import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

function Header({}) {
  const { user, logout, signIn } = useAuth();
  const [showLogIn, setShowLogIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      await signIn(email, password);   // Firebase login
      setShowLogIn(false);             // close modal
      navigate("/dashboard");          // redirect to Dashboard
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">🏗️ Project Architects</h1>
        <nav className="nav">
          {user ? (
            <div className="user-section">
              <span className="user-email">{user.email || 'Guest'}</span>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
          <>
            <button className="w3-large w3-orange w3-hover-grey w3-round-large" onClick={() => setShowLogIn(true)}>Log In</button>
            {showLogIn && (
            <LoginModal onClose={()=> setShowLogIn(false)} 
              onLogin={handleLogin}
            />
          )}
          </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
