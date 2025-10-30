'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Switch,
  Select,
  MenuItem,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import { Pencil, Calendar, CheckCircle, XCircle } from '@phosphor-icons/react';
import { colors } from '@/lib/colors.config.js';

export default function Venues() {
  const { data: session, status } = useSession();
  const [venues, setVenues] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('/api/allVenues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVenues(data.message);
        } else {
          toast.error('Error fetching venues');
        }
      } catch (error) {
        toast.error('Error fetching venues');
      }
    };

    fetchVenues();
  }, [isEdit]);

  const handleInputChange = (index, field, value) => {
    const updatedVenues = [...venues];
    updatedVenues[index][field] = value;
    setVenues(updatedVenues);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/editVenues', {
        method: 'POST',
        body: JSON.stringify({ venues }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setIsEdit(false);
        toast.success('Venues updated successfully');
      } else {
        toast.error('Error updating venues');
      }
    } catch (error) {
      toast.error('Error updating venues');
    }
    setSubmitting(false);
  };

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={40} />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const isAdmin = session?.user?.userType === 'admin';

  const uniqueParentBlocks = [
    ...new Set(venues.map(venue => venue.parentBlock)),
  ];

  return (
    <Box
      sx={{
        bgcolor: colors.light.secondaryHex,
        display: 'flex',
        flexDirection: 'column',
        mt: 3,
        p: 6,
        borderRadius: 3,
        minHeight: '100vh',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Venues
        </Typography>
        <Stack direction='row' spacing={1}>
          {venues.length > 0 && (
            <>
              <IconButton
                sx={{
                  bgcolor: colors.light.primaryHex,
                  color: colors.light.primaryForegroundHex,
                  '&:hover': {
                    bgcolor: colors.light.primaryHex,
                    opacity: 0.8,
                  },
                }}
                onClick={() => {
                  setIsEdit(prevIsEdit => !prevIsEdit);
                  toast.info(
                    !isEdit
                      ? 'You can edit the details now!'
                      : 'Editing is disabled.'
                  );
                }}
              >
                <Pencil size={24} color={colors.light.backgroundHex} />
              </IconButton>
              <IconButton
                component={Link}
                href='/venues/reservations'
                sx={{
                  bgcolor: colors.light.primaryHex,
                  color: colors.light.primaryForegroundHex,
                  '&:hover': {
                    bgcolor: colors.light.primaryHex,
                    opacity: 0.8,
                  },
                }}
              >
                <Calendar size={24} color={colors.light.backgroundHex} />
              </IconButton>
            </>
          )}
        </Stack>
      </Box>

      {venues.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.light.mutedHex }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Venue Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  AC
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Projector
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Seating Capacity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Parent Block
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Availability
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {venues.map((venue, index) => (
                <TableRow
                  key={venue.venueId}
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: colors.light.accentHex,
                    },
                    '&:hover': {
                      bgcolor: colors.light.mutedHex,
                    },
                  }}
                >
                  <TableCell>
                    {isEdit ? (
                      <TextField
                        fullWidth
                        size='small'
                        value={venue.venueName}
                        onChange={e =>
                          handleInputChange(index, 'venueName', e.target.value)
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant='body1'>{venue.venueName}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEdit ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={venue.hasAc}
                            onChange={e =>
                              handleInputChange(
                                index,
                                'hasAc',
                                e.target.checked
                              )
                            }
                            color='primary'
                          />
                        }
                        label=''
                      />
                    ) : (
                      <Chip
                        icon={
                          venue.hasAc ? (
                            <CheckCircle
                              size={16}
                              color={venue.hasAc ? '#ffffff' : '#424242'}
                            />
                          ) : (
                            <XCircle size={16} color='#424242' />
                          )
                        }
                        label={venue.hasAc ? 'Yes' : 'No'}
                        color={venue.hasAc ? 'success' : 'default'}
                        size='small'
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {isEdit ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={venue.hasProjector}
                            onChange={e =>
                              handleInputChange(
                                index,
                                'hasProjector',
                                e.target.checked
                              )
                            }
                            color='primary'
                          />
                        }
                        label=''
                      />
                    ) : (
                      <Chip
                        icon={
                          venue.hasProjector ? (
                            <CheckCircle
                              size={16}
                              color={venue.hasProjector ? '#ffffff' : '#424242'}
                            />
                          ) : (
                            <XCircle size={16} color='#424242' />
                          )
                        }
                        label={venue.hasProjector ? 'Yes' : 'No'}
                        color={venue.hasProjector ? 'success' : 'default'}
                        size='small'
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {isEdit ? (
                      <TextField
                        fullWidth
                        size='small'
                        type='number'
                        value={venue.seatingCapacity}
                        onChange={e =>
                          handleInputChange(
                            index,
                            'seatingCapacity',
                            parseInt(e.target.value) || 0
                          )
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant='body1'>
                        {venue.seatingCapacity}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEdit ? (
                      <Select
                        fullWidth
                        size='small'
                        value={venue.parentBlock}
                        onChange={e =>
                          handleInputChange(
                            index,
                            'parentBlock',
                            e.target.value
                          )
                        }
                        sx={{
                          bgcolor: 'white',
                        }}
                      >
                        {uniqueParentBlocks.map(block => (
                          <MenuItem key={block} value={block}>
                            {block}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Typography variant='body1'>
                        {venue.parentBlock}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEdit ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={venue.isAvailable}
                            onChange={e =>
                              handleInputChange(
                                index,
                                'isAvailable',
                                e.target.checked
                              )
                            }
                            color='primary'
                          />
                        }
                        label=''
                      />
                    ) : (
                      <Chip
                        icon={
                          venue.isAvailable ? (
                            <CheckCircle size={16} color='#ffffff' />
                          ) : (
                            <XCircle size={16} color='#ffffff' />
                          )
                        }
                        label={venue.isAvailable ? 'Available' : 'Unavailable'}
                        color={venue.isAvailable ? 'success' : 'error'}
                        size='small'
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            No venues available
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Venues will appear here once they are added to the system.
          </Typography>
        </Box>
      )}

      {isEdit && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: colors.light.primaryHex,
              color: colors.light.primaryForegroundHex,
              '&:hover': {
                bgcolor: colors.light.primaryHex,
                opacity: 0.8,
              },
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Submitting...
              </>
            ) : (
              'Submit Changes'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
}
