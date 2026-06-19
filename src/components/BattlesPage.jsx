import { useState, useEffect, useRef } from 'react';
import { Clock, ShieldCheck, Check, Send, AlertTriangle, HelpCircle, Lock, Heart, ExternalLink, Code } from 'lucide-react';
import { 
  getRegisteredPlayers, 
  registerPlayerForBattle, 
  getSubmissions, 
  addSubmission, 
  voteForSubmission, 
  getLiveFeed
} from '../utils/storage';

export default function BattlesPage({ currentUser, currentPhase, triggerNotification, onOpenAuth }) {
  const [registered, setRegistered] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  
  // Saturday Battle States
  const [secondsLeft, setSecondsLeft] = useState(3600); // 60 mins
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [description, setDescription] = useState('');
  const [userSubmission, setUserSubmission] = useState(null);
  
  // Voting States
  const [votedIds, setVotedIds] = useState([]); // track which subIds user voted for

  const feedRef = useRef(null);

  // Sync databases
  useEffect(() => {
    getRegisteredPlayers().then(setRegistered);
    getSubmissions().then(setSubmissions);
    getLiveFeed().then(setLiveFeed);
  }, [currentPhase]);

  // Saturday Battle Timer Countdown
  useEffect(() => {
    if (currentPhase !== 'battle') {
      setTimeout(() => setSecondsLeft(3600), 0); // reset if phase changes
    }
  }, [currentPhase]);

  useEffect(() => {
    if (currentPhase !== 'battle') return;
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase, secondsLeft]);

  // Scroll to top of activity feed when new event arrives
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [liveFeed]);

  // Periodically refresh the simulated feed to feel alive
  useEffect(() => {
    const handleStorageUpdate = () => {
      getLiveFeed().then(setLiveFeed);
      getSubmissions().then(setSubmissions);
      getRegisteredPlayers().then(setRegistered);
    };
    
    // Check local storage for changes every 2.5 seconds
    const interval = setInterval(handleStorageUpdate, 2500);
    return () => clearInterval(interval);
  }, []);

  // Format timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRegister = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    registerPlayerForBattle()
      .then(updatedList => {
        setRegistered(updatedList);
        triggerNotification('⚔️ REGISTERED!', 'You successfully joined Battle #12. +5 XP gained.', 'xp');
      })
      .catch(err => {
        console.error('Failed to enlist for battle:', err);
      });
  };

  const handleSubmitProject = (e) => {
    e.preventDefault();
    if (!githubUrl || !liveUrl || !description) return;
    
    addSubmission(
      currentUser.username,
      currentUser.avatar,
      githubUrl,
      liveUrl,
      description
    )
      .then(sub => {
        setUserSubmission(sub);
        getSubmissions().then(setSubmissions);
        triggerNotification('🚀 PUSHED TO LOBBY!', 'Project submitted successfully! +20 XP awarded.', 'xp');
        
        // Unlock Weekend Warrior & First Battle badge potentially
        if (!currentUser.badges.includes('First Battle')) {
          setTimeout(() => {
            triggerNotification('🏆 BADGE UNLOCKED!', 'Earned badge: "First Battle".', 'badge');
          }, 1500);
        }
      })
      .catch(err => {
        alert(err.message);
      });
  };

  const handleVote = (subId) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    
    voteForSubmission(subId)
      .then(res => {
        if (res.success) {
          setVotedIds([...votedIds, subId]);
          getSubmissions().then(setSubmissions);
          triggerNotification('❤️ VOTE CAST!', `Voted for Project successfully.`, 'xp');
        } else {
          alert(res.error);
        }
      })
      .catch(err => {
        console.error('Failed to vote:', err);
      });
  };

  // Check if current user is registered
  const isUserRegistered = currentUser && (registered.includes(currentUser.id) || registered.includes('current_user'));

  // Trigger processing rewards on phase results
  useEffect(() => {
    if (currentPhase === 'results') {
      getSubmissions().then(setSubmissions);
    }
  }, [currentPhase]);

  return (
    <div className="page-container">
      {/* Header Info */}
      <div className="battle-hero">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          CYBER CARDS SHOWDOWN
        </h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', fontSize: '0.95rem' }}>
          Battle #12: Build a futuristic gaming card featuring glassmorphism and custom animation effects.
        </p>

        {/* Phase Badges & Countdown clocks */}
        {currentPhase === 'registration' && (
          <>
            <div className="countdown-clock">18:42:09</div>
            <span className="battle-status-badge reg">⚔️ REGISTRATION OPEN</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Countdown to Registration Close (Thursday Midnight)</p>
          </>
        )}

        {currentPhase === 'closed' && (
          <>
            <div className="countdown-clock" style={{ color: 'var(--color-orange)', textShadow: '0 0 15px var(--color-orange-glow)' }}>REG LOCKED</div>
            <span className="battle-status-badge voting">🚫 REGISTRATION CLOSED</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Urgency lock active! Preparation day starts tomorrow.</p>
          </>
        )}

        {currentPhase === 'prep' && (
          <>
            <div className="countdown-clock" style={{ color: 'var(--color-blue)', textShadow: '0 0 15px var(--color-blue-glow)' }}>27:17:59</div>
            <span className="battle-status-badge prep">🛡️ PREPARATION MODE</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Countdown to Saturday 8:00 PM Challenge Reveal</p>
          </>
        )}

        {currentPhase === 'battle' && (
          <>
            <div className="countdown-clock">{formatTime(secondsLeft)}</div>
            <span className="battle-status-badge live">🔥 BATTLE IS LIVE</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Timer active. Submissions automatically close when clock hits 00:00.</p>
          </>
        )}

        {currentPhase === 'voting' && (
          <>
            <div className="countdown-clock" style={{ color: 'var(--color-orange)', textShadow: '0 0 15px var(--color-orange-glow)' }}>VOTING ENDS IN 12h</div>
            <span className="battle-status-badge voting">🗳️ VOTING UNDERWAY</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Cast your anonymous votes. Winners will be announced on Monday.</p>
          </>
        )}

        {currentPhase === 'results' && (
          <>
            <div className="countdown-clock" style={{ color: 'var(--color-green)', textShadow: '0 0 15px var(--color-green-glow)' }}>BATTLE CONCLUDED</div>
            <span className="battle-status-badge reg" style={{ color: 'var(--color-green)', borderColor: 'var(--color-green)' }}>🏆 COMPLETED</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Rewards processed. Leaderboards refreshed.</p>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '2rem' }}>
        
        {/* Main Left Section */}
        <div>
          {/* Phase 1 & 2: Registration Open or Closed */}
          {(currentPhase === 'registration' || currentPhase === 'closed') && (
            <div className="cyber-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem' }}>
                <ShieldCheck style={{ color: 'var(--color-purple)' }} />
                <span>BATTLE GATEWAY</span>
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>LOBBY PARTICIPANTS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{registered.length} Developers</div>
                </div>
                {isUserRegistered ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-green)', fontWeight: 'bold' }}>
                    <Check size={18} />
                    <span>⚔️ ENLISTED FOR SATURDAY</span>
                  </div>
                ) : (
                  <button 
                    className="btn-cyber" 
                    onClick={handleRegister}
                    disabled={currentPhase === 'closed'}
                    style={{ opacity: currentPhase === 'closed' ? 0.5 : 1 }}
                  >
                    {currentPhase === 'closed' ? 'LOCKED' : 'ENLIST FOR BATTLE'}
                  </button>
                )}
              </div>

              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>ALLOWED TECH STACKS</h4>
              <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <li style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>Vite React</li>
                <li style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>Pure CSS / Vanilla CSS</li>
                <li style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>Tailwind CSS</li>
              </ul>

              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>RULES OF ENGAGEMENT</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Timers begin strictly at Saturday 8:00 PM IST. You have exactly 60 minutes to push your project.</li>
                <li>Your submission must include a valid public GitHub repository and a live-hosted URL (e.g. Vercel, Netlify, Github Pages).</li>
                <li>No boilerplate or templates created prior to battle are allowed.</li>
                <li>Submit button locks automatically. Late submissions receive 0 XP.</li>
              </ul>
            </div>
          )}

          {/* Phase 3: Preparation Lobby */}
          {currentPhase === 'prep' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="cyber-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-blue)' }}>
                  <HelpCircle />
                  <span>PREPARATION MATERIAL</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  The challenge code details are locked, but you can prepare your build environment. Set up your Vite scaffold and prepare your local styling variables.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-blue)' }}>Recommended Assets</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Fetch gaming icons from Lucide, fonts from Google (Orbitron, Outfit, Inter).</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-blue)' }}>Submission Standard</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Confirm that your GitHub repo is public and Vercel hosting deployment takes under 1 minute.</span>
                  </div>
                </div>
              </div>

              {/* Locked Challenge Container */}
              <div className="cyber-card" style={{ textAlign: 'center', padding: '3.5rem', border: '1px dashed rgba(59, 130, 246, 0.4)', background: 'rgba(0,0,0,0.6)' }}>
                <Lock size={48} className="pulse-slow" style={{ color: 'var(--color-blue)', marginBottom: '1rem' }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>CHALLENGE DETAILED PROMPT</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                  Locked. The digital system will decrypt and reveal the challenge prompts exactly at Saturday 8:00 PM.
                </p>
              </div>
            </div>
          )}

          {/* Phase 4: Battle Phase (Live Challenge & Submission) */}
          {currentPhase === 'battle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="cyber-card glow-red" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-red)', marginBottom: '1rem' }}>
                  <Code />
                  <span>THE SATURDAY CHALLENGE</span>
                </h3>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--color-red)', marginBottom: '0.25rem' }}>PROMPT SPECIFICATION:</strong>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    Create a responsive cyberpunk "Esports Player Card" that houses levels, attributes, status indicators, and badges. Include a glassmorphism container, a glowing neon border that pulses, a subtle scanning grid line animation, and smooth 3D scaling transformations when hovering over the card. The card should look identical to high-fidelity Valorant client screens.
                  </p>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  <strong>Tech Constraint:</strong> You must write the styles using Vanilla CSS in your main stylesheet. Avoid pre-coded templates.
                </div>
              </div>

              {/* Submission Form */}
              <div className="cyber-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem' }}>
                  SUBMIT YOUR CODE
                </h3>
                
                {secondsLeft <= 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--color-red)' }}>
                    <AlertTriangle />
                    <div>
                      <strong>GATEWAY CLOSED</strong>
                      <p style={{ fontSize: '0.75rem' }}>Submissions are officially locked. The 60-minute limit has run out.</p>
                    </div>
                  </div>
                ) : !currentUser ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>You must connect your builder account to submit projects.</p>
                    <button className="btn-cyber" onClick={onOpenAuth}>CONNECT GAMER TAG</button>
                  </div>
                ) : !isUserRegistered ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--color-orange)' }}>
                    <AlertTriangle />
                    <div>
                      <strong>UNREGISTERED ENTRANT</strong>
                      <p style={{ fontSize: '0.75rem' }}>You did not register for this battle during Mon-Thu. You cannot submit projects, but you can spectate the lobby.</p>
                    </div>
                  </div>
                ) : userSubmission ? (
                  <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1.25rem', borderRadius: '8px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-green)', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                      <Check size={18} />
                      <span>SUBMISSION PUSHED (LOCKED & SECURED)</span>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <p><strong>GitHub URL:</strong> <a href={userSubmission.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-purple)' }}>{userSubmission.githubUrl}</a></p>
                      <p><strong>Live URL:</strong> <a href={userSubmission.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-purple)' }}>{userSubmission.liveUrl}</a></p>
                      <p style={{ marginTop: '0.5rem' }}><strong>Description:</strong> {userSubmission.description}</p>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>XP rewards (+20 XP) and badges have been assigned to your profile card. You can edit this submission until the countdown reaches zero.</p>
                    <button 
                      className="btn-cyber secondary" 
                      style={{ marginTop: '1rem', fontSize: '0.75rem', padding: '0.4rem 1rem' }} 
                      onClick={() => setUserSubmission(null)}
                    >
                      EDIT SUBMISSION
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProject} className="submission-form">
                    <div className="form-group">
                      <label className="form-label">Github Repository URL</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://github.com/username/repo-name" 
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Live Deployment URL</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://project-deployment-name.vercel.app" 
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Description / Technical Overview</label>
                      <textarea 
                        className="form-input" 
                        rows={4}
                        placeholder="Detail how you built the keyframe triggers, glass overlays, and performance hacks..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-cyber" style={{ gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
                      <Send size={16} />
                      <span>PUSH PROJECT SUBMISSION (+20 XP)</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Phase 5: Voting Phase */}
          {currentPhase === 'voting' && (
            <div>
              <div className="cyber-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-orange)' }}>
                  <Heart />
                  <span>VOTING ARENA</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Review submissions from the weekend battle below. To ensure fairness, submissions are displayed **anonymously**. Self-voting is disabled. Cast your votes based on design aesthetics, micro-interactions, and visual quality.
                </p>
              </div>

              <div className="voting-arena">
                {submissions.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>No submissions found for this weekend battle.</p>
                ) : (
                  submissions.map((sub, i) => {
                    const isSelf = currentUser && sub.username.toLowerCase() === currentUser.username.toLowerCase();
                    const hasVoted = votedIds.includes(sub.id);
                    
                    return (
                      <div key={sub.id} className="anonymous-card">
                        <div className="anonymous-header">
                          <span className="anonymous-id">PROJECT ANONYMOUS #{i+1}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {sub.votes} Votes
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', minHeight: '60px' }}>
                          {sub.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', margin: '0.5rem 0' }}>
                          <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                            <ExternalLink size={12} /> Github
                          </a>
                          <a href={sub.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                            <ExternalLink size={12} /> Live Link
                          </a>
                        </div>
                        
                        {isSelf ? (
                          <button className="btn-cyber secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>
                            SELF-VOTING BLOCKED
                          </button>
                        ) : hasVoted ? (
                          <button className="btn-cyber green" disabled style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>
                            VOTED
                          </button>
                        ) : (
                          <button 
                            className="btn-cyber" 
                            style={{ background: 'var(--color-orange)', width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                            onClick={() => handleVote(sub.id, sub.username)}
                          >
                            CAST VOTE
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Phase 6: Battle Results / Podium */}
          {currentPhase === 'results' && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>
                BATTLE #12 STANDINGS
              </h3>
              
              {/* Podium */}
              {submissions.length >= 3 && (
                <div className="podium-container">
                  {/* Runner Up */}
                  <div className="podium-column second">
                    <div className="podium-avatar-wrap">
                      <img src={submissions[1].avatar} alt={submissions[1].username} className="podium-avatar" />
                      <span className="crown" style={{ color: 'var(--color-blue)' }}>🥈</span>
                    </div>
                    <div className="podium-card">
                      <span className="podium-rank-badge">Runner-Up</span>
                      <strong style={{ fontSize: '0.95rem', display: 'block', margin: '0.25rem 0' }}>{submissions[1].username}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>{submissions[1].votes} Votes</span>
                      <span className="xp-pill" style={{ fontSize: '0.7rem' }}>+70 XP</span>
                    </div>
                  </div>

                  {/* Champion */}
                  <div className="podium-column first">
                    <div className="podium-avatar-wrap">
                      <img src={submissions[0].avatar} alt={submissions[0].username} className="podium-avatar" />
                      <span className="crown" style={{ color: 'var(--color-orange)' }}>🥇</span>
                    </div>
                    <div className="podium-card">
                      <span className="podium-rank-badge">Champion</span>
                      <strong style={{ fontSize: '1.1rem', display: 'block', margin: '0.25rem 0' }}>{submissions[0].username}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>{submissions[0].votes} Votes</span>
                      <span className="xp-pill" style={{ border: '1px solid var(--color-orange)', color: 'var(--color-orange)', background: 'rgba(245,158,11,0.15)', fontSize: '0.75rem' }}>+120 XP</span>
                    </div>
                  </div>

                  {/* Third */}
                  <div className="podium-column third">
                    <div className="podium-avatar-wrap">
                      <img src={submissions[2].avatar} alt={submissions[2].username} className="podium-avatar" />
                      <span className="crown" style={{ color: 'var(--color-purple)' }}>🥉</span>
                    </div>
                    <div className="podium-card">
                      <span className="podium-rank-badge">3rd Place</span>
                      <strong style={{ fontSize: '0.9rem', display: 'block', margin: '0.25rem 0' }}>{submissions[2].username}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>{submissions[2].votes} Votes</span>
                      <span className="xp-pill" style={{ fontSize: '0.7rem' }}>+70 XP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* All Submissions */}
              <div style={{ marginTop: '3rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>SUBMISSIONS LEDGER</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {submissions.map((sub, idx) => (
                    <div key={sub.id} className="cyber-card" style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <strong style={{ width: '20px', color: 'var(--color-text-muted)' }}>#{idx + 1}</strong>
                        <img src={sub.avatar} alt={sub.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{sub.username}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '1rem' }}>Votes: {sub.votes}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="btn-cyber secondary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}>Github</a>
                        <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="btn-cyber secondary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}>Live Demo</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Lobby Stream (Right Sidebar) */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <Clock size={16} />
            <span>Live Activity Stream</span>
          </h3>
          
          <div ref={feedRef} className="live-activity-feed">
            {liveFeed.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '3rem' }}>Lobby is idle. Events will appear here...</p>
            ) : (
              liveFeed.map((event, i) => (
                <div key={i} className="feed-item">
                  <span style={{ width: '6px', height: '6px', background: 'var(--color-purple)', borderRadius: '50%' }}></span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem' }}>{event.message}</span>
                    <div className="feed-time">{event.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick FAQ / Gamification card */}
          <div className="cyber-card" style={{ marginTop: '1.5rem', background: 'rgba(139, 92, 246, 0.03)', borderColor: 'rgba(139, 92, 246, 0.15)' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              XP REWARDS DISTRIB
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--color-text-muted)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Join Battle:</span> <strong style={{ color: '#fff' }}>+5 XP</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Submit Project:</span> <strong style={{ color: '#fff' }}>+20 XP</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Top 10 Builders:</span> <strong style={{ color: '#fff' }}>+50 XP</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Battle Champion:</span> <strong style={{ color: '#fff' }}>+100 XP</strong></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
