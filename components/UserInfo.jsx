'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Status() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Run getEvents() when the component mounts
    getEvents();
  }, []);

  if (status === 'loading') {
    return (
      <div className='grid place-items-center h-screen text-xl font-extrabold'>
        Loading...
      </div>
    );
  }

  async function getEvents() {
    fetch('/api/allEvents', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.message && data.message.length > 0) {
          setEvents(data.message);
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
  }

  const formatDate = dateString => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <main>
      {events.length > 0 && (
        <div>
          <h2>Events:</h2>
          {events.map((event, index) => (
            <div
              key={index}
              style={{
                maxWidth: '50vw',
                wordWrap: 'break-word',
                margin: '10px',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '5px',
              }}
            >
              <h3>{event.eventData.EventName}</h3>
              <p>
                <strong>Venue:</strong> {event.eventData.EventVenue}
              </p>
              <p>
                <strong>Start Time:</strong>{' '}
                {formatDate(event.eventData.StartTime)}
              </p>
              <p>
                <strong>End Time:</strong> {formatDate(event.eventData.EndTime)}
              </p>
            </div>
          ))}
        </div>
      )}
      {message && (
        <div style={{ maxWidth: '50vw', wordWrap: 'break-word' }}>
          {message}
        </div>
      )}
    </main>
  );
}
