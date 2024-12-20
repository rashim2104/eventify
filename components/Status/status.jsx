"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import TabBar from '../TabBar/tabBar';
import { Toaster, toast } from 'sonner'

export default function Status() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [isDataFetched, setIsDataFetched] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/myEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session?.user?._id
        }),
      });

      const data = await response.json();
      
      if (data.message && data.message.length > 0) {
        setEvents(data.message);
        setMessage('');
      } else {
        setMessage('No events found.');
        setEvents([]);
      }
    } catch (error) {
      setMessage('Error fetching events.');
      console.error('Error:', error);
    } finally {
      setIsDataFetched(true);
    }
  }, [session?.user?._id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status, fetchEvents]);

  if (status === 'loading' || !isDataFetched) {
    return <div className="grid place-items-center h-screen text-xl font-extrabold">Loading...</div>;
  }

  const currUser = session?.user?.userType;

  if (currUser === 'student' || currUser === 'admin') {
    return <h1 className='grid place-items-center h-screen text-7xl text-red-600 font-extrabold'>Not Authorized !!</h1>;
  }

  return (
    <>
      <TabBar
        events={events}
        message={message}
      />
    </>
  );
}
