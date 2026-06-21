import React, { useEffect, useState } from 'react';
import { Trophy, Code, Flame, Users, Calendar, ArrowRight, Zap, Target } from 'lucide-react';
import { useStore } from '../store/useStore';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { battles, fetchBattles } = useStore();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  // Next upcoming challenge countdown
  const upcomingBattle = battles.find(b => b.status === 'upcoming' || b.status === 'preparation');

  useEffect(() => {
    if (!upcomingBattle) return;

    const timer = setInterval(() => {
      const target = new Date(upcomingBattle.startTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Battle Starts Now!');
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
  }, [upcomingBattle]);

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden text-white">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6 animate-pulse">
          <Zap className="w-4 h-4 fill-indigo-400 text-indigo-400" />
          <span>Next Challenge: Saturday 8:00 PM</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Every Skill Has A <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            Battlefield.
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Skill Battle is a community-driven weekend challenge platform where developers, designers, and creators participate in fixed-time 60-minute competitions. Build, submit, vote, and level up.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-glow transition-all duration-300 flex items-center justify-center gap-2 group hover:-translate-y-0.5"
          >
            <span>Enter the Battlefield</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigate('challenges')}
            className="w-full sm:w-auto px-8 py-4 glass hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all duration-300 hover:border-slate-600"
          >
            Explore Past Battles
          </button>
        </div>

        {/* Next Battle Card */}
        {upcomingBattle && (
          <div className="max-w-3xl mx-auto p-6 md:p-8 rounded-2xl glass border-slate-800/80 shadow-premium relative text-left hover:border-slate-700 transition-all duration-300 mb-12">
            <div className="absolute top-4 right-6 text-sm text-indigo-400 font-mono tracking-wider">
              REGISTRATION OPEN
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">WEEKEND CHALLENGE</span>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-slate-100">{upcomingBattle.title}</h3>
                <p className="text-slate-400 mt-2 max-w-md">{upcomingBattle.tagline}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 px-6 py-4 rounded-xl text-center min-w-[200px]">
                <div className="text-xs text-slate-500 font-medium">BATTLE STARTS IN</div>
                <div className="text-xl md:text-2xl font-black text-indigo-400 font-mono mt-1">
                  {timeLeft || 'Calculating...'}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats Counter */}
      <section className="border-y border-slate-800/60 bg-slate-900/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-400">1,250+</div>
            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-widest mt-1">Active Builders</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-purple-400">48</div>
            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-widest mt-1">Battles Completed</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-pink-400">320+</div>
            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-widest mt-1">Submissions</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-green-400">150K+</div>
            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-widest mt-1">XP Earned</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How The Weekend Battle Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Registration opens on Monday, but the actual coding sandbox opens on Saturday for exactly 60 minutes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl glass hover:bg-slate-900/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Register by Thursday</h3>
            <p className="text-slate-400 leading-relaxed">
              Sign up during the week. Check registration criteria, prepare your tools, and study rules. Prompt stays strictly encrypted until go-time.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass hover:bg-slate-900/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mb-6">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Build Live on Saturday</h3>
            <p className="text-slate-400 leading-relaxed">
              At 8:00 PM Saturday, the prompt decrypts. Builders have exactly 60 minutes to design, code, test, and push their submissions. No exceptions.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass hover:bg-slate-900/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20 mb-6">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Vote & Get Ranked</h3>
            <p className="text-slate-400 leading-relaxed">
              Sunday is voting day! Submissions are voted on anonymously by the builder community. Tally updates user XP, streaks, and awards champion badges.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 relative z-10 text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/50 via-slate-900/40 to-purple-900/50 border border-indigo-500/20 shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Ready to test your limits?</h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-8 relative z-10">
            Stop consuming on weekends. Join hundreds of builders pushing production-grade micro projects in 60 minutes.
          </p>
          <button 
            onClick={() => onNavigate('signup')}
            className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 relative z-10"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500 tracking-wider">
        © {new Date().getFullYear()} SKILL BATTLE. ALL RIGHTS RESERVED. EVERY SKILL HAS A BATTLEFIELD.
      </footer>
    </div>
  );
};
