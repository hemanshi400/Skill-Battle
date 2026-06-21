import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, Users, Code, ArrowRight } from 'lucide-react';
import type { Battle } from '../services/api';

interface ChallengesPageProps {
  onSelectBattle: (battleId: string) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ onSelectBattle }) => {
  const { battles, fetchBattles, loading } = useStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('active');

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  // Group battles based on tab
  const getFilteredBattles = (): Battle[] => {
    switch (activeTab) {
      case 'active':
        return battles.filter(b => b.status === 'active');
      case 'upcoming':
        return battles.filter(b => b.status === 'upcoming' || b.status === 'preparation');
      case 'completed':
        return battles.filter(b => b.status === 'completed' || b.status === 'voting');
      default:
        return [];
    }
  };

  const filtered = getFilteredBattles();

  const getStatusBadge = (status: Battle['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black tracking-widest text-green-950 bg-green-400 rounded-full animate-pulse uppercase">
            LIVE NOW
          </span>
        );
      case 'preparation':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-indigo-300 bg-indigo-950 border border-indigo-500/30 rounded-full uppercase">
            PREPARATION
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-slate-400 bg-slate-800 rounded-full uppercase">
            REGISTRATION OPEN
          </span>
        );
      case 'voting':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-yellow-950 bg-yellow-400 rounded-full uppercase">
            VOTING ACTIVE
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-slate-500 bg-slate-900 border border-slate-800 rounded-full uppercase">
            FINISHED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Weekend Challenges</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse upcoming, active, and completed 60-minute coding wars.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-850 self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Battles ({battles.filter(b => b.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming ({battles.filter(b => b.status === 'upcoming' || b.status === 'preparation').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({battles.filter(b => b.status === 'completed' || b.status === 'voting').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          Loading challenges...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((battle) => (
            <div
              key={battle.id}
              className="p-6 rounded-2xl glass hover:bg-slate-900/30 transition-all duration-300 border-slate-850 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(battle.status)}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(battle.startTime).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-100">{battle.title}</h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{battle.tagline}</p>
                
                {/* Metrics */}
                <div className="flex items-center gap-6 mt-6 border-t border-slate-800/40 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>{battle._count?.registrations || 0} Registered</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Code className="w-4 h-4" />
                    <span>{battle._count?.submissions || 0} Projects</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800/45 pt-4">
                <span className="text-xs text-indigo-400 font-semibold font-mono">
                  {battle.status === 'completed' ? 'Results Finalized' : 'Registration Open'}
                </span>
                
                <button
                  onClick={() => onSelectBattle(battle.id)}
                  className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 border border-indigo-500/15"
                >
                  <span>{battle.status === 'active' ? 'Enter Battle' : 'Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-2xl border-slate-850 border">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">
            No challenges found in this category.
          </p>
        </div>
      )}
    </div>
  );
};
