import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import theme from './theme';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Timesheets from './pages/Timesheets';
import MyTimesheet from './pages/MyTimesheet';
import DailyReports from './pages/DailyReports';
import MachineChecklists from './pages/MachineChecklists';
import Export from './pages/Export';
import Assets from './pages/Assets';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { employee } = useAuth();
  if (employee?.role === 'employee') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, employee } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={employee?.role === 'employee' ? <EmployeeDashboard /> : <Dashboard />} />
                <Route path="/projects" element={<AdminRoute><Projects /></AdminRoute>} />
                <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
                <Route path="/assets" element={<AdminRoute><Assets /></AdminRoute>} />
                <Route path="/my-timesheet" element={<MyTimesheet />} />
                <Route path="/timesheets" element={<AdminRoute><Timesheets /></AdminRoute>} />
                <Route path="/reports" element={<DailyReports />} />
                <Route path="/checklists" element={<MachineChecklists />} />
                <Route path="/export" element={<AdminRoute><Export /></AdminRoute>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
