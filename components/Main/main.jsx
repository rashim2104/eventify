'use client';
import Calendar from '../Calendar/calendar';
import EventCard from '../EventCard';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Container } from '@mui/material';

export default function Main() {
  const { status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('/api/allEvents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.message && data.message.length > 0) {
          setEvents(data.message.reverse());
          setMessage('');
        } else {
          setMessage('No Events.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Error fetching events.');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className='grid place-items-center h-screen text-xl font-extrabold'>
        Loading...
      </div>
    );
  }

  return (
    <>
      <div>
        <Calendar meetings={events} />
      </div>
      <Box component="main" sx={{ width: '100%', px: { xs: 2, sm: 3 }, py: 3 }}>
        <EventCard events={events} message={message} grouped={true} />
      </Box>
    </>
  );
}
