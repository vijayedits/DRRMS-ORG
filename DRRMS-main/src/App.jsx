import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.tsx';
import ProfileSettings from './pages/UserDashboardPages/profileSettings.jsx';
import CreateRequest from './pages/UserDashboardPages/CreateRequest.jsx';
import FindResources from './pages/UserDashboardPages/FindResources.tsx';
import MyRequests from './pages/UserDashboardPages/MyRequests.jsx';
import Shelters from './pages/UserDashboardPages/Shelters.jsx';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));  // Get user from local storage

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/volunteer" element={<VolunteerDashboard />} />
      <Route path="/citizen" element={<UserDashboard />} />
      <Route path="/create-request" element={<CreateRequest />} />
      <Route path="/find-resources" element={<FindResources />} />
      <Route path="/my-requests" element={<MyRequests />} />
      <Route path="/shelters" element={<Shelters />} />
      <Route path="/profiles" element={<ProfileSettings />} />
    </Routes>
  );
}

export default App;
