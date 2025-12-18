'use client';

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Link as MuiLink,
  useTheme,
  Grid,
} from '@mui/material';
import { Calendar, Clock, MapPin } from '@phosphor-icons/react';
import Link from 'next/link';

export default function EventCard({ events, message, grouped = true }) {
  const theme = useTheme();

  const formatDate = (dateString, includeTime = true) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && { hour: 'numeric', minute: 'numeric' }),
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const currentDate = new Date();

  // Status mapping logic with specific colors requested
  const getStatusInfo = (status) => {
    switch (status) {
      case 0: // Submitted (Pending)
        return {
          label: 'Pending',
          bgcolor: '#fef3c7', // amber-100
          color: '#92400e',   // amber-800
          border: '#fcd34d'   // amber-300
        };
      case 1: // HOD Approved
        return {
          label: 'HOD Approved',
          bgcolor: '#d1fae5', // emerald-100
          color: '#065f46',   // emerald-800
          border: '#6ee7b7'   // emerald-300
        };
      case 2: // Approved (Final)
        return {
          label: 'Approved',
          bgcolor: '#d1fae5', // emerald-100
          color: '#065f46',   // emerald-800
          border: '#6ee7b7'   // emerald-300
        };
      case -1: // HOD Rejected
        return {
          label: 'HOD Rejected',
          bgcolor: '#ffe4e6', // rose-100
          color: '#9f1239',   // rose-800
          border: '#fda4af'   // rose-300
        };
      case -2: // IQAC Rejected
        return {
          label: 'IQAC Rejected',
          bgcolor: '#ffe4e6', // rose-100
          color: '#9f1239',   // rose-800
          border: '#fda4af'   // rose-300
        };
      case 3: // Marked for Change (HOD)
        return {
          label: 'Changes Requested',
          bgcolor: '#ffe4e6', // rose-100
          color: '#9f1239',   // rose-800
          border: '#fda4af'   // rose-300
        };
      case 4: // Marked for Change (IQAC)
        return {
          label: 'Changes Requested',
          bgcolor: '#ffe4e6', // rose-100
          color: '#9f1239',   // rose-800
          border: '#fda4af'   // rose-300
        };
      case 5: // Principal Approved
        return {
          label: 'Principal Approved',
          bgcolor: '#d1fae5', // emerald-100
          color: '#065f46',   // emerald-800
          border: '#6ee7b7'   // emerald-300
        };
      default:
        return {
          label: 'Unknown',
          bgcolor: theme.palette.grey[100],
          color: theme.palette.grey[800],
          border: theme.palette.grey[300]
        };
    }
  };

  const SingleEventCard = ({ event }) => {
    const statusInfo = getStatusInfo(event.status);

    return (
      <Card
        component={Link}
        href={`${process.env.NEXT_PUBLIC_URL}/events/${event._id}`}
        elevation={0}
        sx={{
          height: '100%',
          minHeight: 320,
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
          },
        }}
      >
        <CardContent sx={{ p: 3, pb: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Row: Status and ID */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{
                bgcolor: statusInfo.bgcolor,
                color: statusInfo.color,
                border: `1px solid ${statusInfo.border}`,
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 24,
                borderRadius: 1.5,
              }}
            />
            {event.ins_id && statusInfo.label.includes('Approved') && (
              <Chip
                label={`ID: ${event.ins_id}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.70rem',
                  height: 24,
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography
            variant='h6'
            component='h3'
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.4,
              mb: 3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.eventData?.EventName}
          </Typography>

          {/* Metadata */}
          <Stack spacing={1.5} sx={{ color: 'text.secondary', mt: 'auto', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Calendar size={18} weight="regular" style={{ opacity: 0.7 }} />
              <Typography variant="body2">
                {formatDate(event.eventData?.StartTime, false)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Clock size={18} weight="regular" style={{ opacity: 0.7 }} />
              <Typography variant="body2">
                {new Date(event.eventData?.StartTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} -
                {new Date(event.eventData?.EndTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <MapPin size={18} weight="regular" style={{ opacity: 0.7 }} />
              <Typography variant="body2" noWrap sx={{ maxWidth: '220px' }}>
                {event.eventData?.EventVenue}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <Box sx={{ px: 3 }}>
          <Box sx={{ height: 1, bgcolor: 'divider', width: '100%', opacity: 0.5 }} />
        </Box>

        <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <MuiLink
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            View Details <Box component="span" sx={{ fontSize: '1.1em', lineHeight: 0 }}>→</Box>
          </MuiLink>
        </Box>
      </Card>
    );
  };


  const renderGrid = (eventList) => (
    <Grid container spacing={3}>
      {eventList.map((event) => (
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6} key={event._id} sx={{ maxWidth: { sm: '50%', md: '50%', lg: '50%', xl: '50%' }, flexBasis: { sm: '50%', md: '50%', lg: '50%', xl: '50%' } }}>
          <SingleEventCard event={event} />
        </Grid>
      ))}
    </Grid>
  );

  if (!events || events.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="h6">{message || "No events found."}</Typography>
      </Box>
    );
  }

  if (!grouped) {
    return renderGrid(events);
  }

  const upcomingEvents = events.filter(
    event => new Date(event.eventData.EndTime) > currentDate
  );
  const pastEvents = events.filter(
    event => new Date(event.eventData.EndTime) <= currentDate
  );


  return (
    <Stack spacing={6} sx={{ py: 4, width: '100%' }}>
      {upcomingEvents.length > 0 && (
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            Upcoming events
          </Typography>
          {renderGrid(upcomingEvents)}
        </Box>
      )}

      {pastEvents.length > 0 && (
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 700, color: 'text.secondary' }}>
            Past events
          </Typography>
          <Box sx={{ opacity: 0.8 }}>
            {renderGrid(pastEvents)}
          </Box>
        </Box>
      )}

      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Typography>{message || "No events found."}</Typography>
      )}
    </Stack>
  );
}
