'use client';
import { Box, Typography, TextField, Divider } from '@mui/material';
import { User, Envelope, Phone, Briefcase } from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');

const CoordinatorViewStep = ({ coordinators }) => {
  if (!coordinators || coordinators.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
          variant='h5'
          sx={{ color: colors.light.foreground, fontWeight: 600 }}
        >
          Coordinator Details
        </Typography>
        <TextField
          fullWidth
          label='Coordinators'
          value='No coordinators added'
          InputProps={{
            readOnly: true,
            sx: {
              color: colors.light.mutedForeground,
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
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Coordinator Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {coordinators.map((coordinator, index) => (
          <Box key={index}>
            {index > 0 && <Divider sx={{ my: 3 }} />}
            <Typography
              variant='h6'
              sx={{ color: colors.light.mutedForeground, mb: 2 }}
            >
              Coordinator {index + 1}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label='Coordinator Name'
                value={coordinator.coordinatorName || 'N/A'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <User size={20} color={colors.light.mutedForeground} />
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

              <TextField
                fullWidth
                label='Designation'
                value={coordinator.coordinatorRole || 'N/A'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Briefcase
                        size={20}
                        color={colors.light.mutedForeground}
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

              <TextField
                fullWidth
                label='Coordinator E-mail'
                value={coordinator.coordinatorMail || 'N/A'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Envelope
                        size={20}
                        color={colors.light.mutedForeground}
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

              <TextField
                fullWidth
                label='Coordinator Phone'
                value={coordinator.coordinatorPhone || 'N/A'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Phone size={20} color={colors.light.mutedForeground} />
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
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CoordinatorViewStep;
