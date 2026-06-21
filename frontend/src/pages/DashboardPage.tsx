import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Flame, Trophy, Award, Clock, ArrowRight, User, Plus, ExternalLink } from 'lucide-react';
import { Github } from '../components/BrandIcons';
import { api } from '../services/api';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onSelectBattle: (battleId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectBattle }) => {
  const { user, activeBattle, fetchActiveBattle, battles, fetchBattles } = useStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [leaderboardPreview, setLeaderboardPreview] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveBattle();
    fetchBattles();
    if (user?.username) {
      api.users.getProfile(user.username).then(res => setProfileData(res));
    }
    // Fetch global leaderboard for preview
    api.users.getLeaderboard('global').then(res => {
      setLeaderboardPreview(res.slice(0, 3));
    });
  }, [user, fetchActiveBattle, fetchBattles]);

  // Find next upcoming battle
  const upcomingBattle = battles.find(b => b.status === 'upcoming' || b.status === 'preparation');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Welcome Hero Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* User Card */}
        <div className="md:col-span-2 p-6 rounded-2xl glass border-slate-800 flex items-center justify-between shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 relative z-10">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg'}
              alt={user?.username}
              className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900"
            />
            <div>
              <h2 className="text-xl font-bold">{user?.fullName}</h2>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">@{user?.username}</p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold text-slate-200">{user?.xp} <span className="text-[10px] text-slate-500 font-normal">XP</span></span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-200">{user?.currentStreak} <span className="text-[10px] text-slate-500 font-normal">weeks</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <button 
              onClick={() => onNavigate(`profile/${user?.username}`)}
              className="px-4 py-2 text-xs font-semibold glass border-slate-700 hover:border-slate-600 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Streak Metrics Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-900/60 border border-slate-800/80 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">CONGRUENCY STREAK</span>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-100 flex items-baseline gap-1">
              {user?.currentStreak}
              <span className="text-xs font-medium text-slate-500">Week Streak</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete weekly battles to preserve your consistency status. Max Streak: {user?.maxStreak} weeks.
            </p>
          </div>
          <div className="w-full bg-slate-800/60 rounded-full h-1.5 mt-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min((user?.currentStreak || 0) * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Active Battle banner (if status is active) */}
          {activeBattle ? (
            <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/5 shadow-glow relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                LIVE NOW
              </div>
              <h3 className="text-lg font-bold text-green-400">Battle is Active!</h3>
              <p className="text-sm font-semibold mt-1 text-slate-200">{activeBattle.title}</p>
              <p className="text-xs text-slate-400 mt-1">{activeBattle.tagline}</p>
              
              <button 
                onClick={() => onSelectBattle(activeBattle.id)}
                className="mt-4 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md shadow-green-500/20"
              >
                <span>Enter Battle Arena</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          ) : (
            upcomingBattle && (
              <div className="p-6 rounded-2xl glass border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors relative overflow-hidden">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">UPCOMING BATTLE</span>
                <h4 className="text-lg font-bold mt-1 text-slate-200">{upcomingBattle.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{upcomingBattle.tagline}</p>
                
                <div className="flex flex-wrap gap-4 items-center mt-4">
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Starts Saturday 8PM</span>
                  </span>
                  
                  <button 
                    onClick={() => onSelectBattle(upcomingBattle.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 ml-auto"
                  >
                    <span>View Challenge Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}

          {/* User Active Badges */}
          <div className="p-6 rounded-2xl glass border-slate-800">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Earned Badges</span>
            </h3>

            {profileData?.badges && profileData.badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profileData.badges.map((b: any) => (
                  <div 
                    key={b.badge.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center hover:border-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 block truncate max-w-full">{b.badge.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{b.badge.xpReward} XP Reward</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                No badges earned yet. Join a battle to earn your first.
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="p-6 rounded-2xl glass border-slate-800">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Activity Log</span>
            </h3>
            
            {profileData?.activityLogs && profileData.activityLogs.length > 0 ? (
              <div className="space-y-4">
                {profileData.activityLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3 text-xs border-b border-slate-800/40 pb-3 last:border-0 last:pb-0">
                    <div className="w-6 h-6 rounded-full bg-slate-800/80 border border-slate-700/60 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold uppercase text-[9px]">
                      {log.type.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-slate-300">{log.content}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                No active log entries found.
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Leaderboard & Status Ticker) */}
        <div className="space-y-6">
          
          {/* Leaderboard Preview */}
          <div className="p-6 rounded-2xl glass border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Top Builders</h3>
              <button 
                onClick={() => onNavigate('leaderboard')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Full Leaderboard
              </button>
            </div>

            <div className="space-y-3">
              {leaderboardPreview.map((item, idx) => (
                <div 
                  key={item.id}
                  onClick={() => onNavigate(`profile/${item.username}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-xs font-mono font-bold text-center ${
                      idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-amber-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img
                      src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.username}`}
                      alt={item.username}
                      className="w-8 h-8 rounded-lg border border-slate-800"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{item.fullName}</span>
                      <span className="text-[10px] text-slate-500 block">@{item.username}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-indigo-400">{item.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/30">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">WEEKEND FLOW REMINDER</h4>
            <ul className="text-xs space-y-2 text-slate-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Registration remains open Monday through Thursday.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Friday is preparation day (general rules revealed).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Saturday at 8:00 PM: Battle starts (60 minutes).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Sunday is open for community voting.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
