import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireRole } from './components/auth/ProtectedRoute';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

// Profile Pages
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

// Feature Pages
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { VideoCallPage } from './pages/call/VideoCallPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';

// Chat Pages
import { ChatPage } from './pages/chat/ChatPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Everything below requires an authenticated session */}
          <Route element={<RequireAuth />}>
            {/* Dashboard Routes — role-gated so an entrepreneur can't view the investor
                dashboard by typing the URL, and vice versa */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route element={<RequireRole role="entrepreneur" />}>
                <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
              </Route>
              <Route element={<RequireRole role="investor" />}>
                <Route path="investor" element={<InvestorDashboard />} />
              </Route>
            </Route>
            
            {/* Profile Routes */}
            <Route path="/profile" element={<DashboardLayout />}>
              <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
              <Route path="investor/:id" element={<InvestorProfile />} />
            </Route>
            
            {/* Feature Routes */}
            <Route path="/investors" element={<DashboardLayout />}>
              <Route index element={<InvestorsPage />} />
            </Route>
            
            <Route path="/entrepreneurs" element={<DashboardLayout />}>
              <Route index element={<EntrepreneursPage />} />
            </Route>
            
            <Route path="/messages" element={<DashboardLayout />}>
              <Route index element={<MessagesPage />} />
            </Route>
            
            <Route path="/notifications" element={<DashboardLayout />}>
              <Route index element={<NotificationsPage />} />
            </Route>
            
            <Route path="/documents" element={<DashboardLayout />}>
              <Route index element={<DocumentsPage />} />
            </Route>
            
            <Route path="/settings" element={<DashboardLayout />}>
              <Route index element={<SettingsPage />} />
            </Route>
            
            <Route path="/help" element={<DashboardLayout />}>
              <Route index element={<HelpPage />} />
            </Route>
            
            <Route path="/deals" element={<DashboardLayout />}>
              <Route index element={<DealsPage />} />
            </Route>
            
            <Route path="/meetings" element={<DashboardLayout />}>
              <Route index element={<MeetingsPage />} />
            </Route>
            
            <Route path="/call" element={<DashboardLayout />}>
              <Route path=":meetingId" element={<VideoCallPage />} />
            </Route>
            
            <Route path="/payments" element={<DashboardLayout />}>
              <Route index element={<PaymentsPage />} />
            </Route>
            
            {/* Chat Routes */}
            <Route path="/chat" element={<DashboardLayout />}>
              <Route index element={<ChatPage />} />
              <Route path=":userId" element={<ChatPage />} />
            </Route>
          </Route>
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all other routes and redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;