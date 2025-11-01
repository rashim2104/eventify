'use client';
import {
  Box,
  Typography,
  TextField,
  Divider,
} from '@mui/material';
import { User, Envelope, Phone, Briefcase, MapPin } from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');

const ResourcePersonViewStep = ({ resourcePersons, hasResourcePersons }) => {
  if (hasResourcePersons === false || hasResourcePersons === null) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
          variant='h5'
          sx={{ color: colors.light.foreground, fontWeight: 600 }}
        >
          Resource Person Details
        </Typography>
        <TextField
          fullWidth
          label='Resource Persons'
          value='No resource persons for this event'
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

  if (!resourcePersons || resourcePersons.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
          variant='h5'
          sx={{ color: colors.light.foreground, fontWeight: 600 }}
        >
          Resource Person Details
        </Typography>
        <TextField
          fullWidth
          label='Resource Persons'
          value='No resource persons added'
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
        Resource Person Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {resourcePersons.map((person, index) => (
          <Box key={index}>
            {index > 0 && <Divider sx={{ my: 3 }} />}
            <Typography
              variant='h6'
              sx={{ color: colors.light.mutedForeground, mb: 2 }}
            >
              Resource Person {index + 1}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label='Resource Person Name'
                value={person.ResourcePersonName || 'N/A'}
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
                value={person.ResourcePersonDesgn || 'N/A'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Briefcase size={20} color={colors.light.mutedForeground} />
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
                label='E-mail'
                value={person.ResourcePersonMail || 'N/A'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Envelope size={20} color={colors.light.mutedForeground} />
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
                label='Phone'
                value={person.ResourcePersonPhone || 'N/A'}
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

              <TextField
                fullWidth
                multiline
                rows={3}
                label='Official Address'
                value={person.ResourcePersonAddr || 'N/A'}
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
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ResourcePersonViewStep;

