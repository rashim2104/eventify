'use client';
import { Box, Typography, TextField } from '@mui/material';
import { Users, Calendar, Clock, MapPin } from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');

const BasicInfoViewStep = ({
  eventData,
  eventOrigin,
  fileUrl,
  renderMedia,
}) => {
  // Helper function to get organizer label
  const getOrganizerLabel = value => {
    const valueMap = {
      1: 'Department',
      2: 'Professional Societies (IEEE,ISTE,EDS)',
      3: 'Clubs and Cells',
      4: 'Other',
      5: 'AICTE Idea Lab',
    };
    return valueMap[value] || value;
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine event venue and location display
  const eventVenue = eventData?.EventVenue || eventData?.eventVenue || 'N/A';
  const eventLocation = eventData?.eventLocation || 'N/A';

  // Build organizer display text
  const getOrganizerDisplay = () => {
    const organizer = getOrganizerLabel(eventData?.EventOrganizer);
    if (eventData?.EventOrganizer == 2 && eventData?.eventSociety) {
      return `${organizer} - ${eventData.eventSociety}${
        eventData.currSoc ? ` (${eventData.currSoc})` : ''
      }`;
    }
    if (eventData?.EventOrganizer == 3 && eventData?.eventSociety) {
      return `${organizer} - ${eventData.eventSociety}`;
    }
    if (eventData?.EventOrganizer == 4 && eventData?.currSoc) {
      return `${organizer} - ${eventData.currSoc}`;
    }
    return organizer;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Basic Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Event Organizer */}
        <TextField
          fullWidth
          label='Event Organizer'
          value={getOrganizerDisplay()}
          InputProps={{
            readOnly: true,
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

        {/* Department / Society / Club */}
        {eventOrigin && (
          <TextField
            fullWidth
            label='Department / Society / Club'
            value={eventOrigin}
            InputProps={{
              readOnly: true,
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

        {/* Event Name */}
        <TextField
          fullWidth
          label='Event Name'
          value={eventData?.EventName || 'N/A'}
          InputProps={{
            readOnly: true,
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

        {/* Event Type */}
        <TextField
          fullWidth
          label='Event Type'
          value={
            eventData?.EventType?.eventType === 'other' &&
            eventData?.EventType?.eventTypeOtherOption
              ? `${eventData.EventType.eventType} - ${eventData.EventType.eventTypeOtherOption}`
              : eventData?.EventType?.eventType || 'N/A'
          }
          InputProps={{
            readOnly: true,
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

        {/* Expected Participants */}
        <TextField
          fullWidth
          label='Expected Number of Participants'
          value={eventData?.EventParticipants || 'N/A'}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Users size={20} color={colors.light.mutedForeground} />
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

        {/* Event Venue */}
        <TextField
          fullWidth
          label='Event Venue'
          value={eventVenue === 'online' ? 'Online' : 'Offline'}
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

        {/* Event Location */}
        <TextField
          fullWidth
          label='Event Location'
          value={eventLocation}
          InputProps={{
            readOnly: true,
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

        {/* Start Date & Time */}
        <TextField
          fullWidth
          label='Start Date & Time'
          value={formatDate(eventData?.StartTime)}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Calendar size={20} color={colors.light.mutedForeground} />
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
          value={formatDate(eventData?.EndTime)}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Calendar size={20} color={colors.light.mutedForeground} />
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

        {/* Event Duration */}
        <TextField
          fullWidth
          label='Event Duration (in hours)'
          value={
            eventData?.EventDuration
              ? `${eventData.EventDuration} hours`
              : 'N/A'
          }
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

        {/* Event Objective */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label='Objective of the Event'
          value={eventData?.EventObjective || 'N/A'}
          InputProps={{
            readOnly: true,
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

        {/* Permission Letter */}
        {fileUrl?.poster && (
          <Box>
            <Typography
              variant='body2'
              sx={{ color: colors.light.mutedForeground, mb: 2 }}
            >
              Permission Letter
            </Typography>
            {renderMedia(fileUrl.poster, 'Permission Letter')}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BasicInfoViewStep;
