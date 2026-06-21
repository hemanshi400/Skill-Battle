import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeDetailsPage } from './pages/ChallengeDetailsPage';
import { LiveBattlePage } from './pages/LiveBattlePage';
import { VotingPage } from './pages/VotingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { BattleResultsPage } from './pages/BattleResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

import { Trophy, Flame, Shield, User, LogOut, Settings, Award, Menu, X, Calendar, Compass, Grid } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, checkAuth, logout } = useStore();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Run Auth Check on Mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Adjust routing state if authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'signup') {
        // If onboarded, go to dashboard. Otherwise onboard.
        const skillsList = user ? JSON.parse(user.skills) : [];
        if (skillsList.length === 0 && !user?.bio) {
          setCurrentPage('onboarding');
        } else {
          setCurrentPage('dashboard');
        }
      }
    } else {
      if (
        currentPage !== 'landing' &&
        currentPage !== 'login' &&
        currentPage !== 'signup'
      ) {
        setCurrentPage('landing');
      }
    }
  }, [isAuthenticated, user]);

  // Unified page router
  const renderPage = () => {
    // Check custom path parameters
    if (currentPage.startsWith('profile/')) {
      const username = currentPage.split('/')[1];
      return (
        <ProfilePage 
          username={username} 
          onNavigate={handleNavigate}
          onSelectBattle={(id) => handleNavigate(`battle/${id}`)}
        />
      );
    }
    if (currentPage.startsWith('battle/')) {
      const battleId = currentPage.split('/')[1];
      return (
        <ChallengeDetailsPage
          battleId={battleId}
          onNavigate={handleNavigate}
          onEnterBattle={(id) => handleNavigate(`live-arena/${id}`)}
          onEnterVoting={(id) => handleNavigate(`vote/${id}`)}
          onEnterResults={(id) => handleNavigate(`results/${id}`)}
        />
      );
    }
    if (currentPage.startsWith('live-arena/')) {
      const battleId = currentPage.split('/')[1];
      return (
        <LiveBattlePage 
          battleId={battleId} 
          onNavigate={handleNavigate}
          onSubmitSuccess={() => handleNavigate('dashboard')}
        />
      );
    }
    if (currentPage.startsWith('vote/')) {
      const battleId = currentPage.split('/')[1];
      return (
        <VotingPage 
          battleId={battleId} 
          onNavigate={handleNavigate}
        />
      );
    }
    if (currentPage.startsWith('results/')) {
      const battleId = currentPage.split('/')[1];
      return (
        <BattleResultsPage 
          battleId={battleId} 
          onNavigate={handleNavigate}
          onSelectUser={(username) => handleNavigate(`profile/${username}`)}
        />
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} defaultTab="login" />;
      case 'signup':
        return <LoginPage onNavigate={handleNavigate} defaultTab="signup" />;
      case 'onboarding':
        return <OnboardingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={handleNavigate}
            onSelectBattle={(id) => handleNavigate(`battle/${id}`)}
          />
        );
      case 'challenges':
        return (
          <ChallengesPage 
            onSelectBattle={(id) => handleNavigate(`battle/${id}`)} 
          />
        );
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogoutClick = () => {
    logout();
    handleNavigate('landing');
  };

  // Hide nav layout wrapper if user is on authentication/onboarding pages
  const isAuthPage = ['landing', 'login', 'signup', 'onboarding'].includes(currentPage);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans antialiased text-white selection:bg-indigo-650 selection:text-white">
      {/* Top Header Navigation (Desktop/Tablet) */}
      {!isAuthPage && (
        <nav className="sticky top-0 z-40 glass border-b border-slate-900 shadow-premium">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
              <div 
                onClick={() => handleNavigate('dashboard')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm shadow-glow">
                  S
                </div>
                <span className="font-extrabold text-sm tracking-wider uppercase">SKILL BATTLE</span>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    currentPage === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigate('challenges')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    currentPage === 'challenges' || currentPage.startsWith('battle/') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Challenges
                </button>
                <button
                  onClick={() => handleNavigate('leaderboard')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    currentPage === 'leaderboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Leaderboard
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 text-purple-400 hover:text-purple-300`}
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>

              {/* User Section (Right) */}
              <div className="hidden md:flex items-center gap-4">
                {/* XP Count */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  <span>{user?.xp} XP</span>
                </div>

                {/* Avatar dropdown/link */}
                <div 
                  onClick={() => handleNavigate(`profile/${user?.username}`)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <img
                    src={user?.avatarUrl}
                    alt={user?.username}
                    className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900"
                  />
                </div>

                {/* Settings & Logout */}
                <button 
                  onClick={() => handleNavigate('settings')}
                  title="Settings"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleLogoutClick}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile menu trigger button */}
              <div className="md:hidden flex items-center gap-3">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 font-mono">
                  {user?.xp} XP
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Overlay Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-900 bg-slate-950 px-4 py-4 space-y-3 font-semibold text-sm">
              <button
                onClick={() => handleNavigate('dashboard')}
                className="w-full text-left py-2 px-3 hover:bg-slate-900 rounded-lg block"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigate('challenges')}
                className="w-full text-left py-2 px-3 hover:bg-slate-900 rounded-lg block"
              >
                Challenges
              </button>
              <button
                onClick={() => handleNavigate('leaderboard')}
                className="w-full text-left py-2 px-3 hover:bg-slate-900 rounded-lg block"
              >
                Leaderboard
              </button>
              <button
                onClick={() => handleNavigate(`profile/${user?.username}`)}
                className="w-full text-left py-2 px-3 hover:bg-slate-900 rounded-lg block"
              >
                My Profile
              </button>
              <button
                onClick={() => handleNavigate('settings')}
                className="w-full text-left py-2 px-3 hover:bg-slate-900 rounded-lg block"
              >
                Settings
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className="w-full text-left py-2 px-3 hover:bg-slate-900 rounded-lg block text-purple-400"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogoutClick}
                className="w-full text-left py-2 px-3 hover:bg-red-500/10 rounded-lg block text-red-400 border-t border-slate-900 pt-3"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      )}

      {/* Main Pages Content wrapper */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isAuthPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-900 py-2.5 px-6 grid grid-cols-4 gap-1 text-center shadow-lg backdrop-blur-md">
          <button 
            onClick={() => handleNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${
              currentPage === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => handleNavigate('challenges')}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${
              currentPage === 'challenges' || currentPage.startsWith('battle/') ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Battles</span>
          </button>
          <button 
            onClick={() => handleNavigate('leaderboard')}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${
              currentPage === 'leaderboard' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Ranks</span>
          </button>
          <button 
            onClick={() => handleNavigate(`profile/${user?.username}`)}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${
              currentPage.startsWith('profile/') ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </div>
      )}
      
      {/* Spacer to push mobile content above bottom nav */}
      {!isAuthPage && <div className="md:hidden h-16" />}
    </div>
  );
}
