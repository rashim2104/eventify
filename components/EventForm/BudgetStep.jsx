'use client';
import { Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { Plus, X } from '@phosphor-icons/react';
const { colors } = require('@/lib/colors.config.js');

const BudgetStep = ({
  control,
  register,
  errors,
  validationErrors,
  watch,
  setValue,
  fileUrl,
  setFileUrl,
  file,
  uploading,
  handleFileChange,
  handleUpload,
  handleDelete,
  renderMedia,
}) => {
  const options = [
    {
      index: 0,
      value: 'Internal Stakeholders',
      label: 'Internal Stakeholders',
    },
    {
      index: 1,
      value: 'External Stakeholders',
      label: 'External Stakeholders',
    },
    {
      index: 2,
      value: 'International Stakeholders',
      label: 'International Stakeholders',
    },
  ];

  const {
    fields: sponsorfield,
    append: sponsorappend,
    remove: sponsorremove,
  } = useFieldArray({
    name: 'eventSponsors',
    control,
  });

  const isSponsored = watch('isSponsored');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='h5'
        sx={{ color: colors.light.foreground, fontWeight: 600 }}
      >
        Budget Details
      </Typography>

      <Paper sx={{ borderRadius: 2, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Event Stakeholders */}
          <FormControl
            error={
              !!errors.eventStakeholders ||
              !!validationErrors?.eventStakeholders
            }
          >
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              Event Stakeholders *
            </FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {options.map(option => {
                const fieldValue = watch('eventStakeholders') || [];
                const isChecked = fieldValue.includes(option.value);

                return (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={isChecked}
                        value={option.value}
                        onChange={e => {
                          const { checked } = e.target;
                          const optionValue = option.value;
                          const currentValue = watch('eventStakeholders') || [];
                          console.log('Checkbox onChange:', { checked, optionValue, currentValue });

                          if (checked) {
                            setValue('eventStakeholders', [...currentValue, optionValue]);
                          } else {
                            setValue('eventStakeholders', currentValue.filter(val => val !== optionValue));
                          }

                          console.log('Updated eventStakeholders:', watch('eventStakeholders'));
                        }}
                        sx={{
                          color: colors.light.border,
                          '&.Mui-checked': {
                            color: colors.light.primary,
                          },
                        }}
                      />
                    }
                    label={option.label}
                    sx={{ color: colors.light.foreground }}
                  />
                );
              })}
            </Box>            {(errors.eventStakeholders ||
              validationErrors?.eventStakeholders) && (
                <FormHelperText sx={{ color: colors.light.destructive }}>
                  {errors.eventStakeholders?.message || validationErrors.eventStakeholders}
                </FormHelperText>
              )}
          </FormControl>

          {/* Is Sponsored */}
          <FormControl
            error={!!errors.isSponsored || !!validationErrors?.isSponsored}
          >
            <FormLabel sx={{ color: colors.light.foreground, mb: 1 }}>
              Is the event sponsored? *
            </FormLabel>
            <Controller
              name="isSponsored"
              control={control}
              rules={{ required: 'Please specify if the event is sponsored' }}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  sx={{ gap: 1 }}
                >
                  <FormControlLabel
                    value='true'
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
                    value='false'
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
            {(errors.isSponsored || validationErrors?.isSponsored) && (
              <FormHelperText sx={{ color: colors.light.destructive }}>
                {errors.isSponsored?.message || validationErrors.isSponsored}
              </FormHelperText>
            )}
          </FormControl>

          {isSponsored === 'true' && (
            <>
              <TextField
                fullWidth
                type='number'
                label='Budget (Rs.) *'
                placeholder='Enter The Budget'
                {...register('Budget', { required: true, min: 0 })}
                error={!!errors.Budget || !!validationErrors?.Budget}
                helperText={
                  errors.Budget
                    ? 'This field is required'
                    : validationErrors?.Budget
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

              <Typography
                variant='h6'
                sx={{ color: colors.light.foreground, mt: 2 }}
              >
                Sponsor(s) Information:
              </Typography>

              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
              >
                {sponsorfield.map((sponsor, index) => (
                  <Paper key={index} sx={{ borderRadius: 2, boxShadow: 'none' }}>
                    <Typography
                      variant='h6'
                      sx={{ color: colors.light.mutedForeground, mb: 2 }}
                    >
                      Sponsor {index + 1}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Sponsor name *'
                          placeholder='Enter The Name Of The Sponsor'
                          {...register(`eventSponsors.${index}.name`, {
                            required: 'Sponsor name is Required',
                          })}
                          error={
                            !!errors.eventSponsors?.[index]?.name ||
                            !!validationErrors?.[`eventSponsors.${index}.name`]
                          }
                          helperText={
                            errors.eventSponsors?.[index]?.name
                              ? errors.eventSponsors[index].name.message
                              : validationErrors?.[
                              `eventSponsors.${index}.name`
                              ]
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
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label='Sponsor Address *'
                          placeholder='Enter The Address Of The Sponsor'
                          {...register(`eventSponsors.${index}.address`, {
                            required: 'Sponsor Address is Required',
                          })}
                          error={
                            !!errors.eventSponsors?.[index]?.address ||
                            !!validationErrors?.[
                            `eventSponsors.${index}.address`
                            ]
                          }
                          helperText={
                            errors.eventSponsors?.[index]?.address
                              ? errors.eventSponsors[index].address.message
                              : validationErrors?.[
                              `eventSponsors.${index}.address`
                              ]
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
                      </Grid>
                    </Grid>

                    {index >= 0 && (
                      <Button
                        type='button'
                        variant='outlined'
                        startIcon={<X size={16} />}
                        onClick={() => sponsorremove(index)}
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
                        Remove Sponsor
                      </Button>
                    )}
                  </Paper>
                ))}

                <Button
                  type='button'
                  variant='contained'
                  startIcon={<Plus size={16} />}
                  onClick={() => sponsorappend({})}
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
                  Add Sponsor
                </Button>
              </Box>
            </>
          )}

          {isSponsored === 'true' && (
            <Box sx={{ mt: 3 }}>
              <FormControl error={!!validationErrors?.sanctionLetter}>
                <FormLabel sx={{ color: colors.light.foreground, mb: 2 }}>
                  Sanction Letter *
                </FormLabel>
                {fileUrl.sanctionLetter === '' && (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
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
                        id='sanction-letter-upload'
                      />
                      <label htmlFor='sanction-letter-upload'>
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
                        disabled={!file || uploading || fileUrl.sanctionLetter}
                        onClick={e => handleUpload(e, 'sanctionLetter')}
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
                {validationErrors?.sanctionLetter && (
                  <FormHelperText sx={{ color: colors.light.destructive }}>
                    {validationErrors.sanctionLetter}
                  </FormHelperText>
                )}
              </FormControl>

              {fileUrl.sanctionLetter !== '' && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant='body2'
                    sx={{ color: colors.light.foreground, mb: 2 }}
                  >
                    Sanction Letter Uploaded Successfully!
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {renderMedia(fileUrl.sanctionLetter, 'Sanction Letter')}
                  </Box>
                  <Button
                    variant='outlined'
                    startIcon={<X size={16} />}
                    onClick={e => handleDelete(e, 'sanctionLetter')}
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
                    Delete Letter
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default BudgetStep;
