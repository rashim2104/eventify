'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  Stack,
} from '@mui/material';
// Using Phosphor icons instead of Material UI icons
import {
  User,
  CheckCircle,
  X,
  Lock,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { colors } from '@/lib/colors.config.js';

export default function Profile() {
  const { data: session, status, update: updateSession } = useSession();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = password => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const checkPasswordStrength = password => {
    const newRequirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    setRequirements(newRequirements);
    const strength = Object.values(newRequirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  useEffect(() => {
    checkPasswordStrength(newPassword);
  }, [newPassword]);

  useEffect(() => {
    if (session?.user?.hasDefaultPassword) {
      toast.warning(
        'Please change your default password to continue using the application',
        {
          duration: 5000,
        }
      );
    }
  }, [session]);

  const handleChangePassword = async () => {
    const email = session?.user?.email;
    setSubmitting(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      setSubmitting(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
      );
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/changePwd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
          action: 'user',
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Password Changed') {
        toast.success('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Only update session if user had default password
        if (session?.user?.hasDefaultPassword === true) {
          await updateSession({
            hasDefaultPassword: false,
          });
        }
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
    }

    setSubmitting(false);
  };

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Typography variant='h6' sx={{ color: colors.light.primaryHex }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const getPasswordStrengthColor = strength => {
    if (strength === 5) return '#4caf50';
    if (strength >= 3) return '#ff9800';
    return colors.light.destructiveHex || '#f44336';
  };

  const getPasswordStrengthWidth = strength => {
    if (strength === 5) return '100%';
    if (strength >= 3) return '60%';
    return '20%';
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: colors.light.backgroundHex,
        minHeight: '100vh',
      }}
    >
      {session?.user?.hasDefaultPassword && (
        <Alert
          severity='warning'
          sx={{
            mb: 4,
            bgcolor: '#ff9800' + '20',
            borderColor: '#ff9800',
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
            Warning!
          </Typography>
          <Typography>
            You are using the default password. Please change it before
            continuing.
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          sx={{
            fontWeight: 'bold',
            mb: 1,
            color: colors.light.primaryHex,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Hello, {session?.user?.name}
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ fontSize: '1.1rem' }}
        >
          Manage your profile information and security settings
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Information Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: colors.light.cardHex,
              borderRadius: 3,
              boxShadow: 3,
              height: '100%',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 4,
                  pb: 2,
                  borderBottom: `2px solid ${colors.light.mutedHex}`,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: colors.light.primaryHex,
                    width: 56,
                    height: 56,
                    mr: 3,
                    boxShadow: 2,
                  }}
                >
                  <User size={28} weight='fill' />
                </Avatar>
                <Box>
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 'bold',
                      color: colors.light.primaryHex,
                      mb: 0.5,
                    }}
                  >
                    Profile Information
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Your personal details and account information
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={3.5}>
                <TextField
                  label='Name'
                  value={session?.user?.name || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />

                <TextField
                  label='Email'
                  value={session?.user?.email || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />

                <TextField
                  label='College'
                  value={session?.user?.college || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />

                <TextField
                  label='Department'
                  value={session?.user?.dept || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />

                <TextField
                  label='Role'
                  value={session?.user?.role || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />

                <TextField
                  label='Phone Number'
                  value={session?.user?.phone || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />

                <TextField
                  label='Staff ID'
                  value={session?.user?.id || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.light.mutedHex + '15',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: colors.light.mutedHex,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: colors.light.primaryHex,
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: colors.light.cardHex,
              borderRadius: 3,
              boxShadow: 3,
              height: '100%',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 4,
                  pb: 2,
                  borderBottom: `2px solid ${colors.light.mutedHex}`,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: colors.light.primaryHex,
                    width: 56,
                    height: 56,
                    mr: 3,
                    boxShadow: 2,
                  }}
                >
                  <Lock
                    size={28}
                    weight='fill'
                    color={colors.light.primaryForegroundHex}
                  />
                </Avatar>
                <Box>
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 'bold',
                      color: colors.light.primaryHex,
                      mb: 0.5,
                    }}
                  >
                    Change Password
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Update your password for better security
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={3.5}>
                <TextField
                  label='Old Password'
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder='Enter old password'
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  fullWidth
                  variant='outlined'
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showOldPassword ? (
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </Button>
                    ),
                  }}
                />

                <TextField
                  label='New Password'
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder='Enter new password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  fullWidth
                  variant='outlined'
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showNewPassword ? (
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </Button>
                    ),
                  }}
                />

                {newPassword.length > 0 && (
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: colors.light.mutedHex + '08',
                      borderRadius: 2,
                      border: `1px solid ${colors.light.mutedHex}`,
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          Password Strength
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 'bold',
                            color: getPasswordStrengthColor(passwordStrength),
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {passwordStrength === 5
                            ? 'Strong'
                            : passwordStrength >= 3
                              ? 'Medium'
                              : 'Weak'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={(passwordStrength / 5) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: colors.light.mutedHex,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getPasswordStrengthColor(passwordStrength),
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>

                    <List dense sx={{ '& .MuiListItem-root': { px: 0 } }}>
                      <ListItem sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {requirements.length ? (
                            <CheckCircle size={16} color='#4caf50' />
                          ) : (
                            <X
                              size={16}
                              color={colors.light.mutedForegroundHex}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary='At least 8 characters'
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: requirements.length
                                ? '#4caf50'
                                : colors.light.mutedForegroundHex,
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {requirements.lowercase ? (
                            <CheckCircle size={16} color='#4caf50' />
                          ) : (
                            <X
                              size={16}
                              color={colors.light.mutedForegroundHex}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary='One lowercase letter'
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: requirements.lowercase
                                ? '#4caf50'
                                : colors.light.mutedForegroundHex,
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {requirements.uppercase ? (
                            <CheckCircle size={16} color='#4caf50' />
                          ) : (
                            <X
                              size={16}
                              color={colors.light.mutedForegroundHex}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary='One uppercase letter'
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: requirements.uppercase
                                ? '#4caf50'
                                : colors.light.mutedForegroundHex,
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {requirements.number ? (
                            <CheckCircle size={16} color='#4caf50' />
                          ) : (
                            <X
                              size={16}
                              color={colors.light.mutedForegroundHex}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary='One number'
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: requirements.number
                                ? '#4caf50'
                                : colors.light.mutedForegroundHex,
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {requirements.special ? (
                            <CheckCircle size={16} color='#4caf50' />
                          ) : (
                            <X
                              size={16}
                              color={colors.light.mutedForegroundHex}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary='One special character'
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: requirements.special
                                ? '#4caf50'
                                : colors.light.mutedForegroundHex,
                            },
                          }}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                )}

                <TextField
                  label='Confirm New Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  fullWidth
                  variant='outlined'
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showConfirmPassword ? (
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </Button>
                    ),
                  }}
                />

                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  onClick={handleChangePassword}
                  disabled={submitting}
                  sx={{
                    bgcolor: colors.light.primaryHex,
                    color: colors.light.primaryForegroundHex,
                    py: 2,
                    px: 4,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: 3,
                    '&:hover': {
                      bgcolor: colors.light.primaryHex,
                      opacity: 0.9,
                      boxShadow: 6,
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      bgcolor: colors.light.mutedHex,
                      color: colors.light.mutedForegroundHex,
                      boxShadow: 'none',
                      transform: 'none',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Change Password'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
