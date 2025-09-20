'use client';
import Calendar from '../Calendar/calven';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
export default function Venue() {
  const { status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedVenues, setSelectedVenues] = useState([]);
  const handleChange = venue => {
    setSelectedVenues([...selectedVenues, venue]);
  };
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
          // console.log(data.message);
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
        <Calendar />
      </div>
    </>
  );
}
