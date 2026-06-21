import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, Shield, Star, Award, CheckCircle, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface ChallengeDetailsPageProps {
  battleId: string;
  onNavigate: (page: string) => void;
  onEnterBattle: (battleId: string) => void;
  onEnterVoting: (battleId: string) => void;
  onEnterResults: (battleId: string) => void;
}

export const ChallengeDetailsPage: React.FC<ChallengeDetailsPageProps> = ({
  battleId,
  onNavigate,
  onEnterBattle,
  onEnterVoting,
  onEnterResults
}) => {
  const { user, registerForBattle, loading } = useStore();
  const [battle, setBattle] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      setLocalLoading(true);
      const res = await fetch(`http://localhost:5000/api/battles/${battleId}`);
      if (res.ok) {
        const data = await res.json();
        setBattle(data);
        
        // Check if current user is registered
        if (user && data.registrations) {
          setIsRegistered(data.registrations.some((r: any) => r.user.id === user.id));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [battleId, user]);

  // Live Timer
  useEffect(() => {
    if (!battle) return;

    const timer = setInterval(() => {
      const target = new Date(battle.startTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Battle Started!');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [battle]);

  const handleRegister = async () => {
    if (!battle) return;
    const success = await registerForBattle(battle.id);
    if (success) {
      setIsRegistered(true);
      fetchDetails(); // refresh registrations list
    }
  };

  if (localLoading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium text-white">
        Loading details...
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white">
        <p className="text-slate-400">Battle not found.</p>
        <button 
          onClick={() => onNavigate('challenges')}
          className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 rounded-lg text-xs"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      {/* Back button */}
      <button
        onClick={() => onNavigate('challenges')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Challenges</span>
      </button>

      {/* Grid Banner */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        
        {/* Banner Details */}
        <div className="md:col-span-2 p-6 md:p-8 rounded-2xl glass border-slate-800 flex flex-col justify-between shadow-premium">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase ${
                battle.status === 'active' ? 'bg-green-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {battle.status}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Ends: {new Date(battle.endTime).toLocaleString()}
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-100">{battle.title}</h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{battle.tagline}</p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800/40 flex flex-wrap gap-4 items-center">
            {battle.status === 'upcoming' || battle.status === 'preparation' ? (
              isRegistered ? (
                <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 rounded-xl text-sm font-bold">
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                  <span>You are Registered for this battle!</span>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-glow hover:-translate-y-0.5"
                >
                  Register for Weekend Battle
                </button>
              )
            ) : battle.status === 'active' ? (
              isRegistered ? (
                <button
                  onClick={() => onEnterBattle(battle.id)}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Enter Live Battle Arena</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              ) : (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 p-3 rounded-lg">
                  Registration is closed. You did not register for this battle.
                </div>
              )
            ) : battle.status === 'voting' ? (
              <button
                onClick={() => onEnterVoting(battle.id)}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5"
              >
                <span>Go to Voting Gallery</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <button
                onClick={() => onEnterResults(battle.id)}
                className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5"
              >
                <span>View Results & Rankings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Status (e.g. countdown or status info) */}
        <div className="p-6 rounded-2xl glass border-slate-800 flex flex-col justify-between shadow-premium text-center">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              {battle.status === 'completed' ? 'Battle Completed' : 'Battle Starts In'}
            </span>
            <div className="text-2xl font-black mt-3 font-mono text-indigo-400">
              {battle.status === 'completed' ? '00:00:00' : timeLeft || 'Calculating...'}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Every builder receives the challenge prompt simultaneously on Saturday at 8:00 PM.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6 text-left">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">Registered builders ({battle.registrations?.length || 0})</span>
            <div className="flex flex-wrap gap-1.5">
              {battle.registrations && battle.registrations.length > 0 ? (
                battle.registrations.slice(0, 10).map((r: any) => (
                  <img
                    key={r.user.id}
                    src={r.user.avatarUrl}
                    alt={r.user.username}
                    title={`@${r.user.username}`}
                    className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900"
                  />
                ))
              ) : (
                <span className="text-[10px] text-slate-500">Be the first to register!</span>
              )}
              {battle.registrations && battle.registrations.length > 10 && (
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  +{battle.registrations.length - 10}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Rules and Guidelines */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left 2 columns - Rules & guidelines */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Battle Rules & Code of Conduct</span>
            </h3>
            <div className="text-sm text-slate-400 space-y-3 leading-relaxed whitespace-pre-line">
              {battle.rules}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-400" />
              <span>Project Requirements</span>
            </h3>
            <div className="text-sm text-slate-400 space-y-3 leading-relaxed whitespace-pre-line">
              {battle.requirements}
            </div>
          </div>
        </div>

        {/* Right column - submission instructions & guidelines */}
        <div>
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Submission Details</span>
            </h3>
            <div className="text-xs text-slate-400 space-y-4 leading-relaxed">
              <p>
                Once active, the submit button will link to a form. You must provide:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                <li>GitHub Repository URL</li>
                <li>Working Deployment Live URL</li>
                <li>Short description of work</li>
              </ul>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400 italic">
                {battle.guidelines}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
