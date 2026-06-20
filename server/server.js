/* global process */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByOAuthId,
  createUser,
  updateUser,
  getRegisteredPlayers,
  registerPlayer,
  getSubmissions,
  addSubmission,
  voteForSubmission,
  getLiveFeed,
  addLiveFeedEvent,
  getPhase,
  setPhase
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cybersecretkey_9876543210!_arena';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.cyber_session;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Session token missing' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Session verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token session' });
  }
};

// GET /api/auth/status
// Check OAuth configuration status
app.get('/api/auth/status', (req, res) => {
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const githubConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  res.json({ googleConfigured, githubConfigured });
});

// GET /api/auth/google
// Start Google OAuth or redirect to mock gateway
app.get('/api/auth/google', (req, res) => {
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  if (!googleConfigured) {
    return res.redirect(`/api/auth/mock-gateway?provider=google`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL);
  const scope = encodeURIComponent('openid profile email');
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`;
  
  res.redirect(googleUrl);
});

// GET /api/auth/google/callback
// Exchange code for Google access token and fetch user details
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/?auth_error=CodeMissing`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenRes.json();
    if (tokens.error) {
      throw new Error(`Token Exchange failed: ${tokens.error_description || tokens.error}`);
    }

    // 2. Fetch User Profile Info from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await profileRes.json();

    // 3. Find or Create User
    let user = getUserByOAuthId('google', profile.sub);
    if (!user) {
      // Try by email to prevent double accounts
      user = getUserByEmail(profile.email);
      if (user) {
        // Link account to google provider
        user = updateUser(user.id, { provider: 'google', oauthId: profile.sub });
      } else {
        // Create new user with onboarded = false
        const defaultAvatar = profile.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
        user = createUser({
          email: profile.email,
          provider: 'google',
          oauthId: profile.sub,
          avatar: defaultAvatar,
          username: '',
          onboarded: false
        });
      }
    }

    // 4. Generate Session Cookie
    const sessionToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('cyber_session', sessionToken, {
      httpOnly: true,
      secure: false, // Set to true if running on HTTPS
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
      path: '/'
    });

    res.redirect(`${FRONTEND_URL}/?auth_success=true`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    res.redirect(`${FRONTEND_URL}/?auth_error=${encodeURIComponent(error.message)}`);
  }
});

// GET /api/auth/github
// Start GitHub OAuth or redirect to mock gateway
app.get('/api/auth/github', (req, res) => {
  const githubConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  if (!githubConfigured) {
    return res.redirect(`/api/auth/mock-gateway?provider=github`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.GITHUB_CALLBACK_URL);
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user%20user:email`;
  
  res.redirect(githubUrl);
});

// GET /api/auth/github/callback
// Exchange code for GitHub access token and fetch user details
app.get('/api/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/?auth_error=CodeMissing`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_CALLBACK_URL
      })
    });

    const tokens = await tokenRes.json();
    if (tokens.error) {
      throw new Error(`GitHub Token Exchange failed: ${tokens.error_description || tokens.error}`);
    }

    // 2. Fetch User Profile Info from GitHub
    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokens.access_token}` }
    });
    const profile = await profileRes.json();

    // 3. Fetch User Email (GitHub might keep it null if private)
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${tokens.access_token}` }
      });
      const emails = await emailRes.json();
      const primaryEmail = emails.find(e => e.primary) || emails[0];
      email = primaryEmail ? primaryEmail.email : `${profile.login}@github.mock`;
    }

    // 4. Find or Create User
    let user = getUserByOAuthId('github', profile.id.toString());
    if (!user) {
      user = getUserByEmail(email);
      if (user) {
        user = updateUser(user.id, { provider: 'github', oauthId: profile.id.toString() });
      } else {
        const defaultAvatar = profile.avatar_url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80';
        user = createUser({
          email,
          provider: 'github',
          oauthId: profile.id.toString(),
          avatar: defaultAvatar,
          username: '',
          onboarded: false
        });
      }
    }

    // 5. Generate Session Cookie
    const sessionToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('cyber_session', sessionToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 3600 * 1000,
      path: '/'
    });

    res.redirect(`${FRONTEND_URL}/?auth_success=true`);
  } catch (error) {
    console.error('GitHub Callback Error:', error);
    res.redirect(`${FRONTEND_URL}/?auth_error=${encodeURIComponent(error.message)}`);
  }
});

