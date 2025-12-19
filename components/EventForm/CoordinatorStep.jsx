'use client';
import { useFieldArray } from 'react-hook-form';
import { Box, Typography, TextField, Button, Paper, Grid } from '@mui/material';
import {
  Plus,
  X,
  User,
  Envelope,
  Phone,
  Briefcase,
} from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');

const CoordinatorStep = ({
  control,
  register,
  errors,
  validationErrors,
  watch,
  fetchedCoordinators,
  setFetchedCoordinators,
  fetchStaffDetails,
  resetForm,
}) => {
  const {
    fields: coordinatorfields,
    append: coordinatorappend,
    remove: coordinatorremove,
  } = useFieldArray({
    name: 'eventCoordinators',
    control,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Coordinator Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {coordinatorfields.map((field, index) => {
          const isFetched = watch(`eventCoordinators.${index}.fetched`);

          return (
            <Paper key={field.id} sx={{ boxShadow: 'none', borderRadius: 2 }}>
              <Typography
                variant='h6'
                sx={{ color: colors.light.mutedForeground, mb: 3 }}
              >
                Coordinator {index + 1}
              </Typography>

              {/* Conditionally render the Staff ID field and fetch button */}
              {!isFetched && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label='Staff ID Number'
                    placeholder='Enter the Staff ID Number'
                    {...register(`eventCoordinators.${index}.staffId`, {
                      pattern: {
                        value: /^[0-9]+$/,
                        message:
                          'Invalid Staff ID. Please enter a valid number.',
                      },
                    })}
                    error={!!errors.eventCoordinators?.[index]?.staffId}
                    helperText={
                      errors.eventCoordinators?.[index]?.staffId?.message
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
                  <Button
                    type='button'
                    variant='contained'
                    onClick={() => fetchStaffDetails(index)}
                    sx={{
                      backgroundColor: colors.light.primary,
                      color: colors.light.primaryForeground,
                      '&:hover': {
                        backgroundColor: colors.light.primary,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Get Staff Details
                  </Button>
                </Box>
              )}

              <Grid container spacing={2} flexDirection='column'>
                {/* First Row: Name and Designation */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Coordinator Name *'
                    {...register(`eventCoordinators.${index}.coordinatorName`, {
                      required: 'Coordinator Name is required',
                      pattern: {
                        value: /^[A-Za-z\s.]+$/,
                        message:
                          'Invalid name. Please enter a valid name without any special characters or numbers.',
                      },
                    })}
                    error={
                      !!errors.eventCoordinators?.[index]?.coordinatorName ||
                      !!validationErrors?.[
                        `eventCoordinators.${index}.coordinatorName`
                      ]
                    }
                    helperText={
                      errors.eventCoordinators?.[index]?.coordinatorName
                        ?.message ||
                      validationErrors?.[
                        `eventCoordinators.${index}.coordinatorName`
                      ]
                    }
                    InputProps={{
                      startAdornment: (
                        <User size={20} color={colors.light.mutedForeground} />
                      ),
                      sx: {
                        color: colors.light.foreground,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.light.border,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Designation *'
                    {...register(`eventCoordinators.${index}.coordinatorRole`, {
                      required: 'Designation is required',
                    })}
                    error={
                      !!errors.eventCoordinators?.[index]?.coordinatorRole ||
                      !!validationErrors?.[
                        `eventCoordinators.${index}.coordinatorRole`
                      ]
                    }
                    helperText={
                      errors.eventCoordinators?.[index]?.coordinatorRole
                        ?.message ||
                      validationErrors?.[
                        `eventCoordinators.${index}.coordinatorRole`
                      ] ||
                      (errors.eventCoordinators?.[index]?.coordinatorRole &&
                        'This field is required')
                    }
                    InputProps={{
                      startAdornment: (
                        <Briefcase
                          size={20}
                          color={colors.light.mutedForeground}
                        />
                      ),
                      sx: {
                        color: colors.light.foreground,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.light.border,
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Second Row: Email and Phone */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type='email'
                    label='Coordinator E-mail *'
                    {...register(`eventCoordinators.${index}.coordinatorMail`, {
                      required: 'Coordinator Mail is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    error={
                      !!errors.eventCoordinators?.[index]?.coordinatorMail ||
                      !!validationErrors?.[
                        `eventCoordinators.${index}.coordinatorMail`
                      ]
                    }
                    helperText={
                      errors.eventCoordinators?.[index]?.coordinatorMail
                        ?.message ||
                      validationErrors?.[
                        `eventCoordinators.${index}.coordinatorMail`
                      ]
                    }
                    InputProps={{
                      startAdornment: (
                        <Envelope
                          size={20}
                          color={colors.light.mutedForeground}
                        />
                      ),
                      sx: {
                        color: colors.light.foreground,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.light.border,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type='tel'
                    label='Coordinator Phone *'
                    {...register(
                      `eventCoordinators.${index}.coordinatorPhone`,
                      {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: 'Invalid phone number',
                        },
                      }
                    )}
                    error={
                      !!errors.eventCoordinators?.[index]?.coordinatorPhone ||
                      !!validationErrors?.[
                        `eventCoordinators.${index}.coordinatorPhone`
                      ]
                    }
                    helperText={
                      errors.eventCoordinators?.[index]?.coordinatorPhone
                        ?.message ||
                      validationErrors?.[
                        `eventCoordinators.${index}.coordinatorPhone`
                      ]
                    }
                    InputProps={{
                      startAdornment: (
                        <Phone size={20} color={colors.light.mutedForeground} />
                      ),
                      sx: {
                        color: colors.light.foreground,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.light.border,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {index > 0 && (
                <Button
                  type='button'
                  variant='outlined'
                  startIcon={<X size={16} />}
                  onClick={() => {
                    coordinatorremove(index);
                    setFetchedCoordinators(prev =>
                      prev.filter(id => id !== index)
                    );
                  }}
                  sx={{
                    mt: 2,
                    color: colors.light.destructive,
                    borderColor: colors.light.destructive,
                    '&:hover': {
                      borderColor: colors.light.destructive,
                      backgroundColor: colors.light.destructive,
                      color: colors.light.primaryForeground,
                    },
                  }}
                >
                  Remove Coordinator
                </Button>
              )}
            </Paper>
          );
        })}

        {/* Buttons Section */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            type='button'
            variant='contained'
            startIcon={<Plus size={16} />}
            onClick={() => coordinatorappend({ staffId: '', fetched: false })}
            sx={{
              backgroundColor: colors.light.primary,
              color: colors.light.primaryForeground,
              '&:hover': {
                backgroundColor: colors.light.primary,
                opacity: 0.9,
              },
            }}
          >
            Add Coordinator
          </Button>
          <Button
            type='button'
            variant='outlined'
            onClick={resetForm}
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
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CoordinatorStep;
