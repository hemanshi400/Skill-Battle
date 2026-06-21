import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Flame, Code, Award, Medal, Search, Calendar, Globe } from 'lucide-react';

interface LeaderboardPageProps {
  onNavigate: (page: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const { leaderboard, fetchLeaderboard, loading } = useStore();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'global'>('global');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe, fetchLeaderboard]);

  const filtered = leaderboard.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400 fill-slate-400/10" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600/10" />;
    return <span className="text-xs font-bold text-slate-500 font-mono">#{rank}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span>Developer Standings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Top builders ranked by weekend challenge XP, submissions completed, and streak scores.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-850 self-start">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'weekly'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'monthly'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('global')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'global'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      {filtered.length >= 3 && searchQuery === '' && (
        <div className="grid md:grid-cols-3 gap-6 mb-12 items-end pt-10">
          
          {/* Rank 2 */}
          <div 
            onClick={() => onNavigate(`profile/${filtered[1].username}`)}
            className="order-2 md:order-1 p-6 rounded-2xl glass border-slate-850 hover:border-slate-700 transition-colors text-center relative cursor-pointer pt-12 md:h-[220px] flex flex-col justify-between"
          >
            <div className="absolute top-[-24px] left-1/2 translate-x-[-50%]">
              <img
                src={filtered[1].avatarUrl}
                alt={filtered[1].username}
                className="w-16 h-16 rounded-2xl border-2 border-slate-400 bg-slate-900 shadow-lg"
              />
            </div>
            <div>
              <span className="text-sm font-black text-slate-400 block mt-2">#2 {filtered[1].fullName}</span>
              <span className="text-[10px] text-slate-500">@{filtered[1].username}</span>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                {filtered[1].xp} XP
              </span>
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {filtered[1].streak}
              </span>
            </div>
          </div>

          {/* Rank 1 - Center Tall */}
          <div 
            onClick={() => onNavigate(`profile/${filtered[0].username}`)}
            className="order-1 md:order-2 p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/80 border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-center relative cursor-pointer pt-16 md:h-[260px] flex flex-col justify-between shadow-premium"
          >
            <div className="absolute top-[-36px] left-1/2 translate-x-[-50%]">
              <div className="relative">
                <Award className="w-6 h-6 text-yellow-400 fill-yellow-400/20 absolute top-[-20px] left-1/2 translate-x-[-50%] animate-bounce" />
                <img
                  src={filtered[0].avatarUrl}
                  alt={filtered[0].username}
                  className="w-20 h-20 rounded-2xl border-4 border-yellow-500 bg-slate-900 shadow-glow"
                />
              </div>
            </div>
            <div>
              <span className="text-base font-black text-yellow-400 block mt-2">#1 {filtered[0].fullName}</span>
              <span className="text-xs text-slate-400">@{filtered[0].username}</span>
            </div>
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <span className="font-extrabold text-indigo-400 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                {filtered[0].xp} XP
              </span>
              <span className="font-extrabold text-slate-300 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                {filtered[0].streak}w
              </span>
            </div>
          </div>

          {/* Rank 3 */}
          <div 
            onClick={() => onNavigate(`profile/${filtered[2].username}`)}
            className="order-3 p-6 rounded-2xl glass border-slate-850 hover:border-slate-700 transition-colors text-center relative cursor-pointer pt-12 md:h-[200px] flex flex-col justify-between"
          >
            <div className="absolute top-[-24px] left-1/2 translate-x-[-50%]">
              <img
                src={filtered[2].avatarUrl}
                alt={filtered[2].username}
                className="w-16 h-16 rounded-2xl border-2 border-amber-600 bg-slate-900 shadow-lg"
              />
            </div>
            <div>
              <span className="text-sm font-black text-amber-600 block mt-2">#3 {filtered[2].fullName}</span>
              <span className="text-[10px] text-slate-500">@{filtered[2].username}</span>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                {filtered[2].xp} XP
              </span>
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {filtered[2].streak}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Standings Table Card */}
      <div className="p-6 rounded-2xl glass border-slate-850">
        
        {/* Search Header */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 max-w-md mb-6">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search builder name or username..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">
            Loading rankings...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Rank</th>
                  <th className="pb-3">Builder</th>
                  <th className="pb-3">Skills</th>
                  <th className="pb-3 text-center">Submissions</th>
                  <th className="pb-3 text-center">Streak</th>
                  <th className="pb-3 text-right pr-3">XP Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map((builder) => (
                  <tr 
                    key={builder.id}
                    onClick={() => onNavigate(`profile/${builder.username}`)}
                    className="hover:bg-slate-900/35 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-3">
                      {getRankBadge(builder.rank)}
                    </td>
                    <td className="py-4 flex items-center gap-3">
                      <img
                        src={builder.avatarUrl}
                        alt={builder.username}
                        className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-900"
                      />
                      <div>
                        <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors block">
                          {builder.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          @{builder.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {builder.skills.slice(0, 3).map(skill => (
                          <span 
                            key={skill}
                            className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 font-medium border border-slate-850"
                          >
                            {skill}
                          </span>
                        ))}
                        {builder.skills.length > 3 && (
                          <span className="text-[10px] text-slate-600 font-semibold px-1">
                            +{builder.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center font-semibold text-slate-300">
                      {builder.submissionsCount}
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-0.5 font-bold text-slate-200">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{builder.streak}w</span>
                      </span>
                    </td>
                    <td className="py-4 text-right pr-3 font-mono font-bold text-indigo-400">
                      {builder.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            No rankings found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