// GET /api/auth/mock-gateway
// Beautiful Cyber Arena Mock OAuth Authentication Portal
app.get('/api/auth/mock-gateway', (req, res) => {
  const { provider } = req.query;
  const isGoogle = provider === 'google';

  const mockProfiles = isGoogle 
    ? [
        { name: 'Neo', email: 'neo@cyberarena.io', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80', id: 'google_neo' },
        { name: 'Trinity', email: 'trinity@matrix.net', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', id: 'google_trinity' },
        { name: 'Morpheus', email: 'morpheus@nebuchadnezzar.org', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', id: 'google_morpheus' }
      ]
    : [
        { name: 'git_hacker_x', email: 'hackerx@github.io', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', id: 'github_hackerx' },
        { name: 'cyber_glitch', email: 'glitch@neonlabs.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', id: 'github_glitch' },
        { name: 'bit_runner', email: 'runner@grid.net', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', id: 'github_runner' }
      ];

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Skill Battle // Terminal Bypass</title>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800;900&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --color-bg: #030303;
          --color-purple: #8b5cf6;
          --color-purple-glow: rgba(139, 92, 246, 0.4);
          --color-blue: #3b82f6;
          --color-blue-glow: rgba(59, 130, 246, 0.4);
          --color-green: #22c55e;
          --color-green-glow: rgba(34, 197, 94, 0.4);
          --color-border: rgba(255,255,255,0.08);
          --color-card-bg: rgba(255,255,255,0.02);
        }
        body {
          margin: 0;
          padding: 0;
          background-color: var(--color-bg);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
        }
        /* Matrix particles grid background */
        body::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 4px, 3px 100%;
          z-index: 1;
          pointer-events: none;
        }
        /* Glowing orb decoration */
        .orb {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 2;
          pointer-events: none;
          opacity: 0.15;
        }
        .orb-left {
          background-color: var(--color-blue);
          top: -10%; left: -10%;
        }
        .orb-right {
          background-color: var(--color-purple);
          bottom: -10%; right: -10%;
        }
        .container {
          position: relative;
          z-index: 10;
          max-width: 480px;
          width: 90%;
          background: rgba(10, 10, 10, 0.85);
          border: 1px solid var(--color-purple);
          box-shadow: 0 0 30px var(--color-purple-glow);
          border-radius: 12px;
          padding: 2.5rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .header {
          margin-bottom: 2rem;
        }
        .header h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
          color: #fff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        .provider-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 0.35rem 1rem;
          border-radius: 20px;
          margin-top: 0.5rem;
          text-transform: uppercase;
          border: 1px solid ${isGoogle ? 'var(--color-blue)' : 'var(--color-purple)'};
          color: ${isGoogle ? 'var(--color-blue)' : 'var(--color-purple)'};
          box-shadow: 0 0 10px ${isGoogle ? 'var(--color-blue-glow)' : 'var(--color-purple-glow)'};
        }
        .alert-box {
          background: rgba(139, 92, 246, 0.04);
          border: 1px dashed rgba(139, 92, 246, 0.25);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          line-height: 1.5;
          color: #ccc;
          margin-bottom: 2rem;
          text-align: left;
        }
        .profile-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--color-card-bg);
          border: 1px solid var(--color-border);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          text-align: left;
        }
        .profile-card:hover {
          border-color: var(--color-green);
          background: rgba(34, 197, 94, 0.04);
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.1);
        }
        .profile-card img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--color-border);
        }
        .profile-info {
          flex: 1;
        }
        .profile-info strong {
          display: block;
          font-size: 0.9rem;
          color: #fff;
        }
        .profile-info span {
          font-size: 0.75rem;
          color: #aaa;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: #555;
          font-size: 0.75rem;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--color-border);
        }
        .divider:not(:empty)::before {
          margin-right: .5em;
        }
        .divider:not(:empty)::after {
          margin-left: .5em;
        }
        .custom-form {
          text-align: left;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 0.35rem;
          letter-spacing: 1px;
        }
        .form-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.65rem 0.85rem;
          color: #fff;
          font-family: inherit;
          font-size: 0.85rem;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-purple);
          box-shadow: 0 0 8px var(--color-purple-glow);
        }
        .btn-submit {
          width: 100%;
          background: linear-gradient(90deg, var(--color-purple), var(--color-blue));
          border: none;
          color: #fff;
          padding: 0.75rem;
          font-family: 'Orbitron', sans-serif;
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 2px;
          border-radius: 6px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 0 15px var(--color-blue-glow);
          margin-top: 0.5rem;
        }
        .btn-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 25px var(--color-purple-glow);
        }
      </style>
    </head>
    <body>
      <div class="orb orb-left"></div>
      <div class="orb orb-right"></div>
      <div class="container">
        <div class="header">
          <h1>SKILL BATTLE // TERMINAL ACCESS</h1>
          <span class="provider-pill">SANDBOX BYPASS MODE</span>
        </div>

        <div class="alert-box">
          <strong>Notice:</strong> Provider Client Credentials are not configured in <code>.env</code>. The digital system has automatically triggered the Sandbox OAuth Bypass. Select a profile below to authenticate.
        </div>

        <div class="profile-list">
          ${mockProfiles.map(p => `
            <div class="profile-card" onclick="selectProfile('${p.name}', '${p.email}', '${p.id}', '${p.avatar}')">
              <img src="${p.avatar}" alt="${p.name}" />
              <div class="profile-info">
                <strong>${p.name}</strong>
                <span>${p.email}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="divider">OR CREATE CUSTOM HACKER</div>

        <form class="custom-form" action="/api/auth/mock-callback" method="GET">
          <input type="hidden" name="provider" value="${provider}" />
          <input type="hidden" name="avatar" id="custom-avatar" value="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80" />
          
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" name="name" class="form-input" placeholder="e.g. Neo Coder" required />
          </div>

          <div class="form-group">
            <label class="form-label">Hacker Email</label>
            <input type="email" name="email" class="form-input" placeholder="e.g. neo@cyberarena.io" required />
          </div>

          <div class="form-group">
            <label class="form-label">Custom OAuth User ID</label>
            <input type="text" name="oauthId" class="form-input" placeholder="e.g. custom_12345" required />
          </div>

          <button type="submit" class="btn-submit">AUTHORIZE SANDBOX CONNECT</button>
        </form>
      </div>

      <script>
        function selectProfile(name, email, id, avatar) {
          const url = '/api/auth/mock-callback?provider=' + encodeURIComponent('${provider}') + 
            '&name=' + encodeURIComponent(name) + 
            '&email=' + encodeURIComponent(email) + 
            '&oauthId=' + encodeURIComponent(id) + 
            '&avatar=' + encodeURIComponent(avatar);
          window.location.href = url;
        }
      </script>
    </body>
  </html>
  `;
  res.send(html);
});

