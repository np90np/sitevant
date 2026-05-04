import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Timesheets from './pages/Timesheets';
import MyTimesheet from './pages/MyTimesheet';
import DailyReports from './pages/DailyReports';
import MachineChecklists from './pages/MachineChecklists';
import Export from './pages/Export';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/my-timesheet" element={<MyTimesheet />} />
            <Route path="/timesheets" element={<Timesheets />} />
            <Route path="/reports" element={<DailyReports />} />
            <Route path="/checklists" element={<MachineChecklists />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
