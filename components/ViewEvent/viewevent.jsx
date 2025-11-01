'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

// Material UI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  LinearProgress,
  MobileStepper,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { Download } from '@mui/icons-material';

// Import Phosphor icons
import { ArrowLeft, ArrowRight, Calendar } from '@phosphor-icons/react';

// Import step components (read-only versions)
import BasicInfoViewStep from './steps/BasicInfoViewStep';
import ScheduleViewStep from './steps/ScheduleViewStep';
import CoordinatorViewStep from './steps/CoordinatorViewStep';
import ResourcePersonViewStep from './steps/ResourcePersonViewStep';
import BudgetViewStep from './steps/BudgetViewStep';

// Import colors
import { colors } from '@/lib/colors.config.js';

// Dynamically import Viewer with SSR disabled
const Viewer = dynamic(() => import('react-viewer'), {
  ssr: false,
});

const ViewEvent = props => {
  const [formStep, setFormStep] = useState(0);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Step labels for the stepper
  const steps = [
    'Basic Information',
    'Session Selection',
    'Coordinators',
    'Resource Persons',
    'Budget & Documents',
  ];

  // Event data
  const eventData = props.eventData || {};
  const eventStatus = props.data?.status || 0;
  const comment =
    props.data?.comment === ''
      ? 'No Comments'
      : props.data?.comment || 'No Comments';
  const fileUrl = props.data?.eventData?.fileUrl || {};
  const venueList = props.data?.eventData?.venueList || [];
  const eventVenueAddInfo = props.data?.eventData?.eventVenueAddInfo || '';

  // Get applied/created date
  const getAppliedDate = () => {
    // Try createdAt first, then fallback to _id timestamp
    const dateSource = props.data?.createdAt || props.data?._id;
    if (!dateSource) return null;

    let date;
    if (typeof dateSource === 'string') {
      // String date
      date = new Date(dateSource);
    } else if (dateSource instanceof Date) {
      // Already a Date object
      date = dateSource;
    } else if (dateSource && typeof dateSource === 'object') {
      // MongoDB ObjectId - extract timestamp from first 8 characters (24 hex chars = 12 bytes, first 4 bytes = timestamp)
      try {
        const timestampHex = dateSource.toString().substring(0, 8);
        const timestamp = parseInt(timestampHex, 16) * 1000;
        date = new Date(timestamp);
      } catch {
        // Fallback to current date if parsing fails
        date = new Date();
      }
    } else {
      date = new Date(dateSource);
    }

    if (isNaN(date.getTime())) return null;
    return date;
  };

  const appliedDate = getAppliedDate();

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = day => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  // Format date as "Mon 1st Aug 2024, 12:25 PM"
  const formattedDate = appliedDate
    ? (() => {
        const day = appliedDate.getDate();
        const dayName = format(appliedDate, 'EEE');
        const month = format(appliedDate, 'MMM');
        const year = format(appliedDate, 'yyyy');
        const time = format(appliedDate, 'h:mm a');
        return `${dayName} ${day}${getOrdinalSuffix(day)} ${month} ${year}, ${time}`;
      })()
    : null;

  // Status labels
  const getStatusLabel = status => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved by HOD/Society Incharge/Club Incharge';
      case 2:
        return props.data?.ins_id || 'Approved';
      case 3:
        return 'Marked for Change by HOD/Society Incharge/Club Incharge';
      case 4:
        return 'Marked for Change by IQAC Member';
      case 5:
        return 'Principal Approval Pending';
      default:
        return 'Rejected';
    }
  };

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 0:
        return 'warning';
      case 1:
        return 'info';
      case 2:
        return 'success';
      case 3:
      case 4:
        return 'warning';
      case 5:
        return 'info';
      default:
        return 'error';
    }
  };

  // Navigation functions
  const nextStep = () => {
    setFormStep(curr => Math.min(curr + 1, 4));
  };

  const prevStep = () => {
    setFormStep(curr => Math.max(curr - 1, 0));
  };

  // Generate PDF
  const generatePDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: props.data._id }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = globalThis.window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Event_Report - ${props.data.ins_id} ${eventData.EventName}.pdf`;
      link.click();

      globalThis.window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Image viewer state and functions
  const [viewerState, setViewerState] = useState({
    visible: false,
    activeImage: null,
    width: 0,
    height: 0,
  });

  const handleImageView = imageUrl => {
    if (typeof globalThis.window === 'undefined') return;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const maxWidth = globalThis.window.innerWidth * 0.9;
      const maxHeight = globalThis.window.innerHeight * 0.9;

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      setViewerState({
        visible: true,
        activeImage: imageUrl,
        width,
        height,
      });
    };
  };

  const renderMedia = (url, type) => {
    if (!url) return null;

    if (url.endsWith('.pdf')) {
      return (
        <Box
          sx={{
            width: '100%',
            height: 400,
            border: 1,
            borderColor: colors.light.border,
            borderRadius: 1,
          }}
        >
          <iframe
            src={url}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${type} document`}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 300,
          border: 1,
          borderColor: colors.light.border,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.9,
            transition: 'opacity 0.2s ease-in-out',
          },
        }}
        onClick={() => handleImageView(url)}
      >
        <img
          src={url}
          alt={`${type} preview`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header with Action Buttons */}
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: colors.light.border,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 2,
              position: 'relative',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='h5'
                sx={{ color: colors.light.foreground, fontWeight: 600 }}
              >
                Event Details
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {/* Applied On Info */}
              <Paper
                sx={{
                  p: 1.5,
                  px: 2,
                  backgroundColor: colors.light.muted,
                  border: 1,
                  borderColor: colors.light.border,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  height: '36.5px', // Match MUI Button default height
                }}
              >
                <Calendar size={16} color={colors.light.mutedForeground} />
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      color: colors.light.mutedForeground,
                      fontSize: '0.7rem',
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                  >
                    Applied on:
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      color: colors.light.foreground,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                  >
                    {formattedDate || 'Date not available'}
                  </Typography>
                </Box>
              </Paper>
              <Button
                variant='outlined'
                startIcon={<Download />}
                onClick={generatePDF}
                sx={{
                  color: colors.light.foreground,
                  borderColor: colors.light.border,
                  height: '36.5px', // Match Paper height
                  '&:hover': {
                    borderColor: colors.light.primary,
                    backgroundColor: colors.light.primary,
                    color: colors.light.primaryForeground,
                  },
                }}
              >
                Download PDF
              </Button>
            </Box>
          </Box>

          {/* Status Display */}
          {eventStatus !== '' && (
            <Box
              sx={{
                p: 3,
                borderBottom: 1,
                borderColor: colors.light.border,
                backgroundColor: colors.light.muted,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant='body1'
                  sx={{ color: colors.light.mutedForeground }}
                >
                  Status:
                </Typography>
                <Chip
                  label={getStatusLabel(eventStatus)}
                  color={getStatusColor(eventStatus)}
                  size='small'
                />
              </Box>
              {comment && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant='body2'
                    sx={{ color: colors.light.mutedForeground, mb: 1 }}
                  >
                    Comments:
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: colors.light.background,
                      border: 1,
                      borderColor: colors.light.border,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ color: colors.light.foreground }}
                    >
                      {comment}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}

          {/* Progress indicator */}
          {formStep < 5 && (
            <Box
              sx={{ p: 3, borderBottom: 1, borderColor: colors.light.border }}
            >
              {/* Desktop Stepper */}
              {!isMobile && (
                <Box sx={{ width: '100%' }}>
                  <Stepper activeStep={formStep} alternativeLabel>
                    {steps.map(label => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  <LinearProgress
                    variant='determinate'
                    value={(formStep + 1) * 20}
                    sx={{ mt: 2, height: 4, borderRadius: 2 }}
                  />
                </Box>
              )}

              {/* Mobile Stepper */}
              {isMobile && (
                <MobileStepper
                  variant='progress'
                  steps={5}
                  position='static'
                  activeStep={formStep}
                  nextButton={
                    <Button
                      size='small'
                      onClick={nextStep}
                      disabled={formStep === 4}
                    >
                      Next
                      <ArrowRight size={20} />
                    </Button>
                  }
                  backButton={
                    <Button
                      size='small'
                      onClick={prevStep}
                      disabled={formStep === 0}
                    >
                      <ArrowLeft size={20} />
                      Back
                    </Button>
                  }
                />
              )}
            </Box>
          )}

          {/* Step Content */}
          <Box sx={{ p: 3 }}>
            {/* Step 0: Basic Info */}
            {formStep === 0 && (
              <BasicInfoViewStep
                eventData={eventData}
                eventOrigin={props.data?.dept}
                fileUrl={fileUrl}
                renderMedia={renderMedia}
              />
            )}

            {/* Step 1: Session Selection */}
            {formStep === 1 && (
              <ScheduleViewStep
                eventData={eventData}
                venueList={venueList}
                eventVenueAddInfo={eventVenueAddInfo}
              />
            )}

            {/* Step 2: Coordinators */}
            {formStep === 2 && (
              <CoordinatorViewStep
                coordinators={eventData.eventCoordinators || []}
              />
            )}

            {/* Step 3: Resource Persons */}
            {formStep === 3 && (
              <ResourcePersonViewStep
                resourcePersons={eventData.eventResourcePerson || []}
                hasResourcePersons={eventData.isResourcePerson}
              />
            )}

            {/* Step 4: Budget */}
            {formStep === 4 && (
              <BudgetViewStep
                eventData={eventData}
                fileUrl={fileUrl}
                renderMedia={renderMedia}
              />
            )}
          </Box>

          {/* Navigation buttons */}
          {formStep < 5 && (
            <Box
              sx={{
                p: 3,
                pt: 2,
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: 1,
                borderColor: colors.light.border,
              }}
            >
              <Button
                onClick={prevStep}
                disabled={formStep === 0}
                variant='outlined'
                startIcon={<ArrowLeft size={20} />}
                sx={{
                  color: colors.light.foreground,
                  borderColor: colors.light.border,
                  '&:hover': {
                    borderColor: colors.light.primary,
                    backgroundColor: colors.light.primary,
                    color: colors.light.primaryForeground,
                  },
                }}
              >
                Previous
              </Button>

              <Button
                onClick={nextStep}
                disabled={formStep === 4}
                variant='contained'
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
                Next
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Viewer
        visible={viewerState.visible}
        onClose={() => setViewerState({ visible: false, activeImage: null })}
        images={[{ src: viewerState.activeImage }]}
        zoomable
        scalable
        rotatable
        downloadable
        noNavbar
        className='custom-viewer'
        drag={false}
        noImgDetails
        changeable={false}
        zIndex={1001}
      />
    </Container>
  );
};

export default ViewEvent;
