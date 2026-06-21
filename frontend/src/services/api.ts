const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const userId = localStorage.getItem('sb_user_id');
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
};

// Generic request wrapper
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const mergedOptions = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options?.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error ${response.status}`);
    }
    return await response.json() as T;
  } catch (error: any) {
    console.error(`API Error on ${path}:`, error);
    throw error;
  }
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  skills: string; // JSON in backend, will parse in UI
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  xp: number;
  currentStreak: number;
  maxStreak: number;
  role: string;
  createdAt: string;
  badges?: Array<{
    badge: {
      id: string;
      name: string;
      description: string;
      icon: string;
      xpReward: number;
    }
  }>;
}

export interface Battle {
  id: string;
  title: string;
  tagline: string;
  description: string;
  rules: string;
  requirements: string;
  guidelines: string;
  registrationStart: string;
  registrationEnd: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'preparation' | 'active' | 'voting' | 'completed';
  createdAt: string;
  _count?: {
    registrations: number;
    submissions: number;
  };
}

export interface Submission {
  id: string;
  battleId: string;
  githubUrl: string;
  liveUrl?: string;
  description: string;
  submittedAt: string;
  voteCount: number;
  hasVoted: boolean;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
    xp: number;
  };
}

export interface LeaderboardUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  submissionsCount: number;
  skills: string[];
  rank: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'register' | 'submit' | 'vote' | 'badge_earned' | 'rank_up';
  content: string;
  createdAt: string;
}

export interface UserProfileResponse extends Omit<User, 'skills'> {
  skills: string[];
  submissions: Array<{
    id: string;
    githubUrl: string;
    liveUrl?: string;
    description: string;
    submittedAt: string;
    battleTitle: string;
    battleId: string;
    voteCount: number;
  }>;
  activityLogs: ActivityLog[];
}

export const api = {
  // Auth API
  auth: {
    login: async (email: string): Promise<User> => {
      const user = await request<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      localStorage.setItem('sb_user_id', user.id);
      return user;
    },
    register: async (data: { email: string; username: string; fullName: string; avatarUrl?: string }): Promise<User> => {
      const user = await request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('sb_user_id', user.id);
      return user;
    },
    onboard: async (data: {
      username: string;
      bio?: string;
      skills: string[];
      githubUrl?: string;
      linkedinUrl?: string;
      portfolioUrl?: string;
    }): Promise<User> => {
      return request<User>('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    getMe: async (): Promise<User> => {
      return request<User>('/auth/me');
    },
    logout: () => {
      localStorage.removeItem('sb_user_id');
    }
  },

  // Battles API
  battles: {
    getAll: async (status?: string): Promise<Battle[]> => {
      return request<Battle[]>(`/battles${status ? `?status=${status}` : ''}`);
    },
    getById: async (id: string): Promise<Battle & {
      registrations: Array<{ user: { id: string; username: string; fullName: string; avatarUrl: string } }>;
      submissions: Array<{ id: string; user: { id: string; username: string; fullName: string; avatarUrl: string }; _count: { votes: number } }>;
    }> => {
      return request(`/battles/${id}`);
    },
    getActive: async (): Promise<Battle | null> => {
      return request<Battle | null>('/battles/active');
    },
    register: async (battleId: string): Promise<any> => {
      return request('/battles/register', {
        method: 'POST',
        body: JSON.stringify({ battleId }),
      });
    }
  },

  // Submissions API
  submissions: {
    submit: async (data: {
      battleId: string;
      githubUrl: string;
      liveUrl?: string;
      description: string;
    }): Promise<Submission> => {
      return request<Submission>('/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    getByBattleId: async (battleId: string): Promise<Submission[]> => {
      return request<Submission[]>(`/submissions/battle/${battleId}`);
    }
  },

  // Voting API
  votes: {
    vote: async (submissionId: string): Promise<{ voted: boolean; message: string }> => {
      return request('/votes', {
        method: 'POST',
        body: JSON.stringify({ submissionId }),
      });
    }
  },

  // Users API
  users: {
    getProfile: async (username: string): Promise<UserProfileResponse> => {
      return request<UserProfileResponse>(`/users/profile/${username}`);
    },
    getLeaderboard: async (timeframe: 'weekly' | 'monthly' | 'global'): Promise<LeaderboardUser[]> => {
      return request<LeaderboardUser[]>(`/users/leaderboard?timeframe=${timeframe}`);
    }
  },

  // Admin Simulation API
  admin: {
    createBattle: async (battleData: Omit<Battle, 'id' | 'createdAt' | 'status'>): Promise<Battle> => {
      return request<Battle>('/admin/create-battle', {
        method: 'POST',
        body: JSON.stringify(battleData),
      });
    },
    updateBattleStatus: async (battleId: string, status: Battle['status']): Promise<{ message: string; battle: Battle }> => {
      return request('/admin/update-status', {
        method: 'POST',
        body: JSON.stringify({ battleId, status }),
      });
    }
  }
};
