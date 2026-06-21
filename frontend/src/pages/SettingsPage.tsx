import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Tag, Check, Globe, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Github, Linkedin } from '../components/BrandIcons';

const AVAILABLE_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Figma',
  'UI/UX', 'Next.js', 'Python', 'AI Prompting', 'HTML/CSS', 'GraphQL'
];

export const SettingsPage: React.FC = () => {
  const { user, onboard, loading } = useStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setBio(user.bio || '');
      setGithubUrl(user.githubUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setPortfolioUrl(user.portfolioUrl || '');
      
      try {
        const skillsList = JSON.parse(user.skills);
        if (Array.isArray(skillsList)) {
          setSelectedSkills(skillsList);
        }
      } catch {
        setSelectedSkills([]);
      }
    }
  }, [user]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!user) return;

    try {
      const success = await onboard({
        username: user.username,
        bio,
        skills: selectedSkills,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      });

      if (success) {
        setSuccessMsg('Profile settings saved successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg('Failed to save profile. Username might be taken.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error saving settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="border-b border-slate-900 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your builder profile details, social links, and skills.
        </p>
      </div>

      <div className="glass p-8 rounded-2xl border-slate-800 shadow-premium">
        
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-xs mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/30 rounded-xl text-xs text-slate-500 focus:outline-none cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-600 mt-1.5 block">Email address cannot be modified.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Username</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/30 rounded-xl text-xs text-slate-500 focus:outline-none cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-600 mt-1.5 block">Username cannot be changed after onboarding.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
              className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell the battlefield who you are..."
              className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Skills Tag Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Skills Tags</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-650/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-850 text-slate-450 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* URL portfolios */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block mb-1">
              Social Links
            </span>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Github className="w-3.5 h-3.5 text-slate-500" />
                  <span>GitHub</span>
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="block w-full px-3 py-2.5 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-slate-500" />
                  <span>LinkedIn</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setlinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="block w-full px-3 py-2.5 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Portfolio</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="block w-full px-3 py-2.5 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-1.5 py-3 px-4 border border-transparent rounded-xl shadow-glow text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
