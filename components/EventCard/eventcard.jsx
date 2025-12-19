'use client';

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  useTheme,
  Button,
} from '@mui/material';
import { Calendar, Clock, MapPin, ArrowRight } from '@phosphor-icons/react';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';

export default function EventCard({ events, message, grouped = true }) {
  const theme = useTheme();

  const formatDate = dateString => {
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = dateString => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Helper function to get venue display text
  const getVenueDisplay = eventData => {
    // Check if event is online
    if (eventData?.EventVenue === 'online') {
      return eventData?.eventVenueAddInfo || 'Online';
    }

    // For offline events, check for venue list first (on-campus)
    const venueList = eventData?.venueList;
    if (venueList && venueList.length > 0) {
      // Get unique venue names
      const uniqueVenueNames = [
        ...new Set(venueList.map(v => v.venueName).filter(Boolean)),
      ];
      if (uniqueVenueNames.length > 0) {
        if (uniqueVenueNames.length === 1) {
          return uniqueVenueNames[0];
        }
        // Show first venue + count of others
        return `${uniqueVenueNames[0]} +${uniqueVenueNames.length - 1} more`;
      }
    }

    // Check for off-campus or additional venue info
    if (eventData?.eventVenueAddInfo) {
      return eventData.eventVenueAddInfo;
    }

    // Fallback
    return eventData?.EventVenue === 'offline' ? 'Offline' : 'N/A';
  };

  const currentDate = new Date();

  const getStatusInfo = status => {
    switch (status) {
      case 0:
        return { label: 'Pending', color: 'warning' };
      case 1:
        return { label: 'HOD Approved', color: 'success' };
      case 2:
        return { label: 'Approved', color: 'success' };
      case -1:
        return { label: 'HOD Rejected', color: 'error' };
      case -2:
        return { label: 'IQAC Rejected', color: 'error' };
      case 3:
        return { label: 'Changes Requested', color: 'error' };
      case 4:
        return { label: 'Changes Requested', color: 'error' };
      case 5:
        return { label: 'Principal Approved', color: 'success' };
      default:
        return { label: 'Unknown', color: 'default' };
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
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.15)}`,
            '& .view-details-btn': {
              opacity: 1,
              transform: 'translateX(0)',
            },
          },
        }}
      >
        <CardContent
          sx={{
            p: 2.5,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Header: Status & ID */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Chip
              label={statusInfo.label}
              size='small'
              color={statusInfo.color}
              variant='soft' // If supported by theme, otherwise defaults
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
                borderRadius: 1,
                bgcolor: alpha(
                  theme.palette[statusInfo.color]?.main ||
                    theme.palette.grey[500],
                  0.1
                ),
                color:
                  theme.palette[statusInfo.color]?.dark ||
                  theme.palette.grey[700],
                border: 'none',
              }}
            />
            {event.ins_id && statusInfo.label.includes('Approved') && (
              <Typography
                variant='caption'
                sx={{
                  fontFamily: 'monospace',
                  color: 'text.disabled',
                  fontSize: '0.7rem',
                }}
              >
                #{event.ins_id}
              </Typography>
            )}
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                mb: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.primary',
              }}
            >
              {event.eventData?.EventName}
            </Typography>
          </Box>

          {/* Metadata Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 1.5,
              mt: 'auto',
              p: 1.5,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              borderRadius: 2,
            }}
          >
            {/* Date */}
            <Calendar
              size={18}
              weight='duotone'
              color={theme.palette.text.secondary}
            />
            <Typography variant='body2' color='text.secondary' fontWeight={500}>
              {formatDate(event.eventData?.StartTime)}
            </Typography>

            {/* Time */}
            <Clock
              size={18}
              weight='duotone'
              color={theme.palette.text.secondary}
            />
            <Typography variant='body2' color='text.secondary'>
              {formatTime(event.eventData?.StartTime)} -{' '}
              {formatTime(event.eventData?.EndTime)}
            </Typography>

            {/* Venue */}
            <MapPin
              size={18}
              weight='duotone'
              color={theme.palette.text.secondary}
            />
            <Typography variant='body2' color='text.secondary' noWrap>
              {getVenueDisplay(event.eventData)}
            </Typography>
          </Box>

          {/* Footer Action */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mt: 0.5,
            }}
          >
            <Button
              className='view-details-btn'
              endIcon={<ArrowRight weight='bold' />}
              size='small'
              sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'primary.main',
                opacity: 0.8,
                transform: 'translateX(-4px)',
                transition: 'all 0.2s ease',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  opacity: 1,
                },
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderGrid = eventList => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        gap: 2.5,
        width: '100%',
      }}
    >
      {eventList.map(event => (
        <Box key={event._id} sx={{ display: 'flex' }}>
          <SingleEventCard event={event} />
        </Box>
      ))}
    </Box>
  );

  if (!events || events.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant='body1'>{message || 'No events found.'}</Typography>
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
    <Stack spacing={5} sx={{ py: 2, width: '100%' }}>
      {upcomingEvents.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Box
              sx={{
                width: 4,
                height: 24,
                bgcolor: 'primary.main',
                borderRadius: 1,
              }}
            />
            <Typography variant='h6' component='h2' sx={{ fontWeight: 700 }}>
              Upcoming Events
            </Typography>
            <Chip
              label={upcomingEvents.length}
              size='small'
              sx={{ ml: 1, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Box>
          {renderGrid(upcomingEvents)}
        </Box>
      )}

      {pastEvents.length > 0 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2.5,
              mt: 1,
            }}
          >
            <Typography
              variant='h6'
              component='h2'
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              Past Events
            </Typography>
          </Box>
          <Box sx={{ opacity: 0.75, filter: 'grayscale(0.2)' }}>
            {renderGrid(pastEvents)}
          </Box>
        </Box>
      )}

      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Typography>{message || 'No events found.'}</Typography>
      )}
    </Stack>
  );
}
