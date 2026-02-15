'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
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
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CheckCircle } from '@phosphor-icons/react';

import { colors } from '@/lib/colors.config.js';

const Viewer = dynamic(() => import('react-viewer'), { ssr: false });

const S3_BASE_URL = 'https://eventifys3.s3.ap-south-1.amazonaws.com/';
const MAX_FILE_SIZE = 5000000; // 5MB

// File validation helper
const validateFile = (file, fileType = 'any') => {
  if (!file) return false;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  let isValidType;
  if (fileType === 'pdf-only') {
    isValidType = isPdf;
  } else if (fileType === 'image-only') {
    isValidType = isImage;
  } else {
    // 'any' - allows both images and PDFs
    isValidType = isImage || isPdf;
  }

  return isValidType && file.size <= MAX_FILE_SIZE;
};

export default function Update() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState({
    geoPhotos: null,
    financialCommitments: null,
    report: null,
    eventPoster: null,
    feedback: null,
  });
  const [fileUrl, setFileUrl] = useState({
    geoPhotos: [],
    financialCommitments: '',
    report: '',
    eventPoster: '',
    feedback: '',
  });
  const [uploading, setUploading] = useState({
    geoPhotos: false,
    financialCommitments: false,
    report: false,
    eventPoster: false,
    feedback: false,
  });
  const [eventNames, setEventNames] = useState([]);
  const [displayForm, setDisplayForm] = useState(true);
  const [viewerState, setViewerState] = useState({
    visible: false,
    activeImage: null,
  });

  const {
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = useForm();

  const handleFileChange = (e, action) => {
    e.preventDefault();
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setFile(prev => ({ ...prev, [action]: null }));

    if (action === 'geoPhotos') {
      // Validate all files for multiple upload (images only)
      const allValid = Array.from(files).every(f => validateFile(f, 'image-only'));
      if (allValid) {
        setFile(prev => ({ ...prev, geoPhotos: files }));
      } else {
        toast.error(
          'Invalid file(s). Please upload image files under 5MB each.'
        );
      }
    } else {
      // Single file upload
      const fileType = action === 'feedback' ? 'pdf-only' : 'any';
      if (validateFile(files[0], fileType)) {
        setFile(prev => ({ ...prev, [action]: files }));
      } else {
        const errorMsg = action === 'feedback'
          ? 'Invalid file. Please upload a PDF file under 5MB.'
          : 'Invalid file. Please upload an image or PDF under 5MB.';
        toast.error(errorMsg);
      }
    }
  };

  const handleUpload = async (e, action) => {
    e.preventDefault();
    const currFile = file[action];
    if (!currFile) return;

    setUploading(prev => ({ ...prev, [action]: true }));

    try {
      const uploadPromises = Array.from(currFile).map(async (f, index) => {
        const formData = new FormData();
        formData.append('file', f);

        try {
          const response = await fetch('/api/s3-upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            return { success: true, url: data.message, fileName: f.name };
          } else {
            // API returned an error status
            const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
            return { success: false, error: errorData.message, fileName: f.name };
          }
        } catch (fetchError) {
          // Network error or other exception
          return { success: false, error: 'Network error', fileName: f.name };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      // Only update state with successful uploads
      if (successfulUploads.length > 0) {
        const successUrls = successfulUploads.map(r => r.url);

        if (action === 'geoPhotos') {
          setFileUrl(prev => ({ ...prev, geoPhotos: successUrls }));
        } else {
          setFileUrl(prev => ({ ...prev, [action]: successUrls[0] || '' }));
        }
      }

      // Show appropriate messages
      const totalFiles = results.length;
      const successCount = successfulUploads.length;
      const failCount = failedUploads.length;

      if (failCount === 0) {
        // All uploads succeeded
        const message = totalFiles === 1
          ? 'File uploaded successfully!'
          : `All ${totalFiles} files uploaded successfully!`;
        toast.success(message);
      } else if (successCount === 0) {
        // All uploads failed
        const message = totalFiles === 1
          ? 'Failed to upload file. Please try again.'
          : `Failed to upload all ${totalFiles} files. Please try again.`;
        toast.error(message);
      } else {
        // Partial success
        toast.error(`${failCount} of ${totalFiles} files failed to upload. ${successCount} uploaded successfully.`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setUploading(prev => ({ ...prev, [action]: false }));
    }
  };

  const handleDelete = async (e, action) => {
    e.preventDefault();

    const deleteFromS3 = async url => {
      const fileName = url.replace(S3_BASE_URL, '');
      const formData = new FormData();
      formData.append('fileName', fileName);
      try {
        await fetch('/api/s3-delete', { method: 'POST', body: formData });
      } catch (error) {
        console.error('Delete error:', error);
      }
    };

    if (action === 'geoPhotos') {
      await Promise.all(fileUrl.geoPhotos.map(deleteFromS3));
      setFileUrl(prev => ({ ...prev, geoPhotos: [] }));
    } else {
      await deleteFromS3(fileUrl[action]);
      setFileUrl(prev => ({ ...prev, [action]: '' }));
    }

    setFile(prev => ({ ...prev, [action]: null }));
    toast.success('File deleted successfully!');
  };

  const renderMedia = (url, type) => {
    if (!url) return null;

    if (url.endsWith('.pdf')) {
      return (
        <Box
          sx={{
            width: '100%',
            height: 300,
            border: 1,
            borderColor: colors.light.borderHex,
            borderRadius: 1,
            overflow: 'hidden',
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
          height: 250,
          border: 1,
          borderColor: colors.light.borderHex,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': { opacity: 0.9 },
        }}
        onClick={() => setViewerState({ visible: true, activeImage: url })}
      >
        <Image
          src={url}
          alt={`${type} preview`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'contain' }}
        />
      </Box>
    );
  };

  const FileUploadSection = ({ type, label, accept, multiple = false, required = false }) => {
    const isUploaded =
      type === 'geoPhotos'
        ? fileUrl.geoPhotos.length > 0
        : fileUrl[type] !== '';

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant='h6' sx={{ color: colors.light.foreground, mb: 2 }}>
          {label}
          {required && <span style={{ color: colors.light.destructive }}> *</span>}
        </Typography>

        {isUploaded ? (
          <>
            <Typography
              variant='body2'
              sx={{ color: colors.light.foreground, mb: 2 }}
            >
              File Uploaded Successfully!
            </Typography>
            {type === 'geoPhotos' ? (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {fileUrl.geoPhotos.map((photoUrl, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    {renderMedia(photoUrl, `Geo Photo ${index + 1}`)}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ mb: 2 }}>{renderMedia(fileUrl[type], label)}</Box>
            )}
            <Button
              variant='outlined'
              onClick={e => handleDelete(e, type)}
              sx={{
                color: colors.light.destructive,
                borderColor: colors.light.destructive,
                '&:hover': {
                  backgroundColor: colors.light.destructive,
                  color: colors.light.primaryForeground,
                },
              }}
            >
              Delete {type === 'geoPhotos' ? 'Photos' : 'File'}
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant='body2'
              sx={{ color: colors.light.mutedForeground }}
            >
              {type === 'geoPhotos'
                ? 'Accepted formats: Images only • Max size: 5MB'
                : type === 'feedback'
                  ? 'Accepted formats: PDF only • Max size: 5MB'
                  : 'Accepted formats: Images or PDF • Max size: 5MB'}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <input
                type='file'
                accept={accept}
                multiple={multiple}
                onChange={e => handleFileChange(e, type)}
                style={{ display: 'none' }}
                id={`${type}-upload`}
              />
              <label htmlFor={`${type}-upload`}>
                <Button
                  variant='outlined'
                  component='span'
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
                  Choose File
                </Button>
              </label>
              {file[type] && (
                <Typography variant='body2' color='text.secondary'>
                  {file[type].length} file(s) selected
                </Typography>
              )}
              <Button
                variant='contained'
                disabled={!file[type] || uploading[type]}
                onClick={e => handleUpload(e, type)}
                sx={{
                  backgroundColor: colors.light.primary,
                  color: colors.light.primaryForeground,
                  '&:hover': {
                    backgroundColor: colors.light.primary,
                    opacity: 0.9,
                  },
                }}
              >
                {uploading[type] ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  useEffect(() => {
    if (!session?.user) return;

    const fetchEventNames = async () => {
      try {
        const { dept, userType, college, _id: user_id } = session.user;
        const response = await fetch('/api/fetchUpdate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user_id, dept, userType, college }),
        });
        const data = await response.json();
        setEventNames(
          data.eventNames.map(({ id, eventName, isSponsored }) => ({
            id,
            eventName,
            isSponsored,
          }))
        );
      } catch (error) {
        console.error('Error fetching event names:', error);
      }
    };

    fetchEventNames();
  }, [session]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const currUser = session?.user?.userType;
  if (currUser === 'student' || currUser === 'admin') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography variant='h3' color='error' fontWeight='bold'>
          Not Authorized!
        </Typography>
      </Box>
    );
  }

  const selectedEventId = watch('selectedEvent');
  const selectedEventData = eventNames.find(e => e.id === selectedEventId);
  const isSponsored =
    selectedEventData?.isSponsored === 'true' ||
    selectedEventData?.isSponsored === true;

  const onSubmit = async data => {
    const missing = [];
    if (!data.selectedEvent) missing.push('Event Selection');
    if (fileUrl.geoPhotos.length === 0) missing.push('Geo Tagged Photos');
    if (isSponsored && !fileUrl.financialCommitments) missing.push('Financial Commitments');
    if (!fileUrl.report) missing.push('Event Report');
    if (!fileUrl.feedback) missing.push('Feedback (Student Responses)');

    if (missing.length > 0) {
      toast.error(`Please complete: ${missing.join(', ')}`);
      return;
    }

    try {
      const response = await fetch('/api/updateEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session?.user?._id,
          jsonData: {
            selectedEvent: data.selectedEvent,
            videoLinks: data.videoLinks,
            amountSpent: data.amountSpent,
            fileUrl,
          },
        }),
      });

      if (response.ok) {
        setDisplayForm(false);
        toast.success('Event updated successfully!');
      } else {
        toast.error('Error updating event details!');
      }
    } catch (error) {
      toast.error('Error updating event');
      console.error('Error updating event:', error);
    }
  };

  if (!displayForm) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                py: 4,
              }}
            >
              <CheckCircle size={64} color={colors.light.primary} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant='h4'
                  sx={{
                    color: colors.light.foreground,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Congratulations!
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ color: colors.light.mutedForeground }}
                >
                  Event details have been updated successfully.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const isFormComplete =
    // fileUrl.financialCommitments && // Validated on submit
    // fileUrl.report && // Validated on submit
    // fileUrl.feedback; // Validated on submit
    true; // Always enable to show validation errors

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{ p: 3, borderBottom: 1, borderColor: colors.light.borderHex }}
          >
            <Typography variant='h5' fontWeight='bold'>
              Post Event Form
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Update your event with photos, reports, and financial details
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: colors.light.borderHex,
                  borderRadius: 2,
                }}
              >
                <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                  Select Event
                </Typography>
                <FormControl fullWidth error={!!errors.selectedEvent}>
                  <InputLabel id='event-select-label'>
                    Choose an event
                  </InputLabel>
                  <Select
                    labelId='event-select-label'
                    label='Choose an event'
                    defaultValue=''
                    {...register('selectedEvent', {
                      required: 'Please select an event',
                    })}
                  >
                    <MenuItem value='' disabled>
                      -- Select Event --
                    </MenuItem>
                    {eventNames.map(({ id, eventName }) => (
                      <MenuItem key={id} value={id}>
                        {eventName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.selectedEvent && (
                    <FormHelperText>
                      {errors.selectedEvent.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Paper>

              {watch('selectedEvent') && (
                <>
                  <Divider sx={{ my: 1 }}>
                    <Typography variant='overline' color='text.secondary'>
                      Media & Documents
                    </Typography>
                  </Divider>

                  <FileUploadSection
                    type='geoPhotos'
                    label='Geo Tagged Photos'
                    accept='image/*'
                    multiple
                    required
                  />
                  <FileUploadSection
                    type='eventPoster'
                    label='Event Poster'
                    accept='image/*,application/pdf'
                  />
                  {isSponsored && (
                    <FileUploadSection
                      type='financialCommitments'
                      label='Financial Commitments'
                      accept='image/*,application/pdf'
                      required
                    />
                  )}
                  <FileUploadSection
                    type='report'
                    label='Event Report'
                    accept='image/*,application/pdf'
                    required
                  />

                  <Divider sx={{ my: 1 }}>
                    <Typography variant='overline' color='text.secondary'>
                      Feedback & Additional Details
                    </Typography>
                  </Divider>

                  <FileUploadSection
                    type='feedback'
                    label='Feedback (PDF of student responses from Google Form)'
                    accept='application/pdf'
                    required
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant='h6'
                      sx={{ color: colors.light.foreground, mb: 2 }}
                    >
                      Video Links
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='Enter video links (optional)'
                      {...register('videoLinks')}
                    />
                  </Box>

                  {isSponsored && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant='h6'
                        sx={{ color: colors.light.foreground, mb: 2 }}
                      >
                        Amount Spent (Rs.)
                      </Typography>
                      <TextField
                        fullWidth
                        type='number'
                        placeholder='Enter the amount spent (optional)'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>₹</InputAdornment>
                          ),
                        }}
                        {...register('amountSpent', { min: 0 })}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      pt: 2,
                      borderTop: 1,
                      borderColor: colors.light.borderHex,
                    }}
                  >
                    <Button
                      type='submit'
                      variant='contained'
                      size='large'
                      disabled={Object.values(uploading).some(Boolean)}
                      sx={{
                        backgroundColor: colors.light.primary,
                        color: colors.light.primaryForeground,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: colors.light.primary,
                          opacity: 0.9,
                        },
                      }}
                    >
                      Submit
                    </Button>
                  </Box>
                </>
              )}
            </Box>
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
        drag={false}
        noImgDetails
        changeable={false}
        zIndex={1001}
      />
    </Container >
  );
}
