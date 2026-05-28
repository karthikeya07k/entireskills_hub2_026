import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldAlert, LogIn } from 'lucide-react';

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/25 transition-transform hover:scale-105 duration-300">
          <Award className="w-9 h-9 animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
          Welcome to EntreSkill Hub
        </h2>
        <p className="mt-2 text-center text-base text-slate-700 font-semibold tracking-wide uppercase">
          Skill-to-Startup Enablement Platform
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

            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 gap-6">
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
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all shadow-sm hover:border-slate-300"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

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
                    name="password"
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-md shadow-primary-500/10 disabled:opacity-50 hover:shadow-lg active:scale-[0.99]"
                id="login-button"
              >
                {loading ? (
                  <span className="flex items-center space-x-2 text-base">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 text-base">
                    <LogIn className="w-5 h-5 mr-1.5" />
                    <span>Sign In to Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Account Redirect */}
          <div className="mt-8 text-center bg-slate-50 py-3 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">New to the platform? </span>
            <Link to="/register" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Create an account now
            </Link>
          </div>

          {/* Testing and Demo Quick-Fill Section */}
          <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-primary-500" />
                <span>Developer Sandbox Quick-Login</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">Click below to automatically fill credentials and log in instantly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@entreskill.com')}
                className="group flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all hover:border-primary-400 shadow-sm"
              >
                <div className="text-left min-w-0">
                  <p className="text-slate-900 group-hover:text-primary-600 truncate transition-colors text-sm font-bold">Alex Johnson</p>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Student Role</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('designer.maria@entreskill.com')}
                className="group flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all hover:border-primary-400 shadow-sm"
              >
                <div className="text-left min-w-0">
                  <p className="text-slate-900 group-hover:text-primary-600 truncate transition-colors text-sm font-bold">Maria Santos</p>
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-0.5">Tailoring Expert</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('chef.raj@entreskill.com')}
                className="group flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all hover:border-primary-400 shadow-sm"
              >
                <div className="text-left min-w-0">
                  <p className="text-slate-900 group-hover:text-primary-600 truncate transition-colors text-sm font-bold">Chef Raj Patel</p>
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-0.5">Culinary Advisor</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marketer.sam@entreskill.com')}
                className="group flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all hover:border-primary-400 shadow-sm"
              >
                <div className="text-left min-w-0">
                  <p className="text-slate-900 group-hover:text-primary-600 truncate transition-colors text-sm font-bold">Sam Wilson</p>
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-0.5">Marketing Advisor</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@entreskill.com')}
                className="sm:col-span-2 group flex items-center justify-between p-3.5 border border-red-200 rounded-xl hover:bg-red-50/50 text-slate-700 font-bold text-sm transition-all hover:border-red-400 shadow-sm"
              >
                <div className="text-left min-w-0 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-red-700 transition-colors font-extrabold text-sm">System Administrator</p>
                    <p className="text-xs text-red-400 font-medium uppercase tracking-wider mt-0.5">Full Telemetry Controls</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
