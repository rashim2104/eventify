'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Skeleton,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { CalendarBlank, Sparkle } from '@phosphor-icons/react';
import EventCard from '@/components/EventCard/eventcard';
import '../styles/doodle.css';

// Loading skeleton component - memoized for performance
const LoadingSkeleton = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
      },
      gap: { xs: 2, sm: 2.5, md: 3 },
    }}
  >
    {[...Array(6)].map((_, index) => (
      <Paper
        key={index}
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          animation: 'shimmer 1.5s ease-in-out infinite',
          animationDelay: `${index * 0.15}s`,
          '@keyframes shimmer': {
            '0%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.6, transform: 'scale(0.995)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        <Skeleton
          variant='rounded'
          width='50%'
          height={24}
          sx={{ mb: 1.5, borderRadius: 1 }}
        />
        <Skeleton
          variant='text'
          width='85%'
          height={28}
          sx={{ mb: 0.5 }}
        />
        <Skeleton variant='text' width='60%' height={20} sx={{ mb: 2 }} />
        <Box sx={{ bgcolor: 'grey.100', borderRadius: 2, p: 1.5 }}>
          <Skeleton variant='text' width='75%' height={18} sx={{ mb: 0.75 }} />
          <Skeleton variant='text' width='55%' height={18} sx={{ mb: 0.75 }} />
          <Skeleton variant='text' width='65%' height={18} />
        </Box>
      </Paper>
    ))}
  </Box>
);

// Empty state component - memoized for performance
const EmptyState = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: { xs: 6, sm: 8, md: 10 },
      px: 2,
      animation: 'fadeInUp 0.6s ease forwards',
      '@keyframes fadeInUp': {
        from: { opacity: 0, transform: 'translateY(30px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
    }}
  >
    <Box
      sx={{
        width: { xs: 100, sm: 120 },
        height: { xs: 100, sm: 120 },
        mx: 'auto',
        mb: 3,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #fff7ed 0%, #fed7aa 100%)',
        boxShadow: '0 8px 32px rgba(249, 115, 22, 0.15)',
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(249, 115, 22, 0.15)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 12px 40px rgba(249, 115, 22, 0.25)' },
        },
      }}
    >
      <CalendarBlank size={56} weight='duotone' color='#ea580c' />
    </Box>
    <Typography
      variant='h5'
      sx={{
        fontWeight: 700,
        color: 'text.primary',
        mb: 1.5,
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
      }}
    >
      No Upcoming Events
    </Typography>
    <Typography
      variant='body1'
      sx={{
        color: 'text.secondary',
        maxWidth: 380,
        mx: 'auto',
        lineHeight: 1.7,
        fontSize: { xs: '0.9rem', sm: '1rem' },
      }}
    >
      There are no events scheduled for the next 30 days. Check back later!
    </Typography>
  </Box>
);

// Footer component - memoized for performance
const Footer = () => (
  <footer
    style={{
      background: 'linear-gradient(to right, #111827, #1f2937, #111827)',
      color: 'white',
      padding: '48px 0',
      marginTop: 'auto',
    }}
  >
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          marginBottom: '24px',
        }}
        className='footer-logos'
      >
        <div style={{ width: '192px' }}>
          <Image
            src='/assets/images/SairamEOMS-white.png'
            width={180}
            height={70}
            quality={100}
            priority
            alt='Sairam EOMS Logo'
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div
          className='footer-divider'
          style={{
            display: 'none',
            borderLeft: '1px solid #4b5563',
            height: '64px',
          }}
        />
        <div style={{ width: '192px' }}>
          <Image
            src='/assets/images/logo-white.png'
            width={180}
            height={70}
            quality={100}
            priority
            alt='Eventify Logo'
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
      <div
        style={{
          height: '1px',
          width: '100%',
          maxWidth: '448px',
          margin: '0 auto 24px',
          background: 'linear-gradient(to right, transparent, #6b7280, transparent)',
        }}
      />
      <p style={{ color: '#9ca3af', margin: 0 }}>
        © {new Date().getFullYear()} Eventify - Sairam Institutions.
      </p>
    </div>
    <style jsx>{`
      @media (min-width: 768px) {
        .footer-logos {
          flex-direction: row !important;
        }
        .footer-divider {
          display: block !important;
        }
      }
    `}</style>
  </footer>
);

