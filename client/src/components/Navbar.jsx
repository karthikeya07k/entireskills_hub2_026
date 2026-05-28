import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, MessageSquare, ShieldAlert, Award } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200/80 backdrop-blur-md bg-opacity-95 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-10">
            {/* Clean Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-95 transition-opacity">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight">
                EntreSkill <span className="text-primary-600 font-medium">Hub</span>
              </span>
            </Link>

            {/* Role-specific Nav Links */}
            <div className="hidden md:flex space-x-2 items-center">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/') 
                    ? 'text-primary-700 bg-primary-50/70 border border-primary-100/50' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              
              {user.role === 'user' && (
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                    isActive('/chat')
                      ? 'text-primary-700 bg-primary-50/70 border border-primary-100/50'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  <span>My Mentors</span>
                </Link>
              )}

              {user.role === 'mentor' && (
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                    isActive('/chat')
                      ? 'text-primary-700 bg-primary-50/70 border border-primary-100/50'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  <span>Mentees Inbox</span>
                </Link>
              )}

              {user.role === 'admin' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  Admin Mode
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3.5 pr-5 border-r border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shadow-inner">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                  {user.role}
                </p>
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {user.name.split(' ')[0]}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-650 p-2.5 rounded-xl hover:bg-red-50 transition-colors flex items-center space-x-1.5"
              title="Sign Out"
              id="logout-button"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="hidden sm:inline text-xs font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
