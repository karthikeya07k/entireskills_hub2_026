import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, CheckCircle2, Circle, HelpCircle, DollarSign, Wrench, 
  Play, FileText, ChevronRight, Award, Loader2, Send, MessageSquare, Rocket 
} from 'lucide-react';

export default function IdeaDetail() {
  const id = useParams().id;
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuth();

  const [idea, setIdea] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingStep, setUpdatingStep] = useState(null);

  useEffect(() => {
    fetchIdeaDetails();
  }, [id]);

  const fetchIdeaDetails = async () => {
    try {
      const res = await authenticatedFetch(`/ideas/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIdea(data.idea);
        setRoadmap(data.roadmap || []);
        setLessons(data.lesson || []);
        setCompletedSteps(data.completedSteps || []);
      } else {
        throw new Error('Failed to load details');
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = async (stepNumber) => {
    const isCurrentlyCompleted = completedSteps.includes(stepNumber);
    setUpdatingStep(stepNumber);
    try {
      const res = await authenticatedFetch(`/ideas/${id}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          stepNumber,
          isCompleted: !isCurrentlyCompleted
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedSteps(data.completedSteps);
      }
    } catch (err) {
      console.error('Failed to toggle progress', err);
    } finally {
      setUpdatingStep(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
        <p className="text-sm font-semibold text-slate-500">Loading Startup Simulation...</p>
      </div>
    );
  }

  // Calculate metrics
  const totalSteps = roadmap.length;
  const completedCount = completedSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  
  // Sum cost of completed steps vs total cost
  const totalBudget = roadmap.reduce((sum, step) => sum + step.estimatedCost, 0);
  const spentBudget = roadmap
    .filter(step => completedSteps.includes(step.stepNumber))
    .reduce((sum, step) => sum + step.estimatedCost, 0);

  return (
    <div className="space-y-8">
      {/* Back button and title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Dashboard</span>
        </button>

        {progressPercent === 100 && (
          <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm animate-bounce">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Simulation Pathway Completed!</span>
          </div>
        )}
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md">
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
          {idea?.title}
        </h1>
        <p className="text-base font-medium text-slate-500 mt-3 leading-relaxed max-w-4xl">
          {idea?.description}
        </p>

        {/* Dynamic metrics bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span>Roadmap Completion</span>
              <span className="text-primary-600 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/40">
              <div
                className="h-full bg-primary-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-black text-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Milestones</p>
              <p className="text-base font-extrabold text-slate-800">{completedCount} / {totalSteps} Checkpoints</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Simulated Budget Spent</p>
              <p className="text-base font-extrabold text-slate-850">
                ${spentBudget.toLocaleString()} / <span className="text-slate-400 font-normal">${totalBudget.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Roadmap Stepper Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">1. Setup Roadmap Timeline</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Verify tools, costs, and check off completed startup steps on-the-fly.</p>
          </div>

          <div className="relative border-l border-slate-200 ml-4 pl-8 space-y-8">
            {roadmap.map((step, index) => {
              const isDone = completedSteps.includes(step.stepNumber);
              const isPending = updatingStep === step.stepNumber;

              return (
                <div key={step._id} className="relative group">
                  {/* Step Connector Node */}
                  <button
                    onClick={() => handleToggleStep(step.stepNumber)}
                    disabled={isPending}
                    className={`absolute -left-12 top-0.5 w-9 h-9 rounded-full border-2 flex items-center justify-center bg-white transition-all shadow-sm ${
                      isDone
                        ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-50'
                        : 'border-slate-300 text-slate-400 hover:border-primary-500 hover:text-primary-500'
                    }`}
                  >
                    {isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    ) : isDone ? (
                      <CheckCircle2 className="w-5 h-5 fill-current text-emerald-500 bg-white rounded-full" />
                    ) : (
                      <span className="text-sm font-bold">{step.stepNumber}</span>
                    )}
                  </button>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-base font-bold leading-tight ${isDone ? 'text-slate-500 line-through' : 'text-slate-950'}`}>
                        {step.title}
                      </h3>
                      {step.estimatedCost > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold shadow-sm">
                          Cost: ${step.estimatedCost}
                        </span>
                      )}
                    </div>

                    <p className={`text-sm font-medium leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>
                      {step.description}
                    </p>

                    {/* Tools required badges */}
                    {step.toolsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="text-xs text-slate-400 font-bold uppercase mr-1.5 flex items-center">
                          Required Tools:
                        </span>
                        {step.toolsRequired.map(t => (
                          <span key={t} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/50 rounded-lg text-xs font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Educational Lessons Tracker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">2. Startup Academy modules</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Learn using video lectures and markdown summary guides tailored for this track.</p>
            </div>

            {lessons.length > 0 ? (
              <div className="space-y-6">
                {/* Module tabs */}
                <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-100">
                  {lessons.map((module, idx) => {
                    const isActive = idx === activeModuleIdx;
                    return (
                      <button
                        key={module._id}
                        onClick={() => setActiveModuleIdx(idx)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {module.contentType === 'video_embed' ? 'Video Lecture' : 'Lesson Article'}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Active Module View */}
                {lessons[activeModuleIdx] && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {lessons[activeModuleIdx].moduleTitle}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold uppercase">
                        {lessons[activeModuleIdx].contentType === 'video_embed' ? (
                          <span className="flex items-center text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                            <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Video
                          </span>
                        ) : (
                          <span className="flex items-center text-primary-500 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">
                            <FileText className="w-3.5 h-3.5 mr-1" /> Article
                          </span>
                        )}
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500">
                          {lessons[activeModuleIdx].durationText}
                        </span>
                      </div>
                    </div>

                    {/* Content render */}
                    {lessons[activeModuleIdx].contentType === 'video_embed' && lessons[activeModuleIdx].resourceUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={lessons[activeModuleIdx].resourceUrl}
                          title={lessons[activeModuleIdx].moduleTitle}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    {/* Article / Summary Text */}
                    <div className="bg-slate-50 p-5 border border-slate-200 rounded-xl max-h-[300px] overflow-y-auto">
                      <div className="prose prose-slate prose-sm text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                        {lessons[activeModuleIdx].summaryBody}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-400 text-sm italic">
                No lesson curriculum has been linked for this startup track.
              </div>
            )}
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Need professional guidance?</span>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center space-x-2 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Send className="w-4.5 h-4.5" />
              <span>Send Consulting Inquiry</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
