'use client';
import { useFieldArray } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Plus, X, User, Envelope, Phone, Briefcase, MapPin } from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');

const ResourcePersonStep = ({
  control,
  register,
  errors,
  validationErrors,
  watch,
  hasResourcePersons,
  handleResourcePersonQuestion,
}) => {
  const {
    fields: resourcepersonfields,
    append: resourcepersonappend,
    remove: resourcepersonremove,
  } = useFieldArray({
    name: 'eventResourcePerson',
    control,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Resource Person Details
      </Typography>

      <Paper sx={{ borderRadius: 2, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Question on whether there are resource persons */}
          <FormControl error={!!validationErrors?.hasResourcePersons}>
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              Are there any resource persons for the event? *
            </FormLabel>
            <Select
              value={
                hasResourcePersons === null
                  ? ''
                  : hasResourcePersons
                    ? 'yes'
                    : 'no'
              }
              onChange={e =>
                handleResourcePersonQuestion({
                  target: { value: e.target.value },
                })
              }
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: colors.light.mutedForeground }}>Select an option</span>;
                }
                return selected === 'yes' ? 'Yes' : 'No';
              }}
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.light.border,
                },
              }}
            >
              <MenuItem value='' disabled>
                <span style={{ color: colors.light.mutedForeground }}>Select an option</span>
              </MenuItem>
              <MenuItem value='yes'>Yes</MenuItem>
              <MenuItem value='no'>No</MenuItem>
            </Select>
            {validationErrors?.hasResourcePersons && (
              <Box
                sx={{
                  color: colors.light.destructive,
                  fontSize: '0.875rem',
                  mt: 1,
                }}
              >
                {validationErrors.hasResourcePersons}
              </Box>
            )}
          </FormControl>

          {/* Conditionally render resource person details if 'Yes' is selected */}
          {hasResourcePersons && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {resourcepersonfields.map((field, index) => (
                <Paper key={index} sx={{ borderRadius: 2, boxShadow: 'none' }}>
                  <Typography
                    variant='h6'
                    sx={{ color: colors.light.mutedForeground, mb: 3 }}
                  >
                    Resource Person {index + 1}
                  </Typography>

                  <Grid container spacing={2} flexDirection='column'>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label='Name'
                        {...register(
                          `eventResourcePerson.${index}.ResourcePersonName`,
                          {
                            required: 'Resource Person name is required',
                            pattern: {
                              value: /^[A-Za-z\s]+$/,
                              message:
                                'Invalid name. Please enter a valid name without any special characters or numbers.',
                            },
                          }
                        )}
                        error={
                          !!errors.eventResourcePerson?.[index]
                            ?.ResourcePersonName ||
                          !!validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonName`
                          ]
                        }
                        helperText={
                          errors.eventResourcePerson?.[index]
                            ?.ResourcePersonName?.message ||
                          validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonName`
                          ]
                        }
                        InputProps={{
                          startAdornment: (
                            <User
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
                        type='email'
                        label='E-mail'
                        {...register(
                          `eventResourcePerson.${index}.ResourcePersonMail`,
                          {
                            required: 'Resource Person Mail is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Invalid email address',
                            },
                          }
                        )}
                        error={
                          !!errors.eventResourcePerson?.[index]
                            ?.ResourcePersonMail ||
                          !!validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonMail`
                          ]
                        }
                        helperText={
                          errors.eventResourcePerson?.[index]
                            ?.ResourcePersonMail?.message ||
                          validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonMail`
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
                        label='Phone'
                        {...register(
                          `eventResourcePerson.${index}.ResourcePersonPhone`,
                          {
                            required:
                              'Resource Person phone number is required',
                            pattern: {
                              value: /^[6-9]\d{9}$/,
                              message: 'Invalid phone number',
                            },
                          }
                        )}
                        error={
                          !!errors.eventResourcePerson?.[index]
                            ?.ResourcePersonPhone ||
                          !!validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonPhone`
                          ]
                        }
                        helperText={
                          errors.eventResourcePerson?.[index]
                            ?.ResourcePersonPhone?.message ||
                          validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonPhone`
                          ]
                        }
                        InputProps={{
                          startAdornment: (
                            <Phone
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
                        label='Designation'
                        {...register(
                          `eventResourcePerson.${index}.ResourcePersonDesgn`,
                          {
                            required: 'Designation is Required',
                          }
                        )}
                        error={
                          !!errors.eventResourcePerson?.[index]
                            ?.ResourcePersonDesgn ||
                          !!validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonDesgn`
                          ]
                        }
                        helperText={
                          errors.eventResourcePerson?.[index]
                            ?.ResourcePersonDesgn?.message ||
                          validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonDesgn`
                          ]
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

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label='Official Address'
                        {...register(
                          `eventResourcePerson.${index}.ResourcePersonAddr`,
                          {
                            required: 'Address is Required',
                          }
                        )}
                        error={
                          !!errors.eventResourcePerson?.[index]
                            ?.ResourcePersonAddr ||
                          !!validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonAddr`
                          ]
                        }
                        helperText={
                          errors.eventResourcePerson?.[index]
                            ?.ResourcePersonAddr?.message ||
                          validationErrors?.[
                            `eventResourcePerson.${index}.ResourcePersonAddr`
                          ]
                        }
                        InputProps={{
                          startAdornment: (
                            <MapPin
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
                  </Grid>

                  {index > 0 && (
                    <Button
                      type='button'
                      variant='outlined'
                      startIcon={<X size={16} />}
                      onClick={() => resourcepersonremove(index)}
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
                      Remove Resource Person
                    </Button>
                  )}
                </Paper>
              ))}

              {/* Add Resource Person button */}
              <Button
                type='button'
                variant='contained'
                startIcon={<Plus size={16} />}
                onClick={() => {
                  resourcepersonappend({});
                }}
                sx={{
                  mt: 2,
                  backgroundColor: colors.light.primary,
                  color: colors.light.primaryForeground,
                  '&:hover': {
                    backgroundColor: colors.light.primary,
                    opacity: 0.9,
                  },
                }}
              >
                Add Resource Person
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResourcePersonStep;
