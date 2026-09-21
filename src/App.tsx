import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PlaygroundPage } from './pages/PlaygroundPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { RoutingEnginePage } from './pages/RoutingEnginePage.js';
import { ModelsPage } from './pages/ModelsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { HistoryDetailPage } from './pages/HistoryDetailPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { DocsPage } from './pages/DocsPage.js';
import { AboutPage } from './pages/AboutPage.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Core Application with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/routing" element={<RoutingEnginePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<HistoryDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
