'use client';
import { Box, Typography, TextField, Chip } from '@mui/material';
import { MapPin, Calendar, Clock } from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');
import { format } from 'date-fns';

const ScheduleViewStep = ({ eventData, venueList, eventVenueAddInfo }) => {
  const isEventOnline = eventData?.EventVenue === 'online';
  const isEventOnCampus = eventData?.eventLocation === 'On-Campus';

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'dd-MM-yy');
  };

  // Format date time
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'PPP p');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{
          color: colors.light.foreground,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Calendar size={24} />
        Schedule Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Start Date & Time */}
        <TextField
          fullWidth
          label='Start Date & Time'
          value={formatDateTime(eventData?.StartTime)}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Clock size={20} color={colors.light.mutedForeground} />
              </Box>
            ),
            sx: {
              color: colors.light.foreground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.light.border,
              },
            },
          }}
          InputLabelProps={{
            sx: {
              color: colors.light.mutedForeground,
            },
          }}
        />

        {/* End Date & Time */}
        <TextField
          fullWidth
          label='End Date & Time'
          value={formatDateTime(eventData?.EndTime)}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Clock size={20} color={colors.light.mutedForeground} />
              </Box>
            ),
            sx: {
              color: colors.light.foreground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.light.border,
              },
            },
          }}
          InputLabelProps={{
            sx: {
              color: colors.light.mutedForeground,
            },
          }}
        />

        {/* Venue Information */}
        {isEventOnline ? (
          <TextField
            fullWidth
            label='Event Venue'
            value='Online Event'
            InputProps={{
              readOnly: true,
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <MapPin size={20} color={colors.light.mutedForeground} />
                </Box>
              ),
              sx: {
                color: colors.light.foreground,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: colors.light.mutedForeground,
              },
            }}
          />
        ) : isEventOnCampus && venueList && venueList.length > 0 ? (
          <Box>
            <Typography
              variant='body2'
              sx={{ color: colors.light.mutedForeground, mb: 2 }}
            >
              Venue Reservations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {venueList.map((venue, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={`Venue Reservation ${index + 1}`}
                  value={`${venue.reservationDate || 'N/A'} - ${venue.reservationSession || 'N/A'} (Venue ID: ${venue.venueId || 'N/A'})`}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Box
                        sx={{ mr: 1, display: 'flex', alignItems: 'center' }}
                      >
                        <MapPin
                          size={20}
                          color={colors.light.mutedForeground}
                        />
                      </Box>
                    ),
                    endAdornment: (
                      <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={venue.reservationDate || 'N/A'}
                          size='small'
                          sx={{
                            backgroundColor: colors.light.primary,
                            color: colors.light.primaryForeground,
                          }}
                        />
                        <Chip
                          label={venue.reservationSession || 'N/A'}
                          size='small'
                          sx={{
                            backgroundColor: colors.light.accent,
                            color: colors.light.foreground,
                          }}
                        />
                      </Box>
                    ),
                    sx: {
                      color: colors.light.foreground,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.light.border,
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: colors.light.mutedForeground,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <TextField
            fullWidth
            label='Event Venue'
            value={eventVenueAddInfo || 'N/A'}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <MapPin size={20} color={colors.light.mutedForeground} />
                </Box>
              ),
              sx: {
                color: colors.light.foreground,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: colors.light.mutedForeground,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ScheduleViewStep;
