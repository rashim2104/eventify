'use client';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { colors } from '@/lib/colors.config.js';
import {
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Link as MUILink,
  CircularProgress,
} from '@mui/material';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [token, setToken] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Validate token on component mount
      validateToken(tokenParam);
    } else {
      setIsValidToken(false);
      toast.error('Invalid or missing reset token');
    }
  }, [searchParams]);

  const validateToken = async resetToken => {
    try {
      // Use a simple token validation API call instead of full password reset
      const response = await fetch('/api/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        toast.error(data.message || 'Invalid or expired reset token');
      }
    } catch (error) {
      setIsValidToken(false);
      toast.error('Failed to validate token');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          'Password reset successfully! You can now log in with your new password.'
        );
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: colors.light.background,
          }}
        >
          <Container maxWidth='sm' sx={{ py: 4 }}>
            <Paper
              elevation={1}
              sx={{
                p: 4,
                bgcolor: colors.light.card,
                color: colors.light.cardForeground,
                borderRadius: 2,
                width: '100%',
                maxWidth: 520,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 3,
                  mb: 2,
                }}
              >
                <Image
                  src='/assets/images/SairamEOMS.png'
                  width={200}
                  height={80}
                  quality={100}
                  priority
                  className='object-contain'
                  alt='Sairam EOMS Logo'
                />
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Box
                    sx={{
                      borderLeft: `1px solid ${colors.light.border}`,
                      height: '80px',
                    }}
                  />
                </Box>
                <Image
                  src='/assets/images/logo.png'
                  width={200}
                  height={80}
                  quality={100}
                  priority
                  className='object-contain'
                  alt='Eventify Logo'
                />
              </Box>
              <Typography
                variant='h5'
                sx={{
                  textAlign: 'center',
                  color: colors.light.foreground,
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Validating Reset Token
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                }}
              >
                <CircularProgress
                  size={24}
                  sx={{ color: colors.light.primary }}
                />
                <Typography
                  variant='body1'
                  sx={{ color: colors.light.mutedForeground }}
                >
                  Validating reset token...
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>
      </>
    );
  }

  if (isValidToken === false) {
    return (
      <>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: colors.light.background,
          }}
        >
          <Container maxWidth='sm' sx={{ py: 4 }}>
            <Paper
              elevation={1}
              sx={{
                p: 4,
                bgcolor: colors.light.card,
                color: colors.light.cardForeground,
                borderRadius: 2,
                width: '100%',
                maxWidth: 520,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 3,
                  mb: 2,
                }}
              >
                <Image
                  src='/assets/images/SairamEOMS.png'
                  width={200}
                  height={80}
                  quality={100}
                  priority
                  className='object-contain'
                  alt='Sairam EOMS Logo'
                />
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Box
                    sx={{
                      borderLeft: `1px solid ${colors.light.border}`,
                      height: '80px',
                    }}
                  />
                </Box>
                <Image
                  src='/assets/images/logo.png'
                  width={200}
                  height={80}
                  quality={100}
                  priority
                  className='object-contain'
                  alt='Eventify Logo'
                />
              </Box>
              <Typography
                variant='h5'
                sx={{
                  textAlign: 'center',
                  color: colors.light.destructive,
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Invalid or Expired Link
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  textAlign: 'center',
                  color: colors.light.mutedForeground,
                  mb: 4,
                }}
              >
                This password reset link is invalid or has expired. Please
                request a new one.
              </Typography>
              <Button
                href='/forgot-password'
                variant='contained'
                sx={{
                  height: '3rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  bgcolor: colors.light.primary,
                  color: colors.light.primaryForeground,
                  '&:hover': { bgcolor: colors.light.primary },
                  width: { xs: '100%', sm: '70%' },
                  mx: 'auto',
                  display: 'block',
                }}
              >
                Request New Reset Link
              </Button>
            </Paper>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.light.background,
        }}
      >
        <Container maxWidth='sm' sx={{ py: 4 }}>
          <Paper
            elevation={1}
            sx={{
              p: 4,
              bgcolor: colors.light.card,
              color: colors.light.cardForeground,
              borderRadius: 2,
              width: '100%',
              maxWidth: 520,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 3,
                mb: 2,
              }}
            >
              <Image
                src='/assets/images/SairamEOMS.png'
                width={200}
                height={80}
                quality={100}
                priority
                className='object-contain'
                alt='Sairam EOMS Logo'
              />
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  sx={{
                    borderLeft: `1px solid ${colors.light.border}`,
                    height: '80px',
                  }}
                />
              </Box>
              <Image
                src='/assets/images/logo.png'
                width={200}
                height={80}
                quality={100}
                priority
                className='object-contain'
                alt='Eventify Logo'
              />
            </Box>
            <Typography
              variant='h5'
              sx={{
                textAlign: 'center',
                color: colors.light.foreground,
                mb: 2,
                fontWeight: 600,
              }}
            >
              Reset Your Password
            </Typography>
            <Typography
              variant='body1'
              sx={{
                textAlign: 'center',
                color: colors.light.mutedForeground,
                mb: 4,
              }}
            >
              Enter your new password below. Make sure it meets the security
              requirements.
            </Typography>

            <Box component='form' onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2} direction='column' wrap='nowrap'>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='New Password'
                    type='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    variant='outlined'
                    placeholder='Enter your new password'
                    disabled={isLoading}
                    sx={{ width: '100%' }}
                    inputProps={{ minLength: 8 }}
                  />
                  <Typography
                    variant='body2'
                    sx={{
                      color: colors.light.mutedForeground,
                      mt: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    Password must be at least 8 characters long and include
                    uppercase, lowercase, and numbers.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Confirm New Password'
                    type='password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    variant='outlined'
                    placeholder='Confirm your new password'
                    disabled={isLoading}
                    sx={{ width: '100%' }}
                    inputProps={{ minLength: 8 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isLoading}
                    sx={{
                      height: '3rem',
                      fontSize: '1rem',
                      fontWeight: 500,
                      bgcolor: colors.light.primary,
                      color: colors.light.primaryForeground,
                      '&:hover': { bgcolor: colors.light.primary },
                      width: { xs: '100%', sm: '70%' },
                      mx: 'auto',
                      display: 'block',
                    }}
                  >
                    {isLoading ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CircularProgress
                          size={18}
                          sx={{ color: colors.light.primaryForeground }}
                        />
                        Resetting Password...
                      </Box>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MUILink
                      href='/'
                      underline='hover'
                      sx={{ fontSize: '0.875rem', color: 'var(--primary)' }}
                    >
                      ← Back to Login
                    </MUILink>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

// Loading fallback for Suspense
function ResetPasswordLoading() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.light.background,
      }}
    >
      <Container maxWidth='sm' sx={{ py: 4 }}>
        <Paper
          elevation={1}
          sx={{
            p: 4,
            bgcolor: colors.light.card,
            color: colors.light.cardForeground,
            borderRadius: 2,
            width: '100%',
            maxWidth: 520,
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              gap: 3,
              mb: 2,
            }}
          >
            <Image
              src='/assets/images/SairamEOMS.png'
              width={200}
              height={80}
              quality={100}
              priority
              className='object-contain'
              alt='Sairam EOMS Logo'
            />
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  borderLeft: `1px solid ${colors.light.border}`,
                  height: '80px',
                }}
              />
            </Box>
            <Image
              src='/assets/images/logo.png'
              width={200}
              height={80}
              quality={100}
              priority
              className='object-contain'
              alt='Eventify Logo'
            />
          </Box>
          <Typography
            variant='h5'
            sx={{
              textAlign: 'center',
              color: colors.light.foreground,
              mb: 2,
              fontWeight: 600,
            }}
          >
            Loading Reset Password
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <CircularProgress size={24} sx={{ color: colors.light.primary }} />
            <Typography
              variant='body1'
              sx={{ color: colors.light.mutedForeground }}
            >
              Loading...
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

// Main page component with Suspense boundary
export default function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
