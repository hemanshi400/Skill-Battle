// LocalStorage keys
const STORAGE_KEYS = {
  PLAYERS: 'skillbattle_players',
  CURRENT_USER: 'skillbattle_curr_user',
  SUBMISSIONS: 'skillbattle_submissions',
  BATTLE_REGISTERED: 'skillbattle_registered',
  LIVE_FEED: 'skillbattle_live_feed',
};

// Initial Mock Players Seeding
const DEFAULT_PLAYERS = [
  {
    id: 'hemanshi',
    username: 'Hemanshi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    level: 5,
    xp: 1200,
    streak: 4,
    winRate: 85,
    badges: ['Weekend Warrior', 'Champion', 'Winning Streak', 'Top 10 Builder', 'Battle Veteran'],
    history: [
      { id: 'b1', title: 'Cyber Glow Landing', rank: 1, xp: 120 },
      { id: 'b2', title: 'Arc Browser Mockup', rank: 2, xp: 70 },
      { id: 'b3', title: 'Discord Overlay Hack', rank: 1, xp: 120 },
    ]
  },
  {
    id: 'priya',
    username: 'Priya',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    level: 4,
    xp: 750,
    streak: 2,
    winRate: 60,
    badges: ['Weekend Warrior', 'Top 10 Builder', 'Battle Veteran'],
    history: [
      { id: 'b1', title: 'Cyber Glow Landing', rank: 4, xp: 25 },
      { id: 'b2', title: 'Arc Browser Mockup', rank: 1, xp: 120 },
    ]
  },
  {
    id: 'rahul',
    username: 'Rahul',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    level: 3,
    xp: 450,
    streak: 1,
    winRate: 40,
    badges: ['Weekend Warrior', 'First Battle'],
    history: [
      { id: 'b2', title: 'Arc Browser Mockup', rank: 7, xp: 25 },
    ]
  },
  {
    id: 'alex_cyber',
    username: 'AlexCyber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: 2,
    xp: 180,
    streak: 0,
    winRate: 20,
    badges: ['Weekend Warrior'],
    history: [
      { id: 'b1', title: 'Cyber Glow Landing', rank: 12, xp: 5 },
    ]
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub_priya',
    username: 'Priya',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/priya/cyber-card-battle',
    liveUrl: 'https://cyber-card-battle.vercel.app',
    description: 'A 3D perspective battle card with hovering neon swords and particle blast effects upon activation. Fully styled in vanilla CSS.',
    votes: 8,
    battleId: 'current'
  },
  {
    id: 'sub_rahul',
    username: 'Rahul',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/rahul/cyberpunk-profile',
    liveUrl: 'https://cyberpunk-profile.netlify.app',
    description: 'Clean glassmorphic profile widget. Has toggleable character stat cards and glowing levels. Focuses on minimal typography.',
    votes: 4,
    battleId: 'current'
  },
  {
    id: 'sub_alex',
    username: 'AlexCyber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/alex/neon-esports-card',
    liveUrl: 'https://neon-esports-card.surge.sh',
    description: 'Simple responsive card with heavy neon glows and custom font headers.',
    votes: 2,
    battleId: 'current'
  }
];

const DEFAULT_FEED = [
  { time: '10 mins ago', message: 'Rahul registered for the Battle' },
  { time: '18 mins ago', message: 'Priya submitted project "3D Perspective Battle Card"' },
  { time: '25 mins ago', message: 'AlexCyber joined the preparation lobby' },
  { time: '40 mins ago', message: 'Hemanshi earned badge "Winning Streak"' },
  { time: '1 hr ago', message: 'Battle registration opened!' }
];

export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(DEFAULT_PLAYERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LIVE_FEED)) {
    localStorage.setItem(STORAGE_KEYS.LIVE_FEED, JSON.stringify(DEFAULT_FEED));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BATTLE_REGISTERED)) {
    localStorage.setItem(STORAGE_KEYS.BATTLE_REGISTERED, JSON.stringify(['priya', 'rahul', 'alex_cyber']));
  }
};

// Player CRUD
export const getPlayers = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '[]');
};

export const savePlayers = (players) => {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also save in players array
    const players = getPlayers();
    const index = players.findIndex(p => p.username.toLowerCase() === user.username.toLowerCase());
    if (index > -1) {
      players[index] = { ...players[index], ...user };
    } else {
      players.push(user);
    }
    savePlayers(players);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Battle registration
export const getRegisteredPlayers = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BATTLE_REGISTERED) || '[]');
};

export const registerPlayerForBattle = (userId) => {
  const registered = getRegisteredPlayers();
  if (!registered.includes(userId)) {
    registered.push(userId);
    localStorage.setItem(STORAGE_KEYS.BATTLE_REGISTERED, JSON.stringify(registered));
    
    // Add XP & Log Activity
    addXPToUser(userId, 5, 'Registration bonus (+5 XP)');
    addLiveFeedEvent(`${userId === 'current_user' ? 'You' : userId} registered for the weekend battle!`);
  }
};

// Submissions
export const getSubmissions = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
};

