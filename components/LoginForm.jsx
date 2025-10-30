'use client';
import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Waves from './Wave/waves';
import colorsConfig from '@/lib/colors.config.js';
import {
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Divider,
  Link as MUILink,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Eye, EyeSlash } from '@phosphor-icons/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [viewPassword, setViewPassword] = useState(false);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackUrl') || '/dashboard';

  const handleLogin = async e => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter the mail and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        callbackUrl: callbackURL,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid Credentials. Try again!');
        setIsLoading(false);
        return;
      }

      if (res?.url) {
        router.replace(res.url);
      }
    } catch (error) {
      console.log(error);
      setError('An error occurred during login.');
      setIsLoading(false);
    }
  };

  const { colors } = colorsConfig;

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
              <Divider
                orientation='vertical'
                flexItem
                sx={{
                  borderColor: colors.light.border,
                  display: { xs: 'none', md: 'block' },
                }}
              />
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
              variant='body1'
              sx={{ textAlign: 'center', color: colors.light.mutedForeground }}
            >
              Please login to your account
            </Typography>
            <Box component='form' onSubmit={handleLogin} sx={{ mt: 3 }}>
              <Grid container spacing={2} direction='column' wrap='nowrap'>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Email'
                    type='email'
                    onChange={e => setEmail(e.target.value)}
                    variant='outlined'
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Password'
                    type={viewPassword ? 'text' : 'password'}
                    onChange={e => setPassword(e.target.value)}
                    variant='outlined'
                    sx={{ width: '100%' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setViewPassword(prev => !prev)}
                            edge='end'
                          >
                            {viewPassword ? (
                              <EyeSlash size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                {error && (
                  <Grid item xs={12}>
                    <Typography
                      variant='body2'
                      sx={{ color: colors.light.destructive }}
                    >
                      {error}
                    </Typography>
                  </Grid>
                )}
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
                        Signing in...
                      </Box>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MUILink
                      href='/forgot-password'
                      underline='hover'
                      sx={{ fontSize: '0.875rem', color: 'var(--primary)' }}
                    >
                      Forgot your password?
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
};

export default Login;
