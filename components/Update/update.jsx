'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

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
const validateFile = (file, allowPdf = true) => {
  if (!file) return false;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isValidType = allowPdf ? isImage || isPdf : isImage;
  return isValidType && file.size <= MAX_FILE_SIZE;
};

export default function Update() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState({
    geoPhotos: null,
    financialCommitments: null,
    report: null,
    eventPoster: null,
  });
  const [fileUrl, setFileUrl] = useState({
    geoPhotos: [],
    financialCommitments: '',
    report: '',
    eventPoster: '',
  });
  const [uploading, setUploading] = useState({
    geoPhotos: false,
    financialCommitments: false,
    report: false,
    eventPoster: false,
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
      const allValid = Array.from(files).every(f => validateFile(f, false));
      if (allValid) {
        setFile(prev => ({ ...prev, geoPhotos: files }));
      } else {
        toast.error(
          'Invalid file(s). Please upload image files under 5MB each.'
        );
      }
    } else {
      // Single file upload (images or PDF)
      if (validateFile(files[0], true)) {
        setFile(prev => ({ ...prev, [action]: files }));
      } else {
        toast.error('Invalid file. Please upload an image or PDF under 5MB.');
      }
    }
  };

  const handleUpload = async (e, action) => {
    e.preventDefault();
    const currFile = file[action];
    if (!currFile) return;

    setUploading(prev => ({ ...prev, [action]: true }));

    try {
      const uploadPromises = Array.from(currFile).map(async f => {
        const formData = new FormData();
        formData.append('file', f);
        const response = await fetch('/api/s3-upload', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          return data.message;
        }
        return null;
      });

      const urls = (await Promise.all(uploadPromises)).filter(Boolean);

      if (action === 'geoPhotos') {
        setFileUrl(prev => ({ ...prev, geoPhotos: urls }));
      } else {
        setFileUrl(prev => ({ ...prev, [action]: urls[0] || '' }));
      }

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
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
        <img
          src={url}
          alt={`${type} preview`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>
    );
  };

  const FileUploadSection = ({ type, label, accept, multiple = false }) => {
    const isUploaded =
      type === 'geoPhotos'
        ? fileUrl.geoPhotos.length > 0
        : fileUrl[type] !== '';

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant='h6' sx={{ color: colors.light.foreground, mb: 2 }}>
          {label}
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
          data.eventNames.map(({ id, eventName }) => ({ id, eventName }))
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

  const onSubmit = async data => {
    const missing = [];
    if (!data.selectedEvent) missing.push('Event Selection');
    if (fileUrl.geoPhotos.length === 0) missing.push('Geo Tagged Photos');
    if (!fileUrl.financialCommitments) missing.push('Financial Commitments');
    if (!fileUrl.report) missing.push('Event Report');
    if (!data.videoLinks) missing.push('Video Links');
    if (!data.amountSpent) missing.push('Amount Spent');

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
    fileUrl.geoPhotos.length > 0 &&
    fileUrl.financialCommitments &&
    fileUrl.report &&
    watch('videoLinks') &&
    watch('amountSpent');

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
                  />
                  <FileUploadSection
                    type='eventPoster'
                    label='Event Poster'
                    accept='image/*,application/pdf'
                  />
                  <FileUploadSection
                    type='financialCommitments'
                    label='Financial Commitments'
                    accept='image/*,application/pdf'
                  />
                  <FileUploadSection
                    type='report'
                    label='Event Report'
                    accept='image/*,application/pdf'
                  />

                  <Divider sx={{ my: 1 }}>
                    <Typography variant='overline' color='text.secondary'>
                      Additional Details
                    </Typography>
                  </Divider>

                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant='h6'
                      sx={{ color: colors.light.foreground, mb: 2 }}
                    >
                      Video Links
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter video links (type 'none' if there are no videos)"
                      {...register('videoLinks', {
                        required: 'This field is required',
                      })}
                      error={!!errors.videoLinks}
                      helperText={errors.videoLinks?.message}
                    />
                  </Box>

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
                      placeholder='Enter the amount spent'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>₹</InputAdornment>
                        ),
                      }}
                      {...register('amountSpent', { required: true, min: 1 })}
                      error={!!errors.amountSpent}
                      helperText={
                        errors.amountSpent && 'Please enter a valid amount'
                      }
                    />
                  </Box>

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
                      disabled={!isFormComplete}
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
    </Container>
  );
}
