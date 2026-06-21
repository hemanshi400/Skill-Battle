import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { ThumbsUp, Code, Globe, HelpCircle, ArrowLeft, Heart, Award } from 'lucide-react';
import { api } from '../services/api';
import type { Submission } from '../services/api';

interface VotingPageProps {
  battleId: string;
  onNavigate: (page: string) => void;
}

export const VotingPage: React.FC<VotingPageProps> = ({ battleId, onNavigate }) => {
  const { user, loading } = useStore();
  const [battle, setBattle] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const fetchSubmissionsAndBattle = async () => {
    try {
      setLocalLoading(true);
      const battleRes = await fetch(`http://localhost:5000/api/battles/${battleId}`);
      if (battleRes.ok) {
        const battleData = await battleRes.json();
        setBattle(battleData);
      }

      const subs = await api.submissions.getByBattleId(battleId);
      setSubmissions(subs);

      // Populate local voted status map
      const votes: Record<string, boolean> = {};
      subs.forEach(s => {
        votes[s.id] = s.hasVoted;
      });
      setVotedMap(votes);
    } catch (e) {
      console.error(e);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsAndBattle();
  }, [battleId, user]);

  const handleVote = async (submissionId: string) => {
    if (!user) {
      alert('Please login to vote.');
      return;
    }

    try {
      const res = await api.votes.vote(submissionId);
      
      // Update local upvote count and toggle voted map state
      setVotedMap(prev => ({
        ...prev,
        [submissionId]: res.voted
      }));

      setSubmissions(prev => 
        prev.map(sub => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              voteCount: res.voted ? sub.voteCount + 1 : sub.voteCount - 1,
              hasVoted: res.voted
            };
          }
          return sub;
        })
      );
    } catch (err: any) {
      alert(err.message || 'Voting failed');
    }
  };

  if (localLoading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium text-white">
        Loading voting gallery...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Header details */}
      <button
        onClick={() => onNavigate('challenges')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 font-semibold animate-pulse"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Challenges</span>
      </button>

      <div className="border-b border-slate-900 pb-6 mb-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
              COMMUNITY VOTING ACTIVE
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2">{battle?.title}</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Vote on projects based on responsiveness, layout fidelity, and micro-interactions. Voting is 100% anonymous to guarantee fair rankings.
            </p>
          </div>
          
          <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-center self-start text-xs text-slate-400 max-w-xs leading-relaxed">
            💡 <span className="text-slate-300 font-semibold">Self-Voting Check:</span> The voting portal does not permit casting votes on your own uploads.
          </div>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub, index) => {
            const hasVoted = votedMap[sub.id];
            
            return (
              <div 
                key={sub.id}
                className="rounded-2xl glass border-slate-850 p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 relative group"
              >
                {/* Visual number indicator for card */}
                <div className="absolute top-4 right-5 text-2xl font-black text-slate-900 select-none">
                  #{index + 1}
                </div>

                <div>
                  {/* Anonymous Author Profile */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={sub.user.avatarUrl}
                      alt="Anonymous Builder"
                      className="w-10 h-10 rounded-xl border border-slate-850 bg-slate-950"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{sub.user.fullName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Anonymous submission</span>
                    </div>
                  </div>

                  {/* Submission Info */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[72px] line-clamp-4">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                  {/* Demo Link */}
                  {sub.liveUrl ? (
                    <a
                      href={sub.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Live Preview</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>No Live Demo</span>
                    </span>
                  )}

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleVote(sub.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      hasVoted
                        ? 'bg-indigo-650/20 border-indigo-500 text-indigo-400 shadow-glow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-indigo-400' : ''}`} />
                    <span>{sub.voteCount} Votes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-2xl border-slate-850 border">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">
            No submissions registered for this battle yet.
          </p>
        </div>
      )}
    </div>
  );
};
