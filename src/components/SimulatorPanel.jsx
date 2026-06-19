import { useState } from 'react';
import { Settings, Activity, Zap } from 'lucide-react';
import { addLiveFeedEvent } from '../utils/storage';

const PHASES = [
  { key: 'registration', label: 'Mon-Wed: Registration Open', day: 'Monday' },
  { key: 'closed', label: 'Thu: Registration Closed', day: 'Thursday' },
  { key: 'prep', label: 'Fri: Preparation Day', day: 'Friday' },
  { key: 'battle', label: 'Sat 8PM: Battle Active (60m)', day: 'Saturday' },
  { key: 'voting', label: 'Sun: Community Voting', day: 'Sunday' },
  { key: 'results', label: 'Mon: Results & Rewards', day: 'Results' }
];

export default function SimulatorPanel({ currentPhase, onPhaseChange, onTriggerFeedEvent }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePhaseClick = (phase) => {
    onPhaseChange(phase);
    addLiveFeedEvent(`[SIMULATOR] System phase shifted to: ${phase.toUpperCase()}`);
  };

  const handleSimActivity = () => {
    const messages = [
      "Zack_Coder registered for the battle",
      "Priya earned the 'Battle Veteran' badge!",
      "Rahul updated project submission description",
      "Player 'Viper' joined the active lobby",
      "Anonymous vote cast for Project Alpha",
      "AlexCyber registered for the battle",
      "Player 'Phoenix' submitted: 'Neon Weather Widget'"
    ];
    const randMsg = messages[Math.floor(Math.random() * messages.length)];
    onTriggerFeedEvent(randMsg);
  };

  return (
    <div className="sim-panel-wrapper">
      {!isOpen ? (
        <button className="sim-panel-btn" onClick={() => setIsOpen(true)}>
          <Settings size={18} className="animate-spin" />
          <span>SIMULATOR CONTROLS</span>
        </button>
      ) : (
        <div className="sim-panel-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="sim-section-title">CHRONO-SIMULATOR</span>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              CLOSE [X]
            </button>
          </div>
          
          <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '-5px 0 5px 0' }}>
            Change days to see how Skill Battle adapts:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {PHASES.map((p) => (
              <button
                key={p.key}
                className={`btn-sim-opt ${currentPhase === p.key ? 'active' : ''}`}
                onClick={() => handlePhaseClick(p.key)}
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{p.label}</span>
                {currentPhase === p.key && <Zap size={10} style={{ color: 'var(--color-purple)' }} />}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
            <span className="sim-section-title" style={{ display: 'block', marginBottom: '0.5rem' }}>LOBBY SIMULATOR</span>
            <button 
              className="btn-sim-opt" 
              onClick={handleSimActivity}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}
            >
              <Activity size={14} />
              <span>Simulate Lobby Event</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
