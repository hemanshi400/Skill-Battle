import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Shield, Plus, List, Play, CheckCircle, Flame, PlusCircle, Calendar, Edit, AlertCircle } from 'lucide-react';
import type { Battle } from '../services/api';

export const AdminPage: React.FC = () => {
  const { battles, fetchBattles, createBattle, updateBattleStatus, loading } = useStore();
  
  // Creation form inputs
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [requirements, setRequirements] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title || !tagline || !description || !rules || !requirements || !guidelines || !startTime || !endTime) {
      setErrorMsg('All fields are required');
      return;
    }

    const success = await createBattle({
      title,
      tagline,
      description,
      rules,
      requirements,
      guidelines,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    });

    if (success) {
      setSuccessMsg('New weekend battle created successfully!');
      setTitle('');
      setTagline('');
      setDescription('');
      setRules('');
      setRequirements('');
      setGuidelines('');
      setStartTime('');
      setEndTime('');
      setActiveSubTab('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg('Failed to create battle');
    }
  };

  const handleStatusChange = async (battleId: string, status: Battle['status']) => {
    setSuccessMsg('');
    setErrorMsg('');
    
    const success = await updateBattleStatus(battleId, status);
    if (success) {
      setSuccessMsg(`Status updated successfully! stand-list refreshed and points/badges recalculated.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg('Status update failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            <span>Admin Orchestration Control</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overrule weekend timelines, override battle phases to compile mock results, and build new challenges.
          </p>
        </div>

        {/* Admin Navigation Sub-tabs */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-850 self-start">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'list'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Battles
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'create'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Challenge
          </button>
        </div>
      </div>

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

      {activeSubTab === 'list' ? (
        <div className="p-6 rounded-2xl glass border-slate-850">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-400" />
            <span>Seeded Battles Status Controller</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Challenge Name</th>
                  <th className="pb-3">Start Time</th>
                  <th className="pb-3">Current Status</th>
                  <th className="pb-3 text-right pr-3">Simulation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {battles.map((battle) => (
                  <tr key={battle.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 pl-3">
                      <span className="font-bold text-slate-200 block">{battle.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{battle.tagline}</span>
                    </td>
                    <td className="py-4 font-mono text-slate-400">
                      {new Date(battle.startTime).toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        battle.status === 'active' ? 'bg-green-400 text-slate-950 font-black' :
                        battle.status === 'voting' ? 'bg-yellow-400 text-slate-950 font-bold' :
                        battle.status === 'completed' ? 'bg-slate-850 text-slate-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {battle.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleStatusChange(battle.id, 'preparation')}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] rounded font-semibold text-indigo-300"
                        >
                          Prep
                        </button>
                        <button
                          onClick={() => handleStatusChange(battle.id, 'active')}
                          className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-[10px] rounded font-bold text-green-450"
                        >
                          Active (Live)
                        </button>
                        <button
                          onClick={() => handleStatusChange(battle.id, 'voting')}
                          className="px-2.5 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-[10px] rounded font-bold text-yellow-450"
                        >
                          Voting
                        </button>
                        <button
                          onClick={() => handleStatusChange(battle.id, 'completed')}
                          className="px-2.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] rounded font-bold"
                        >
                          Complete (Tally)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass p-8 rounded-2xl border-slate-850">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <span>Create New Weekend Battle</span>
          </h3>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Admin Dashboard"
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Tagline</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Create a sleek data widget analytics panel."
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Challenge Prompt / Prompt Markdown Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Markdown formatted text detailing core tasks, wireframe layout designs, guidelines..."
                className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Rules</label>
                <textarea
                  required
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  rows={4}
                  placeholder="1. Build using React/Vite. 2. Must submit within 60 mins."
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Requirements</label>
                <textarea
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder="- Responsive sidebar nav\n- Toggleable dark/light themes"
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Guidelines / Submission Instructions</label>
                <textarea
                  required
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  rows={4}
                  placeholder="Focus on clean visual contrast. Keep elements aligned using CSS Grid."
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Start Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>End Date & Time (e.g. +60 mins)</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-1.5 py-3.5 px-4 border border-transparent rounded-xl shadow-glow text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Creating challenge...' : 'Create and Publish Challenge'}</span>
            </button>

          </form>
        </div>
      )}
    </div>
  );
};
