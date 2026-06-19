import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
  </svg>
);

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80', // Cyber guy
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Cyber girl
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', // Neo pilot
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Grid runner
];

export default function AuthModal({ isOpen, currentUser, onClose, onAuthSuccess }) {
  const [step, setStep] = useState(1); // 1: Select OAuth, 2: Setup Gamer Handle
  const [authType, setAuthType] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(MOCK_AVATARS[0]);
  const [error, setError] = useState('');

  // Simulated Connection loading states
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  // Auto-transition to Step 2 if user is logged in but not onboarded
  React.useEffect(() => {
    if (isOpen) {
      if (currentUser && !currentUser.onboarded) {
        const emailPrefix = currentUser.email ? currentUser.email.split('@')[0] : '';
        const suggestedHandle = emailPrefix ? emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_') : '';
        
        setTimeout(() => {
          setStep(2);
          setAuthType(currentUser.provider === 'google' ? 'Google' : 'GitHub');
          setUsername(suggestedHandle);
          setAvatar(currentUser.avatar || MOCK_AVATARS[0]);
        }, 0);
      } else {
        setTimeout(() => {
          setStep(1);
          setError('');
        }, 0);
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleOAuthClick = (type) => {
    setAuthType(type);
    setIsLoading(true);
    setProgress(0);
    setLogs([
      `Initializing ${type} Secure Accounts Handshake...`,
      'Contacting authorization gateway servers...',
      'Redirecting to secure terminal authentication gateway...'
    ]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 34;
      setProgress(Math.min(100, currentProgress));
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          window.location.href = `/api/auth/${type.toLowerCase()}`;
        }, 400);
      }
    }, 150);
  };

  const handleSetupProfile = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Player Handle cannot be empty!');
      return;
    }
    if (username.length < 3) {
      setError('Handle must be at least 3 characters!');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setLogs([
      'Securing gamer handle reservation...',
      'Syncing stats and attributes index...',
      'Saving onboarding configurations...'
    ]);

    fetch('/api/auth/onboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.trim(),
        avatar: avatar
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Onboarding failed');
        }
        return res.json();
      })
      .then((updatedUser) => {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(updatedUser);
          onClose();
        }, 500);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err.message);
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ borderColor: isLoading ? 'var(--color-blue)' : '' }}>
        
        {isLoading ? (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-blue)', textShadow: '0 0 10px var(--color-blue-glow)' }}>
              CONNECTING GATEWAY
            </h2>
            
            {/* Simulated Progress Loader */}
            <div style={{ position: 'relative', height: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  background: 'linear-gradient(90deg, var(--color-blue), var(--color-purple))', 
                  transition: 'width 0.3s ease-out' 
                }} 
              />
              <span style={{ position: 'absolute', top: '1px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {progress}%
              </span>
            </div>

            {/* Simulated Log Output Console */}
            <div 
              style={{ 
                background: '#000', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '8px', 
                padding: '1rem', 
                textAlign: 'left', 
                fontFamily: 'monospace', 
                fontSize: '0.75rem', 
                height: '150px', 
                overflowY: 'auto',
                color: 'var(--color-green)'
              }}
            >
              {logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '0.4rem', animation: 'slideUp 0.2s ease-out' }}>
                  <span style={{ color: 'var(--color-purple)' }}>&gt;</span> {log}
                </div>
              ))}
              <div style={{ color: '#fff', animation: 'glowPulse 2s infinite' }}>█</div>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.5rem', color: '#fff' }}>
              {step === 1 ? 'CONNECT YOUR ACCOUNT' : 'SECURE YOUR BADGE'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              {step === 1 ? 'Select a terminal gateway to login to the battlegrounds.' : 'Register your developer alias and gaming profile picture.'}
            </p>

            {step === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn-cyber secondary" style={{ width: '100%', gap: '0.75rem' }} onClick={() => handleOAuthClick('Google')}>
                  <GoogleIcon />
                  <span>Login with Google</span>
                </button>
                <button className="btn-cyber secondary" style={{ width: '100%', gap: '0.75rem' }} onClick={() => handleOAuthClick('GitHub')}>
                  <GitHubIcon />
                  <span>Login with GitHub</span>
                </button>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.5rem', paddingTop: '1rem' }}>
                  <button 
                    onClick={onClose} 
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Spectate for now
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSetupProfile}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.75rem', color: 'var(--color-green)' }}>
                  <span>Verified Auth Connection via {authType}</span>
                </div>
                
                <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                  <label className="form-label">Player Handle</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. NeoCoder_42" 
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    maxLength={16}
                    required
                  />
                </div>

                <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                  <label className="form-label">Choose Avatar</label>
                  <div className="avatar-selector">
                    {MOCK_AVATARS.map((avUrl, i) => (
                      <img 
                        key={i} 
                        src={avUrl} 
                        alt={`Avatar option ${i}`}
                        className={`avatar-opt ${avatar === avUrl ? 'selected' : ''}`}
                        onClick={() => setAvatar(avUrl)}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-red)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    <ShieldAlert size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    className="btn-cyber secondary" 
                    style={{ flex: 1, padding: '0.5rem 1rem' }} 
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn-cyber" 
                    style={{ flex: 2, padding: '0.5rem 1rem' }}
                  >
                    ENTER ARENA
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
