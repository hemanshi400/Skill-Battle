import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Shield, Mail, User, Info, ArrowRight, UserCheck, Flame } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  defaultTab?: 'login' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, defaultTab = 'login' }) => {
  const { login, register, error, clearError, loading } = useStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('');

  // Sign Up inputs
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    const success = await login(loginEmail);
    if (success) {
      onNavigate('dashboard');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regUsername || !regFullName) return;
    const success = await register({
      email: regEmail,
      username: regUsername.toLowerCase().trim(),
      fullName: regFullName,
    });
    if (success) {
      onNavigate('onboarding');
    }
  };

  const quickFillLogin = async (email: string) => {
    setLoginEmail(email);
    const success = await login(email);
    if (success) {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div 
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 cursor-pointer mb-4 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl shadow-glow">
            S
          </div>
          <span className="text-xl font-bold tracking-tight">SKILL BATTLE</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-300">
          {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Weekend challenges. Live leaderboard. Unlocked XP.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass py-8 px-6 sm:px-10 rounded-2xl shadow-premium border-slate-800">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                clearError();
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
                activeTab === 'login'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                clearError();
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
                activeTab === 'signup'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs mb-4 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Username
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="username"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Your Name"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Fills for Demo Testing */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block mb-3">
              DEMO QUICK ACCESSIBLE ACCOUNTS:
            </span>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => quickFillLogin('admin@skillbattle.com')}
                className="px-3 py-2 text-left bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/50 rounded-lg text-xs transition-colors flex items-center gap-1.5 text-indigo-200"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Panel Account</span>
              </button>
              <button
                onClick={() => quickFillLogin('elena@skillbattle.com')}
                className="px-3 py-2 text-left bg-purple-950/40 hover:bg-purple-900/40 border border-purple-900/50 rounded-lg text-xs transition-colors flex items-center gap-1.5 text-purple-200"
              >
                <Flame className="w-3.5 h-3.5 text-purple-400" />
                <span>Elena (2.2k XP)</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => quickFillLogin('alex@skillbattle.com')}
                className="px-2 py-1.5 text-center bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] transition-colors text-slate-300"
              >
                Alex Dev
              </button>
              <button
                onClick={() => quickFillLogin('sarah@skillbattle.com')}
                className="px-2 py-1.5 text-center bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] transition-colors text-slate-300"
              >
                Sarah M
              </button>
              <button
                onClick={() => quickFillLogin('marcus@skillbattle.com')}
                className="px-2 py-1.5 text-center bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] transition-colors text-slate-300"
              >
                Marcus UX
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
