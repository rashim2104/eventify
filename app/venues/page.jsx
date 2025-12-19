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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormLabel,
  FormControl,
} from '@mui/material';
import {
  Pencil,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  CalendarPlus,
} from '@phosphor-icons/react';
import { colors } from '@/lib/colors.config.js';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function Venues() {
  const { data: session, status } = useSession();
  const [venues, setVenues] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingVenue, setAddingVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({
    venueName: '',
    hasAc: false,
    hasProjector: false,
    seatingCapacity: '',
    parentBlock: '',
    venueId: '',
    isAvailable: true,
  });
  const [parentBlocks, setParentBlocks] = useState([]);

  // Blocking State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockData, setBlockData] = useState({
    venueId: '',
    startDate: null,
    endDate: null,
    sessions: ['forenoon', 'afternoon'],
    reason: '',
  });

  // Fetch parent blocks from API
  useEffect(() => {
    const fetchParentBlocks = async () => {
      try {
        const res = await fetch('/api/config/parent-blocks');
        const data = await res.json();
        setParentBlocks(data.parentBlocks || []);
      } catch (error) {
        console.error('Failed to fetch parent blocks:', error);
      }
    };
    fetchParentBlocks();
  }, []);

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

  const handleNewVenueChange = (field, value) => {
    setNewVenue(prev => ({ ...prev, [field]: value }));
  };

  const resetNewVenueForm = () => {
    setNewVenue({
      venueName: '',
      hasAc: false,
      hasProjector: false,
      seatingCapacity: '',
      parentBlock: '',
      venueId: '',
      isAvailable: true,
    });
    setIsAddModalOpen(false);
  };

  const handleAddVenue = async () => {
    // Validation
    if (!newVenue.venueName.trim()) {
      toast.error('Venue name is required');
      return;
    }
    if (!newVenue.venueId.trim()) {
      toast.error('Venue ID is required');
      return;
    }
    if (!newVenue.parentBlock.trim()) {
      toast.error('Parent block is required');
      return;
    }
    if (newVenue.seatingCapacity <= 0) {
      toast.error('Seating capacity must be greater than 0');
      return;
    }

    setAddingVenue(true);
    try {
      const response = await fetch('/api/venue/addVenue', {
        method: 'POST',
        body: JSON.stringify(newVenue),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        toast.success('Venue added successfully');
        resetNewVenueForm();
        // Trigger refetch by toggling isEdit
        setIsEdit(prev => !prev);
        setTimeout(() => setIsEdit(false), 100);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error adding venue');
      }
    } catch (error) {
      toast.error('Error adding venue');
    }
    setAddingVenue(false);
  };

  const handleBlockVenue = async () => {
    if (
      !blockData.venueId ||
      !blockData.startDate ||
      !blockData.endDate ||
      blockData.sessions.length === 0
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (blockData.endDate < blockData.startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setBlocking(true);
    try {
      const response = await fetch('/api/venue/blockVenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...blockData,
          startDate: blockData.startDate.toISOString(),
          endDate: blockData.endDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setIsBlockModalOpen(false);
        // Reset form
        setBlockData({
          venueId: '',
          startDate: null,
          endDate: null,
          sessions: ['forenoon', 'afternoon'],
          reason: '',
        });
      } else {
        toast.error(result.message || 'Error blocking venue');
      }
    } catch (error) {
      console.error('Error blocking venue:', error);
      toast.error('Error blocking venue');
    }
    setBlocking(false);
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
          {/* Add Venue Button - always visible for admins */}
          {isAdmin && (
            <>
              <IconButton
                title='Add New Venue'
                sx={{
                  bgcolor: colors.light.primaryHex,
                  color: colors.light.primaryForegroundHex,
                  '&:hover': {
                    bgcolor: colors.light.primaryHex,
                    opacity: 0.8,
                  },
                }}
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={24} color={colors.light.backgroundHex} />
              </IconButton>
              <IconButton
                title='Reserve Venue'
                sx={{
                  bgcolor: colors.light.primaryHex,
                  color: colors.light.primaryForegroundHex,
                  '&:hover': {
                    bgcolor: colors.light.primaryHex,
                    opacity: 0.8,
                  },
                }}
                onClick={() => setIsBlockModalOpen(true)}
              >
                <CalendarPlus size={24} color={colors.light.backgroundHex} />
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

      {/* Add Venue Dialog */}
      <Dialog
        open={isAddModalOpen}
        onClose={resetNewVenueForm}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Venue</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label='Venue Name'
              fullWidth
              value={newVenue.venueName}
              onChange={e => handleNewVenueChange('venueName', e.target.value)}
              required
            />
            <TextField
              label='Venue ID'
              fullWidth
              value={newVenue.venueId}
              onChange={e => handleNewVenueChange('venueId', e.target.value)}
              required
              helperText='A unique identifier for the venue (e.g., "LH-101")'
            />
            <TextField
              select
              label='Parent Block'
              fullWidth
              value={newVenue.parentBlock}
              onChange={e =>
                handleNewVenueChange('parentBlock', e.target.value)
              }
              required
              helperText='Select the building or block'
            >
              {parentBlocks.map(block => (
                <MenuItem key={block._id || block.name} value={block.name}>
                  {block.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label='Seating Capacity'
              type='number'
              fullWidth
              value={newVenue.seatingCapacity}
              onChange={e =>
                handleNewVenueChange(
                  'seatingCapacity',
                  parseInt(e.target.value) || 0
                )
              }
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newVenue.hasAc}
                  onChange={e =>
                    handleNewVenueChange('hasAc', e.target.checked)
                  }
                  color='primary'
                />
              }
              label='Has AC'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newVenue.hasProjector}
                  onChange={e =>
                    handleNewVenueChange('hasProjector', e.target.checked)
                  }
                  color='primary'
                />
              }
              label='Has Projector'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newVenue.isAvailable}
                  onChange={e =>
                    handleNewVenueChange('isAvailable', e.target.checked)
                  }
                  color='primary'
                />
              }
              label='Is Available'
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={resetNewVenueForm} color='inherit'>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleAddVenue}
            disabled={addingVenue}
            sx={{
              bgcolor: colors.light.primaryHex,
              '&:hover': {
                bgcolor: colors.light.primaryHex,
                opacity: 0.8,
              },
            }}
          >
            {addingVenue ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Adding...
              </>
            ) : (
              'Add Venue'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Venue Dialog */}
      <Dialog
        open={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Reserve Venue (Block)
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                select
                label='Venue'
                fullWidth
                value={blockData.venueId}
                onChange={e =>
                  setBlockData({ ...blockData, venueId: e.target.value })
                }
                required
              >
                {venues.map(venue => (
                  <MenuItem key={venue.venueId} value={venue.venueId}>
                    {venue.venueName}
                  </MenuItem>
                ))}
              </TextField>
              <DatePicker
                label='Start Date'
                value={blockData.startDate}
                onChange={newValue =>
                  setBlockData({ ...blockData, startDate: newValue })
                }
                slotProps={{ textField: { fullWidth: true, required: true } }}
                disablePast
              />
              <DatePicker
                label='End Date'
                value={blockData.endDate}
                onChange={newValue =>
                  setBlockData({ ...blockData, endDate: newValue })
                }
                slotProps={{ textField: { fullWidth: true, required: true } }}
                minDate={blockData.startDate}
              />
              <FormControl component='fieldset'>
                <FormLabel component='legend'>Sessions</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={blockData.sessions.includes('forenoon')}
                        onChange={e => {
                          const newSessions = e.target.checked
                            ? [...blockData.sessions, 'forenoon']
                            : blockData.sessions.filter(s => s !== 'forenoon');
                          setBlockData({ ...blockData, sessions: newSessions });
                        }}
                      />
                    }
                    label='Forenoon'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={blockData.sessions.includes('afternoon')}
                        onChange={e => {
                          const newSessions = e.target.checked
                            ? [...blockData.sessions, 'afternoon']
                            : blockData.sessions.filter(s => s !== 'afternoon');
                          setBlockData({ ...blockData, sessions: newSessions });
                        }}
                      />
                    }
                    label='Afternoon'
                  />
                </FormGroup>
              </FormControl>
              <TextField
                label='Reason'
                fullWidth
                multiline
                rows={3}
                value={blockData.reason}
                onChange={e =>
                  setBlockData({ ...blockData, reason: e.target.value })
                }
                placeholder='e.g., Maintenance, Holiday, etc.'
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsBlockModalOpen(false)} color='inherit'>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleBlockVenue}
            disabled={blocking}
            sx={{
              bgcolor: colors.light.primaryHex,
              '&:hover': {
                bgcolor: colors.light.primaryHex,
                opacity: 0.8,
              },
            }}
          >
            {blocking ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Reserving...
              </>
            ) : (
              'Reserve'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
