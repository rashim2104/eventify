'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import * as colorsConfig from '@/lib/colors.config.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'past', label: 'Past' },
  { value: 'pending approval', label: 'Pending Approval' },
];

function formatISODate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function parseReservationDisplayDate(ddmmyy) {
  if (!ddmmyy) return '-';
  const [dd, mm, yy] = ddmmyy.split('-');
  const iso = `20${yy}-${mm}-${dd}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return ddmmyy;
  return d.toLocaleDateString();
}

function getStatusChipProps(statusText) {
  const status = statusText || '-';
  const isPending = status === 'Pending Approval';
  const isPast = status === 'Past';
  const isUpcoming = status === 'Upcoming';
  const isOngoing = status === 'Ongoing';

  return {
    color: isUpcoming
      ? 'info'
      : isOngoing
        ? 'warning'
        : isPending
          ? 'error'
          : 'default',
    sx: {
      backgroundColor: isPast ? '#ffeb3b' : isPending ? '#ffcdd2' : undefined,
      color: isPast ? '#000' : isPending ? '#d32f2f' : undefined,
    },
    variant: isPast || isPending ? 'filled' : 'outlined',
  };
}

export default function Reservations() {
  const { data: session, status } = useSession();
  const theme = useTheme();
  const appColors = colorsConfig.colors;

  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(
    () => new Date(today.getFullYear(), 0, 1),
    [today]
  );
  const defaultTo = useMemo(
    () => new Date(today.getFullYear(), 11, 31),
    [today]
  );

  const [venues, setVenues] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [selectedVenueIds, setSelectedVenueIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const isAdmin = session?.user?.userType === 'admin';

  const fetchVenues = async () => {
    try {
      const res = await fetch('/api/allVenues', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch venues');
      const list = Array.isArray(data?.venues) ? data.venues : [];
      setVenues(list);
      const allVenueObjectIds = list.map(v => v?._id || v?.id).filter(Boolean);
      const allVenueIdStrings = list.map(v => v?.venueId).filter(Boolean);
      setSelectedVenues(allVenueObjectIds);
      setSelectedVenueIds(allVenueIdStrings);
    } catch (e) {
      setError(e.message || 'Failed to fetch venues');
    }
  };

  const fetchEventsGrouped = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        startDate: formatISODate(fromDate),
        endDate: formatISODate(toDate),
        status: statusFilter,
        venueIds: selectedVenueIds,
      };

      const res = await fetch('/api/venue/reservations-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || 'Failed to fetch reservations');

      const grouped = data.events || [];
      setRows(grouped);
    } catch (e) {
      setError(e.message || 'Failed to fetch reservations');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    fetchEventsGrouped();
  }, []);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
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
        Venue Reservations
      </Typography>

      <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* Row 1: Venue and Status */}
          <Grid container spacing={2} alignItems='center' sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ width: { xs: '100%', md: 360 } }}>
                <InputLabel id='venues-label'>Venues</InputLabel>
                <Select
                  labelId='venues-label'
                  multiple
                  value={selectedVenues}
                  onChange={e => {
                    const selectedObjectIds = e.target.value;
                    setSelectedVenues(selectedObjectIds);
                    const selectedVenueIdStrings = selectedObjectIds
                      .map(objId => {
                        const venue = venues.find(
                          v => (v?._id || v?.id) === objId
                        );
                        return venue?.venueId;
                      })
                      .filter(Boolean);
                    setSelectedVenueIds(selectedVenueIdStrings);
                  }}
                  input={<OutlinedInput label='Venues' />}
                  sx={{
                    width: '100%',
                    '& .MuiSelect-select': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                  renderValue={selected => {
                    if (!selected?.length) return 'All Venues';
                    const names = selected
                      .map(
                        id =>
                          venues.find(v => (v?._id || v?.id) === id)?.venueName
                      )
                      .filter(Boolean);
                    return names.join(', ');
                  }}
                >
                  {venues.map(v => (
                    <MenuItem key={v?._id || v?.id} value={v?._id || v?.id}>
                      <Checkbox
                        checked={selectedVenues.indexOf(v?._id || v?.id) > -1}
                      />
                      <Typography sx={{ ml: 1 }}>
                        {v?.venueName || v?.name || 'Unnamed'}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ width: { xs: '100%', md: 360 } }}>
                <InputLabel id='status-label'>Status</InputLabel>
                <Select
                  labelId='status-label'
                  value={statusFilter}
                  label='Status'
                  onChange={e => setStatusFilter(e.target.value)}
                  sx={{
                    width: '100%',
                    '& .MuiSelect-select': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Row 2: From and To dates */}
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={6}>
              <DatePicker
                label='From'
                value={fromDate}
                onChange={val => val && setFromDate(val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label='To'
                value={toDate}
                onChange={val => val && setToDate(val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' },
                mt: 1,
              }}
            >
              <Button
                variant='contained'
                sx={{ py: 1.25, minWidth: { xs: '60%', md: 160 } }}
                onClick={fetchEventsGrouped}
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

      <Paper variant='outlined' sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size='small' sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor:
                  appColors?.light?.secondaryHex || theme.palette.action.hover,
              }}
            >
              <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Venue</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Session</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                  <Typography variant='body2' color='text.secondary'>
                    No reservations found for selected filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(group => {
                if (!group.reservations || group.reservations.length === 0) {
                  return null;
                }
                const [first, ...rest] = group.reservations;
                const firstDate = parseReservationDisplayDate(
                  first?.reservationDate
                );
                return (
                  <React.Fragment key={group.eventId}>
                    <TableRow hover>
                      <TableCell
                        rowSpan={group.reservations.length}
                        sx={{
                          fontWeight: 700,
                          verticalAlign: 'top',
                        }}
                      >
                        {`${group.ins_id ? group.ins_id + ' - ' : ''}${group.eventName}`}
                      </TableCell>
                      <TableCell>{first?.venueName || '-'}</TableCell>
                      <TableCell>{firstDate}</TableCell>
                      <TableCell>
                        {first?.reservationSession
                          ? first.reservationSession.charAt(0).toUpperCase() +
                            first.reservationSession.slice(1)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          label={first?.statusText || '-'}
                          {...getStatusChipProps(first?.statusText)}
                        />
                      </TableCell>
                    </TableRow>
                    {rest.map((r, i) => {
                      const d = parseReservationDisplayDate(r?.reservationDate);
                      return (
                        <TableRow key={`${group.eventId}-${i}`} hover>
                          <TableCell>{r?.venueName || '-'}</TableCell>
                          <TableCell>{d}</TableCell>
                          <TableCell>
                            {r?.reservationSession
                              ? r.reservationSession.charAt(0).toUpperCase() +
                                r.reservationSession.slice(1)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size='small'
                              label={r?.statusText || '-'}
                              {...getStatusChipProps(r?.statusText)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
