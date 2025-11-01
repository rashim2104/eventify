'use client';
'use session';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ViewEvent from '@/components/ViewEvent/viewevent';

// Material UI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, Cancel, Edit } from '@mui/icons-material';

// Import colors
import { colors } from '@/lib/colors.config.js';

export default function EventInfo({ params }) {
  const [eventDetails, setEventDetails] = useState([]);
  const [comment, setComment] = useState('');
  const [redirectStatus, setRedirectStatus] = useState(false);
  const { data: session, status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEventIdModal, setShowEventIdModal] = useState(false);
  const [customEventId, setCustomEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  let email = session?.user?.email;
  const userType = session?.user?.userType;

  const handlePrincipalApprovalCheck = () => {
    setIsDialogOpen(true);
  };

  const handleChange = async (event_id, action, customEventId = null) => {
    try {
      const user_id = session?.user?._id;
      const response = await fetch('/api/approveEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id,
          user_id,
          userType,
          action,
          comment: comment,
          customEventId: customEventId, // Make sure we're sending the customEventId
        }),
      });

      if (response.ok) {
        // Handle success
        action === 'Approve'
          ? toast.success('Event Approved Successfully')
          : action === 'Comment'
            ? toast.success('Event marked for change')
            : action === 'ApprovePrinc'
              ? toast.success('Event Forwarded to Principal Successfully')
              : toast.error('Event Rejected Successfully');

        setRedirectStatus(true);
      } else {
        // Handle error
        toast.error('Failed to approve event');
        setRedirectStatus(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setRedirectStatus(false);
    }
  };

  const generateEventId = async () => {
    try {
      const response = await fetch('/api/generateEventId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: eventDetails[0].user_id,
          dept: eventDetails[0].dept,
          college: eventDetails[0].eventCollege,
        }),
      });
      const data = await response.json();
      setCustomEventId(data.eventId);
      setShowEventIdModal(true);
    } catch (error) {
      console.error('Error generating event ID:', error);
      toast.error('Failed to generate event ID');
    }
  };

  const handleApproveWithEventId = () => {
    if (!customEventId.trim()) {
      toast.error('Event ID cannot be empty');
      return;
    }
    // Pass the customEventId directly
    handleChange(eventDetails[0]._id, 'Approve', customEventId);
    setShowEventIdModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (redirectStatus) router.replace('/approve');
      // Only run getEvents() when the session is resolved (status is not 'loading')
      else if (status === 'authenticated' || status === 'unauthenticated') {
        const eventId = params.eventID;
        const userType = session?.user?.userType;
        try {
          const response = await fetch('/api/eventDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventId,
              userType,
            }),
          });
          const data = await response.json();
          if (
            data.message &&
            data.message.length > 0 &&
            data.message !== 'An error occurred while fetching data.'
          ) {
            setEventDetails(data.message);
          } else {
            setEventDetails([]);
          }
        } catch (error) {
          console.error('Error:', error);
          setEventDetails([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status, redirectStatus]);

  if (status === 'loading') {
    return (
      <div className='grid place-items-center h-screen text-xl font-extrabold'>
        Loading...
      </div>
    );
  }
  const currUser = session?.user?.userType;
  if (currUser === 'student') {
    return (
      <h1 className='grid place-items-center h-screen text-7xl text-red-600	font-extrabold'>
        Not Authorized !!
      </h1>
    );
  }
  return (
    <>
      <div>
        <div>
          {eventDetails.length != 0 ? (
            <div className='flex flex-col items-left gap-3'>
              {!loading && (
                <ViewEvent
                  eventData={eventDetails[0].eventData}
                  dept={eventDetails[0].dept}
                  data={eventDetails[0]}
                />
              )}
              {(email === 'principal@sairamit.edu.in' ||
                email === 'principal@sairam.edu.in') &&
                eventDetails[0].status == 5 && (
                  <Container maxWidth='lg' sx={{ mt: 3 }}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent
                        sx={{
                          p: 3,
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        <Button
                          variant='contained'
                          startIcon={<CheckCircle />}
                          onClick={() =>
                            handleChange(eventDetails[0]._id, 'Approve')
                          }
                          sx={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#059669',
                            },
                          }}
                        >
                          Approve
                        </Button>
                      </CardContent>
                    </Card>
                  </Container>
                )}
              {((userType === 'HOD' && eventDetails[0].status == 0) ||
                (userType === 'admin' && eventDetails[0].status == 1)) && (
                <Container maxWidth='lg' sx={{ mt: 3 }}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent
                      sx={{
                        p: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        variant='contained'
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          if (userType === 'admin') {
                            handlePrincipalApprovalCheck();
                          } else {
                            handleChange(eventDetails[0]._id, 'Approve');
                          }
                        }}
                        sx={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#059669',
                          },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant='contained'
                        startIcon={<Cancel />}
                        onClick={() =>
                          handleChange(eventDetails[0]._id, 'Reject')
                        }
                        sx={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#dc2626',
                          },
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant='contained'
                        startIcon={<Edit />}
                        onClick={() => setShowModal(true)}
                        sx={{
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#d97706',
                          },
                        }}
                      >
                        Mark for Change
                      </Button>
                    </CardContent>
                  </Card>
                </Container>
              )}
            </div>
          ) : (
            <p>No event details available.</p>
          )}
        </div>
      </div>
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ color: colors.light.foreground }}>
          Add a Comment
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder='Enter your comment...'
            value={comment}
            onChange={e => setComment(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: colors.light.foreground,
                '& fieldset': {
                  borderColor: colors.light.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.light.border,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.light.primary,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setShowModal(false)}
            sx={{
              color: colors.light.destructive,
              '&:hover': {
                backgroundColor: colors.light.destructive,
                color: colors.light.primaryForeground,
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setShowModal(false);
              handleChange(eventDetails[0]._id, 'Comment');
            }}
            variant='contained'
            sx={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showEventIdModal}
        onClose={() => {
          setShowEventIdModal(false);
          setIsEditing(false);
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ color: colors.light.foreground }}>
          Event ID Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography
            component='label'
            variant='body2'
            sx={{
              color: colors.light.mutedForeground,
              mb: 2,
              display: 'block',
            }}
          >
            Suggested Event ID:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isEditing ? (
              <TextField
                fullWidth
                value={customEventId}
                onChange={e => setCustomEventId(e.target.value)}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.light.foreground,
                    '& fieldset': {
                      borderColor: colors.light.border,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.light.border,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.light.primary,
                    },
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  backgroundColor: colors.light.muted,
                  borderRadius: 1,
                  border: 1,
                  borderColor: colors.light.border,
                }}
              >
                <Typography sx={{ color: colors.light.foreground }}>
                  {customEventId}
                </Typography>
              </Box>
            )}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant='outlined'
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
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setShowEventIdModal(false);
              setIsEditing(false);
            }}
            sx={{
              color: colors.light.mutedForeground,
              '&:hover': {
                backgroundColor: colors.light.muted,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleApproveWithEventId();
              setIsEditing(false);
            }}
            variant='contained'
            sx={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Confirm & Approve
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ color: colors.light.foreground }}>
          Principal Approval
        </DialogTitle>
        <DialogContent>
          <Typography
            variant='body1'
            sx={{ color: colors.light.mutedForeground }}
          >
            Does this event need principal approval?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              generateEventId();
            }}
            variant='outlined'
            sx={{
              color: colors.light.foreground,
              borderColor: colors.light.border,
              '&:hover': {
                borderColor: colors.light.border,
                backgroundColor: colors.light.muted,
              },
            }}
          >
            No
          </Button>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              handleChange(eventDetails[0]._id, 'ApprovePrinc');
            }}
            variant='contained'
            sx={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
