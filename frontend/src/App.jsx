import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import AnalysisPage from './pages/AnalysisPage';
import ComparePage from './pages/ComparePage';
import UploadPage from './pages/UploadPage';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="history" element={<DashboardHome />} />
          <Route path="documents" element={<DashboardHome />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center flex-col gap-4 p-4">
            <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
            <p className="text-slate-500">The page you are looking for does not exist.</p>
            <a href="/" className="text-blue-600 font-medium hover:underline">Go Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
