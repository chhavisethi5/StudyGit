import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import OverviewPage from './pages/OverviewPage';
import ExplorePage from './pages/ExplorePage';
import CreateRoadmapPage from './pages/CreateRoadmapPage';
import EditRoadmapPage from './pages/EditRoadmapPage';
import RoadmapDetailPage from './pages/RoadmapDetailPage';
import MyRoadmapsPage from './pages/MyRoadmapsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PullRequestsPage from './pages/PullRequestsPage';
import ActivityPage from './pages/ActivityPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="explore/new" element={<CreateRoadmapPage />} />
            <Route path="explore/:id" element={<RoadmapDetailPage />} />
            <Route path="explore/:id/edit" element={<EditRoadmapPage />} />
            {/* Route aliases */}
            <Route path="roadmaps/new" element={<CreateRoadmapPage />} />
            <Route path="roadmaps/:id" element={<RoadmapDetailPage />} />
            <Route path="roadmaps/:id/edit" element={<EditRoadmapPage />} />
            <Route path="my-roadmaps" element={<MyRoadmapsPage />} />
            {/* Authentication routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            {/* Future workflow placeholders */}
            <Route path="pull-requests" element={<PullRequestsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            {/* Fallback route */}
            <Route path="*" element={<OverviewPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
