import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Award, Flame, Trophy, Code, Globe, Clock, ArrowLeft } from 'lucide-react';
import { Github, Linkedin } from '../components/BrandIcons';
import { api } from '../services/api';
import type { UserProfileResponse } from '../services/api';

interface ProfilePageProps {
  username: string;
  onNavigate: (page: string) => void;
  onSelectBattle: (battleId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ username, onNavigate, onSelectBattle }) => {
  const { user } = useStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.users.getProfile(username);
        setProfile(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium text-white">
        Loading builder profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white">
        <p className="text-slate-400">Builder profile "@${username}" not found.</p>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 rounded-lg text-xs"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isOwnProfile = user && user.id === profile.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Back check */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Profile Header Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        
        {/* Bio Card */}
        <div className="md:col-span-2 p-6 md:p-8 rounded-2xl glass border-slate-800 flex flex-col justify-between shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="w-20 h-20 rounded-2xl border border-slate-700 bg-slate-900"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold">{profile.fullName}</h1>
                {profile.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-indigo-650 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-bold uppercase tracking-wider">
                    Staff
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-400 font-mono">@{profile.username}</p>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">{profile.bio || 'This builder has not written a bio yet.'}</p>
              
              {/* External Social Profiles */}
              <div className="flex items-center gap-4 pt-3">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          {isOwnProfile && (
            <button
              onClick={() => onNavigate('settings')}
              className="mt-6 sm:mt-0 sm:absolute sm:top-6 sm:right-6 px-3 py-1.5 text-[10px] font-bold border border-slate-800 hover:border-slate-700 rounded-lg bg-slate-900 transition-colors uppercase tracking-wider"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Builder Statistics */}
        <div className="p-6 rounded-2xl glass border-slate-800 shadow-premium flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Builder Stats</span>
          
          <div className="space-y-4 my-4">
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Total XP</span>
              </span>
              <span className="text-sm font-mono font-extrabold text-indigo-400">{profile.xp} XP</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Active Streak</span>
              </span>
              <span className="text-sm font-mono font-extrabold text-slate-200">{profile.currentStreak} weeks</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-pink-500" />
                <span>Submissions</span>
              </span>
              <span className="text-sm font-mono font-extrabold text-slate-200">{profile.submissions?.length || 0}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 italic">
            Joined on {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>

      </div>

      {/* Body grids */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column - Skills & Badges */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Core Skills</h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">No skills set.</span>
            )}
          </div>

          {/* Badges Achievements */}
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Unlocked Badges</h3>
            {profile.badges && profile.badges.length > 0 ? (
              <div className="space-y-3">
                {profile.badges.map((b: any) => (
                  <div 
                    key={b.badge.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-900"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{b.badge.name}</span>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">{b.badge.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">No badges unlocked yet.</span>
            )}
          </div>
        </div>

        {/* Right 2 Columns - Submissions history & Activity logs */}
        <div className="md:col-span-2 space-y-6">
          {/* Submissions */}
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Challenge Submissions</h3>
            {profile.submissions && profile.submissions.length > 0 ? (
              <div className="space-y-4">
                {profile.submissions.map((sub) => (
                  <div 
                    key={sub.id}
                    className="p-5 rounded-xl bg-slate-950/50 border border-slate-900 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-3">
                      <div>
                        <span 
                          onClick={() => onSelectBattle(sub.battleId)}
                          className="text-sm font-bold text-slate-200 hover:text-indigo-400 cursor-pointer block"
                        >
                          {sub.battleTitle}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-bold">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <span>{sub.voteCount} Votes</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {sub.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                      {sub.githubUrl !== '#' && (
                        <a 
                          href={sub.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
                        >
                          <Github className="w-4 h-4" />
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
                          <Globe className="w-4 h-4" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No submissions uploaded yet.
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="p-6 rounded-2xl glass border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Activity Stream</h3>
            {profile.activityLogs && profile.activityLogs.length > 0 ? (
              <div className="space-y-4">
                {profile.activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-850 flex-shrink-0 flex items-center justify-center text-slate-500 font-mono text-[9px]">
                      OK
                    </div>
                    <div>
                      <p className="text-slate-300">{log.content}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                No active log records.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
