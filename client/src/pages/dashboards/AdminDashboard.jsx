import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, Users, Briefcase, FileText, CheckCircle, XCircle, AlertCircle, 
  Plus, Terminal, RefreshCw, GraduationCap, MessageSquare 
} from 'lucide-react';

export default function AdminDashboard() {
  const { authenticatedFetch } = useAuth();
  const [telemetry, setTelemetry] = useState(null);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Course creation form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [matchingSkillsText, setMatchingSkillsText] = useState('');
  const [steps, setSteps] = useState([
    { stepNumber: 1, title: '', description: '', toolsRequiredText: '', estimatedCost: 0 }
  ]);
  const [modules, setModules] = useState([
    { moduleTitle: '', durationText: '15 mins', contentType: 'article_markdown', summaryBody: '' }
  ]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch telemetry counts and logs
      const telRes = await authenticatedFetch('/admin/telemetry');
      if (telRes.ok) {
        const telData = await telRes.json();
        setTelemetry(telData);
      }

      // 2. Fetch pending mentors
      const pendRes = await authenticatedFetch('/admin/pending-mentors');
      if (pendRes.ok) {
        const pendData = await pendRes.json();
        setPendingMentors(pendData);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to query administrative telemetry endpoints.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMentor = async (mentorId, action) => {
    try {
      const res = await authenticatedFetch(`/admin/verify-mentor/${mentorId}`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setSuccessMsg(`Mentor application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAdminData(); // Reload list
      } else {
        throw new Error('Action failed');
      }
    } catch (err) {
      setErrorMsg('Error executing verification action.');
    }
  };

  const handleAddFormStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, title: '', description: '', toolsRequiredText: '', estimatedCost: 0 }]);
  };

  const handleRemoveFormStep = (index) => {
    const updated = steps.filter((_, idx) => idx !== index);
    // Recalculate step numbers
    const renumbered = updated.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    setSteps(renumbered);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleAddFormModule = () => {
    setModules([...modules, { moduleTitle: '', durationText: '10 mins', contentType: 'article_markdown', summaryBody: '' }]);
  };

  const handleRemoveFormModule = (index) => {
    setModules(modules.filter((_, idx) => idx !== index));
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!title || !description || !matchingSkillsText) {
      setErrorMsg('Course title, description, and match skills are required.');
      return;
    }

    const formattedSkills = matchingSkillsText.split(',').map(s => s.trim()).filter(Boolean);
    
    const formattedSteps = steps.map(s => ({
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
      toolsRequired: s.toolsRequiredText.split(',').map(t => t.trim()).filter(Boolean),
      estimatedCost: Number(s.estimatedCost) || 0
    }));

    const formattedModules = modules.map(m => ({
      moduleTitle: m.moduleTitle,
      durationText: m.durationText,
      contentType: m.contentType,
      summaryBody: m.summaryBody
    }));

    try {
      const res = await authenticatedFetch('/admin/ideas/create', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          matchingSkills: formattedSkills,
          steps: formattedSteps,
          modules: formattedModules
        })
      });

      if (res.ok) {
        setSuccessMsg(`Startup Track "${title}" successfully configured!`);
        // Reset states
        setTitle('');
        setDescription('');
        setMatchingSkillsText('');
        setSteps([{ stepNumber: 1, title: '', description: '', toolsRequiredText: '', estimatedCost: 0 }]);
        setModules([{ moduleTitle: '', durationText: '15 mins', contentType: 'article_markdown', summaryBody: '' }]);
        fetchAdminData(); // Refresh count
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Configuration failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit course configuration.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert panels */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-base flex items-center space-x-2 shadow-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-base flex items-center space-x-2 shadow-sm font-semibold">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Title */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <Terminal className="w-4 h-4" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">System Telemetry Center</h1>
          <p className="text-slate-400 text-sm font-medium">Verify system registrations, approve advisors, and configure academic simulations.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-base font-semibold border border-slate-700 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow mr-1.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Telemetry Metrics Grid */}
      {telemetry && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2 w-full">
              <span className="text-xs font-bold uppercase tracking-wider">Students</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{telemetry.counts.users}</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2 w-full">
              <span className="text-xs font-bold uppercase tracking-wider">Approved Mentors</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{telemetry.counts.mentors}</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2 w-full">
              <span className="text-xs font-bold uppercase tracking-wider">Awaiting Verification</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{telemetry.counts.pendingMentors}</p>
            {telemetry.counts.pendingMentors > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-bl-full"></span>
            )}
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2 w-full">
              <span className="text-xs font-bold uppercase tracking-wider">Startup Tracks</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><GraduationCap className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{telemetry.counts.ideas}</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2 w-full">
              <span className="text-xs font-bold uppercase tracking-wider">Total Messages Log</span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><MessageSquare className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{telemetry.counts.messages}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Verification Table & Registry */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mentor Verification Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Pending Mentor Approvals</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-4">Advisor Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Declared Skills</th>
                    <th className="p-4 text-right">Verification Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingMentors.length > 0 ? (
                    pendingMentors.map(mentor => (
                      <tr key={mentor._id} className="hover:bg-slate-50 text-slate-700 font-medium">
                        <td className="p-4 font-bold text-slate-950">{mentor.name}</td>
                        <td className="p-4 text-slate-600">{mentor.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {mentor.skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/45">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleVerifyMentor(mentor._id, 'approve')}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold transition-all text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyMentor(mentor._id, 'reject')}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold transition-all text-sm"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                        {/* Dynamic warning/info alert sign icon for empty state */}
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <AlertCircle className="w-10 h-10 text-amber-500" />
                          <p className="text-base font-bold text-slate-800">No pending mentor verification requests</p>
                          <p className="text-sm text-slate-400">All submitted advisor applications have been successfully verified.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Registry Logs */}
          {telemetry && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">System Activity Logs (User Registry)</h3>
              </div>
              <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
                {telemetry.recentUsers.map(reg => (
                  <div key={reg._id} className="flex justify-between items-center text-sm p-3 border-b border-slate-100 hover:bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800">{reg.name}</span>
                      <span className="text-xs text-slate-400 ml-2 font-semibold">({reg.email})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        reg.role === 'admin' 
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : reg.role === 'mentor' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-primary-50 text-primary-600 border border-primary-100'
                      }`}>
                        {reg.role}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Add New Course/Roadmap Configuration Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-1">
                <Plus className="w-5 h-5 text-primary-500 animate-pulse" />
                <span>Configure Startup Track</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Dynamically add new business ideas, linking modular steps (roadmaps) and course summary modules.
              </p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 tracking-wide">Startup Track Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Appliance Repair Services"
                    className="block w-full border border-slate-200 rounded-xl p-3 text-base focus:ring-2 focus:ring-primary-500 focus:outline-none hover:border-slate-300 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 tracking-wide">Track Description</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the simulation track..."
                    className="block w-full border border-slate-200 rounded-xl p-3 text-base focus:ring-2 focus:ring-primary-500 focus:outline-none hover:border-slate-300 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 tracking-wide">Matching Skill Tags (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={matchingSkillsText}
                    onChange={(e) => setMatchingSkillsText(e.target.value)}
                    placeholder="e.g. Appliance Repair Services, Retail"
                    className="block w-full border border-slate-200 rounded-xl p-3 text-base focus:ring-2 focus:ring-primary-500 focus:outline-none hover:border-slate-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Roadmap Steps */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Pathway Steps Checklist</h4>
                  <button
                    type="button"
                    onClick={handleAddFormStep}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    + Add Step
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {steps.map((step, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 relative space-y-2.5">
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFormStep(idx)}
                          className="absolute top-2 right-3 text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Delete
                        </button>
                      )}
                      <div className="text-xs font-bold text-slate-400">Step #{step.stepNumber}</div>
                      <input
                        type="text"
                        required
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        placeholder="Step Title"
                        className="block w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      />
                      <input
                        type="text"
                        required
                        value={step.description}
                        onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                        placeholder="Step Description"
                        className="block w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={step.toolsRequiredText}
                          onChange={(e) => handleStepChange(idx, 'toolsRequiredText', e.target.value)}
                          placeholder="Tools (comma list)"
                          className="block w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                        />
                        <input
                          type="number"
                          value={step.estimatedCost}
                          onChange={(e) => handleStepChange(idx, 'estimatedCost', e.target.value)}
                          placeholder="Cost ($)"
                          className="block w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson Modules */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Lesson Modules</h4>
                  <button
                    type="button"
                    onClick={handleAddFormModule}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    + Add Module
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {modules.map((mod, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 relative space-y-2.5">
                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFormModule(idx)}
                          className="absolute top-2 right-3 text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Delete
                        </button>
                      )}
                      <input
                        type="text"
                        required
                        value={mod.moduleTitle}
                        onChange={(e) => handleModuleChange(idx, 'moduleTitle', e.target.value)}
                        placeholder="Module Title"
                        className="block w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={mod.durationText}
                          onChange={(e) => handleModuleChange(idx, 'durationText', e.target.value)}
                          placeholder="Duration (e.g. 15m)"
                          className="block w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                        />
                        <select
                          value={mod.contentType}
                          onChange={(e) => handleModuleChange(idx, 'contentType', e.target.value)}
                          className="block w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                        >
                          <option value="article_markdown">Markdown Article</option>
                          <option value="video_embed">Video Embed Link</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={mod.summaryBody}
                        onChange={(e) => handleModuleChange(idx, 'summaryBody', e.target.value)}
                        placeholder="Lesson content or Markdown body summary..."
                        className="block w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-6 rounded-xl text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5 mr-1.5" />
                <span>Launch Course Config</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
