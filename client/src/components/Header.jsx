import { useState } from 'react';
import './Header.css';

function Header({ user, onLogout }) {
  const [showLogIn, setShowLogIn] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">🏗️ Project Architects</h1>
        <nav className="nav">
          {user ? (
            <div className="user-section">
              <span className="user-email">{user.email || 'Guest'}</span>
              <button onClick={onLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <button className="w3-large w3-orange w3-hover-grey w3-round-large" onClick={() => setShowLogIn(true)}>Log In</button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
