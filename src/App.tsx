import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { MainApp } from './components/MainApp';
import { ProfilePage } from './components/Profile/ProfilePage';
import { EventDetails } from './components/Events/EventDetails';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { MinimalLayout } from './components/Layout/MinimalLayout';
import { ActivityFeed } from './components/Activity/ActivityFeed';
import { ServicesPage } from './components/Services/ServicesPage';
import { BookingsPage } from './components/Bookings/BookingsPage';
import { SocialDashboard } from './components/Social/SocialDashboard';
import { MessagesPage } from './components/Messages/MessagesPage';
import { PaymentsPage } from './components/Payments/PaymentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/reset-password" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MinimalLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<MainApp />} />
            <Route path="/activity" element={<ActivityFeed />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/social" element={<SocialDashboard />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/settings" element={<div>Settings</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}