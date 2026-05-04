import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Timesheet, MachineChecklist, DailyReport } from '../lib/database.types';
import { format, startOfWeek, addDays } from 'date-fns';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function EmployeeDashboard() {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myTimesheets, setMyTimesheets] = useState<Timesheet[]>([]);
  const [myChecklists, setMyChecklists] = useState<MachineChecklist[]>([]);
  const [myReports, setMyReports] = useState<DailyReport[]>([]);

  const quickActions: QuickAction[] = [
    {
      label: 'New Timesheet',
      description: 'Start a new weekly timesheet',
      icon: <AddIcon sx={{ fontSize: 32 }} />,
      color: 'primary.main',
      path: '/my-timesheet',
    },
    {
      label: 'New Checklist',
      description: 'Start machine prestart check',
      icon: <AddIcon sx={{ fontSize: 32 }} />,
      color: 'warning.main',
      path: '/checklists',
    },
    {
      label: 'New Daily Diary',
      description: 'Start daily report and expenses',
      icon: <AddIcon sx={{ fontSize: 32 }} />,
      color: 'success.main',
      path: '/reports',
    },
  ];

  useEffect(() => {
    if (!employee) { setLoading(false); return; }

    async function fetchData() {
      setLoading(true);
      const empId = employee!.id;

      const [tsRes, clRes, drRes] = await Promise.all([
        supabase
          .from('timesheets')
          .select('*')
          .eq('employee_id', empId)
          .order('week_start_date', { ascending: false })
          .limit(5),
        supabase
          .from('machine_checklists')
          .select('*, project:projects(name)')
          .eq('inspected_by', empId)
          .order('inspection_date', { ascending: false })
          .limit(5),
        supabase
          .from('daily_reports')
          .select('*, project:projects(name)')
          .eq('reported_by', empId)
          .order('report_date', { ascending: false })
          .limit(5),
      ]);

      setMyTimesheets(tsRes.data ?? []);
      setMyChecklists((clRes.data as MachineChecklist[]) ?? []);
      setMyReports((drRes.data as DailyReport[]) ?? []);
      setLoading(false);
    }

    fetchData();
  }, [employee]);

  const currentTs = myTimesheets.find(
    (t) => t.week_start_date === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
    draft: 'default',
    submitted: 'warning',
    approved: 'success',
    rejected: 'error',
    flagged: 'error',
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Welcome back, {employee ? `${employee.first_name}` : 'Employee'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>

      {/* Timesheet Summary */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>Timesheet Summary</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {loading ? (
            <Stack spacing={1.5}>
              <Skeleton height={20} />
              <Skeleton height={40} />
              <Skeleton height={6} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {/* Stats Row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Days Worked
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {currentTs ? Math.ceil(currentTs.total_hours / 8) : 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Total Hours
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {currentTs ? currentTs.total_hours : 0}h
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Avg Daily
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {currentTs && currentTs.total_hours > 0 ? (currentTs.total_hours / Math.max(1, Math.ceil(currentTs.total_hours / 8))).toFixed(1) : 0}h
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Progress
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {currentTs ? Math.round((currentTs.total_hours / 40) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
              {/* Progress Bar */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Weekly Target
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {currentTs ? Math.round((currentTs.total_hours / 40) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={currentTs ? Math.min((currentTs.total_hours / 40) * 100, 100) : 0}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>Quick Actions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid size={{ xs: 12, sm: 4 }} key={action.label}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: action.color,
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={700}>
                  {action.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <AccessTimeIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>This Week's Timesheet</Typography>
              </Box>
              {loading ? (
                <Skeleton height={32} />
              ) : currentTs ? (
                <Stack spacing={0.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={currentTs.status.charAt(0).toUpperCase() + currentTs.status.slice(1)}
                      color={statusColor[currentTs.status]}
                      size="small"
                    />
                    <Typography variant="body2">{currentTs.total_hours}h logged</Typography>
                  </Box>
                  {currentTs.status === 'draft' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SendIcon />}
                      onClick={() => navigate('/my-timesheet')}
                      sx={{ mt: 0.5 }}
                    >
                      Submit for Approval
                    </Button>
                  )}
                </Stack>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No timesheet created for this week
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => navigate('/my-timesheet')}
                  >
                    Start Timesheet
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <ChecklistIcon sx={{ color: 'warning.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>Recent Prestart Checks</Typography>
              </Box>
              {loading ? (
                <Skeleton height={32} />
              ) : myChecklists.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No checklists yet</Typography>
              ) : (
                <Stack spacing={0.5}>
                  {myChecklists.slice(0, 3).map((cl) => (
                    <Box key={cl.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {cl.machine_name}
                      </Typography>
                      <Chip
                        label={cl.status.charAt(0).toUpperCase() + cl.status.slice(1)}
                        color={statusColor[cl.status]}
                        size="small"
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <AssignmentIcon sx={{ color: 'success.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>Recent Daily Reports</Typography>
              </Box>
              {loading ? (
                <Skeleton height={32} />
              ) : myReports.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No reports yet</Typography>
              ) : (
                <Stack spacing={0.5}>
                  {myReports.slice(0, 3).map((dr) => (
                    <Box key={dr.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {format(new Date(dr.report_date), 'MMM d')} - {dr.project?.name ?? 'Project'}
                      </Typography>
                      <Chip
                        label={dr.is_complete ? 'Done' : 'WIP'}
                        color={dr.is_complete ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timesheet History */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>Timesheet History</Typography>
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box p={2}><Skeleton height={40} /><Skeleton height={40} /></Box>
          ) : myTimesheets.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="text.secondary">No timesheets recorded yet.</Typography>
            </Box>
          ) : (
            <Box>
              {myTimesheets.map((ts, idx) => (
                <Box
                  key={ts.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: idx < myTimesheets.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(ts.week_start_date), 'MMM d')} - {format(addDays(new Date(ts.week_start_date), 6), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{ts.total_hours}h</Typography>
                  </Box>
                  <Chip
                    label={ts.status.charAt(0).toUpperCase() + ts.status.slice(1)}
                    color={statusColor[ts.status]}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
