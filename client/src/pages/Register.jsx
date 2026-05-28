import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Lock, Mail, User as UserIcon, AlertCircle, Check, ArrowRight, UserPlus } from 'lucide-react';

const PRACTICAL_TRACKS = [
  'Tailoring',
  'Textiles',
  'Cooking',
  'Food Processing',
  'Local Retail',
  'Digital Content Creation',
  'Appliance Repair Services'
];

export default function Register() {
  const { register, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' (student) or 'mentor'
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(false);

    if (!name || !email || !password) {
      setLocalError('Please fill in all standard fields.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, selectedSkills);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/25 transition-transform hover:scale-105 duration-300">
          <Award className="w-9 h-9" />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-base text-slate-700 font-semibold tracking-wide uppercase">
          Join EntreSkill Hub to launch your entrepreneurship journey
        </p>
      </div>

      {/* Main Spacious Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="w-full max-w-2xl px-10 py-12 rounded-2xl shadow-xl bg-white border border-slate-100">
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Display Errors */}
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-base flex items-center space-x-3 transition-all duration-300 animate-shake">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold">{localError || error}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Full Name & Email row grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-base font-bold text-slate-700 tracking-wide">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all shadow-sm hover:border-slate-300"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-base font-bold text-slate-700 tracking-wide">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all shadow-sm hover:border-slate-300"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-base font-bold text-slate-700 tracking-wide">
                  Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all shadow-sm hover:border-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Account Role Selector */}
            <div className="space-y-3">
              <label className="block text-base font-bold text-slate-700 tracking-wide">
                Choose Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-3.5 px-5 border rounded-xl text-base font-bold transition-all text-left flex flex-col justify-between h-24 ${
                    role === 'user'
                      ? 'border-primary-500 bg-primary-50/50 text-primary-800 ring-2 ring-primary-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block text-base">Student</span>
                  <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Learn & Launch Simulation
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`py-3.5 px-5 border rounded-xl text-base font-bold transition-all text-left flex flex-col justify-between h-24 ${
                    role === 'mentor'
                      ? 'border-primary-500 bg-primary-50/50 text-primary-800 ring-2 ring-primary-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block text-base">Expert Advisor</span>
                  <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Guide & Review Roadmaps
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {role === 'mentor'
                  ? 'Expert advisor accounts require administrative approval before they are displayed in the directory.'
                  : 'Student accounts grant instant access to profiling filters, recommendations, and advisor mail.'}
              </p>
            </div>

            {/* Skills / Interests Matrix Grid */}
            <div className="space-y-3">
              <label className="block text-base font-bold text-slate-700 tracking-wide">
                {role === 'mentor' ? 'Select Fields of Expert Consultation' : 'Select Your Interest Fields / Offline Tracks'}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PRACTICAL_TRACKS.map(track => {
                  const isSelected = selectedSkills.includes(track);
                  return (
                    <button
                      key={track}
                      type="button"
                      onClick={() => handleToggleSkill(track)}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white shadow-sm shadow-primary-500/10'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 mr-1.5" />}
                      {track}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Register Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-md shadow-primary-500/10 disabled:opacity-50 hover:shadow-lg active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center space-x-2 text-base">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Registering...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 text-base">
                    <UserPlus className="w-5 h-5 mr-1.5" />
                    <span>Register Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Account Redirect */}
          <div className="mt-8 text-center bg-slate-50 py-3 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">Already registered? </span>
            <Link to="/login" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Sign In instead
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
