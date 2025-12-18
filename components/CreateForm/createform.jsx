'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { EventForm } from '@/components/EventForm';
import './Form.css';

export default function CreateForm() {
  const { data: session, status } = useSession();
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
  return <EventForm />;
}