// GET /api/auth/mock-callback
// Setup mock login redirect session
app.get('/api/auth/mock-callback', (req, res) => {
  const { provider, email, oauthId, avatar } = req.query;

  if (!email || !oauthId) {
    return res.redirect(`${FRONTEND_URL}/?auth_error=MockBypassMissingParams`);
  }

  // Find or Create User
  let user = getUserByOAuthId(provider, oauthId);
  if (!user) {
    user = getUserByEmail(email);
    if (user) {
      user = updateUser(user.id, { provider, oauthId });
    } else {
      user = createUser({
        email,
        provider,
        oauthId,
        avatar,
        username: '', // Leave empty to force onboarding
        onboarded: false
      });
    }
  }

  // Generate Session Cookie
  const sessionToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('cyber_session', sessionToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/'
  });

  res.redirect(`${FRONTEND_URL}/?auth_success=true`);
});

// GET /api/auth/me
// Get current authenticated user
app.get('/api/auth/me', authenticateUser, (req, res) => {
  res.json(req.user);
});

// POST /api/auth/onboard
// Onboard user with handle and avatar
app.post('/api/auth/onboard', authenticateUser, (req, res) => {
  const { username, avatar } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Gamer alias cannot be empty' });
  }

  const cleanHandle = username.trim();
  if (cleanHandle.length < 3) {
    return res.status(400).json({ error: 'Gamer handle must be at least 3 characters long' });
  }

  // Check if handle is already taken (excluding current user)
  const allUsers = getUsers();
  const duplicate = allUsers.find(u => u.username.toLowerCase() === cleanHandle.toLowerCase() && u.id !== req.user.id);
  if (duplicate) {
    return res.status(400).json({ error: 'Player handle is already enqueued by another builder' });
  }

  // Update profile
  const updatedUser = updateUser(req.user.id, {
    username: cleanHandle,
    avatar: avatar || req.user.avatar,
    onboarded: true
  });

  addLiveFeedEvent(`Player ${updatedUser.username} entered the Cyber Arena`);

  res.json(updatedUser);
});

// POST /api/auth/logout
// Terminate session
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('cyber_session', { path: '/' });
  res.json({ success: true });
});

// GET /api/players
// Fetch sorted players
app.get('/api/players', (req, res) => {
  const players = getUsers().sort((a, b) => b.xp - a.xp);
  res.json(players);
});

// GET /api/registered
// Fetch registered player IDs
app.get('/api/registered', (req, res) => {
  res.json(getRegisteredPlayers());
});