export const addSubmission = (username, avatar, githubUrl, liveUrl, description) => {
  const submissions = getSubmissions();
  
  // Check if already submitted
  const existingIndex = submissions.findIndex(s => s.username === username);
  
  const newSub = {
    id: existingIndex > -1 ? submissions[existingIndex].id : 'sub_' + Math.random().toString(36).substr(2, 9),
    username,
    avatar,
    githubUrl,
    liveUrl,
    description,
    votes: existingIndex > -1 ? submissions[existingIndex].votes : 0,
    battleId: 'current'
  };

  if (existingIndex > -1) {
    submissions[existingIndex] = newSub;
  } else {
    submissions.push(newSub);
    // Award +20 XP to User
    addXPToUserByUsername(username, 20, 'Submission bonus (+20 XP)');
    unlockBadgeByUsername(username, 'First Battle');
    unlockBadgeByUsername(username, 'Weekend Warrior');
  }

  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  addLiveFeedEvent(`${username} submitted project: "${description.substring(0, 30)}..."`);
  return newSub;
};

// Community Voting
export const voteForSubmission = (subId, voterUsername) => {
  const submissions = getSubmissions();
  const subIndex = submissions.findIndex(s => s.id === subId);
  
  if (subIndex > -1) {
    // Check self-voting
    if (submissions[subIndex].username === voterUsername) {
      return { success: false, error: 'Self-voting is not allowed' };
    }
    
    submissions[subIndex].votes += 1;
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    addLiveFeedEvent(`Anonymous vote cast for project by ${submissions[subIndex].username}`);
    return { success: true, newVotes: submissions[subIndex].votes };
  }
  return { success: false, error: 'Submission not found' };
};

// Dynamic Feed
export const getLiveFeed = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIVE_FEED) || '[]');
};

export const addLiveFeedEvent = (message) => {
  const feed = getLiveFeed();
  feed.unshift({
    time: 'Just now',
    message
  });
  localStorage.setItem(STORAGE_KEYS.LIVE_FEED, JSON.stringify(feed.slice(0, 30)));
};

// Level and Badge Engine helpers
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

export const addXPToUserByUsername = (username, amount, reason) => {
  const players = getPlayers();
  const index = players.findIndex(p => p.username.toLowerCase() === username.toLowerCase());
  
  if (index > -1) {
    const player = players[index];
    const prevXP = player.xp;
    player.xp += amount;
    
    // Check Level Up
    let newLevel = player.level;
    for (let i = XP_LEVEL_MAP.length - 1; i >= 0; i--) {
      if (player.xp >= XP_LEVEL_MAP[i].xpRequired) {
        newLevel = XP_LEVEL_MAP[i].level;
        break;
      }
    }
    
    let leveledUp = false;
    if (newLevel > player.level) {
      player.level = newLevel;
      leveledUp = true;
    }
    
    players[index] = player;
    savePlayers(players);
    
    // If it is the current logged-in user, sync current user state too
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
      currentUser.xp = player.xp;
      currentUser.level = player.level;
      setCurrentUser(currentUser);
      
      // Return details for trigger notification
      return { amount, reason, leveledUp, levelName: getLevelName(newLevel), level: newLevel };
    }
  }
  return null;
};

export const addXPToUser = (userId, amount, reason) => {
  const user = getCurrentUser();
  if (user) {
    return addXPToUserByUsername(user.username, amount, reason);
  }
  return null;
};

export const unlockBadgeByUsername = (username, badgeName) => {
  const players = getPlayers();
  const index = players.findIndex(p => p.username.toLowerCase() === username.toLowerCase());
  
  if (index > -1) {
    const player = players[index];
    if (!player.badges) player.badges = [];
    
    if (!player.badges.includes(badgeName)) {
      player.badges.push(badgeName);
      players[index] = player;
      savePlayers(players);
      
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
        currentUser.badges = player.badges;
        setCurrentUser(currentUser);
        return { badgeName, unlocked: true };
      }
    }
  }
  return null;
};

export const unlockBadge = (badgeName) => {
  const user = getCurrentUser();
  if (user) {
    return unlockBadgeByUsername(user.username, badgeName);
  }
  return null;
};

// End of Battle results evaluation simulation
export const processBattleEndResults = () => {
  const submissions = getSubmissions().sort((a,b) => b.votes - a.votes);
  if (submissions.length === 0) return;
  
  // Rank 1: Winner
  const winner = submissions[0];
  const winnerReward = addXPToUserByUsername(winner.username, 100, 'Battle Winner (+100 XP)');
  unlockBadgeByUsername(winner.username, 'Champion');
  addLiveFeedEvent(`🏆 ${winner.username} won the Weekend Battle!`);

  // Top 10 gets +50 XP
  submissions.slice(0, 10).forEach((sub, rankIndex) => {
    addXPToUserByUsername(sub.username, 50, 'Top 10 Battle Bonus (+50 XP)');
    unlockBadgeByUsername(sub.username, 'Top 10 Builder');
    
    // Add to history
    const players = getPlayers();
    const pIdx = players.findIndex(p => p.username === sub.username);
    if (pIdx > -1) {
      if (!players[pIdx].history) players[pIdx].history = [];
      players[pIdx].history.unshift({
        id: 'battle_' + Date.now(),
        title: 'Cyber Arena Card Showdown',
        rank: rankIndex + 1,
        xp: rankIndex === 0 ? 100 + 50 + 20 : 50 + 20
      });
      savePlayers(players);
    }
  });

  // Re-sync current user if they participated
  const currUser = getCurrentUser();
  if (currUser) {
    const players = getPlayers();
    const updatedMe = players.find(p => p.username === currUser.username);
    if (updatedMe) {
      setCurrentUser(updatedMe);
    }
  }
};
