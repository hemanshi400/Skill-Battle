import { useState, useEffect } from 'react';
import { Sword, Home, Trophy, User, LogIn, LogOut, Award, Star } from 'lucide-react';
import { getCurrentUser, addLiveFeedEvent, initStorage, getPhase, setPhase } from './utils/storage';
import LandingPage from './components/LandingPage';
import BattlesPage from './components/BattlesPage';
import LeaderboardPage from './components/LeaderboardPage';
import ProfilePage from './components/ProfilePage';
import AuthModal from './components/AuthModal';
import SimulatorPanel from './components/SimulatorPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setGamerUser] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('registration'); // registration, closed, prep, battle, voting, results
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast / notification trigger
  const triggerNotification = (title, desc, type = 'xp') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch authentication status, query params, and system phase on mount
  useEffect(() => {
    initStorage();
    
    // Check URL parameters for successful redirect from OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
      getCurrentUser().then(user => {
        if (user) {
          setGamerUser(user);
          if (!user.onboarded) {
            setIsAuthOpen(true);
          } else {
            triggerNotification('GATEWAY SECURED', `Welcome back, ${user.username}!`, 'xp');
          }
        }
      });
    } else {
      getCurrentUser().then(user => {
        if (user) {
          setGamerUser(user);
          if (!user.onboarded) {
            setIsAuthOpen(true);
          }
        }
      });
    }

    // Load active phase
    getPhase().then(phase => {
      if (phase) {
        setCurrentPhase(phase);
      }
    });
  }, []);

  const syncUser = (user) => {
    setGamerUser(user);
  };

  const handleLogout = () => {
    if (currentUser) {
      addLiveFeedEvent(`Player ${currentUser.username} exited the lobby`);
      fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
          setGamerUser(null);
          triggerNotification('LOBBY EXIT', 'You logged out of the Cyber Arena.', 'xp');
        })
        .catch(err => {
          console.error('Logout request failed:', err);
          setGamerUser(null);
        });
    }
  };

  // Capture simulator feed events
  const handleTriggerFeedEvent = (msg) => {
    addLiveFeedEvent(msg);
    // Visual alerts for feed actions
    if (msg.includes('submitted')) {
      triggerNotification('⚔️ LOBBY SUBMISSION', msg, 'xp');
    } else if (msg.includes('badge')) {
      triggerNotification('🏆 BADGE ACHIEVED', msg, 'badge');
    } else {
      triggerNotification('⚡ LOBBY UPDATE', msg, 'xp');
    }
  };

  // Render correct page body
  const renderBody = () => {
    switch (activeTab) {
      case 'home':
        return (
          <LandingPage 
            currentUser={currentUser} 
            onNavigate={setActiveTab} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'battles':
        return (
          <BattlesPage 
            currentUser={currentUser} 
            currentPhase={currentPhase} 
            triggerNotification={triggerNotification}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      case 'leaderboard':
        return <LeaderboardPage currentUser={currentUser} />;
      case 'profile':
        return (
          <ProfilePage 
            currentUser={currentUser} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      default:
        return (
          <LandingPage 
            currentUser={currentUser} 
            onNavigate={setActiveTab} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Background Matrix particles simulated grid */}
      <div className="grid-bg"></div>

      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="logo-container" onClick={() => setActiveTab('home')}>
          <span>SKILL</span>
          <span className="logo-highlight">BATTLE</span>
          <Sword size={20} className="logo-highlight" style={{ transform: 'rotate(45deg)' }} />
        </div>

        <nav className="desktop-nav">
          <button 
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={16} />
            <span>HOME</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'battles' ? 'active' : ''}`}
            onClick={() => setActiveTab('battles')}
          >
            <Sword size={16} />
            <span>BATTLES</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={16} />
            <span>RANKINGS</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>PROFILE</span>
          </button>
        </nav>

        <div className="user-status-widget">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="xp-pill">{currentUser.xp} XP</span>
              <span className="level-badge-nav">LVL {currentUser.level}</span>
              <div 
                onClick={() => setActiveTab('profile')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username} 
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-red)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem'
                }}
                title="Exit Arena"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="btn-cyber" style={{ padding: '0.5rem 1.25rem' }} onClick={() => setIsAuthOpen(true)}>
              <LogIn size={14} />
              <span>CONNECT TAG</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {renderBody()}
      </main>

      {/* Mobile Navigation (Bottom Nav) */}
      <nav className="mobile-bottom-nav">
        <a 
          className={`mobile-nav-link ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home />
          <span>Home</span>
        </a>
        <a 
          className={`mobile-nav-link ${activeTab === 'battles' ? 'active' : ''}`}
          onClick={() => setActiveTab('battles')}
        >
          <Sword />
          <span>Battles</span>
        </a>
        <a 
          className={`mobile-nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy />
          <span>Rankings</span>
        </a>
        <a 
          className={`mobile-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User />
          <span>Profile</span>
        </a>
      </nav>

      {/* Floating simulator panel overlays */}
      <SimulatorPanel 
        currentPhase={currentPhase} 
        onPhaseChange={async (phase) => {
          await setPhase(phase);
          setCurrentPhase(phase);
        }} 
        onTriggerFeedEvent={handleTriggerFeedEvent}
      />

      {/* Notification Toast Layer */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-message ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'badge' ? (
                <Award style={{ color: 'var(--color-purple)' }} />
              ) : (
                <Star style={{ color: 'var(--color-green)' }} />
              )}
            </div>
            <div className="toast-content">
              <span className="toast-title">{toast.title}</span>
              <span className="toast-desc">{toast.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Authentic Connect Tag Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        currentUser={currentUser}
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={syncUser}
      />

    </div>
  );
}
