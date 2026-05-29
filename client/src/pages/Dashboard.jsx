import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import MentorDashboard from './dashboards/MentorDashboard';
import { 
  Scissors, ChefHat, Store, Megaphone, Wrench, Palette, 
  Bookmark, MessageSquare, Compass, ArrowRight, Check, Award, Sparkles, Loader2, BookOpen, 
  Briefcase, Zap, Rocket, Send 
} from 'lucide-react';

const PRACTICAL_TRACKS = [
  'Apparel Design & Sustainable Fashion Tech',
  'Culinary Arts, Cloud Kitchens & Commercial Catering',
  'Micro-Retail Operations & Supply Chain Management',
  'Digital Branding, Content Strategy & Freelance Agency',
  'Consumer Electronics, Maintenance & Technical Services',
  'Handicrafts Artistry, Upcycled Decor & Micro-Manufacturing'
];

const TRACK_ICONS = {
  'Apparel Design & Sustainable Fashion Tech': Scissors,
  'Culinary Arts, Cloud Kitchens & Commercial Catering': ChefHat,
  'Micro-Retail Operations & Supply Chain Management': Store,
  'Digital Branding, Content Strategy & Freelance Agency': Megaphone,
  'Consumer Electronics, Maintenance & Technical Services': Wrench,
  'Handicrafts Artistry, Upcycled Decor & Micro-Manufacturing': Palette
};

const TRACK_COLORS = {
  'Apparel Design & Sustainable Fashion Tech': 'text-indigo-600 bg-indigo-50 border-indigo-100',
  'Culinary Arts, Cloud Kitchens & Commercial Catering': 'text-amber-600 bg-amber-50 border-amber-100',
  'Micro-Retail Operations & Supply Chain Management': 'text-emerald-600 bg-emerald-50 border-emerald-100',
  'Digital Branding, Content Strategy & Freelance Agency': 'text-purple-600 bg-purple-50 border-purple-100',
  'Consumer Electronics, Maintenance & Technical Services': 'text-cyan-600 bg-cyan-50 border-cyan-100',
  'Handicrafts Artistry, Upcycled Decor & Micro-Manufacturing': 'text-orange-600 bg-orange-50 border-orange-100'
};

