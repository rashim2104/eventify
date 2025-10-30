'use client';
import { useState } from 'react';
import Image from 'next/image';
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password reset link sent to your email!');
      } else {
        toast.error(data.message || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
                Check Your Email
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  textAlign: 'center',
                  color: colors.light.mutedForeground,
                  mb: 3,
                }}
              >
                We&apos;ve sent a password reset link to{' '}
                <strong>{email}</strong>
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  textAlign: 'center',
                  color: colors.light.mutedForeground,
                  mb: 4,
                }}
              >
                The link will expire in 1 hour. If you don&apos;t see the email,
                check your spam folder.
              </Typography>
              <Button
                onClick={() => setIsSubmitted(false)}
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
                Send Another Email
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
              Forgot Password?
            </Typography>
            <Typography
              variant='body1'
              sx={{
                textAlign: 'center',
                color: colors.light.mutedForeground,
                mb: 4,
              }}
            >
              No worries! Enter your email address and we&apos;ll send you a
              link to reset your password.
            </Typography>

            <Box component='form' onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2} direction='column' wrap='nowrap'>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    variant='outlined'
                    placeholder='Enter your email'
                    disabled={isLoading}
                    sx={{ width: '100%' }}
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
                        Sending...
                      </Box>
                    ) : (
                      'Send Reset Link'
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
