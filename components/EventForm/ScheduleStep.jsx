'use client';
import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Paper,
  IconButton,
  MobileStepper,
} from '@mui/material';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Users,
  Building,
  Plus,
  X
} from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';

const ScheduleStep = ({
  control,
  register,
  errors,
  watch,
  isEventVenueOnline,
  isEventVenueOffCampus,
  handleVenueChange,
  getValues,
  formStep,
  setFormStep,
  prevForm,
  completeFormStep,
  validationErrors,
}) => {
  // Internal venue selection state (replacing Calven's functionality)
  const [venueFormStep, setVenueFormStep] = useState(1); // 1=Session Selection, 2=Venue Select, 3=Confirm
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [venues, setVenues] = useState({ raw: {}, filtered: [] });
  const [tempVenues, setTempVenues] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userVenue, setUserVenue] = useState('');
  const [parentBlocks, setParentBlocks] = useState([]);

  // Fetch parent blocks from API on mount
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

  // Handle session selection for event date range
  const handleSessionChange = (session, isChecked) => {
    const startTime = getValues('StartTime');
    const endTime = getValues('EndTime');

    if (!startTime || !endTime) {
      toast.error('Please complete the basic information first');
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isChecked) {
      // Add session for all dates in the range
      const newEntries = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        newEntries.push({
          date: format(currentDate, 'dd-MM-yy'),
          session: session,
          venue: '',
        });
        currentDate = addDays(currentDate, 1);
      }
      setSelectedSessions(prev => [...prev, ...newEntries]);
    } else {
      // Remove session for all dates in the range
      const startFormatted = format(startDate, 'dd-MM-yy');
      const endFormatted = format(endDate, 'dd-MM-yy');

      setSelectedSessions(prev =>
        prev.filter(entry => {
          const entryDate = entry.date;
          return !(entry.session === session &&
            entryDate >= startFormatted &&
            entryDate <= endFormatted);
        })
      );
    }
  };

  // Fetch venue availability
  const handleNextStep = async () => {
    if (venueFormStep === 1) {
      const startTime = getValues('StartTime');
      const endTime = getValues('EndTime');

      if (!startTime || !endTime || selectedSessions.length === 0) {
        toast.error('Please complete the basic information and select at least one session');
        return;
      }

      try {
        const response = await fetch('/api/venue/fetchAvailability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedSessions,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setVenues(prevState => ({
            ...prevState,
            raw: {
              prevReservation: data.message.prevReservations,
              venueList: data.message.venueList,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching venue availability:', error);
        toast.error('Failed to fetch venue availability');
      }

      setVenueFormStep(2); // Move to venue selection
    } else if (venueFormStep === 2) {
      if (tempVenues.length === 0) {
        toast.error('Please select at least one venue');
        return;
      }
      setVenueFormStep(3); // Move to confirmation
    } else if (venueFormStep === 3) {
      // Complete the venue selection and move to next form step
      handleVenueChange(tempVenues, userVenue);
      completeFormStep(); // This will move to the next step in the main form
    }
  };

  // Filter venues by block
  const filterVenues = (parentBlock) => {
    setVenues(prevState => {
      const {
        raw: { prevReservation, venueList },
      } = prevState;

      const filteredByBlock = venueList.filter(
        venue => venue.parentBlock === parentBlock
      );

      const filteredVenues = filteredByBlock.map(venue => {
        const slots = selectedSessions.map(session => {
          const isBooked = prevReservation.some(
            res =>
              res.venueId === venue.venueId &&
              res.reservationDate === session.date &&
              res.reservationSession === session.session
          );
          return {
            date: session.date,
            session: session.session,
            available: isBooked ? 0 : 1,
          };
        });

        return {
          ...venue,
          slots,
        };
      });

      if (filteredVenues.length === 0) {
        toast.error('No venues available for the selected Block.');
      }

      return {
        ...prevState,
        filtered: filteredVenues,
      };
    });
  };

  // Handle venue selection
  const handleChange = (slot, venueId, checked, title) => {
    if (checked) {
      setTempVenues([
        ...tempVenues,
        {
          date: slot.date,
          session: slot.session,
          venueId: venueId,
          venueName: title,
        },
      ]);
    } else {
      setTempVenues(
        tempVenues.filter(
          venue =>
            !(
              venue.date === slot.date &&
              venue.session === slot.session &&
              venue.venueId === venueId
            )
        )
      );
    }
  };

  // Previous step handler
  const handlePreviousStep = () => {
    if (venueFormStep === 1) {
      // Go back to basic info step
      prevForm();
    } else {
      setVenueFormStep(prevStep => Math.max(prevStep - 1, 1));
      if (venueFormStep === 2) {
        setVenues(prevState => ({
          ...prevState,
          filtered: [],
        }));
        setTempVenues([]);
      }
    }
  };

  // Dialog handlers
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleAddVenue = () => {
    if (userVenue.length === 0) {
      toast.error('Please enter a venue name.');
      return;
    }
    setTempVenues([]);
    selectedSessions.map(session => {
      setTempVenues(prevVenues => [
        ...prevVenues,
        {
          date: session.date,
          session: session.session,
          venueId: 'O',
          venueName: userVenue,
        },
      ]);
    });
    setVenueFormStep(3);
    handleDialogClose();
  };

  // Confirm venue selection
  const handleVenueConfirmation = () => {
    if (tempVenues.length === 0) {
      toast.error('Please select at least one venue');
      return;
    }
    handleVenueChange(tempVenues, userVenue);
  };

  // Helper functions
  const isSessionSelected = (session) => {
    const startTime = getValues('StartTime');
    const endTime = getValues('EndTime');

    if (!startTime || !endTime) return false;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const startFormatted = format(startDate, 'dd-MM-yy');
    const endFormatted = format(endDate, 'dd-MM-yy');

    return selectedSessions.some(
      entry => entry.session === session &&
        entry.date >= startFormatted &&
        entry.date <= endFormatted
    );
  };

  const getDateRange = () => {
    const startTime = getValues('StartTime');
    const endTime = getValues('EndTime');

    if (!startTime || !endTime) return [null, null];

    return [new Date(startTime), new Date(endTime)];
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Format date range for display
  const formatDateRange = () => {
    const startTime = getValues('StartTime');
    const endTime = getValues('EndTime');

    if (!startTime || !endTime) return '';

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isSameDay(startDate, endDate)) {
      return format(startDate, 'MMM dd, yyyy');
    } else {
      return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography
        variant='h5'
        sx={{
          color: colors.light.foreground,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Calendar size={24} />
        Schedule Details
      </Typography>

      {isEventVenueOnline === 'offline' &&
        isEventVenueOffCampus === 'On-Campus' ? (
        <Box sx={{ width: '100%' }}>
          <Typography
            variant='h6'
            sx={{
              color: colors.light.foreground,
              mb: 3,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <MapPin size={20} />
            Venue Selection
          </Typography>

          {/* Internal 3-step venue selection process */}
          <Box sx={{ width: '100%' }}>
            {/* Mobile Stepper */}
            <MobileStepper
              variant="progress"
              steps={3}
              position="static"
              activeStep={venueFormStep - 1}
              sx={{ mb: 3, width: '100%' }}
            />

            {/* Step 1: Session Selection */}
            {venueFormStep === 1 && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: colors.light.foreground }}>
                    Step 1: Session Selection
                  </Typography>

                  {/* Event Date Range Display */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: colors.light.foreground }}>
                      Event Date Range
                    </Typography>

                    {(() => {
                      const startTime = getValues('StartTime');
                      const endTime = getValues('EndTime');

                      if (!startTime || !endTime) {
                        return (
                          <Typography variant="body2" sx={{ color: colors.light.mutedForeground, fontStyle: 'italic' }}>
                            Please complete the basic information to see the event date range
                          </Typography>
                        );
                      }

                      const startDate = new Date(startTime);
                      const endDate = new Date(endTime);
                      const isSingleDay = isSameDay(startDate, endDate);

                      return (
                        <Box sx={{
                          p: 2,
                          border: 1,
                          borderColor: colors.light.border,
                          borderRadius: 1,
                          backgroundColor: colors.light.muted,
                        }}>
                          <Typography variant="body1" sx={{ color: colors.light.foreground, mb: 1 }}>
                            <strong>Start:</strong> {format(startDate, 'PPP')} at {format(startDate, 'HH:mm')}
                          </Typography>
                          <Typography variant="body1" sx={{ color: colors.light.foreground, mb: 1 }}>
                            <strong>End:</strong> {format(endDate, 'PPP')} at {format(endDate, 'HH:mm')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.light.mutedForeground }}>
                            Duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} day{!isSingleDay ? 's' : ''}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Box>

                  {/* Session Selection */}
                  {(() => {
                    const startTime = getValues('StartTime');
                    const endTime = getValues('EndTime');

                    if (!startTime || !endTime) {
                      return (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="body2" sx={{ color: colors.light.mutedForeground, fontStyle: 'italic' }}>
                            Please complete the basic information to select sessions
                          </Typography>
                        </Box>
                      );
                    }

                    return (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: colors.light.foreground }}>
                          Select Sessions for {formatDateRange()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: colors.light.mutedForeground }}>
                          Sessions will be applied to all dates in your event
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSessionSelected('forenoon')}
                                onChange={(e) => handleSessionChange('forenoon', e.target.checked)}
                                sx={{
                                  color: colors.light.border,
                                  '&.Mui-checked': {
                                    color: colors.light.primary,
                                  },
                                }}
                              />
                            }
                            label="Forenoon"
                            sx={{ color: colors.light.foreground }}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSessionSelected('afternoon')}
                                onChange={(e) => handleSessionChange('afternoon', e.target.checked)}
                                sx={{
                                  color: colors.light.border,
                                  '&.Mui-checked': {
                                    color: colors.light.primary,
                                  },
                                }}
                              />
                            }
                            label="Afternoon"
                            sx={{ color: colors.light.foreground }}
                          />
                        </Box>
                      </Box>
                    );
                  })()}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleNextStep}
                      disabled={(() => {
                        const startTime = getValues('StartTime');
                        const endTime = getValues('EndTime');
                        return !startTime || !endTime || selectedSessions.length === 0;
                      })()}
                      endIcon={<ArrowRight size={20} />}
                      sx={{
                        backgroundColor: colors.light.primary,
                        color: colors.light.primaryForeground,
                        '&:hover': {
                          backgroundColor: colors.light.primary,
                          opacity: 0.9,
                        },
                      }}
                    >
                      Continue to Venue Selection
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Venue Selection */}
            {venueFormStep === 2 && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: colors.light.foreground }}>
                    Step 2: Venue Selection
                  </Typography>

                  {/* Block Selection Grid */}
                  <Typography variant="body2" sx={{ mb: 2, color: colors.light.mutedForeground }}>
                    Select a block to view available venues
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {parentBlocks.map((block) => (
                      <Grid item xs={6} sm={4} md={3} key={block._id || block.name}>
                        <Card
                          onClick={() => filterVenues(block.name)}
                          sx={{
                            cursor: 'pointer',
                            border: 1,
                            borderColor: colors.light.border,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: colors.light.primary,
                              boxShadow: 2,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Building size={32} color={colors.light.primary} style={{ marginBottom: 8 }} />
                            <Typography variant="subtitle2" sx={{ color: colors.light.foreground, fontWeight: 500 }}>
                              {block.name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                    {/* Other Venue Option */}
                    <Grid item xs={6} sm={4} md={3}>
                      <Card
                        onClick={handleDialogOpen}
                        sx={{
                          cursor: 'pointer',
                          border: 1,
                          borderColor: colors.light.border,
                          borderStyle: 'dashed',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: colors.light.primary,
                            boxShadow: 2,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Plus size={32} color={colors.light.mutedForeground} style={{ marginBottom: 8 }} />
                          <Typography variant="subtitle2" sx={{ color: colors.light.mutedForeground, fontWeight: 500 }}>
                            Other Venue
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Venue Cards */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {venues.filtered.map(venue => (
                      <Card key={venue.venueId} sx={{ border: 1, borderColor: colors.light.border }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ color: colors.light.foreground, mb: 1 }}>
                                {venue.venueName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Chip
                                  label={`Capacity: ${venue.seatingCapacity}`}
                                  size="small"
                                  sx={{ backgroundColor: colors.light.muted, color: colors.light.foreground }}
                                />
                                {venue.hasAc && (
                                  <Chip
                                    label="AC"
                                    size="small"
                                    sx={{ backgroundColor: colors.light.accent, color: colors.light.foreground }}
                                  />
                                )}
                                {venue.hasProjector && (
                                  <Chip
                                    label="Projector"
                                    size="small"
                                    sx={{ backgroundColor: colors.light.accent, color: colors.light.foreground }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>

                          {/* Session Slots */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {venue.slots.map((slot, index) => (
                              <FormControlLabel
                                key={index}
                                control={
                                  <Checkbox
                                    checked={tempVenues.some(
                                      v => v.date === slot.date &&
                                        v.session === slot.session &&
                                        v.venueId === venue.venueId
                                    )}
                                    onChange={(e) => handleChange(slot, venue.venueId, e.target.checked, venue.venueName)}
                                    disabled={slot.available === 0}
                                    sx={{
                                      color: colors.light.border,
                                      '&.Mui-checked': {
                                        color: colors.light.primary,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Clock size={16} />
                                    <Typography variant="body2" sx={{ color: colors.light.foreground }}>
                                      {capitalize(slot.date)} - {capitalize(slot.session)}
                                    </Typography>
                                    {slot.available === 0 && (
                                      <Chip
                                        label="Booked"
                                        size="small"
                                        color="error"
                                      />
                                    )}
                                  </Box>
                                }
                                sx={{ color: colors.light.foreground }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  {/* Custom Venue Dialog */}
                  <Dialog open={isDialogOpen} onClose={handleDialogClose}>
                    <DialogTitle sx={{ color: colors.light.foreground }}>
                      Enter Custom Venue
                    </DialogTitle>
                    <DialogContent>
                      <TextField
                        fullWidth
                        label="Venue Name"
                        value={userVenue}
                        onChange={(e) => setUserVenue(e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleDialogClose} sx={{ color: colors.light.foreground }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddVenue}
                        variant="contained"
                        sx={{
                          backgroundColor: colors.light.primary,
                          color: colors.light.primaryForeground,
                        }}
                      >
                        Add Venue
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      onClick={handlePreviousStep}
                      startIcon={<ArrowLeft size={20} />}
                      variant="outlined"
                      sx={{
                        color: colors.light.foreground,
                        borderColor: colors.light.border,
                      }}
                    >
                      Back to Session Selection
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      endIcon={<ArrowRight size={20} />}
                      variant="contained"
                      disabled={tempVenues.length === 0}
                      sx={{
                        backgroundColor: colors.light.primary,
                        color: colors.light.primaryForeground,
                      }}
                    >
                      Continue to Confirmation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {venueFormStep === 3 && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: colors.light.foreground }}>
                    Step 3: Confirm Venue Selection
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2, color: colors.light.foreground }}>
                    Event Date Range: <strong>{formatDateRange()}</strong>
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2, color: colors.light.foreground }}>
                    Selected Sessions:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {isSessionSelected('forenoon') && (
                      <Chip
                        label="Forenoon"
                        sx={{ backgroundColor: colors.light.primary, color: colors.light.primaryForeground }}
                      />
                    )}
                    {isSessionSelected('afternoon') && (
                      <Chip
                        label="Afternoon"
                        sx={{ backgroundColor: colors.light.primary, color: colors.light.primaryForeground }}
                      />
                    )}
                  </Box>

                  <Typography variant="body1" sx={{ mb: 3, color: colors.light.foreground }}>
                    Selected Venues:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {tempVenues.map(venue => (
                      <Paper key={venue.venueId} sx={{ p: 2, backgroundColor: colors.light.muted }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ color: colors.light.foreground }}>
                              {capitalize(venue.venueName)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.light.mutedForeground }}>
                              {capitalize(venue.date)} - {capitalize(venue.session)}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => {
                              setTempVenues(tempVenues.filter(v => v !== venue));
                            }}
                            size="small"
                            sx={{ color: colors.light.destructive }}
                          >
                            <X size={16} />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      onClick={handlePreviousStep}
                      startIcon={<ArrowLeft size={20} />}
                      variant="outlined"
                      sx={{
                        color: colors.light.foreground,
                        borderColor: colors.light.border,
                      }}
                    >
                      Back to Venue Selection
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      endIcon={<CheckCircle size={20} />}
                      variant="contained"
                      sx={{
                        backgroundColor: colors.light.primary,
                        color: colors.light.primaryForeground,
                      }}
                    >
                      Complete Venue Selection
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 600 }}>
          <Typography
            variant='h6'
            sx={{
              color: colors.light.foreground,
              mb: 2,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <MapPin size={20} />
            Event Venue Information
          </Typography>

          <TextField
            fullWidth
            label='Event Venue'
            placeholder='Enter The Event Venue'
            {...register('eventVenueAddInfo', { required: true })}
            error={!!errors.eventVenueAddInfo}
            helperText={errors.eventVenueAddInfo && 'This field is required'}
            InputProps={{
              sx: {
                color: colors.light.foreground,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.primary,
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: colors.light.foreground,
                '&.Mui-focused': {
                  color: colors.light.primary,
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ScheduleStep;
