import { useState, useEffect } from 'react';
import { Users, Sword, Trophy, Zap, Clock, MessageSquare } from 'lucide-react';
import { getPlayers, getRegisteredPlayers } from '../utils/storage';

export default function LandingPage({ currentUser, onNavigate, onOpenAuth }) {
  const [registeredCount, setRegisteredCount] = useState(0);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getRegisteredPlayers().then(list => {
      if (list) setRegisteredCount(list.length);
    });
    getPlayers().then(list => {
      if (list) setPlayers(list.slice(0, 3));
    });
  }, []);

  const handleCtaClick = () => {
    if (currentUser) {
      onNavigate('battles');
    } else {
      onOpenAuth();
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-headline">EVERY SKILL HAS A BATTLEFIELD</h1>
        <div className="hero-subheadline">
          <span className="hero-sub-word purple">COMPETE.</span>
          <span className="hero-sub-word blue">BUILD.</span>
          <span className="hero-sub-word green">GET RECOGNIZED.</span>
        </div>
        <button className="btn-cyber" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }} onClick={handleCtaClick}>
          ENTER THE ARENA
        </button>
      </section>

      {/* Live Stats */}
      <section className="live-stats-bar">
        <div className="stat-item purple">
          <div className="stat-glow"></div>
          <Users size={24} style={{ color: 'var(--color-purple)' }} />
          <span className="stat-val">124</span>
          <span className="stat-lbl">🔥 Warriors Online</span>
        </div>
        <div className="stat-item blue">
          <div className="stat-glow"></div>
          <Sword size={24} style={{ color: 'var(--color-blue)' }} />
          <span className="stat-val">{registeredCount + 15}</span>
          <span className="stat-lbl">⚔️ Registrations Active</span>
        </div>
        <div className="stat-item orange">
          <div className="stat-glow"></div>
          <Trophy size={24} style={{ color: 'var(--color-orange)' }} />
          <span className="stat-val">18</span>
          <span className="stat-lbl">🏆 Elite Champions</span>
        </div>
      </section>

      {/* Upcoming Battle Callout */}
      <section style={{ margin: '4rem 0' }}>
        <h2 className="section-title">
          <Sword size={24} />
          <span>Active Weekend Battle</span>
        </h2>
        <div className="cyber-card glow-purple" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', padding: '2.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="battle-status-badge reg">Mon - Thu: Registration</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> Starts Saturday 8:00 PM (IST)
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              BATTLE #12: CYBER CARDS SHOWDOWN
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Build a premium coding/profile card widget featuring high-fidelity glassmorphism overlays, custom keyframes, skew hover reflections, and responsive mobile adaptation. Rules require pure CSS styling.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#fff' }}>
              <div><strong>LOBBY CAP:</strong> Unlimited</div>
              <div><strong>DURATION:</strong> 60 Mins</div>
              <div><strong>ALLOW STACK:</strong> React, Vanilla CSS</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '2rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>PRIZE POOL</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-orange)', textShadow: '0 0 10px var(--color-orange-glow)' }}>
              150 XP + BADGE
            </span>
            <button className="btn-cyber" style={{ width: '100%' }} onClick={() => onNavigate('battles')}>
              VIEW BATTLE LOBBY
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ margin: '4rem 0' }}>
        <h2 className="section-title">
          <Zap size={24} />
          <span>How It Works</span>
        </h2>
        <div className="grid-cards">
          <div className="cyber-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-purple)' }}>1. REGISTRATION</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Monday to Thursday. Secure your slot early. Registrations auto-lock on Thursday midnight.
            </p>
          </div>
          <div className="cyber-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-blue)' }}>2. PREPARATION</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Friday lobby opens. Allowed tools and styling frameworks are released. The challenge details remain locked.
            </p>
          </div>
          <div className="cyber-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚔️</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-red)' }}>3. Saturday Live</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              8:00 PM IST. The prompt is unveiled. Write your code, host online, and submit before the 60-minute clock finishes.
            </p>
          </div>
          <div className="cyber-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗳️</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-orange)' }}>4. COMMUNITY VOTE</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Sunday voting. Submissions are pooled anonymously. Review projects and vote. Anti-cheat locks self-votes.
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview & Top Players Spotlight */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
          <div>
            <h2 className="section-title">
              <Trophy size={24} />
              <span>Top Warriors Spotlight</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {players.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="cyber-card" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderColor: idx === 0 ? 'var(--color-orange)' : idx === 1 ? 'var(--color-blue)' : 'var(--color-purple)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={p.avatar} alt={p.username} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                      <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.7rem', padding: '0 0.3rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        L{p.level}
                      </span>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{p.username}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Win Rate: {p.winRate}% | Streak: {p.streak}🔥</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-purple)' }}>{p.xp} XP</span>
                    <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.25rem' }}>
                      {p.badges.slice(0, 2).map((b, i) => (
                        <span key={i} style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="section-title">
              <MessageSquare size={24} />
              <span>Arena Highlights</span>
            </h2>
            <div className="cyber-card" style={{ height: '300px', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontWeight: 'bold', textTransform: 'uppercase' }}>🏆 LAST WEEK WINNER</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>Hemanshi dominated the card design arena with a glassmorphism glowing widget that registered 45 community votes.</p>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: 'bold', textTransform: 'uppercase' }}>⚡ FASTEST SUBMITTER</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Priya pushed a live surge link in just 14 minutes with responsive canvas backdrops!</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-orange)', fontWeight: 'bold', textTransform: 'uppercase' }}>📈 TRENDING WARRIOR</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Rahul leveled up from Rookie to Challenger in under two weekends, claiming +350 XP.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
