'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';

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
} from '@mui/material';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';

// Import Phosphor icons
import {
  Calendar,
  Users,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  Trash,
} from '@phosphor-icons/react';

// Import step components
import BasicInfoStep from './BasicInfoStep';
import ScheduleStep from './ScheduleStep';
import CoordinatorStep from './CoordinatorStep';
import ResourcePersonStep from './ResourcePersonStep';
import BudgetStep from './BudgetStep';
import SuccessStep from './SuccessStep';

// Note: Calven component functionality has been integrated into ScheduleStep
// No longer importing Calven as a separate component

// Import utilities and hooks
import {
  validateStep0,
  validateStep2,
  validateStep3,
  validateStep4,
} from './utils/validation';
import { useEventForm } from './hooks/useEventForm';

// Import colors and theme
import { colors } from '@/lib/colors.config.js';
import theme from '@/lib/mui-theme.js';

// Dynamically import Viewer with SSR disabled
const Viewer = dynamic(() => import('react-viewer'), {
  ssr: false,
});

const EventForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [formStep, setFormStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Config data from API
  const [configData, setConfigData] = useState({
    societies: [],
    ieeeSocieties: [],
    clubs: [],
    departments: [],
  });

  // Fetch config data on mount
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        // Build departments URL with college filter if user has a college
        const userCollege = session?.user?.college;
        const departmentsUrl = userCollege
          ? `/api/config/departments?college=${encodeURIComponent(userCollege)}`
          : '/api/config/departments';

        const [societiesRes, clubsRes, departmentsRes] = await Promise.all([
          fetch('/api/config/societies'),
          fetch('/api/config/clubs'),
          fetch(departmentsUrl),
        ]);
        const societiesData = await societiesRes.json();
        const clubsData = await clubsRes.json();
        const departmentsData = await departmentsRes.json();

        const allSocieties = societiesData.societies || [];
        setConfigData({
          societies: allSocieties.filter(s => s.type === 'professional'),
          ieeeSocieties: allSocieties.filter(s => s.type === 'ieee'),
          clubs: clubsData.clubs || [],
          departments: departmentsData.departments || [],
        });
      } catch (error) {
        console.error('Failed to fetch config data:', error);
      }
    };

    // Only fetch when session is available
    if (session?.user) {
      fetchConfigData();
    }
  }, [session]);

  // Step labels for the stepper
  const steps = [
    'Basic Information',
    'Session Selection',
    'Coordinators',
    'Resource Persons',
    'Budget & Documents',
  ];

  // Initialize form
  const {
    watch,
    handleSubmit,
    control,
    register,
    formState: { errors, isValid },
    getValues,
    setValue,
    reset,
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      eventSponsors: [
        {
          name: '',
          address: '',
        },
      ],
      eventCoordinators: [
        {
          coordinatorName: '',
          coordinatorMail: '',
          coordinatorPhone: '',
          coordinatorRole: '',
          staffId: '',
          fetched: false,
        },
      ],
      eventResourcePerson: [
        {
          ResourcePersonName: '',
          ResourcePersonMail: '',
          ResourcePersonPhone: '',
          ResourcePersonDesgn: '',
          ResourcePersonAddr: '',
        },
      ],
      eventStakeholders: [],
    },
  });

  // Initialize useFieldArray hooks for various form sections
  const {
    fields: coordinatorfields,
    append: coordinatorappend,
    remove: coordinatorremove,
  } = useFieldArray({
    name: 'eventCoordinators',
    control,
  });

  const {
    fields: resourcepersonfields,
    append: resourcepersonappend,
    remove: resourcepersonremove,
  } = useFieldArray({
    name: 'eventResourcePerson',
    control,
  });

  const {
    fields: sponsorfield,
    append: sponsorappend,
    remove: sponsorremove,
  } = useFieldArray({
    name: 'eventSponsors',
    control,
  });

  // Use custom hook for shared form logic
  const {
    eventOrigin,
    setEventOrigin,
    eventSociety,
    setEventSociety,
    currSoc,
    setCurrSoc,
    file,
    uploading,
    fileUrl,
    setFileUrl,
    venueList,
    setVenueList,
    userVenue,
    setUserVenue,
    hasResourcePersons,
    setHasResourcePersons,
    fetchedCoordinators,
    setFetchedCoordinators,
    isEventVenueOnline,
    isEventVenueOffCampus,
    isSponsored,
    fetchStaffDetails,
    handleResourcePersonQuestion,
    handleFileChange,
    handleUpload,
    handleDelete,
    handleVenueChange,
  } = useEventForm(control, getValues, setValue, watch, trigger);

  // Function to reset coordinator fields
  const resetCoordinatorFields = () => {
    coordinatorfields.forEach((_, index) => {
      setValue(`eventCoordinators.${index}.staffId`, '');
      setValue(`eventCoordinators.${index}.fetched`, false);
    });
  };

  // Function to reset form
  const resetForm = () => {
    reset();
    resetCoordinatorFields();
  };

  // Validation function
  const completeFormStep = () => {
    console.log('================');
    console.log('STARTING VALIDATION');
    console.log('================');
    let stepErrors = null;
    switch (formStep) {
      case 0:
        console.log('================');
        console.log('CASE 0');
        console.log('================');
        stepErrors = validateStep0(
          watch,
          eventOrigin,
          eventSociety,
          currSoc,
          fileUrl
        );
        console.log('================');
        console.log(stepErrors);
        console.log('================');
        break;
      case 2:
        console.log('================');
        console.log('CASE 2');
        console.log('================');
        stepErrors = validateStep2(watch, coordinatorfields);
        break;
      case 3:
        console.log('================');
        console.log('CASE 3');
        console.log('================');
        stepErrors = validateStep3(
          watch,
          resourcepersonfields,
          hasResourcePersons
        );
        break;
      case 4:
        console.log('================');
        console.log('CASE 4');
        console.log('================');
        stepErrors = validateStep4(watch, fileUrl, isSponsored);
        break;
      default:
        console.log('================');
        console.log('CASE DEFAULT');
        console.log('================');
        stepErrors = null;
    }

    if (stepErrors) {
      setValidationErrors(stepErrors);
    } else {
      setValidationErrors({});
      setFormStep(curr => curr + 1);
    }
  };

  // Form submission
  const submitForm = async eventData => {
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting event...');

    // Remove unwanted fields from eventCoordinators
    const filteredEventCoordinators = eventData.eventCoordinators.map(
      ({ staffId, fetched, ...rest }) => rest
    );

    // Update eventData with filtered eventCoordinators
    eventData = {
      ...eventData,
      eventCoordinators: filteredEventCoordinators,
      fileUrl,
      venueList,
      eventVenueAddInfo: getValues('eventVenueAddInfo'),
      isResourcePerson: hasResourcePersons,
    };

    const user_id = session?.user?._id;
    const userType = session?.user?.userType;
    let dept = '';
    let college = session?.user?.college;

    // Existing logic for dept and college determination
    if (eventData.dept === 'SBIT') {
      dept = college === 'SIT' ? 'SBIT' : 'SBEC';
    }
    if (eventOrigin == 1 || eventOrigin == 5) {
      // For admins selecting Department, use the selected department from dropdown
      if (userType === 'admin' && eventOrigin == 1) {
        dept = eventSociety;
        // Find the college for the selected department from configData
        const selectedDept = configData.departments.find(
          d => d.code === eventSociety
        );
        if (selectedDept) {
          college = selectedDept.college;
        }
      } else {
        dept = session?.user?.dept;
      }
    } else if (eventOrigin == 2) {
      if (eventSociety === 'IEEE' || eventSociety === '4') {
        dept = currSoc;
        college = 'common';
      } else {
        dept = eventSociety;
        college = 'common';
      }
    } else if (eventOrigin == 3) {
      dept = eventSociety;
      college = 'common';
    } else if (eventOrigin == 4) {
      dept = currSoc;
      college = 'common';
    }

    const status = await fetch('/api/v2/createEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        dept,
        userType,
        eventData,
        college,
      }),
    });

    if (status.ok) {
      toast.dismiss(toastId);
      setFormStep(5); // Move to success step
      toast.success('Event Created Successfully!');
      setTimeout(() => {
        router.replace('/create');
      }, 2000);
    } else {
      toast.dismiss(toastId);
      const data = await status.json();
      toast.error(
        data.message || 'An error occurred while creating the event.'
      );
      console.error('Error creating event:', data.message);
    }
    setIsSubmitting(false);
  };

  // Navigation functions
  const prevForm = () => {
    setFormStep(curr => curr - 1);
  };

  // Image viewer state and functions
  const [viewerState, setViewerState] = useState({
    visible: false,
    activeImage: null,
    width: 0,
    height: 0,
  });

  const handleImageView = imageUrl => {
    if (typeof window === 'undefined') return;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;

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
        <Image
          src={url}
          alt={`${type} preview`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
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
          <form onSubmit={handleSubmit(submitForm)}>
            {formStep < 5 && (
              <Box
                sx={{ p: 3, borderBottom: 1, borderColor: colors.light.border }}
              >
                {/* Progress indicator */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{ color: colors.light.foreground, mb: 2 }}
                  >
                    Create New Event
                  </Typography>

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
                          onClick={completeFormStep}
                          disabled={formStep === 4}
                        >
                          Next
                          <ArrowRight size={20} />
                        </Button>
                      }
                      backButton={
                        <Button
                          size='small'
                          onClick={prevForm}
                          disabled={formStep === 0}
                        >
                          <ArrowLeft size={20} />
                          Back
                        </Button>
                      }
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Step Content */}
            <Box sx={{ p: 3 }}>
              {/* Step 0: Basic Info */}
              {formStep === 0 && (
                <BasicInfoStep
                  control={control}
                  register={register}
                  errors={errors}
                  validationErrors={validationErrors}
                  watch={watch}
                  eventOrigin={eventOrigin}
                  eventSociety={eventSociety}
                  setEventSociety={setEventSociety}
                  currSoc={currSoc}
                  setCurrSoc={setCurrSoc}
                  fileUrl={fileUrl}
                  setFileUrl={setFileUrl}
                  file={file}
                  uploading={uploading}
                  handleFileChange={handleFileChange}
                  handleUpload={handleUpload}
                  handleDelete={handleDelete}
                  renderMedia={renderMedia}
                  societies={configData.societies}
                  ieeeSocieties={configData.ieeeSocieties}
                  clubs={configData.clubs}
                  departments={configData.departments}
                  userType={session?.user?.userType}
                />
              )}

              {/* Step 1: Session Selection */}
              {formStep === 1 && (
                <ScheduleStep
                  control={control}
                  register={register}
                  errors={errors}
                  watch={watch}
                  isEventVenueOnline={isEventVenueOnline}
                  isEventVenueOffCampus={isEventVenueOffCampus}
                  handleVenueChange={handleVenueChange}
                  getValues={getValues}
                  formStep={formStep}
                  setFormStep={setFormStep}
                  prevForm={prevForm}
                  completeFormStep={completeFormStep}
                  validationErrors={validationErrors}
                />
              )}

              {/* Step 2: Coordinators */}
              {formStep === 2 && (
                <CoordinatorStep
                  control={control}
                  register={register}
                  errors={errors}
                  validationErrors={validationErrors}
                  watch={watch}
                  fetchedCoordinators={fetchedCoordinators}
                  setFetchedCoordinators={setFetchedCoordinators}
                  fetchStaffDetails={fetchStaffDetails}
                  resetForm={resetForm}
                />
              )}

              {/* Step 3: Resource Persons */}
              {formStep === 3 && (
                <ResourcePersonStep
                  control={control}
                  register={register}
                  errors={errors}
                  validationErrors={validationErrors}
                  watch={watch}
                  hasResourcePersons={hasResourcePersons}
                  handleResourcePersonQuestion={handleResourcePersonQuestion}
                />
              )}

              {/* Step 4: Budget */}
              {formStep === 4 && (
                <BudgetStep
                  control={control}
                  register={register}
                  errors={errors}
                  validationErrors={validationErrors}
                  watch={watch}
                  setValue={setValue}
                  fileUrl={fileUrl}
                  setFileUrl={setFileUrl}
                  file={file}
                  uploading={uploading}
                  handleFileChange={handleFileChange}
                  handleUpload={handleUpload}
                  handleDelete={handleDelete}
                  renderMedia={renderMedia}
                />
              )}

              {/* Step 5: Success */}
              {formStep === 5 && <SuccessStep />}
            </Box>

            {/* Navigation buttons */}
            {/* Show navigation buttons for all steps except when offline venue selection is active */}
            {formStep < 5 &&
              !(
                formStep === 1 &&
                isEventVenueOnline === 'offline' &&
                isEventVenueOffCampus === 'On-Campus'
              ) && (
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
                    onClick={prevForm}
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

                  <Box>
                    {formStep === 4 ? (
                      <Button
                        variant='contained'
                        onClick={() => {
                          const stepErrors = validateStep4(
                            watch,
                            fileUrl,
                            isSponsored
                          );
                          if (stepErrors) {
                            setValidationErrors(stepErrors);
                            return;
                          }
                          setValidationErrors({});
                          handleSubmit(submitForm)();
                        }}
                        disabled={isSubmitting}
                        endIcon={<Check size={20} />}
                        sx={{
                          backgroundColor: colors.light.primary,
                          color: colors.light.primaryForeground,
                          '&:hover': {
                            backgroundColor: colors.light.primary,
                            opacity: 0.9,
                          },
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Event'}
                      </Button>
                    ) : (
                      <Button
                        onClick={completeFormStep}
                        type='button'
                        variant='contained'
                        endIcon={<ArrowRight size={20} />}
                        disabled={
                          formStep === 1 &&
                          isEventVenueOnline === 'online' &&
                          !watch('eventVenueAddInfo')
                        }
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
                    )}
                  </Box>
                </Box>
              )}
          </form>
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

export default EventForm;
