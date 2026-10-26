import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import ExplorePage from './pages/ExplorePage';
import CreateRoadmapPage from './pages/CreateRoadmapPage';
import EditRoadmapPage from './pages/EditRoadmapPage';
import RoadmapDetailPage from './pages/RoadmapDetailPage';
import MyRoadmapsPage from './pages/MyRoadmapsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PullRequestsPage from './pages/PullRequestsPage';
import PullRequestDetailPage from './pages/PullRequestDetailPage';
import ActivityPage from './pages/ActivityPage';

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-git-border border-t-git-indigo" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <OverviewPage />
      </AppLayout>
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route element={<AppLayout />}>
            <Route path="overview" element={<OverviewPage />} />
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
            {/* Workflow routes */}
            <Route path="pull-requests" element={<PullRequestsPage />} />
            <Route path="pull-requests/:id" element={<PullRequestDetailPage />} />
            <Route path="activity" element={<ActivityPage />} />
            {/* Fallback route */}
            <Route path="*" element={<RootRoute />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
