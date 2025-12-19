'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import EventCard from '../EventCard/eventcard';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export default function Approve() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');

  const getEvents = useCallback(async () => {
    const user_id = session?.user?._id;
    const dept = session?.user?.dept;
    const userType = session?.user?.userType;
    const college = session?.user?.college;

    try {
      const response = await fetch('/api/fetchApprove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          dept,
          college,
          userType,
        }),
      });

      const data = await response.json();

      if (data.message && data.message.length > 0) {
        // Store all events, they'll be filtered for display
        setEvents(data.message);
        setMessage('');
      } else {
        setMessage('No events to Approve.');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching events.');
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === 'authenticated' || status === 'unauthenticated') {
      getEvents();
    }
  }, [status, getEvents]);

  if (status === 'loading') {
    return (
      <div className='grid place-items-center h-screen text-xl font-extrabold'>
        Loading...
      </div>
    );
  }

  const currUser = session?.user?.userType;
  if (currUser === 'student' || currUser === 'staff') {
    toast.error('Not Authorized');
    redirect('/dashboard');
    return null;
  }

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100'>
        Approval Requests
      </h2>
      <EventCard events={events} message={message} />
    </div>
  );
}
