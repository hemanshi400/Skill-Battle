import { useState, useEffect } from 'react';
import { Trophy, Search, Flame } from 'lucide-react';
import { getPlayers } from '../utils/storage';

export default function LeaderboardPage({ currentUser }) {
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch and sort players by XP descending
    getPlayers().then(data => {
      if (data) {
        const sorted = data.sort((a, b) => b.xp - a.xp);
        setPlayers(sorted);
      }
    });
  }, []);

  const filteredPlayers = players.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split top 3 for podium
  const podium = players.slice(0, 3);


  return (
    <div className="page-container">
      <h2 className="section-title">
        <Trophy size={24} style={{ color: 'var(--color-orange)' }} />
        <span>ARENA LEADERBOARD</span>
      </h2>

      {/* Esports Podium */}
      {podium.length >= 3 && searchQuery === '' && (
        <div className="podium-container" style={{ marginBottom: '4rem' }}>
          {/* Rank 2 (Runner-Up) - Left */}
          {podium[1] && (
            <div className="podium-column second">
              <div className="podium-avatar-wrap">
                <img src={podium[1].avatar} alt={podium[1].username} className="podium-avatar" />
                <span className="crown" style={{ color: 'var(--color-blue)' }}>🥈</span>
              </div>
              <div className="podium-card">
                <span className="podium-rank-badge">Runner-Up</span>
                <strong style={{ fontSize: '1rem', display: 'block', margin: '0.25rem 0' }}>{podium[1].username}</strong>
                <span className="xp-pill">{podium[1].xp} XP</span>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  <span>Win Rate: {podium[1].winRate}%</span>
                  <span>|</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: 'var(--color-orange)' }}>
                    <Flame size={10} /> {podium[1].streak}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Champion) - Center */}
          {podium[0] && (
            <div className="podium-column first">
              <div className="podium-avatar-wrap">
                <img src={podium[0].avatar} alt={podium[0].username} className="podium-avatar" />
                <span className="crown" style={{ color: 'var(--color-orange)' }}>🥇</span>
              </div>
              <div className="podium-card">
                <span className="podium-rank-badge">Champion</span>
                <strong style={{ fontSize: '1.2rem', display: 'block', margin: '0.25rem 0' }}>{podium[0].username}</strong>
                <span className="xp-pill" style={{ border: '1px solid var(--color-orange)', color: 'var(--color-orange)', background: 'rgba(245,158,11,0.15)' }}>
                  {podium[0].xp} XP
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  <span>Win Rate: {podium[0].winRate}%</span>
                  <span>|</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: 'var(--color-orange)' }}>
                    <Flame size={12} /> {podium[0].streak}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Third Place) - Right */}
          {podium[2] && (
            <div className="podium-column third">
              <div className="podium-avatar-wrap">
                <img src={podium[2].avatar} alt={podium[2].username} className="podium-avatar" />
                <span className="crown" style={{ color: 'var(--color-purple)' }}>🥉</span>
              </div>
              <div className="podium-card">
                <span className="podium-rank-badge">3rd Place</span>
                <strong style={{ fontSize: '0.95rem', display: 'block', margin: '0.25rem 0' }}>{podium[2].username}</strong>
                <span className="xp-pill">{podium[2].xp} XP</span>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  <span>Win Rate: {podium[2].winRate}%</span>
                  <span>|</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: 'var(--color-orange)' }}>
                    <Flame size={10} /> {podium[2].streak}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table Grid */}
      <div className="leaderboard-table-container">
        
        {/* Search */}
        <div className="leaderboard-search-bar">
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for players..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Header Row */}
        <div className="leaderboard-header-row">
          <div>Rank</div>
          <div>Builder Tag</div>
          <div>Total XP</div>
          <div>Win Rate</div>
          <div>Streak</div>
          <div>Badges</div>
        </div>

        {/* Rows */}
        {filteredPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No builders match your search query.
          </div>
        ) : (
          filteredPlayers.map((player, idx) => {
            const isMe = currentUser && player.username.toLowerCase() === currentUser.username.toLowerCase();
            return (
              <div 
                key={player.id} 
                className="leaderboard-player-row"
                style={{ 
                  background: isMe ? 'rgba(139, 92, 246, 0.05)' : '',
                  borderLeft: isMe ? '3px solid var(--color-purple)' : ''
                }}
              >
                <div className="lb-rank" style={{ color: idx < 3 ? 'var(--color-orange)' : 'var(--color-text-muted)' }}>
                  #{idx + 1}
                </div>
                
                <div className="lb-player-info">
                  <img src={player.avatar} alt={player.username} className="lb-avatar" />
                  <div>
                    <span className="lb-name" style={{ color: isMe ? 'var(--color-purple)' : '#fff' }}>
                      {player.username} {isMe && '(You)'}
                    </span>
                    <span className="lb-level">Lvl {player.level}</span>
                  </div>
                </div>

                <div className="lb-xp">{player.xp} XP</div>
                <div className="lb-winrate">{player.winRate}%</div>
                
                <div className="lb-streak">
                  {player.streak > 0 ? (
                    <>
                      <Flame size={14} fill="var(--color-orange)" />
                      <span>{player.streak} Win Streak</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                  )}
                </div>

                <div className="lb-badges">
                  {player.badges && player.badges.length > 0 ? (
                    player.badges.slice(0, 3).map((badge, i) => (
                      <span key={i} className="lb-badge-mini" title={badge}>
                        {badge}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>None</span>
                  )}
                  {player.badges && player.badges.length > 3 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                      +{player.badges.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
