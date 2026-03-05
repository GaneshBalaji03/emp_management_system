import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './api/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EmployeeDirectory from './pages/employees/EmployeeDirectory';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import AttendancePage from './pages/attendance/AttendancePage';
import LeavePage from './pages/leaves/LeavePage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import TicketsPage from './pages/tickets/TicketsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AuditLogPage from './pages/management/audit-logs/AuditLogPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="employees" element={<EmployeeDirectory />} />
                        <Route path="onboarding" element={<OnboardingPage />} />
                        <Route path="attendance" element={<AttendancePage />} />
                        <Route path="leaves" element={<LeavePage />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="tickets" element={<TicketsPage />} />
                        <Route path="management" element={<AuditLogPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
