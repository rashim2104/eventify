'use client';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
const { colors } = require('@/lib/colors.config.js');

const BudgetViewStep = ({ eventData, fileUrl, renderMedia }) => {
  const isSponsored = eventData?.isSponsored === 'true' || eventData?.isSponsored === true;
  const stakeholders = eventData?.eventStakeholders || [];
  const sponsors = eventData?.eventSponsors || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Budget Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Event Stakeholders */}
        <TextField
          fullWidth
          label='Event Stakeholders'
          value={
            stakeholders.length > 0
              ? stakeholders.join(', ')
              : 'No stakeholders specified'
          }
          InputProps={{
            readOnly: true,
            endAdornment:
              stakeholders.length > 0 ? (
                <Box sx={{ ml: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {stakeholders.map((stakeholder, index) => (
                    <Chip
                      key={index}
                      label={stakeholder}
                      size='small'
                      sx={{
                        backgroundColor: colors.light.primary,
                        color: colors.light.primaryForeground,
                      }}
                    />
                  ))}
                </Box>
              ) : null,
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

        {/* Sponsorship Status */}
        <TextField
          fullWidth
          label='Is the event sponsored?'
          value={isSponsored ? 'Yes' : 'No'}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Chip
                label={isSponsored ? 'Sponsored' : 'Not Sponsored'}
                size='small'
                sx={{
                  backgroundColor: isSponsored
                    ? colors.light.primary
                    : colors.light.muted,
                  color: isSponsored
                    ? colors.light.primaryForeground
                    : colors.light.foreground,
                }}
              />
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

        {/* Budget and Sponsor Details */}
        {isSponsored && (
          <>
            {/* Budget */}
            {eventData?.Budget && (
              <TextField
                fullWidth
                label='Budget (Rs.)'
                value={`₹${eventData.Budget.toLocaleString('en-IN')}`}
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: colors.light.foreground,
                    fontSize: '1.25rem',
                    fontWeight: 600,
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

            {/* Sponsors */}
            {sponsors && sponsors.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {sponsors.map((sponsor, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider sx={{ my: 3 }} />}
                    <Typography
                      variant='h6'
                      sx={{ color: colors.light.mutedForeground, mb: 2 }}
                    >
                      Sponsor {index + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label='Sponsor Name'
                        value={sponsor.name || 'N/A'}
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

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label='Sponsor Address'
                        value={sponsor.address || 'N/A'}
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
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Sanction Letter */}
            {fileUrl?.sanctionLetter && (
              <Box>
                <Typography
                  variant='body2'
                  sx={{ color: colors.light.mutedForeground, mb: 2 }}
                >
                  Sanction Letter
                </Typography>
                {renderMedia(fileUrl.sanctionLetter, 'Sanction Letter')}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default BudgetViewStep;

