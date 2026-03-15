import { useState, useEffect } from 'react';
import Header from '../components/Header';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';
import { healthCheck } from '../services/api';
import './Home.css';
import LandingPage from '../components/LandingPage';

function Home() {
  const { user, logout } = useAuth();
  const [serverStatus, setServerStatus] = useState('checking...');

  const checkServerHealth = async () => {
    try {
      const response = await healthCheck();
      setServerStatus(response.status === 'ok' ? '✓ Connected' : '✗ Error');
    } catch {
      setServerStatus('✗ Disconnected');
    }
  };

  useEffect(() => {
    // Check server health on component mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkServerHealth();
  }, []);

  // Landing page content
  return (
    <div className="home">
      <Header />
      <LandingPage />
      <div className="server-status">
        <p>Server Status: {serverStatus}</p>
      </div>
    </div>
  );
}

export default Home;
