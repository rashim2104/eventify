'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Checkbox,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as colorsConfig from '@/lib/colors.config.js';
import { toast } from 'sonner';
import { PaperPlaneTilt, DownloadSimple, ShieldCheck, ClipboardText, ChartBar } from '@phosphor-icons/react';

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null;
}

export default function Report() {
  const { data: session, status } = useSession();
  const theme = useTheme();
  const appColors = colorsConfig.colors;
  const getCurrentYearRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 2);
    const end = new Date(now.getFullYear(), 11, 31);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const [events, setEvents] = useState([]);
  const [{ startDate, endDate }, setDateRange] = useState(
    getCurrentYearRange()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('eventDate');
  const [selectedIds, setSelectedIds] = useState([]);

  // Category filter state
  const [categoryType, setCategoryType] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Tab state
  const [reportTab, setReportTab] = useState(0);

  // Override dialog state (used in Pending Report tab)
  const [overrideDialog, setOverrideDialog] = useState({ open: false, userId: null, userName: null });
  const [overrideLoading, setOverrideLoading] = useState(false);

  const handleGrantOverride = async (userId) => {
    setOverrideLoading(true);
    try {
      const res = await fetch('/api/grantOverride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to grant override');
      toast.success('Override granted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to grant override');
    } finally {
      setOverrideLoading(false);
      setOverrideDialog({ open: false, userId: null, userName: null });
    }
  };

  // Derive pending reports grouped by user
  const pendingAnnexures = React.useMemo(() => {
    const pending = events.filter(e => {
      const end = e?.eventData?.EndTime ? new Date(e.eventData.EndTime) : null;
      const completed = end && end < new Date();
      const postEventFilled = Boolean(e?.postEventData);
      return completed && !postEventFilled;
    });

    const grouped = {};
    for (const e of pending) {
      const uid = e.user_id;
      if (!uid) continue;
      if (!grouped[uid]) {
        grouped[uid] = {
          userId: uid,
          userName: e?.eventData?.eventCoordinators?.[0]?.coordinatorName || uid,
          dept: e?.dept || '-',
          events: [],
        };
      }
      grouped[uid].events.push(e);
    }
    return Object.values(grouped);
  }, [events]);

  const handleBulkRemindUser = async (userEvents) => {
    try {
      await Promise.all(
        userEvents.map(async e => {
          const res = await fetch('/api/remind-coordinator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: e._id }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data?.message || 'Failed to send some reminders');
          }
        })
      );
      toast.success(`Reminder sent for ${userEvents.length} event(s)`);
    } catch (err) {
      toast.error(err.message || 'Failed to send reminders');
    }
  };

  const CATEGORY_TYPES = [
    { value: 'department', label: 'Department' },
    { value: 'club', label: 'Clubs' },
    { value: 'professional', label: 'Professional Societies' },
    { value: 'ieee', label: 'IEEE Societies' },
  ];

  // Fetch category options when categoryType changes
  useEffect(() => {
    const fetchCategoryOptions = async () => {
      if (!categoryType) {
        setCategoryOptions([]);
        setSelectedCategories([]);
        return;
      }

      setLoadingCategories(true);
      try {
        let url = '';
        switch (categoryType) {
          case 'department':
            url = '/api/config/departments';
            break;
          case 'club':
            url = '/api/config/clubs';
            break;
          case 'professional':
            url = '/api/config/societies?type=professional';
            break;
          case 'ieee':
            url = '/api/config/societies?type=ieee';
            break;
          default:
            return;
        }

        const res = await fetch(url);
        const data = await res.json();

        let options = [];
        if (categoryType === 'department' && data.departments) {
          options = data.departments.map(d => ({ code: d.code, name: d.name }));
        } else if (categoryType === 'club' && data.clubs) {
          options = data.clubs.map(c => ({ code: c.code, name: c.name }));
        } else if ((categoryType === 'professional' || categoryType === 'ieee') && data.societies) {
          options = data.societies.map(s => ({ code: s.code, name: s.name }));
        }

        setCategoryOptions(options);
        setSelectedCategories([]);
      } catch (err) {
        console.error('Failed to fetch category options:', err);
        setCategoryOptions([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoryOptions();
  }, [categoryType]);

  const getValueByKey = (event, key) => {
    switch (key) {
      case 'ins_id':
        return event?.ins_id || '';
      case 'eventName':
        return event?.eventData?.EventName || '';
      case 'eventDate': {
        const d = event?.eventData?.StartTime
          ? new Date(event.eventData.StartTime)
          : null;
        return d ? d.getTime() : 0;
      }
      case 'coordinatorName':
        return event?.eventData?.eventCoordinators?.[0]?.coordinatorName || '';
      case 'completed': {
        const end = event?.eventData?.EndTime
          ? new Date(event.eventData.EndTime)
          : null;
        return end && end < new Date() ? 1 : 0;
      }
      case 'postEventFilled':
        return event?.postEventData ? 1 : 0;
      default:
        return '';
    }
  };

  const descendingComparator = (a, b, key) => {
    const va = getValueByKey(a, key);
    const vb = getValueByKey(b, key);
    if (vb < va) return -1;
    if (vb > va) return 1;
    return 0;
  };

  const getComparator = (ord, key) =>
    ord === 'desc'
      ? (a, b) => descendingComparator(a, b, key)
      : (a, b) => -descendingComparator(a, b, key);

  const stableSort = (array, comparator) => {
    const stabilized = array.map((el, index) => [el, index]);
    stabilized.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilized.map(el => el[0]);
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = id => selectedIds.indexOf(id) !== -1;
  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelected = events.map(n => n._id);
      setSelectedIds(newSelected);
      return;
    }
    setSelectedIds([]);
  };
  const handleRowClick = (event, id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1)
      );
    }
    setSelectedIds(newSelected);
  };

  const handleBulkReminder = async () => {
    if (!selectedIds.length) return;
    const targetEvents = events.filter(e => selectedIds.includes(e._id));
    const eligible = targetEvents.filter(e => {
      const end = e?.eventData?.EndTime ? new Date(e.eventData.EndTime) : null;
      const completed = end && end < new Date();
      const postEventFilled = Boolean(e?.postEventData);
      return completed && !postEventFilled;
    });
    if (!eligible.length) {
      toast.info('No eligible events selected');
      return;
    }
    try {
      await Promise.all(
        eligible.map(async e => {
          const res = await fetch('/api/remind-coordinator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: e._id }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data?.message || 'Failed to send some reminders');
          }
        })
      );
      toast.success(`Reminder sent to ${eligible.length} event(s)`);
    } catch (err) {
      toast.error(err.message || 'Failed to send reminders');
    }
  };

  const handleBulkDownload = async () => {
    if (!selectedIds.length) return;
    const targetEvents = events.filter(e => selectedIds.includes(e._id));
    let successCount = 0;
    for (const e of targetEvents) {
      try {
        const res = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: e._id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to generate PDF');
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        {
          const prefix = e?.ins_id || e?._id || 'event';
          const baseName = `${e?.eventData?.EventName || 'event'}.pdf`;
          a.download = `${prefix}-${baseName}`;
        }
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        successCount += 1;
      } catch (err) {
        // Continue with next file; summarize at end
      }
    }
    if (successCount > 0) toast.success(`Downloaded ${successCount} report(s)`);
    if (successCount < targetEvents.length)
      toast.error(`Failed ${targetEvents.length - successCount} report(s)`);
  };

  const fetchEvents = async (from, to) => {
    setLoading(true);
    setError('');
    try {
      const body = {
        startDate: new Date(from).toISOString().split('T')[0],
        endDate: new Date(to).toISOString().split('T')[0],
        filters: {},
      };

      // Add category filter if any categories are selected
      if (selectedCategories.length > 0) {
        body.filters.dept = selectedCategories.map(c => c.code);
      }

      const res = await fetch('/api/filterEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch events');
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (e) {
      setError(e.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { startDate: s, endDate: e } = getCurrentYearRange();
    fetchEvents(s, e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDateChange = e => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchEvents(startDate, endDate);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (session?.user?.userType !== 'admin') {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Typography
          variant='body1'
          sx={{ color: theme.palette.text.secondary }}
        >
          Not Authorized
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h5' component='h1' sx={{ mb: 2, fontWeight: 700 }}>
        Events Report
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={reportTab}
          onChange={(e, v) => setReportTab(v)}
          indicatorColor='primary'
          sx={{
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab
            icon={<ChartBar size={20} />}
            label='Events Report'
            iconPosition='start'
            sx={{ minHeight: 56 }}
          />
          <Tab
            icon={<ClipboardText size={20} />}
            label='Pending Report'
            iconPosition='start'
            sx={{ minHeight: 56 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={reportTab} index={0}>
      <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={4}>
              <DatePicker
                label='Start Date'
                value={startDate ? new Date(startDate) : null}
                onChange={value => {
                  if (!value) return;
                  setDateRange(prev => ({
                    ...prev,
                    startDate: new Date(value).toISOString().split('T')[0],
                  }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label='End Date'
                value={endDate ? new Date(endDate) : null}
                onChange={value => {
                  if (!value) return;
                  setDateRange(prev => ({
                    ...prev,
                    endDate: new Date(value).toISOString().split('T')[0],
                  }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md='auto'>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id='category-type-label'>Category Type</InputLabel>
                <Select
                  labelId='category-type-label'
                  id='category-type-select'
                  value={categoryType}
                  label='Category Type'
                  onChange={e => setCategoryType(e.target.value)}
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  {CATEGORY_TYPES.map(ct => (
                    <MenuItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {categoryType && (
              <Grid item xs={12} md='auto'>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  id='category-multi-select'
                  options={categoryOptions}
                  getOptionLabel={option => option.name}
                  value={selectedCategories}
                  onChange={(event, newValue) => setSelectedCategories(newValue)}
                  loading={loadingCategories}
                  isOptionEqualToValue={(option, value) => option.code === value.code}
                  sx={{ minWidth: 300 }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`Select ${CATEGORY_TYPES.find(c => c.value === categoryType)?.label || 'Items'}`}
                      placeholder='Select...'
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant='outlined'
                        label={option.name}
                        size='small'
                        {...getTagProps({ index })}
                        key={option.code}
                      />
                    ))
                  }
                />
              </Grid>
            )}
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-end' },
                width: '100%',
              }}
            >
              <Button
                onClick={handleSearch}
                variant='contained'
                sx={{
                  py: 1.25,
                  alignSelf: 'center',
                  minWidth: { xs: '60%', md: 160 },
                  mt: { xs: 1, md: 0 },
                  bgcolor: appColors?.light?.primaryHex || '#c96442',
                  color: appColors?.light?.primaryForegroundHex || '#ffffff',
                  '&:hover': {
                    bgcolor: appColors?.light?.chart1 || '#b05730',
                  },
                }}
              >
                Apply Filters
              </Button>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity='error'>Error: {error}</Alert>
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>
      </Paper>

      {selectedIds.length > 0 && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md='auto'>
              <Typography variant='subtitle2'>
                Selected: {selectedIds.length}
              </Typography>
            </Grid>
            {(() => {
              const targetEvents = events.filter(e =>
                selectedIds.includes(e._id)
              );
              const allEligible =
                targetEvents.length > 0 &&
                targetEvents.every(e => {
                  const end = e?.eventData?.EndTime
                    ? new Date(e.eventData.EndTime)
                    : null;
                  const completed = end && end < new Date();
                  const postEventFilled = Boolean(e?.postEventData);
                  return completed && !postEventFilled;
                });
              return (
                <>
                  {allEligible && (
                    <Grid item xs={12} md='auto'>
                      <Button variant='outlined' onClick={handleBulkReminder}>
                        Send Reminders
                      </Button>
                    </Grid>
                  )}
                  <Grid item xs={12} md='auto'>
                    <Button
                      variant='contained'
                      onClick={handleBulkDownload}
                      sx={{
                        bgcolor: appColors?.light?.primaryHex || '#c96442',
                        color: appColors?.light?.primaryForegroundHex || '#ffffff',
                        '&:hover': {
                          bgcolor: appColors?.light?.chart1 || '#b05730',
                        },
                      }}
                    >
                      Download Reports
                    </Button>
                  </Grid>
                </>
              );
            })()}
          </Grid>
        </Paper>
      )}

      <Paper variant='outlined' sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer
          sx={{
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'scroll',
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
            '&::-webkit-scrollbar': {
              width: '10px',
              display: 'block',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          <Table size='small' sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor:
                    appColors?.light?.secondaryHex || theme.palette.action.hover,
                }}
              >
                <TableCell padding='checkbox'>
                  <Checkbox
                    color='primary'
                    indeterminate={
                      selectedIds.length > 0 && selectedIds.length < events.length
                    }
                    checked={
                      events.length > 0 && selectedIds.length === events.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all events' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'ins_id'}
                    direction={orderBy === 'ins_id' ? order : 'asc'}
                    onClick={() => handleRequestSort('ins_id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'eventName'}
                    direction={orderBy === 'eventName' ? order : 'asc'}
                    onClick={() => handleRequestSort('eventName')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'eventDate'}
                    direction={orderBy === 'eventDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('eventDate')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'coordinatorName'}
                    direction={orderBy === 'coordinatorName' ? order : 'asc'}
                    onClick={() => handleRequestSort('coordinatorName')}
                  >
                    Coordinator
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'completed'}
                    direction={orderBy === 'completed' ? order : 'asc'}
                    onClick={() => handleRequestSort('completed')}
                  >
                    Completed
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'postEventFilled'}
                    direction={orderBy === 'postEventFilled' ? order : 'asc'}
                    onClick={() => handleRequestSort('postEventFilled')}
                  >
                    Post-Event Filled
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 4 }}>
                    <Typography variant='body2' color='text.secondary'>
                      No events found for selected range
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stableSort(events, getComparator(order, orderBy)).map(event => {
                  const eventDate = event?.eventData?.StartTime
                    ? new Date(event.eventData.StartTime).toLocaleDateString()
                    : '-';
                  const coordinatorName =
                    event?.eventData?.eventCoordinators?.[0]?.coordinatorName ||
                    '-';
                  const completed = (() => {
                    const end = event?.eventData?.EndTime
                      ? new Date(event.eventData.EndTime)
                      : null;
                    return end && end < new Date();
                  })();
                  const postEventFilled = Boolean(event?.postEventData);

                  const canRemind = completed && !postEventFilled;
                  const firstCoordinatorEmail =
                    event?.eventData?.eventCoordinators?.[0]?.coordinatorMail ||
                    '';

                  const onSendReminder = async () => {
                    try {
                      const res = await fetch('/api/remind-coordinator', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ eventId: event._id }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.message || 'Failed');
                      toast.success('Reminder email sent');
                    } catch (err) {
                      toast.error(err.message || 'Failed to send reminder');
                    }
                  };

                  const onDownloadPdf = async () => {
                    try {
                      const res = await fetch('/api/generate-pdf', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ eventId: event._id }),
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data?.error || 'Failed to generate PDF');
                      }
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      {
                        const prefix = event?.ins_id || event?._id || 'event';
                        const baseName = `${event?.eventData?.EventName || 'event'}.pdf`;
                        a.download = `${prefix}-${baseName}`;
                      }
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      toast.success('Report downloaded');
                    } catch (err) {
                      toast.error(err.message || 'Failed to download report');
                    }
                  };

                  const isItemSelected = isSelected(event._id);
                  const labelId = `event-checkbox-${event._id}`;

                  return (
                    <TableRow key={event._id} hover>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          color='primary'
                          checked={isItemSelected}
                          onChange={e => handleRowClick(e, event._id)}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell>{event.ins_id || '-'}</TableCell>
                      <TableCell>{event?.eventData?.EventName || '-'}</TableCell>
                      <TableCell>{eventDate}</TableCell>
                      <TableCell>{coordinatorName}</TableCell>
                      <TableCell>
                        <Chip
                          label={completed ? 'Yes' : 'No'}
                          size='small'
                          color={completed ? 'success' : 'warning'}
                          variant={completed ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={postEventFilled ? 'Yes' : 'No'}
                          size='small'
                          color={postEventFilled ? 'success' : 'warning'}
                          variant={postEventFilled ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                          {canRemind && (
                            <Tooltip title='Send reminder to creator'>
                              <IconButton
                                color='primary'
                                size='small'
                                onClick={onSendReminder}
                              >
                                <PaperPlaneTilt size={18} weight='regular' />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title='Download report (PDF)'>
                            <IconButton
                              color='primary'
                              size='small'
                              onClick={onDownloadPdf}
                            >
                              <DownloadSimple size={18} weight='regular' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      </TabPanel>

      <TabPanel value={reportTab} index={1}>
        <Paper variant='outlined' sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer
            sx={{
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'scroll',
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 #f1f1f1',
              '&::-webkit-scrollbar': {
                width: '10px',
                display: 'block',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            <Table size='small' sx={{ minWidth: 650 }} stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor:
                      appColors?.light?.secondaryHex || theme.palette.action.hover,
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pending Events</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Event Names</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : pendingAnnexures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                      <Typography variant='body2' color='text.secondary'>
                        No pending reports found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingAnnexures.map(group => (
                    <TableRow key={group.userId} hover>
                      <TableCell>{group.userName}</TableCell>
                      <TableCell>{group.dept}</TableCell>
                      <TableCell>
                        <Chip
                          label={group.events.length}
                          size='small'
                          color='warning'
                          variant='filled'
                        />
                      </TableCell>
                      <TableCell>
                        {group.events
                          .map(e => e?.eventData?.EventName || '-')
                          .join(', ')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Tooltip title='Grant event creation override'>
                            <IconButton
                              color='warning'
                              size='small'
                              onClick={() =>
                                setOverrideDialog({
                                  open: true,
                                  userId: group.userId,
                                  userName: group.userName,
                                })
                              }
                            >
                              <ShieldCheck size={18} weight='regular' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Send reminders for all pending events'>
                            <IconButton
                              color='primary'
                              size='small'
                              onClick={() => handleBulkRemindUser(group.events)}
                            >
                              <PaperPlaneTilt size={18} weight='regular' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <Dialog
        open={overrideDialog.open}
        onClose={() => setOverrideDialog({ open: false, userId: null, userName: null })}
      >
        <DialogTitle>Grant Event Creation Override</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will allow{' '}
            <strong>{overrideDialog.userName || 'this user'}</strong>{' '}
            to create one new event even though they have pending post-event annexure
            submissions. This is a one-time override.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOverrideDialog({ open: false, userId: null, userName: null })}
            disabled={overrideLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleGrantOverride(overrideDialog.userId)}
            variant='contained'
            color='warning'
            disabled={overrideLoading}
          >
            {overrideLoading ? 'Granting...' : 'Grant Override'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
