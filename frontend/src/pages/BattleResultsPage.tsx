import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Award, Trophy, Code, Users, Star, ArrowLeft, Globe, Check } from 'lucide-react';
import { Github } from '../components/BrandIcons';
import { api } from '../services/api';
import type { Submission } from '../services/api';

interface BattleResultsPageProps {
  battleId: string;
  onNavigate: (page: string) => void;
  onSelectUser: (username: string) => void;
}

export const BattleResultsPage: React.FC<BattleResultsPageProps> = ({
  battleId,
  onNavigate,
  onSelectUser
}) => {
  const { user } = useStore();
  const [battle, setBattle] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const battleRes = await fetch(`http://localhost:5000/api/battles/${battleId}`);
        if (battleRes.ok) {
          const battleData = await battleRes.json();
          setBattle(battleData);
        }

        const subsRes = await api.submissions.getByBattleId(battleId);
        // Sort submissions by voteCount descending for results standing
        const sortedSubs = [...subsRes].sort((a, b) => b.voteCount - a.voteCount);
        setSubmissions(sortedSubs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [battleId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium text-white">
        Compiling results...
      </div>
    );
  }

  const winner = submissions[0];
  const second = submissions[1];
  const third = submissions[2];

  // Stats calculation
  const totalRegistrations = battle?.registrations?.length || 0;
  const totalSubmissions = submissions.length;
  const submissionRatio = totalRegistrations > 0 ? Math.round((totalSubmissions / totalRegistrations) * 100) : 0;
  const totalVotes = submissions.reduce((acc, s) => acc + s.voteCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white animate-fade-in">
      <button
        onClick={() => onNavigate('challenges')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Challenges</span>
      </button>

      <div className="border-b border-slate-900 pb-6 mb-8 text-center md:text-left">
        <span className="text-[10px] font-black bg-indigo-650 text-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
          FINAL STANDINGS
        </span>
        <h1 className="text-3xl font-extrabold mt-2">{battle?.title} Results</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Challenge finalized. XP rewards and badges have been credited to qualifying profiles.
        </p>
      </div>

      {/* Podium Display */}
      {submissions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-12 items-end pt-12">
          
          {/* Second Place */}
          {second && (
            <div 
              onClick={() => onSelectUser(second.user.username)}
              className="order-2 md:order-1 p-6 rounded-2xl glass border-slate-850 hover:border-slate-700 transition-colors text-center relative cursor-pointer pt-12 md:h-[220px] flex flex-col justify-between"
            >
              <div className="absolute top-[-24px] left-1/2 translate-x-[-50%]">
                <img
                  src={second.user.avatarUrl}
                  alt={second.user.username}
                  className="w-16 h-16 rounded-2xl border-2 border-slate-400 bg-slate-900 shadow-lg"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">2ND PLACE</span>
                <span className="text-sm font-black text-slate-300 block mt-1">{second.user.fullName}</span>
                <span className="text-[10px] text-slate-500">@{second.user.username}</span>
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs font-mono font-bold text-indigo-400">
                <span>{second.voteCount} Votes</span>
                <span className="text-slate-600">|</span>
                <span>+300 XP Earned</span>
              </div>
            </div>
          )}

          {/* First Place - Winner */}
          {winner && (
            <div 
              onClick={() => onSelectUser(winner.user.username)}
              className="order-1 md:order-2 p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/80 border border-yellow-500/20 hover:border-yellow-500/40 transition-all text-center relative cursor-pointer pt-16 md:h-[260px] flex flex-col justify-between shadow-glow"
            >
              <div className="absolute top-[-36px] left-1/2 translate-x-[-50%]">
                <div className="relative">
                  <Trophy className="w-7 h-7 text-yellow-400 fill-yellow-400/20 absolute top-[-24px] left-1/2 translate-x-[-50%] animate-bounce" />
                  <img
                    src={winner.user.avatarUrl}
                    alt={winner.user.username}
                    className="w-20 h-20 rounded-2xl border-4 border-yellow-500 bg-slate-900 shadow-glow"
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">CHAMPION</span>
                <span className="text-base font-black text-yellow-300 block mt-1">{winner.user.fullName}</span>
                <span className="text-xs text-slate-400">@{winner.user.username}</span>
              </div>
              <div className="mt-6 flex justify-center gap-4 text-xs font-mono font-bold text-yellow-400">
                <span>{winner.voteCount} Votes</span>
                <span className="text-slate-700">|</span>
                <span>+500 XP Champion Reward</span>
              </div>
            </div>
          )}

          {/* Third Place */}
          {third && (
            <div 
              onClick={() => onSelectUser(third.user.username)}
              className="order-3 p-6 rounded-2xl glass border-slate-850 hover:border-slate-700 transition-colors text-center relative cursor-pointer pt-12 md:h-[200px] flex flex-col justify-between"
            >
              <div className="absolute top-[-24px] left-1/2 translate-x-[-50%]">
                <img
                  src={third.user.avatarUrl}
                  alt={third.user.username}
                  className="w-16 h-16 rounded-2xl border-2 border-amber-600 bg-slate-900 shadow-lg"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">3RD PLACE</span>
                <span className="text-sm font-black text-slate-300 block mt-1">{third.user.fullName}</span>
                <span className="text-[10px] text-slate-500">@{third.user.username}</span>
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs font-mono font-bold text-indigo-400">
                <span>{third.voteCount} Votes</span>
                <span className="text-slate-600">|</span>
                <span>+300 XP Earned</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Analytics stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="p-5 rounded-2xl glass border-slate-850 text-center">
          <div className="text-2xl font-black text-indigo-400">{totalRegistrations}</div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-1">Registrations</div>
        </div>
        <div className="p-5 rounded-2xl glass border-slate-850 text-center">
          <div className="text-2xl font-black text-purple-400">{totalSubmissions}</div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-1">Projects Submitted</div>
        </div>
        <div className="p-5 rounded-2xl glass border-slate-850 text-center">
          <div className="text-2xl font-black text-pink-400">{submissionRatio}%</div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-1">Completion Rate</div>
        </div>
        <div className="p-5 rounded-2xl glass border-slate-850 text-center">
          <div className="text-2xl font-black text-green-400">{totalVotes}</div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-1">Community Votes</div>
        </div>
      </div>

      {/* Submission archives list */}
      <div className="p-6 rounded-2xl glass border-slate-850">
        <h3 className="text-base font-bold mb-6 flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-400" />
          <span>Project Submissions Archive ({submissions.length})</span>
        </h3>

        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((sub, idx) => (
              <div 
                key={sub.id}
                className="p-5 rounded-xl bg-slate-950/45 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-6"
              >
                <div className="flex items-start gap-4">
                  <span className="text-sm font-mono font-bold text-slate-600 mt-1">
                    #{(idx + 1).toString().padStart(2, '0')}
                  </span>
                  
                  <img
                    src={sub.user.avatarUrl}
                    alt={sub.user.username}
                    onClick={() => onSelectUser(sub.user.username)}
                    className="w-10 h-10 rounded-xl border border-slate-850 bg-slate-900 cursor-pointer"
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        onClick={() => onSelectUser(sub.user.username)}
                        className="text-xs font-bold text-slate-200 hover:text-indigo-400 cursor-pointer"
                      >
                        {sub.user.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500">@{sub.user.username}</span>
                      {idx === 0 && (
                        <span className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded text-[9px] font-bold">
                          CHAMPION
                        </span>
                      )}
                      {idx > 0 && idx < 10 && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-bold">
                          TOP 10
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xl">
                      {sub.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-[11px]">
                      {sub.githubUrl !== '#' && (
                        <a 
                          href={sub.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code Repository</span>
                        </a>
                      )}
                      {sub.liveUrl && (
                        <a 
                          href={sub.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t border-slate-900 md:border-0 pt-3 md:pt-0">
                  <span className="text-xs text-slate-500 md:block hidden">VOTES COUNT</span>
                  <span className="text-sm font-mono font-extrabold text-indigo-400 md:mt-1">
                    {sub.voteCount} Votes
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No projects archived for this challenge.
          </div>
        )}
      </div>
    </div>
  );
};
