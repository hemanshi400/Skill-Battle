import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowRight, Tag, Globe, Check, AlertCircle } from 'lucide-react';
import { Github, Linkedin } from '../components/BrandIcons';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

const AVAILABLE_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Figma',
  'UI/UX', 'Next.js', 'Python', 'AI Prompting', 'HTML/CSS', 'GraphQL'
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { user, onboard, error, loading } = useStore();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    const success = await onboard({
      username: username.toLowerCase().trim(),
      bio,
      skills: selectedSkills,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    });

    if (success) {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col justify-center py-12 px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center mb-8">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-300">
          Build your Builder profile
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Tell the community who you are. This profile is your public weekend battle history.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="glass p-8 rounded-2xl shadow-premium border-slate-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Choose Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer_handle"
                className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="I write React code, build visual mockups, and drink coffee..."
                className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all resize-none"
              />
            </div>

            {/* Skills Tag Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Select your Skills</span>
              </label>
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
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <span className="text-sm font-bold tracking-wider text-slate-500 uppercase block mb-1">
                PROFESSIONAL PORTFOLIO LINKS:
              </span>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Github className="w-3.5 h-3.5 text-slate-500" />
                    <span>GitHub URL</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="block w-full px-3 py-2.5 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Linkedin className="w-3.5 h-3.5 text-slate-500" />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="block w-full px-3 py-2.5 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Portfolio Website</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="block w-full px-3 py-2.5 border border-slate-800 bg-slate-900/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Saving Setup...' : 'Complete Profile Setup'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
