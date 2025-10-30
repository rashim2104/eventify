'use client';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Avatar,
  Stack,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import { Calendar, MapPin, Clock, Eye, User } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import Link from 'next/link';

export default function EventCard({ events, message }) {
  const theme = useTheme();

  const formatDate = dateString => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the current date/time
  const currentDate = new Date();

  // Separate events into upcoming and past events
  const upcomingEvents = events.filter(
    event => new Date(event.eventData.StartTime) > currentDate
  );
  const pastEvents = events.filter(
    event => new Date(event.eventData.StartTime) <= currentDate
  );

  const getStatusColor = status => {
    switch (status) {
      case 1:
        return 'primary'; // Pending/Submitted
      case 2:
        return 'success'; // Approved
      case 3:
        return 'error'; // Rejected
      default:
        return 'default';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 1:
        return 'Pending';
      case 2:
        return 'Approved';
      case 3:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const SingleEventCard = ({ event, isPast = false }) => (
    <Card
      component={Link}
      href={`${process.env.NEXT_PUBLIC_URL}/events/${event._id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        cursor: 'pointer',
        textDecoration: 'none',
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: 1,
        borderColor: theme.palette.divider,
        '&:hover': {
          boxShadow: 2,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CardContent
        sx={{
          height: 140,
          bgcolor: isPast ? theme.palette.grey[50] : theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Calendar
            size={48}
            color={isPast ? theme.palette.text.secondary : 'white'}
            weight='regular'
          />
        </Box>
        <Chip
          label={getStatusText(event.status)}
          color={getStatusColor(event.status)}
          size='small'
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
          }}
        />
      </CardContent>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant='h6'
          component='h3'
          sx={{
            mb: 2,
            color: theme.palette.text.primary,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {event.eventData?.EventName}
        </Typography>

        {event.status === 2 && event.ins_id && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant='body2'
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Event ID: {event.ins_id}
            </Typography>
          </Box>
        )}

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {/* TODO: Add Venue details from API 
             <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <MapPin size={18} color={theme.palette.text.secondary} weight="regular" style={{ marginTop: 2 }} />
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.4,
              }}
            >
              <strong>Venue:</strong> {event.eventData?.EventVenue}
            </Typography>
          </Box> */}

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Clock
              size={18}
              color={theme.palette.text.secondary}
              weight='regular'
              style={{ marginTop: 2 }}
            />
            <Box>
              <Typography
                variant='body2'
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                <strong>Start:</strong> {formatDate(event.eventData?.StartTime)}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                <strong>End:</strong> {formatDate(event.eventData?.EndTime)}
              </Typography>
            </Box>
          </Box>

          {!isPast && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Eye
                size={16}
                color={theme.palette.text.secondary}
                weight='regular'
              />
              <MuiLink
                href={`${process.env.NEXT_PUBLIC_URL}/events/${event._id}`}
                sx={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline',
                  },
                }}
              >
                View Details →
              </MuiLink>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        py: 4,
      }}
    >
      {/* Display Upcoming Events */}
      <Box sx={{ width: '100%' }}>
        <Typography
          variant='h4'
          component='h2'
          sx={{
            mb: 4,
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '1.875rem',
          }}
        >
          Upcoming Events
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <Box
                key={index}
                sx={{
                  width: {
                    xs: '100%',
                    xl: 'calc(50% - 12px)',
                  },
                  minWidth: 300,
                }}
              >
                <SingleEventCard event={event} isPast={false} />
              </Box>
            ))
          ) : events.length > 0 ? (
            <Typography
              variant='body1'
              sx={{ color: theme.palette.text.secondary }}
            >
              No upcoming events.
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Display Past Events */}
      <Box sx={{ width: '100%' }}>
        <Typography
          variant='h4'
          component='h2'
          sx={{
            mb: 4,
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '1.875rem',
          }}
        >
          Past Events
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          {pastEvents.length > 0 ? (
            pastEvents.map((event, index) => (
              <Box
                key={index}
                sx={{
                  width: {
                    xs: '100%',
                    xl: 'calc(50% - 12px)',
                  },
                  minWidth: 300,
                }}
              >
                <SingleEventCard event={event} isPast={true} />
              </Box>
            ))
          ) : events.length > 0 ? (
            <Typography
              variant='body1'
              sx={{ color: theme.palette.text.secondary }}
            >
              No past events.
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Display message if no events */}
      {!upcomingEvents.length && !pastEvents.length && (
        <Box
          sx={{
            maxWidth: '50vw',
            wordWrap: 'break-word',
            color: theme.palette.text.secondary,
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );
}