export default function Dashboard() {
  const { user, authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  // Role switching
  if (!user) return null;

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'mentor') {
    return <MentorDashboard />;
  }

  // Student Dashboard logic
  const [skills, setSkills] = useState(user?.skills || []);
  const [recommendations, setRecommendations] = useState([]);
  const [allIdeas, setAllIdeas] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loadingAssess, setLoadingAssess] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [message, setMessage] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(user?.bookmarkedIdeas || []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch all business ideas
      const ideasRes = await authenticatedFetch('/ideas/all');
      if (ideasRes.ok) {
        const data = await ideasRes.json();
        setAllIdeas(data);
      }

      // 2. Fetch matched recommendations based on current user skills
      const recsRes = await authenticatedFetch('/ideas/recommendations');
      if (recsRes.ok) {
        const data = await recsRes.json();
        setRecommendations(data);
      }

      // 3. Fetch verified mentors
      const mentorsRes = await authenticatedFetch('/mentors');
      if (mentorsRes.ok) {
        const data = await mentorsRes.json();
        setMentors(data);
      }

      // 4. Fetch updated profile to align bookmarks
      const meRes = await authenticatedFetch('/auth/me');
      if (meRes.ok) {
        const profile = await meRes.json();
        setBookmarkedIds(profile.bookmarkedIdeas || []);
        setSkills(profile.skills || []);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingIdeas(false);
      setLoadingMentors(false);
    }
  };

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAssessSubmit = async (e) => {
    e.preventDefault();
    setLoadingAssess(true);
    setMessage('');
    try {
      const response = await authenticatedFetch('/ideas/assess', {
        method: 'POST',
        body: JSON.stringify({ skills })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        setMessage('Assessment complete! Recommendations updated below.');
        setTimeout(() => setMessage(''), 4000);
      } else {
        throw new Error('Assessment failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating assessment.');
    } finally {
      setLoadingAssess(false);
    }
  };

  const handleToggleBookmark = async (ideaId) => {
    try {
      const res = await authenticatedFetch(`/ideas/${ideaId}/bookmark`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(data.bookmarkedIdeas);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const isBookmarked = (ideaId) => {
    return bookmarkedIds.includes(ideaId);
  };

  const getIndustryBadge = (matchingSkills) => {
    const firstSkill = matchingSkills[0];
    const IconComponent = TRACK_ICONS[firstSkill] || Briefcase;
    const colorClasses = TRACK_COLORS[firstSkill] || 'text-slate-600 bg-slate-50 border-slate-100';

    return (
      <div className={`p-3 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm ${colorClasses}`}>
        <IconComponent className="w-7 h-7" />
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100">
            <Sparkles className="w-4 h-4" />
            <span>Academic Entrepreneurship Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-slate-500 text-base max-w-2xl font-medium">
            Analyze your skillset, matching academic roadmaps, and interact with professional mentors to launch your micro-venture.
          </p>
        </div>
        <div className="mt-4 md:mt-0 relative z-10 flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map(s => {
              const Icon = TRACK_ICONS[s] || Briefcase;
              return (
                <span key={s} className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{s}</span>
                </span>
              );
            })
          ) : (
            <span className="text-sm text-slate-400 italic font-medium">No interest tracks selected yet</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Skill Assessment Matrix */}
        <div className="w-full lg:col-span-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-md sticky top-24 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Compass className="w-5 h-5 text-primary-600 animate-spin-slow" />
                <span>Interest Profiler Matrix</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                Select or modify the upgraded professional tracks that align with your background. Submission triggers real-time matching.
              </p>
            </div>

            <form onSubmit={handleAssessSubmit} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${
                  message.includes('Error') 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex flex-col space-y-3">
                {PRACTICAL_TRACKS.map(track => {
                  const selected = skills.includes(track);
                  const Icon = TRACK_ICONS[track] || Briefcase;
                  return (
                    <button
                      key={track}
                      type="button"
                      onClick={() => handleToggleSkill(track)}
                      className={`flex items-center justify-between p-3.5 border rounded-xl text-base font-semibold transition-all text-left ${
                        selected
                          ? 'border-primary-500 bg-primary-50/55 text-primary-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-5 h-5 ${selected ? 'text-primary-600' : 'text-slate-400'}`} />
                        <span>{track}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        selected ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {selected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={loadingAssess}
                className="w-full flex justify-center items-center py-3 px-6 rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50"
              >
                {loadingAssess ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Matching...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    <span>Update & Match Pipeline</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Matched Recommendations & Mentors */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Matched recommendations */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Recommended Startup Pathways
              </h2>
              <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-semibold border border-primary-100">
                {recommendations.length} Matches
              </span>
            </div>

            {loadingIdeas ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {recommendations.map(idea => (
                  <div key={idea._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group">
                    <div className="space-y-4">
                      
                      {/* Industry Hero Badge Banner */}
                      <div className="flex justify-between items-start">
                        {getIndustryBadge(idea.matchingSkills)}
                        
                        <button
                          onClick={() => handleToggleBookmark(idea._id)}
                          className={`p-2 rounded-lg hover:bg-slate-50 transition-colors ${
                            isBookmarked(idea._id) ? 'text-amber-500' : 'text-slate-400'
                          }`}
                          title={isBookmarked(idea._id) ? 'Bookmarked' : 'Bookmark Startup'}
                        >
                          <Bookmark className={`w-5 h-5 ${isBookmarked(idea._id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors leading-snug">
                        {idea.title}
                      </h3>
                      
                      <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                        {idea.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {idea.matchingSkills.map(s => {
                          const SubIcon = TRACK_ICONS[s] || Briefcase;
                          return (
                            <span key={s} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200/50">
                              <SubIcon className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              <span>{s}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/idea/${idea._id}`)}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-slate-50 text-slate-700 hover:bg-primary-600 hover:text-white rounded-xl text-base font-semibold transition-all border border-slate-100 shadow-sm"
                      >
                        <Rocket className="w-4.5 h-4.5 text-primary-500 group-hover:text-white" />
                        <span>Launch Simulation Roadmap</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
                <p className="text-base font-medium text-slate-500">
                  No startup pathways match your current profile.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Try toggling more tracks in the Interest Profiler Matrix.
                </p>
              </div>
            )}
          </div>

          {/* Bookmarks Section */}
          {bookmarkedIds.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-200/60">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                My Bookmarked Startup Tracks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {allIdeas
                  .filter(idea => isBookmarked(idea._id))
                  .map(idea => (
                    <div key={idea._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          {getIndustryBadge(idea.matchingSkills)}
                          <button
                            onClick={() => handleToggleBookmark(idea._id)}
                            className="p-2 rounded-lg hover:bg-slate-50 text-amber-500 transition-colors"
                          >
                            <Bookmark className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 leading-snug">
                          {idea.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                          {idea.description}
                        </p>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={() => navigate(`/idea/${idea._id}`)}
                          className="w-full flex items-center justify-center space-x-1.5 py-3 px-6 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-base font-semibold transition-all shadow-sm"
                        >
                          <Rocket className="w-4.5 h-4.5 mr-1.5" />
                          <span>Resume Pathway</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Mentor Directory */}
          <div className="space-y-6 pt-6 border-t border-slate-200/60">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              MicroMentor Consulting Directory
            </h2>

            {loadingMentors ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : mentors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {mentors.map(mentor => (
                  <div key={mentor._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base shadow-sm">
                          {mentor.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-950 text-base leading-none">
                            {mentor.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                            Verified Advisor
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {mentor.skills.map(s => {
                          const MentorSkillIcon = TRACK_ICONS[s] || Briefcase;
                          return (
                            <span key={s} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold">
                              <MentorSkillIcon className="w-3.5 h-3.5 mr-1" />
                              <span>{s}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/chat/${mentor._id}`)}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-base font-semibold transition-all shadow-sm"
                      >
                        <Send className="w-4.5 h-4.5 text-primary-500 mr-1.5" />
                        <span>Send Consulting Inquiry</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No verified mentors available at the moment.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
