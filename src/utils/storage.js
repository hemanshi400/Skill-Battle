// Level and Badge Engine mapping data
const XP_LEVEL_MAP = [
  { level: 1, name: 'Rookie', xpRequired: 0 },
  { level: 2, name: 'Builder', xpRequired: 100 },
  { level: 3, name: 'Challenger', xpRequired: 300 },
  { level: 4, name: 'Elite', xpRequired: 600 },
  { level: 5, name: 'Legend', xpRequired: 1000 },
];

export const getLevelName = (level) => {
  if (level >= 5) return 'Legend';
  if (level === 4) return 'Elite';
  if (level === 3) return 'Challenger';
  if (level === 2) return 'Builder';
  return 'Rookie';
};

export const getXpRangeForLevel = (level) => {
  const current = XP_LEVEL_MAP.find(x => x.level === level) || XP_LEVEL_MAP[0];
  const next = XP_LEVEL_MAP.find(x => x.level === level + 1) || { xpRequired: current.xpRequired + 500 };
  return { min: current.xpRequired, max: next.xpRequired };
};

// Initialize Storage Databases (Stub for client-side setup consistency)
export const initStorage = () => {
  // Backend manages seeding now. No-op.
};

// Fetch current user from JWT cookie session
export const getCurrentUser = async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.status === 200) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error('Failed to get current user session:', err);
    return null;
  }
};

// No-op for direct storage. Server sets cookie now.
export const setCurrentUser = () => {
  // Cookie handles session persistence.
};

// Fetch all registered players
export const getPlayers = async () => {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('Failed to fetch players');
    return await res.json();
  } catch (err) {
    console.error('Error fetching players from backend:', err);
    return [];
  }
};

// Fetch registered player IDs for battle enlisting
export const getRegisteredPlayers = async () => {
  try {
    const res = await fetch('/api/registered');
    if (!res.ok) throw new Error('Failed to fetch registered list');
    return await res.json();
  } catch (err) {
    console.error('Error fetching enlists:', err);
    return [];
  }
};

// Enlist player for battle
export const registerPlayerForBattle = async () => {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to register');
    }
    const data = await res.json();
    return data.registered;
  } catch (err) {
    console.error('Error enlisting player:', err);
    throw err;
  }
};

// Fetch all battle submissions
export const getSubmissions = async () => {
  try {
    const res = await fetch('/api/submissions');
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return await res.json();
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return [];
  }
};

// Add / Update project submission
export const addSubmission = async (username, avatar, githubUrl, liveUrl, description) => {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubUrl, liveUrl, description })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to submit project');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating submission:', err);
    throw err;
  }
};

// Vote for a project submission
export const voteForSubmission = async (subId) => {
  try {
    const res = await fetch(`/api/submissions/${subId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || 'Failed to vote' };
    }
    const data = await res.json();
    return { success: true, newVotes: data.newVotes };
  } catch (err) {
    console.error('Error casting vote:', err);
    return { success: false, error: err.message };
  }
};

// Fetch activity feed logs
export const getLiveFeed = async () => {
  try {
    const res = await fetch('/api/feed');
    if (!res.ok) throw new Error('Failed to fetch live feed');
    return await res.json();
  } catch (err) {
    console.error('Error fetching feed:', err);
    return [];
  }
};

// Add simulated feed activity
export const addLiveFeedEvent = async (message) => {
  try {
    const res = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to post live event');
    return await res.json();
  } catch (err) {
    console.error('Error adding activity log:', err);
    return [];
  }
};

// Fetch current active phase
export const getPhase = async () => {
  try {
    const res = await fetch('/api/phase');
    if (!res.ok) throw new Error('Failed to fetch system phase');
    const data = await res.json();
    return data.phase;
  } catch (err) {
    console.error('Error getting phase:', err);
    return 'registration';
  }
};

// Update active system phase (also handles results computation on results shift)
export const setPhase = async (phase) => {
  try {
    const res = await fetch('/api/phase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase })
    });
    if (!res.ok) throw new Error('Failed to update phase');
    const data = await res.json();
    return data.phase;
  } catch (err) {
    console.error('Error setting phase:', err);
    return phase;
  }
};

// Stub for battle end results called by frontend
export const processBattleEndResults = async () => {
  // Backend processes battle end logic automatically when transitioning phase to 'results'
};
