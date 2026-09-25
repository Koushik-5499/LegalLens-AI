import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
          <Route path="history" element={<PlaceholderPage title="History" />} />
          <Route path="documents" element={<PlaceholderPage title="My Documents" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
        <Route path="*" element={<div className="flex h-screen items-center justify-center"><h2>Page Not Found</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;
