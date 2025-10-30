'use client';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
const { colors } = require('@/lib/colors.config.js');

const SuccessStep = () => {
  const router = useRouter();

  const handleStatusClick = () => {
    router.push('/status');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        py: 4,
      }}
    >
      <CheckCircle size={64} color={colors.light.primary} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant='h4'
          sx={{ color: colors.light.foreground, fontWeight: 600, mb: 2 }}
        >
          Congratulations!
        </Typography>
        <Typography variant='h6' sx={{ color: colors.light.mutedForeground, mb: 3 }}>
          Event Created Successfully
        </Typography>
        <Button
          variant="contained"
          onClick={handleStatusClick}
          sx={{
            bgcolor: colors.light.primary,
            color: colors.light.primaryForeground,
            '&:hover': {
              bgcolor: colors.light.primary,
              opacity: 0.9,
            },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1,
            borderRadius: 2,
          }}
        >
          Click here to follow the status of the event
          <ArrowRight size={16} />
        </Button>
      </Box>
    </Box>
  );
};

export default SuccessStep;
