"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TabBar from '../TabBar/tabBar';
import { Toaster, toast } from 'sonner'

export default function Status() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    // Only run getEvents() when the session is resolved (status is not 'loading')
    if (status === 'authenticated'){
      const user_id = session?.user?._id;
      fetch('/api/myEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message && data.message.length > 0) {
            setEvents(data.message.reverse());
            setMessage("");
          } else {
            toast.info("No Events Found."); 
          }
          setIsDataFetched(true); // Set the flag to true after data is fetched
        })
        .catch(error => {
          console.error('Error:', error);
          setMessage("Error fetching events.");
        });
    }
  }, [status]);

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