// POST /api/register
// Register logged-in user for battle
app.post('/api/register', authenticateUser, (req, res) => {
  registerPlayer(req.user.id);

  // Add +5 XP and Log
  const updatedPlayers = getUsers();
  const idx = updatedPlayers.findIndex(u => u.id === req.user.id);
  if (idx !== -1) {
    const player = updatedPlayers[idx];
    player.xp += 5;
    updateUser(req.user.id, { xp: player.xp });
  }

  addLiveFeedEvent(`${req.user.username} registered for the weekend battle!`);
  res.json({ success: true, registered: getRegisteredPlayers() });
});

// GET /api/submissions
// Fetch all submissions
app.get('/api/submissions', (req, res) => {
  res.json(getSubmissions());
});

// POST /api/submissions
// Submit project
app.post('/api/submissions', authenticateUser, (req, res) => {
  const { githubUrl, liveUrl, description } = req.body;
  if (!githubUrl || !liveUrl || !description) {
    return res.status(400).json({ error: 'Missing submission fields' });
  }

  const submissions = getSubmissions();
  const existingIdx = submissions.findIndex(s => s.username === req.user.username);
  
  const sub = addSubmission(req.user.username, req.user.avatar, githubUrl, liveUrl, description);
  
  if (existingIdx === -1) {
    // New submission, grant +20 XP and badges if not unlocked
    const user = req.user;
    const newXP = user.xp + 20;
    const badges = [...user.badges];
    if (!badges.includes('First Battle')) badges.push('First Battle');
    if (!badges.includes('Weekend Warrior')) badges.push('Weekend Warrior');
    
    // Simple level calculator
    let level = 1;
    if (newXP >= 1000) level = 5;
    else if (newXP >= 600) level = 4;
    else if (newXP >= 300) level = 3;
    else if (newXP >= 100) level = 2;
    
    updateUser(user.id, { xp: newXP, level, badges });
  }

  addLiveFeedEvent(`${req.user.username} submitted project: "${description.substring(0, 30)}..."`);
  res.json(sub);
});

// POST /api/submissions/:id/vote
// Cast vote
app.post('/api/submissions/:id/vote', authenticateUser, (req, res) => {
  const subId = req.params.id;
  const result = voteForSubmission(subId, req.user.username);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  addLiveFeedEvent(`Anonymous vote cast for project by ${result.author}`);
  res.json({ success: true, newVotes: result.newVotes });
});

// GET /api/feed
// Fetch feed
app.get('/api/feed', (req, res) => {
  res.json(getLiveFeed());
});

// POST /api/feed
// Add feed event
app.post('/api/feed', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message field is required' });
  }
  const feed = addLiveFeedEvent(message);
  res.json(feed);
});

// GET /api/phase
// Fetch phase
app.get('/api/phase', (req, res) => {
  res.json({ phase: getPhase() });
});

// POST /api/phase
// Update phase
app.post('/api/phase', (req, res) => {
  const { phase } = req.body;
  if (!phase) {
    return res.status(400).json({ error: 'Phase field is required' });
  }
  setPhase(phase);
  addLiveFeedEvent(`[SIMULATOR] System phase shifted to: ${phase.toUpperCase()}`);

  // If results phase, process results
  if (phase === 'results') {
    const submissions = getSubmissions().sort((a,b) => b.votes - a.votes);
    if (submissions.length > 0) {
      // 1st place: Winner
      const winner = submissions[0];
      const winnerUser = getUsers().find(u => u.username === winner.username);
      if (winnerUser) {
        const xp = winnerUser.xp + 100;
        const badges = [...winnerUser.badges];
        if (!badges.includes('Champion')) badges.push('Champion');
        updateUser(winnerUser.id, { xp, badges });
      }
      addLiveFeedEvent(`🏆 ${winner.username} won the Weekend Battle!`);

      // Top 10 gets +50 XP
      submissions.slice(0, 10).forEach((sub, rankIndex) => {
        const u = getUsers().find(usr => usr.username === sub.username);
        if (u) {
          const xp = u.xp + 50;
          const badges = [...u.badges];
          if (!badges.includes('Top 10 Builder')) badges.push('Top 10 Builder');
          
          const history = [...u.history];
          history.unshift({
            id: 'battle_' + Date.now() + '_' + rankIndex,
            title: 'Cyber Arena Card Showdown',
            rank: rankIndex + 1,
            xp: rankIndex === 0 ? 100 + 50 + 20 : 50 + 20
          });
          
          updateUser(u.id, { xp, badges, history });
        }
      });
    }
  }

  res.json({ phase });
});

app.listen(PORT, () => {
  console.log(`[Cyber Arena Backend] Server running at http://localhost:${PORT}`);
});
