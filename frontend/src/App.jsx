import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/auth.jsx'
import HomePage from './pages/home.jsx'
import EmployeesPage from './pages/employees.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import RoleChangePage from './pages/RoleChangePage.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import ComplianceDashboardPage from './pages/ComplianceDashboardPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import AppLayout from './components/AppLayout.jsx'

function AuthLayout({ children }) {
  return <RequireAuth><AppLayout>{children}</AppLayout></RequireAuth>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/role-change" element={<RoleChangePage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/compliance" element={<ComplianceDashboardPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App

