import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Clock, Code, Terminal, Send, CheckCircle, Globe, Info, AlertCircle } from 'lucide-react';
import { Github } from '../components/BrandIcons';

interface LiveBattlePageProps {
  battleId: string;
  onNavigate: (page: string) => void;
  onSubmitSuccess: () => void;
}

const MOCK_ACTIVITY_LOGS = [
  'elena_codes initialized git repo.',
  'alex_dev started drafting UI components.',
  'sarah_m configured Tailwind configurations.',
  'marcus_ux uploaded design concepts to Figma.',
  'elena_codes pushed first package build (+20 XP).',
  'sarah_m imported framer-motion library.',
  'alex_dev completed navigation layouts.',
  'marcus_ux started coding React states.',
  'elena_codes added responsive flex containers.',
  'sarah_m added CSS keyframe animations.',
  'alex_dev is drafting project descriptions.',
  'marcus_ux added click sound effect loops.'
];

export const LiveBattlePage: React.FC<LiveBattlePageProps> = ({
  battleId,
  onNavigate,
  onSubmitSuccess
}) => {
  const { user, submitProject, error, clearError, loading } = useStore();
  const [battle, setBattle] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [activities, setActivities] = useState<string[]>([
    'Battle started. Good luck builders!',
    'Challenge instructions decrypted successfully.'
  ]);
  
  // Submission Form inputs
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activityEndRef = useRef<HTMLDivElement>(null);

  // Fetch Battle Details
  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/battles/${battleId}`);
        if (res.ok) {
          const data = await res.json();
          setBattle(data);
          
          // Check if already submitted
          const hasSub = data.submissions?.some((s: any) => s.user.id === user?.id);
          if (hasSub) setIsSubmitted(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBattle();
  }, [battleId, user]);

  // Live Timer
  useEffect(() => {
    if (!battle) return;

    const timer = setInterval(() => {
      const target = new Date(battle.endTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Submissions Closed!');
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // Update page title
      document.title = `🍅 ${minutes}:${seconds} - Live Battle`;
    }, 1000);

    return () => {
      clearInterval(timer);
      document.title = 'Skill Battle';
    };
  }, [battle]);

  // Auto activity feed generator (ticker)
  useEffect(() => {
    const activityInterval = setInterval(() => {
      const randomActivity = MOCK_ACTIVITY_LOGS[Math.floor(Math.random() * MOCK_ACTIVITY_LOGS.length)];
      setActivities((prev) => [...prev, randomActivity]);
    }, 12000); // add log entry every 12 seconds

    return () => clearInterval(activityInterval);
  }, []);

  // Scroll to bottom of activity terminal
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !description) return;

    const success = await submitProject({
      battleId: battle.id,
      githubUrl,
      liveUrl,
      description,
    });

    if (success) {
      setIsSubmitted(true);
      setActivities((prev) => [...prev, `You successfully submitted your project! (+100 XP)`]);
      setTimeout(() => {
        onSubmitSuccess();
      }, 2000);
    }
  };

  if (!battle) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium text-white">
        Entering sandbox...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Timer Ticker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-900 pb-6">
        <div>
          <span className="text-[10px] font-black tracking-widest text-green-950 bg-green-400 px-2.5 py-1 rounded-full uppercase animate-pulse">
            BATTLE LIVE
          </span>
          <h1 className="text-2xl font-bold mt-2 text-slate-100">{battle.title}</h1>
        </div>

        {/* Big Timer */}
        <div className="bg-slate-950/80 px-6 py-3 rounded-xl border border-red-500/20 text-center flex items-center gap-3">
          <Clock className="w-6 h-6 text-red-500 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider text-left">Time Remaining</div>
            <div className="text-2xl font-black font-mono text-red-400">{timeLeft || '60:00'}</div>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns - Challenge Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl glass border-slate-850 min-h-[400px]">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Code className="w-5 h-5 text-indigo-400" />
              <span>Challenge Prompt & Instructions</span>
            </h3>
            
            {/* Decrypted description renderer */}
            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {battle.description}
            </div>
          </div>
        </div>

        {/* Right Column - Live Feed & Submission Panel */}
        <div className="space-y-6">
          
          {/* Submission Panel */}
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Project Submission
            </h3>

            {isSubmitted ? (
              <div className="py-6 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <span className="text-sm font-bold text-slate-200 block">Project Submitted!</span>
                <span className="text-xs text-slate-500 mt-1 block">Good luck! Review submissions on Sunday.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-lg text-[10px] flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Repo URL*</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Github className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="block w-full pl-9 pr-3 py-2 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Live Demo URL (Optional)</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://..."
                      className="block w-full pl-9 pr-3 py-2 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description*</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe how you solved the requirements, tech stack details, and features implemented..."
                    className="block w-full px-3 py-2 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 border border-transparent rounded-xl shadow-glow text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting...' : 'Submit Project'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Live Activity Log Ticker */}
          <div className="p-6 rounded-2xl glass border-slate-850 flex flex-col h-[280px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-green-400" />
              <span>Live Battle Stream</span>
            </h3>

            <div className="flex-1 bg-slate-950/90 border border-slate-900 rounded-xl p-3 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-2">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="text-green-500 flex-shrink-0">&gt;</span>
                  <span className="break-all">{act}</span>
                </div>
              ))}
              <div ref={activityEndRef} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
