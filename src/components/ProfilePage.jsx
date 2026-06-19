import { Award, Flame, Shield, Calendar, Sparkles } from 'lucide-react';
import { getLevelName, getXpRangeForLevel } from '../utils/storage';

const ALL_BADGES = [
  { name: 'Weekend Warrior', desc: 'Join a weekend battle.', icon: '⚔️' },
  { name: 'First Battle', desc: 'Submit a project.', icon: '🚀' },
  { name: 'Champion', desc: 'Place 1st in voting.', icon: '🏆' },
  { name: 'Top 10 Builder', desc: 'Rank in top 10.', icon: '🏅' },
  { name: 'Battle Veteran', desc: 'Participate in 5+ battles.', icon: '🛡️' },
  { name: 'Winning Streak', desc: 'Win 2 battles in a row.', icon: '🔥' }
];

export default function ProfilePage({ currentUser, onOpenAuth }) {
  if (!currentUser) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="cyber-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
          <Shield size={48} className="pulse-slow" style={{ color: 'var(--color-purple)', marginBottom: '1.25rem', marginInline: 'auto' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>PROFILE DATA BLOCKED</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            Connect your developer profile to view your stats, XP rankings, unlocked achievements, and battle history.
          </p>
          <button className="btn-cyber" onClick={onOpenAuth}>CONNECT BUILDER TAG</button>
        </div>
      </div>
    );
  }

  // Calculate XP progress
  const levelName = getLevelName(currentUser.level);
  const xpRange = getXpRangeForLevel(currentUser.level);
  const totalXpInLevel = xpRange.max - xpRange.min;
  const earnedXpInLevel = currentUser.xp - xpRange.min;
  const progressPercent = Math.min(100, Math.max(0, (earnedXpInLevel / totalXpInLevel) * 100));

  // Default mock skills
  const mockSkills = [
    { name: 'Visual Design / Aesthetics', val: 78 + (currentUser.level * 4) },
    { name: 'CSS Core / Keyframes', val: 70 + (currentUser.level * 5) },
    { name: 'React State / Logic', val: 65 + (currentUser.level * 6) },
    { name: 'Lobby Speed / Velocity', val: 80 + (currentUser.level * 3) }
  ];

  return (
    <div className="page-container">
      <div className="profile-grid">
        
        {/* Left Column: Player card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="player-card">
            <div className="profile-avatar-wrapper">
              <img src={currentUser.avatar} alt={currentUser.username} className="profile-avatar" />
              <span className="profile-level-badge">Lvl {currentUser.level}</span>
            </div>
            
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span>{currentUser.username}</span>
              {currentUser.level >= 5 && <Sparkles size={16} style={{ color: 'var(--color-orange)' }} />}
            </h3>
            
            <span style={{ fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>
              RANK: {levelName}
            </span>

            {/* XP progress */}
            <div style={{ width: '100%', textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>LEVEL PROGRESS</span>
                <span>{currentUser.xp} / {xpRange.max} XP</span>
              </div>
              <div className="xp-bar-container">
                <div className="xp-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                {xpRange.max - currentUser.xp} XP to level up
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', gap: '1rem', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>WIN RATE</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--color-green)' }}>{currentUser.winRate || 0}%</strong>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>STREAK</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', gap: '0.1rem', justifyContent: 'center' }}>
                  <Flame size={14} /> {currentUser.streak || 0}
                </strong>
              </div>
            </div>
          </div>

          {/* Skill Ratings attributes */}
          <div className="cyber-card">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-purple)' }}>CHARACTER ATTRIBUTES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockSkills.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{s.name}</span>
                    <strong style={{ color: '#fff' }}>{s.val}</strong>
                  </div>
                  <div className="xp-bar-container" style={{ height: '6px' }}>
                    <div 
                      className="xp-bar-fill" 
                      style={{ 
                        width: `${s.val}%`, 
                        background: i % 2 === 0 ? 'var(--color-purple)' : 'var(--color-blue)' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Battle History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Achievements */}
          <div className="cyber-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              <Award style={{ color: 'var(--color-orange)' }} />
              <span>ACHIEVED REPUTATION</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Earn badges by joining weekend lobbies, shipping responsive projects, and ranking on the podium.
            </p>

            <div className="achievements-grid">
              {ALL_BADGES.map((b) => {
                const isUnlocked = currentUser.badges && currentUser.badges.includes(b.name);
                return (
                  <div key={b.name} className={`achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`}>
                    <div className="achievement-icon">{b.icon}</div>
                    <span className="achievement-title">{b.name}</span>
                    <span className="achievement-desc">{b.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Battle History */}
          <div className="cyber-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              <Calendar style={{ color: 'var(--color-blue)' }} />
              <span>BATTLE HISTORY LOGS</span>
            </h3>
            
            {(!currentUser.history || currentUser.history.length === 0) ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                No past battles registered. Connect on Saturday to log your first record!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentUser.history.map((hist) => (
                  <div 
                    key={hist.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px' 
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'block' }}>{hist.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Standing: Rank #{hist.rank}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-purple)', fontSize: '0.9rem' }}>
                        +{hist.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