export default function StudentPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/student/event');
        const data = await response.json();
        if (response.ok) {
          setEvents(data.message || []);
        } else {
          setError(data.message || 'Failed to fetch events');
        }
      } catch {
        setError('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Memoize stats to prevent unnecessary recalculations
  const eventCount = useMemo(() => events.length, [events]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fafafa',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      {/* Navigation Bar */}
      <Box
        component='nav'
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth='lg'>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: { xs: 56, sm: 64, md: 70 },
              px: { xs: 0.5, sm: 0 },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: 130, sm: 150, md: 160 },
                height: { xs: 35, sm: 40, md: 45 },
              }}
            >
              <Image
                src='/assets/images/logo.png'
                fill
                quality={100}
                alt='Eventify Logo'
                priority
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        className='doodle-background'
        sx={{
          pt: { xs: 10, sm: 12, md: 14 },
          pb: { xs: 5, sm: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249, 115, 22, 0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '15%', md: '20%' },
            left: { xs: '2%', md: '8%' },
            width: { xs: 60, sm: 80, md: 120 },
            height: { xs: 60, sm: 80, md: 120 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
            filter: 'blur(30px)',
            animation: 'floatOrb 8s ease-in-out infinite',
            '@keyframes floatOrb': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(15px, -20px) scale(1.1)' },
              '66%': { transform: 'translate(-10px, 10px) scale(0.95)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '5%', md: '15%' },
            right: { xs: '5%', md: '10%' },
            width: { xs: 80, sm: 100, md: 150 },
            height: { xs: 80, sm: 100, md: 150 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(249, 115, 22, 0.06) 100%)',
            filter: 'blur(40px)',
            animation: 'floatOrb 10s ease-in-out infinite reverse',
          }}
        />

        <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Badge */}
            <Box
              sx={{
                animation: 'slideDown 0.5s ease forwards',
                '@keyframes slideDown': {
                  from: { opacity: 0, transform: 'translateY(-20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Chip
                icon={<Sparkle size={14} weight='fill' />}
                label="Discover What's Happening"
                size='small'
                sx={{
                  mb: { xs: 2, sm: 3 },
                  bgcolor: 'rgba(249, 115, 22, 0.1)',
                  color: '#ea580c',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  py: { xs: 2, sm: 2.5 },
                  px: { xs: 0.5, sm: 1 },
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  backdropFilter: 'blur(8px)',
                  '& .MuiChip-icon': { color: '#f97316' },
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: { xs: 1.5, sm: 2 },
                color: 'text.primary',
                letterSpacing: '-0.02em',
                animation: 'slideUp 0.6s ease forwards',
                animationDelay: '0.1s',
                opacity: 0,
                '@keyframes slideUp': {
                  from: { opacity: 0, transform: 'translateY(25px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Upcoming
              <Box
                component='span'
                sx={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #f97316 0%, #dc2626 50%, #ea580c 100%)',
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 4s ease infinite',
                  '@keyframes gradientShift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                }}
              >
                Campus Events
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 500,
                mx: 'auto',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                lineHeight: 1.7,
                mb: { xs: 3, sm: 4 },
                px: { xs: 1, sm: 0 },
                animation: 'slideUp 0.6s ease forwards',
                animationDelay: '0.25s',
                opacity: 0,
              }}
            >
              Stay updated with workshops, seminars, cultural fests, and more happening at your campus.
            </Typography>

            {/* Stats - Simple inline display */}
            {!loading && eventCount > 0 && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 2, sm: 3 },
                  animation: 'slideUp 0.6s ease forwards',
                  animationDelay: '0.4s',
                  opacity: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography
                    component='span'
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                      background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {eventCount}
                  </Typography>
                  <Typography
                    component='span'
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    }}
                  >
                    Events
                  </Typography>
                </Box>

                <Divider
                  orientation='vertical'
                  flexItem
                  sx={{
                    height: { xs: 24, sm: 28 },
                    alignSelf: 'center',
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                    mx: { xs: 0.5, sm: 1 },
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography
                    component='span'
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                      color: 'text.primary',
                    }}
                  >
                    30
                  </Typography>
                  <Typography
                    component='span'
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    }}
                  >
                    Days
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Events Section */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f8fafc',
          py: { xs: 3, sm: 4, md: 5 },
          minHeight: { xs: 300, sm: 400 },
        }}
      >
        <Container maxWidth='lg' sx={{ px: { xs: 2, sm: 3 } }}>
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Box
              sx={{
                textAlign: 'center',
                py: { xs: 6, md: 8 },
                animation: 'fadeIn 0.5s ease forwards',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
              }}
            >
              <Typography variant='h6' color='error.main' sx={{ mb: 1, fontWeight: 600 }}>
                Oops! Something went wrong
              </Typography>
              <Typography color='text.secondary' sx={{ fontSize: '0.95rem' }}>
                {error}
              </Typography>
            </Box>
          ) : eventCount === 0 ? (
            <EmptyState />
          ) : (
            <Box
              sx={{
                '& > div': {
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: { xs: 2, sm: 2.5, md: 3 },
                },
              }}
            >
              <EventCard
                events={events}
                grouped={false}
                isStudent={true}
                message='No upcoming events found.'
              />
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
