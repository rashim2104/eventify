'use client';
import { Controller } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  TextField,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Typography,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Users } from '@phosphor-icons/react';

const { colors } = require('@/lib/colors.config.js');

const BasicInfoStep = ({
  control,
  register,
  errors,
  validationErrors,
  watch,
  eventOrigin,
  eventSociety,
  setEventSociety,
  currSoc,
  setCurrSoc,
  fileUrl,
  setFileUrl,
  file,
  uploading,
  handleFileChange,
  handleUpload,
  handleDelete,
  renderMedia,
  // Config data from parent (fetched from API)
  societies = [],
  ieeeSocieties = [],
  clubs = [],
  departments = [],
  userType = '',
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Basic Details
      </Typography>

      {/* Main Form Container */}
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Event Organizer */}
        <FormControl
          fullWidth
          error={!!errors.EventOrganizer || !!validationErrors?.EventOrganizer}
        >
          <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
            Event Organizer *
          </FormLabel>
          <Controller
            name='EventOrganizer'
            control={control}
            rules={{ required: 'Event Organizer is required' }}
            render={({ field }) => (
              <Select
                {...field}
                displayEmpty
                renderValue={selected => {
                  if (!selected) {
                    return (
                      <span style={{ color: colors.light.mutedForeground }}>
                        Select an option
                      </span>
                    );
                  }

                  // Map values to display text
                  const valueMap = {
                    1: 'Department',
                    2: 'Professional Societies (IEEE,ISTE,EDS)',
                    3: 'Clubs and Cells',
                    4: 'Other',
                    5: 'AICTE Idea Lab',
                  };

                  return valueMap[selected] || selected;
                }}
                sx={{
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.light.border,
                  },
                }}
              >
                <MenuItem value='' disabled>
                  <span style={{ color: colors.light.mutedForeground }}>
                    Select an option
                  </span>
                </MenuItem>
                <MenuItem value='1'>Department</MenuItem>
                <MenuItem value='5'>AICTE Idea Lab</MenuItem>
                <MenuItem value='2'>
                  Professional Societies (IEEE,ISTE,EDS)
                </MenuItem>
                <MenuItem value='3'>Clubs and Cells</MenuItem>
                <MenuItem value='4'>Other</MenuItem>
              </Select>
            )}
          />
          {(errors.EventOrganizer || validationErrors?.EventOrganizer) && (
            <FormHelperText
              sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
            >
              {errors.EventOrganizer?.message ||
                validationErrors?.EventOrganizer}
            </FormHelperText>
          )}
        </FormControl>

        {/* Department Selection for Admins */}
        {watch('EventOrganizer') == 1 && userType === 'admin' && (
          <FormControl fullWidth error={!!validationErrors?.eventSociety}>
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              Department *
            </FormLabel>
            <Select
              key={watch('EventOrganizer')}
              value={eventSociety || ''}
              onChange={e => {
                setEventSociety(e.target.value);
                setCurrSoc(e.target.value);
              }}
              displayEmpty
              renderValue={selected => {
                if (!selected) {
                  return (
                    <span style={{ color: colors.light.mutedForeground }}>
                      Select a Department
                    </span>
                  );
                }
                const dept = departments.find(d => d.code === selected);
                return dept ? dept.name : selected;
              }}
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              }}
            >
              <MenuItem value='' disabled>
                <span style={{ color: colors.light.mutedForeground }}>
                  Select a Department
                </span>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.code || dept._id} value={dept.code}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
            {validationErrors?.eventSociety && (
              <FormHelperText
                sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
              >
                {validationErrors.eventSociety}
              </FormHelperText>
            )}
          </FormControl>
        )}

        {/* Professional Society Selection */}
        {watch('EventOrganizer') == 2 && (
          <FormControl fullWidth error={!!validationErrors?.eventSociety}>
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              Professional Society *
            </FormLabel>
            <Select
              key={watch('EventOrganizer')}
              value={eventSociety || ''}
              onChange={e => {
                setEventSociety(e.target.value);
              }}
              displayEmpty
              renderValue={selected => {
                if (!selected) {
                  return (
                    <span style={{ color: colors.light.mutedForeground }}>
                      Select an Option
                    </span>
                  );
                }
                return selected;
              }}
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              }}
            >
              <MenuItem value='' disabled>
                <span style={{ color: colors.light.mutedForeground }}>
                  Select an Option
                </span>
              </MenuItem>
              {societies.map((society) => (
                <MenuItem key={society.code || society} value={society.code || society}>
                  {society.name || society}
                </MenuItem>
              ))}
            </Select>
            {validationErrors?.eventSociety && (
              <FormHelperText
                sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
              >
                {validationErrors.eventSociety}
              </FormHelperText>
            )}
          </FormControl>
        )}

        {/* IEEE Society Selection */}
        {watch('EventOrganizer') == 2 && eventSociety === 'IEEE' && (
          <FormControl fullWidth>
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              IEEE Society
            </FormLabel>
            <Select
              value={currSoc}
              onChange={e => setCurrSoc(e.target.value)}
              displayEmpty
              renderValue={selected => {
                if (!selected) {
                  return (
                    <span style={{ color: colors.light.mutedForeground }}>
                      Select an Option
                    </span>
                  );
                }
                return selected;
              }}
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              }}
            >
              <MenuItem value='' disabled>
                <span style={{ color: colors.light.mutedForeground }}>
                  Select an Option
                </span>
              </MenuItem>
              {ieeeSocieties.map((society) => (
                <MenuItem key={society.code || society} value={society.code || society}>
                  {society.name || society}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Clubs and Cells Selection */}
        {watch('EventOrganizer') == 3 && (
          <FormControl fullWidth error={!!validationErrors?.eventSociety}>
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              Club/Cell *
            </FormLabel>
            <Select
              key={watch('EventOrganizer')}
              value={eventSociety || ''}
              onChange={e => {
                setEventSociety(e.target.value);
              }}
              displayEmpty
              renderValue={selected => {
                if (!selected) {
                  return (
                    <span style={{ color: colors.light.mutedForeground }}>
                      Select an Option
                    </span>
                  );
                }
                return selected;
              }}
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              }}
            >
              <MenuItem value='' disabled>
                <span style={{ color: colors.light.mutedForeground }}>
                  Select an Option
                </span>
              </MenuItem>
              {clubs.map((club) => (
                <MenuItem key={club.code || club} value={club.code || club}>
                  {club.name || club}
                </MenuItem>
              ))}
            </Select>
            {validationErrors?.eventSociety && (
              <FormHelperText
                sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
              >
                {validationErrors.eventSociety}
              </FormHelperText>
            )}
          </FormControl>
        )}

        {/* Other Specification */}
        {watch('EventOrganizer') == 4 && (
          <TextField
            fullWidth
            placeholder='Please specify'
            value={eventSociety || ''}
            onChange={e => {
              setEventSociety(e.target.value || '');
              setCurrSoc(e.target.value);
            }}
            error={!!validationErrors?.currSoc}
            helperText={validationErrors?.currSoc}
            InputProps={{
              sx: {
                color: colors.light.foreground,
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              },
            }}
          />
        )}

        {/* Event Name */}
        <TextField
          fullWidth
          label='Event Name *'
          placeholder='Enter The Name Of The Event'
          {...register('EventName', {
            required: 'This field is required',
            minLength: {
              value: 2,
              message: 'Event name must be at least 2 characters',
            },
          })}
          error={!!errors.EventName || !!validationErrors?.EventName}
          helperText={errors.EventName?.message || validationErrors?.EventName}
          InputProps={{
            sx: {
              color: colors.light.foreground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.light.border,
              },
            },
          }}
        />

        {/* Event Type */}
        <FormControl
          fullWidth
          error={
            !!errors.EventType?.eventType ||
            !!validationErrors?.['EventType.eventType']
          }
        >
          <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
            Event Type *
          </FormLabel>
          <Controller
            name='EventType.eventType'
            control={control}
            rules={{ required: 'Event Type is required' }}
            render={({ field }) => (
              <Select
                {...field}
                displayEmpty
                renderValue={selected => {
                  if (!selected) {
                    return (
                      <span style={{ color: colors.light.mutedForeground }}>
                        Select an option
                      </span>
                    );
                  }
                  return selected;
                }}
                sx={{
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.light.border,
                  },
                }}
              >
                <MenuItem value='' disabled>
                  <span style={{ color: colors.light.mutedForeground }}>
                    Select an option
                  </span>
                </MenuItem>
                <MenuItem value='Workshop'>Workshop</MenuItem>
                <MenuItem value='FDP'>FDP</MenuItem>
                <MenuItem value='Bootcamp'>BootCamp</MenuItem>
                <MenuItem value='Conference'>Conference</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
              </Select>
            )}
          />
          {(errors.EventType?.eventType ||
            validationErrors?.['EventType.eventType']) && (
              <FormHelperText
                sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
              >
                {errors.EventType?.eventType?.message ||
                  validationErrors?.['EventType.eventType']}
              </FormHelperText>
            )}
        </FormControl>

        {/* Event Type Other Option */}
        {watch('EventType.eventType') === 'other' && (
          <TextField
            fullWidth
            placeholder='Please specify'
            {...register('EventType.eventTypeOtherOption', {
              required: 'Please specify the event type',
              minLength: {
                value: 2,
                message: 'Event type details must be at least 2 characters',
              },
            })}
            error={
              !!errors.EventType?.eventTypeOtherOption ||
              !!validationErrors?.['EventType.eventTypeOtherOption']
            }
            helperText={
              errors.EventType?.eventTypeOtherOption?.message ||
              validationErrors?.['EventType.eventTypeOtherOption'] ||
              ''
            }
            InputProps={{
              sx: {
                color: colors.light.foreground,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              },
            }}
          />
        )}

        {/* Event Objective */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label='Objective of the Event *'
          placeholder='Enter the objective'
          {...register('EventObjective', {
            required: 'This field is required',
            minLength: {
              value: 10,
              message: 'Objective must be at least 10 characters',
            },
          })}
          error={!!errors.EventObjective || !!validationErrors?.EventObjective}
          helperText={
            errors.EventObjective?.message || validationErrors?.EventObjective
          }
          InputProps={{
            sx: {
              color: colors.light.foreground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.light.border,
              },
            },
          }}
        />

        {/* Expected Number of Participants */}
        <TextField
          fullWidth
          type='number'
          label='Expected Number of Participants *'
          placeholder='Enter expected number of participants'
          {...register('EventParticipants', {
            required: 'This field is required',
            min: { value: 1, message: 'Must be at least 1 participant' },
            max: { value: 10000, message: 'Cannot exceed 10,000 participants' },
          })}
          error={
            !!errors.EventParticipants || !!validationErrors?.EventParticipants
          }
          helperText={
            errors.EventParticipants?.message ||
            validationErrors?.EventParticipants
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Users size={20} color={colors.light.mutedForeground} />
              </InputAdornment>
            ),
            sx: {
              color: colors.light.foreground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.light.border,
              },
            },
          }}
        />

        {/* Event Venue */}
        <FormControl
          error={!!errors.EventVenue || !!validationErrors?.EventVenue}
        >
          <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
            Event Venue *
          </FormLabel>
          <Controller
            name='EventVenue'
            control={control}
            rules={{ required: 'Please select an event venue' }}
            render={({ field }) => (
              <RadioGroup
                {...field}
                value={field.value || ''}
                onChange={e => {
                  console.log('Event Venue changed to:', e.target.value);
                  field.onChange(e.target.value);
                }}
                sx={{ gap: 1 }}
              >
                <FormControlLabel
                  value='online'
                  control={
                    <Radio
                      sx={{
                        color: colors.light.border,
                        '&.Mui-checked': {
                          color: colors.light.primary,
                        },
                      }}
                    />
                  }
                  label='Online'
                  sx={{ color: colors.light.foreground }}
                />
                <FormControlLabel
                  value='offline'
                  control={
                    <Radio
                      sx={{
                        color: colors.light.border,
                        '&.Mui-checked': {
                          color: colors.light.primary,
                        },
                      }}
                    />
                  }
                  label='Offline'
                  sx={{ color: colors.light.foreground }}
                />
              </RadioGroup>
            )}
          />
          {(errors.EventVenue || validationErrors?.EventVenue) && (
            <FormHelperText
              sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
            >
              {errors.EventVenue?.message || validationErrors?.EventVenue}
            </FormHelperText>
          )}
        </FormControl>

        {/* Event Location */}
        <FormControl
          error={!!errors.eventLocation || !!validationErrors?.eventLocation}
        >
          <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
            Is Event On-campus? *
          </FormLabel>
          <Controller
            name='eventLocation'
            control={control}
            rules={{
              required: 'Please specify if the event is on-campus',
            }}
            render={({ field }) => (
              <RadioGroup
                {...field}
                value={field.value || ''}
                onChange={e => {
                  field.onChange(e.target.value);
                }}
                sx={{ gap: 1 }}
              >
                <FormControlLabel
                  value='On-Campus'
                  control={
                    <Radio
                      sx={{
                        color: colors.light.border,
                        '&.Mui-checked': {
                          color: colors.light.primary,
                        },
                      }}
                    />
                  }
                  label='Yes'
                  sx={{ color: colors.light.foreground }}
                />
                <FormControlLabel
                  value='Off-Campus'
                  control={
                    <Radio
                      sx={{
                        color: colors.light.border,
                        '&.Mui-checked': {
                          color: colors.light.primary,
                        },
                      }}
                    />
                  }
                  label='No'
                  sx={{ color: colors.light.foreground }}
                />
              </RadioGroup>
            )}
          />
          {(errors.eventLocation || validationErrors?.eventLocation) && (
            <FormHelperText
              sx={{ color: colors.light.destructive, fontSize: '0.75rem' }}
            >
              {errors.eventLocation?.message || validationErrors?.eventLocation}
            </FormHelperText>
          )}
        </FormControl>

        {/* Permission Letter Upload */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='h6'
            sx={{ color: colors.light.foreground, mb: 2 }}
          >
            Permission Letter{' '}
            <span style={{ color: colors.light.foreground }}>*</span>
          </Typography>

          {fileUrl.poster === '' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: colors.light.mutedForeground }}
              >
                Accepted formats: Images or PDF • Max size: 5MB
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  type='file'
                  accept='image/*, application/pdf'
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id='permission-letter-upload'
                />
                <label htmlFor='permission-letter-upload'>
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
                <Button
                  type='button'
                  variant='contained'
                  disabled={!file || uploading || fileUrl.poster}
                  onClick={e => handleUpload(e, 'poster')}
                  sx={{
                    backgroundColor: colors.light.primary,
                    color: colors.light.primaryForeground,
                    '&:hover': {
                      backgroundColor: colors.light.primary,
                      opacity: 0.9,
                    },
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </Box>
            </Box>
          )}

          {fileUrl.poster !== '' && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: colors.light.foreground, mb: 2 }}
              >
                File Uploaded Successfully!
              </Typography>
              <Box sx={{ mb: 2 }}>
                {renderMedia(fileUrl.poster, 'Permission Letter')}
              </Box>
              <Button
                variant='outlined'
                onClick={e => handleDelete(e, 'poster')}
                sx={{
                  color: colors.light.destructive,
                  borderColor: colors.light.destructive,
                  '&:hover': {
                    borderColor: colors.light.destructive,
                    backgroundColor: colors.light.destructive,
                    color: colors.light.primaryForeground,
                  },
                }}
              >
                Delete File
              </Button>
            </Box>
          )}
        </Box>

        {/* Start Date & Time */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
          <Controller
            name='StartTime'
            control={control}
            rules={{ required: 'Start date and time is required' }}
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label='Start Date & Time *'
                value={value ? dayjs(value) : null}
                onChange={newValue => {
                  onChange(newValue ? newValue.toISOString() : '');
                }}
                minDate={dayjs()}
                format='DD/MM/YYYY HH:mm'
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.StartTime || !!validationErrors?.StartTime,
                    helperText:
                      errors.StartTime?.message || validationErrors?.StartTime,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        color: colors.light.foreground,
                        '& fieldset': {
                          borderColor: colors.light.border,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.light.border,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.light.primary,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.light.foreground,
                        '&.Mui-focused': {
                          color: colors.light.primary,
                        },
                      },
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>

        {/* End Date & Time */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
          <Controller
            name='EndTime'
            control={control}
            rules={{
              required: 'End date and time is required',
              validate: {
                isAfterStartTime: value => {
                  const startTime = watch('StartTime');
                  return (
                    dayjs(value).isAfter(dayjs(startTime)) ||
                    'End time must be after start time'
                  );
                },
              },
            }}
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label='End Date & Time *'
                value={value ? dayjs(value) : null}
                onChange={newValue => {
                  onChange(newValue ? newValue.toISOString() : '');
                }}
                minDate={dayjs()}
                format='DD/MM/YYYY HH:mm'
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.EndTime || !!validationErrors?.EndTime,
                    helperText:
                      errors.EndTime?.message || validationErrors?.EndTime,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        color: colors.light.foreground,
                        '& fieldset': {
                          borderColor: colors.light.border,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.light.border,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.light.primary,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.light.foreground,
                        '&.Mui-focused': {
                          color: colors.light.primary,
                        },
                      },
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>

        {/* Event Duration */}
        <TextField
          fullWidth
          type='number'
          label='Event Duration (in hours) *'
          {...register('EventDuration', {
            required: 'This field is required',
            min: { value: 1, message: 'Must be at least 1 hour' },
          })}
          error={!!errors.EventDuration || !!validationErrors?.EventDuration}
          helperText={
            errors.EventDuration?.message || validationErrors?.EventDuration
          }
          InputProps={{
            sx: {
              color: colors.light.foreground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.light.border,
              },
            },
          }}
          inputProps={{
            min: 1,
          }}
        />
      </Box>
    </Box>
  );
};

export default BasicInfoStep;
