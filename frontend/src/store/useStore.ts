import { create } from 'zustand';
import { api } from '../services/api';
import type { User, Battle, Submission, LeaderboardUser, UserProfileResponse } from '../services/api';

interface State {
  user: User | null;
  isAuthenticated: boolean;
  activeBattle: Battle | null;
  battles: Battle[];
  leaderboard: LeaderboardUser[];
  currentProfile: UserProfileResponse | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setError: (err: string | null) => void;
  clearError: () => void;
  
  // Auth Actions
  login: (email: string) => Promise<boolean>;
  register: (data: { email: string; username: string; fullName: string; avatarUrl?: string }) => Promise<boolean>;
  onboard: (data: {
    username: string;
    bio?: string;
    skills: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  }) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => void;

  // Battle Actions
  fetchBattles: (status?: string) => Promise<void>;
  fetchActiveBattle: () => Promise<void>;
  registerForBattle: (battleId: string) => Promise<boolean>;
  submitProject: (data: {
    battleId: string;
    githubUrl: string;
    liveUrl?: string;
    description: string;
  }) => Promise<boolean>;

  // User Actions
  fetchLeaderboard: (timeframe: 'weekly' | 'monthly' | 'global') => Promise<void>;
  fetchUserProfile: (username: string) => Promise<void>;

  // Admin Simulation Actions
  updateBattleStatus: (battleId: string, status: Battle['status']) => Promise<boolean>;
  createBattle: (battleData: Omit<Battle, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
}

export const useStore = create<State>((set, get) => ({
  user: null,
  isAuthenticated: false,
  activeBattle: null,
  battles: [],
  leaderboard: [],
  currentProfile: null,
  loading: false,
  error: null,

  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),

  login: async (email) => {
    set({ loading: true, error: null });
    try {
      const user = await api.auth.login(email);
      set({ user, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = await api.auth.register(data);
      set({ user, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', loading: false });
      return false;
    }
  },

  onboard: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = await api.auth.onboard(data);
      set({ user, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Onboarding failed', loading: false });
      return false;
    }
  },

  checkAuth: async () => {
    const userId = localStorage.getItem('sb_user_id');
    if (!userId) return;
    
    set({ loading: true });
    try {
      const user = await api.auth.getMe();
      set({ user, isAuthenticated: true, loading: false });
    } catch (err) {
      console.warn('Persisted session invalid, logging out.');
      localStorage.removeItem('sb_user_id');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: () => {
    api.auth.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchBattles: async (status) => {
    set({ loading: true, error: null });
    try {
      const battles = await api.battles.getAll(status);
      set({ battles, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch battles', loading: false });
    }
  },

  fetchActiveBattle: async () => {
    try {
      const activeBattle = await api.battles.getActive();
      set({ activeBattle });
    } catch (err) {
      console.error('Failed to fetch active battle:', err);
    }
  },

  registerForBattle: async (battleId) => {
    set({ loading: true, error: null });
    try {
      await api.battles.register(battleId);
      // Refresh active user to update activity feed and registration list
      const updatedUser = await api.auth.getMe();
      set({ user: updatedUser, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to register', loading: false });
      return false;
    }
  },

  submitProject: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.submissions.submit(data);
      // Refresh user details to reflect new XP and badges
      const updatedUser = await api.auth.getMe();
      set({ user: updatedUser, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Submission failed', loading: false });
      return false;
    }
  },

  fetchLeaderboard: async (timeframe) => {
    set({ loading: true, error: null });
    try {
      const leaderboard = await api.users.getLeaderboard(timeframe);
      set({ leaderboard, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load leaderboard', loading: false });
    }
  },

  fetchUserProfile: async (username) => {
    set({ loading: true, error: null });
    try {
      const currentProfile = await api.users.getProfile(username);
      set({ currentProfile, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load profile', loading: false });
    }
  },

  updateBattleStatus: async (battleId, status) => {
    set({ loading: true, error: null });
    try {
      await api.admin.updateBattleStatus(battleId, status);
      // Refresh battles list & active battle state
      const battles = await api.battles.getAll();
      const activeBattle = await api.battles.getActive();
      // If we completed a battle, user might have gotten XP
      let updatedUser = get().user;
      if (status === 'completed' && get().user) {
        try {
          updatedUser = await api.auth.getMe();
        } catch (e) {
          // ignore
        }
      }
      set({ battles, activeBattle, user: updatedUser, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update battle status', loading: false });
      return false;
    }
  },

  createBattle: async (battleData) => {
    set({ loading: true, error: null });
    try {
      await api.admin.createBattle(battleData);
      const battles = await api.battles.getAll();
      set({ battles, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create battle', loading: false });
      return false;
    }
  }
}));
