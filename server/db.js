import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initial Mock Seed Data
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

const DEFAULT_DB = {
  players: DEFAULT_PLAYERS,
  submissions: DEFAULT_SUBMISSIONS,
  registered: ['priya', 'rahul', 'alex_cyber'],
  liveFeed: DEFAULT_FEED,
  currentPhase: 'registration'
};

// Reads data synchronously from the database file
export function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error('Failed to read database file, falling back to default database structure:', error);
    return DEFAULT_DB;
  }
}

// Writes data synchronously to the database file
export function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file:', error);
  }
}

// User helper methods
export function getUsers() {
  return readDB().players || [];
}

export function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getUserByOAuthId(provider, oauthId) {
  const users = getUsers();
  return users.find(u => u.provider === provider && u.oauthId === oauthId) || null;
}

export function createUser(userData) {
  const db = readDB();
  const newUser = {
    id: userData.id || `user_${Math.random().toString(36).substring(2, 9)}`,
    username: userData.username || '',
    email: userData.email || '',
    provider: userData.provider || '',
    oauthId: userData.oauthId || '',
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    level: userData.level || 1,
    xp: userData.xp || 0,
    streak: userData.streak || 0,
    winRate: userData.winRate || 0,
    badges: userData.badges || [],
    history: userData.history || [],
    onboarded: userData.onboarded !== undefined ? userData.onboarded : false
  };

  db.players.push(newUser);
  writeDB(db);
  return newUser;
}

export function updateUser(id, updates) {
  const db = readDB();
  const idx = db.players.findIndex(u => u.id === id);
  if (idx !== -1) {
    db.players[idx] = { ...db.players[idx], ...updates };
    writeDB(db);
    return db.players[idx];
  }
  return null;
}

export function updateUserByUsername(username, updates) {
  const db = readDB();
  const idx = db.players.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx !== -1) {
    db.players[idx] = { ...db.players[idx], ...updates };
    writeDB(db);
    return db.players[idx];
  }
  return null;
}

// Registered players for battles
export function getRegisteredPlayers() {
  return readDB().registered || [];
}

export function registerPlayer(userId) {
  const db = readDB();
  if (!db.registered.includes(userId)) {
    db.registered.push(userId);
    writeDB(db);
  }
  return db.registered;
}

// Submissions helper
export function getSubmissions() {
  return readDB().submissions || [];
}

export function addSubmission(username, avatar, githubUrl, liveUrl, description) {
  const db = readDB();
  const existingIdx = db.submissions.findIndex(s => s.username === username);

  const sub = {
    id: existingIdx > -1 ? db.submissions[existingIdx].id : 'sub_' + Math.random().toString(36).substr(2, 9),
    username,
    avatar,
    githubUrl,
    liveUrl,
    description,
    votes: existingIdx > -1 ? db.submissions[existingIdx].votes : 0,
    battleId: 'current'
  };

  if (existingIdx > -1) {
    db.submissions[existingIdx] = sub;
  } else {
    db.submissions.push(sub);
  }

  writeDB(db);
  return sub;
}

export function voteForSubmission(subId, voterUsername) {
  const db = readDB();
  const subIdx = db.submissions.findIndex(s => s.id === subId);

  if (subIdx > -1) {
    if (db.submissions[subIdx].username === voterUsername) {
      return { success: false, error: 'Self-voting is not allowed' };
    }
    db.submissions[subIdx].votes += 1;
    writeDB(db);
    return { success: true, newVotes: db.submissions[subIdx].votes, author: db.submissions[subIdx].username };
  }
  return { success: false, error: 'Submission not found' };
}

// Activity Feed
export function getLiveFeed() {
  return readDB().liveFeed || [];
}

export function addLiveFeedEvent(message) {
  const db = readDB();
  db.liveFeed.unshift({
    time: 'Just now',
    message
  });
  db.liveFeed = db.liveFeed.slice(0, 30);
  writeDB(db);
  return db.liveFeed;
}

// Phase Management
export function getPhase() {
  return readDB().currentPhase || 'registration';
}

export function setPhase(phase) {
  const db = readDB();
  db.currentPhase = phase;
  writeDB(db);
  return phase;
}
