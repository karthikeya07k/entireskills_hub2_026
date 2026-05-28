import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserDashboard from './dashboards/UserDashboard';
import MentorDashboard from './dashboards/MentorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
}
