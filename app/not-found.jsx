'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { House, ArrowLeft } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/colors.config.js';

export default function NotFound() {
    const router = useRouter();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: colors.light.background,
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                    }}
                >
                    {/* 404 Number */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '8rem', md: '12rem' },
                            fontWeight: 800,
                            color: colors.light.primary,
                            lineHeight: 1,
                            mb: 2,
                            textShadow: '4px 4px 0px rgba(201, 100, 66, 0.2)',
                        }}
                    >
                        404
                    </Typography>

                    {/* Message */}
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: colors.light.foreground,
                            mb: 1,
                        }}
                    >
                        Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: colors.light.mutedForeground,
                            mb: 4,
                            maxWidth: 400,
                            mx: 'auto',
                        }}
                    >
                        The page you're looking for doesn't exist or has been moved.
                    </Typography>

                    {/* Action Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<House weight="bold" />}
                            onClick={() => router.push('/')}
                            sx={{
                                bgcolor: colors.light.primary,
                                color: colors.light.primaryForeground,
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: colors.light.primary,
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Go Home
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<ArrowLeft weight="bold" />}
                            onClick={() => router.back()}
                            sx={{
                                color: colors.light.foreground,
                                borderColor: colors.light.border,
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: colors.light.primary,
                                    bgcolor: 'transparent',
                                },
                            }}
                        >
                            Go Back
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
