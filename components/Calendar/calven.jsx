'use client';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  parse,
  parseISO,
  startOfToday,
} from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import VenueCard from '../VenueCard/venuecard';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Calven(props) {
  const [tempVenues, setTempVenues] = useState([]);

  const handleChange = (slot, venueId, checked, title) => {
    if (checked) {
      setTempVenues([
        ...tempVenues,
        {
          date: slot.date,
          session: slot.session,
          venueId: venueId,
          venueName: title,
        },
      ]);
    } else {
      setTempVenues(
        tempVenues.filter(
          venue =>
            !(
              venue.date === slot.date &&
              venue.session === slot.session &&
              venue.venueId === venueId
            )
        )
      );
    }
  };

  let today = startOfToday();
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [venueFormStep, setVenueFormStep] = useState(1);
  const [venues, setVenues] = useState({ raw: {}, filtered: [] });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userVenue, setUserVenue] = useState('');

  const handleSessionChange = (session, isChecked) => {
    if (!selectedDate) return;
    const formattedDate = format(new Date(selectedDate), 'dd-MM-yy');
    if (isChecked) {
      const newEntry = {
        date: formattedDate,
        session: session,
        venue: '',
      };
      setSelectedSessions(prevSessions => [...prevSessions, newEntry]);
    } else {
      setSelectedSessions(prevSessions =>
        prevSessions.filter(
          entry =>
            !entry.date.startsWith(formattedDate) || entry.session !== session
        )
      );
    }
  };

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  const isSessionSelected = session => {
    if (!selectedDate) return false;
    const formattedDate = format(new Date(selectedDate), 'dd-MM-yy');
    return selectedSessions.some(
      entry => entry.date.startsWith(formattedDate) && entry.session === session
    );
  };

  const isDateSelected = date => {
    const formattedDate = format(date, 'dd-MM-yy');
    return selectedSessions.some(entry => entry.date.startsWith(formattedDate));
  };

  const handleNextStep = async () => {
    if (venueFormStep === 1) {
      try {
        const response = await fetch('/api/venue/fetchAvailability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedSessions,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          setVenues(prevState => ({
            ...prevState,
            raw: {
              prevReservation: data.message.prevReservations,
              venueList: data.message.venueList,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching venue availability:', error);
      }
    }
    setVenueFormStep(prevStep => Math.min(prevStep + 1, 3));
  };

  const filterVenues = (parentBlock, selectedSessions) => {
    setVenues(prevState => {
      const {
        raw: { prevReservation, venueList },
      } = prevState;

      // Filter venues by parent block
      const filteredByBlock = venueList.filter(
        venue => venue.parentBlock === parentBlock
      );

      // Add slots array to each venue
      const filteredVenues = filteredByBlock.map(venue => {
        const slots = selectedSessions.map(session => {
          const isBooked = prevReservation.some(
            res =>
              res.venueId === venue.venueId &&
              res.reservationDate === session.date &&
              res.reservationSession === session.session
          );
          return {
            date: session.date,
            session: session.session,
            available: isBooked ? 0 : 1,
          };
        });

        return {
          ...venue,
          slots,
        };
      });

      if (filteredVenues.length == 0) {
        toast.error('No venues available for the selected Block.');
      }

      return {
        ...prevState,
        filtered: filteredVenues,
      };
    });
  };

  const handlePreviousStep = () => {
    setVenueFormStep(prevStep => Math.max(prevStep - 1, 1));
    if (venueFormStep === 2) {
      setVenues(prevState => ({
        ...prevState,
        filtered: [],
      }));
      setTempVenues([]);
    }
    if (venueFormStep === 3 && userVenue.length != 0) {
      setIsDialogOpen(true);
      setTempVenues([]);
    }
  };
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleAddVenue = () => {
    if (userVenue.length === 0) {
      toast.error('Please enter a venue name.');
      return;
    }
    setTempVenues([]);
    selectedSessions.map(session => {
      setTempVenues(prevVenues => [
        ...prevVenues,
        {
          date: session.date,
          session: session.session,
          venueId: 'O',
          venueName: userVenue,
        },
      ]);
    });
    setVenueFormStep(3);
    handleDialogClose();
  };

  const handleVenueConfirmation = () => {
    props.handleVenueChange(tempVenues, userVenue);
  };

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className=''>
      <div className='px-4 sm:px6 w-full mb-4'>
        {venueFormStep === 1 && (
          <div className='md:divide-x md:divide-gray-200'>
            <div className='md:pr-14 max-w-2xl'>
              <div className='p-4'>
                <h2 className='text-xl font-semibold mb-4'>
                  Step 2.1: Date and Session Selection
                </h2>
              </div>
              <div className='w-full md:w-1/2'>
                <div className='flex items-center '>
                  <h2 className='flex-auto font-semibold text-gray-900'>
                    {format(firstDayCurrentMonth, 'MMMM yyyy')}
                  </h2>
                  <button
                    type='button'
                    onClick={previousMonth}
                    className='-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500'
                  >
                    <span className='sr-only'>Previous month</span>
                    <ChevronLeftIcon className='w-5 h-5' aria-hidden='true' />
                  </button>
                  <button
                    onClick={nextMonth}
                    type='button'
                    className='-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500'
                  >
                    <span className='sr-only'>Next month</span>
                    <ChevronRightIcon className='w-5 h-5' aria-hidden='true' />
                  </button>
                </div>
                <div className='grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500'>
                  <div>S</div>
                  <div>M</div>
                  <div>T</div>
                  <div>W</div>
                  <div>T</div>
                  <div>F</div>
                  <div>S</div>
                </div>
                <div className='grid grid-cols-7 mt-2 text-sm'>
                  {days.map((day, dayIdx) => (
                    <div
                      key={day.toString()}
                      className={classNames(
                        dayIdx === 0 && colStartClasses[getDay(day)],
                        'py-1.5'
                      )}
                    >
                      <button
                        type='button'
                        onClick={() => {
                          const selectedDate = new Date(
                            new Date(day).setHours(0, 0, 0, 0)
                          );
                          const currentDate = new Date(
                            new Date().setHours(0, 0, 0, 0)
                          );
                          if (selectedDate < currentDate) {
                            toast.error('Please select a date in the future.');
                          } else {
                            setSelectedDate(selectedDate);
                          }
                        }}
                        className='mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                      >
                        <time
                          className={classNames(
                            new Date(new Date(day).setHours(0, 0, 0, 0)) <
                              new Date(new Date().setHours(0, 0, 0, 0))
                              ? 'text-gray-700 p-2 rounded-full w-[35px] h-[35px] bg-slate-200 cursor-not-allowed'
                              : '',
                            isDateSelected(day)
                              ? 'bg-blue-200 p-2 rounded-full w-[35px] h-[35px]'
                              : ''
                          )}
                          dateTime={format(day, 'yyyy-MM-dd')}
                        >
                          {format(day, 'd')}
                        </time>
                      </button>
                      <div className='w-1 h-1 mx-auto mt-1'></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedDate && (
              <div className='fixed inset-0 flex items-center justify-center z-50 bg-gray-800 backdrop-blur-sm bg-opacity-75'>
                <div className='bg-white p-6 rounded-lg shadow-lg'>
                  <h2 className='text-xl font-semibold mb-4'>
                    Select a session:
                  </h2>
                  <label className='flex items-center   '>
                    <input
                      type='checkbox'
                      className='mr-2'
                      checked={isSessionSelected('forenoon')}
                      onChange={e =>
                        handleSessionChange('forenoon', e.target.checked)
                      }
                    />
                    Forenoon
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      className='mr-2'
                      checked={isSessionSelected('afternoon')}
                      onChange={e =>
                        handleSessionChange('afternoon', e.target.checked)
                      }
                    />
                    Afternoon
                  </label>
                  <div className='mt-4'>
                    <button
                      type='button'
                      className='bg-gray-500 text-white py-2 px-4 rounded'
                      onClick={() => setSelectedDate('')}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {venueFormStep === 2 && (
          <>
            <div className='p-2'>
              <h2 className='text-xl font-semibold mb-2'>
                Step 2.2: Venue Selection
              </h2>
            </div>
            <div className='relative md:w-2/3'>
              <Image
                src='/assets/images/map.svg'
                width={600}
                height={600}
                alt='Map'
                className='mb-4 w-[100vw]'
                // priority
                // quality={100}
              />
              <button
                type='button'
                className='absolute top-[81%] left-[28%] marker'
                onClick={() => filterVenues('LMS', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute top-[16%] left-[16%] marker'
                onClick={() => filterVenues('SIT', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute top-[50%] left-[52%] marker'
                onClick={() => filterVenues('B Block', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute top-[55%] left-[58%] marker'
                onClick={() => filterVenues('A Block', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute top-[52%] left-[80%] marker'
                onClick={() => filterVenues('E Block', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute top-[44%] left-[69%] marker'
                onClick={() => filterVenues('G Block', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute top-[60%] left-[33%] marker'
                onClick={() => filterVenues('Sigma', selectedSessions)}
              >
                +
              </button>
              <button
                type='button'
                className='absolute bottom-[5%] right-[5%] font-bold bg-slate-100 p-2 rounded'
                onClick={handleDialogOpen}
              >
                Others
              </button>

              {isDialogOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75'>
                  <div className='bg-white p-4 rounded shadow-lg'>
                    <h2 className='text-lg font-bold mb-4'>
                      Enter the venue name
                    </h2>
                    <input
                      type='text'
                      name='venue'
                      placeholder='Venue'
                      onChange={e => {
                        setUserVenue(e.target.value);
                      }}
                      value={userVenue}
                      className='mb-2 p-2 border rounded w-full'
                    />
                    <div className='flex justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          handleDialogClose();
                          setUserVenue('');
                        }}
                        className='bg-gray-300 p-2 rounded'
                      >
                        Cancel
                      </button>
                      <button
                        type='button'
                        onClick={handleAddVenue}
                        className='bg-blue-500 text-white p-2 rounded'
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className='flex flex-col gap-4 w-full'>
              {venues.filtered.length != 0 &&
                venues.filtered.map(venue => (
                  <VenueCard
                    tempVenues={tempVenues}
                    handleChange={handleChange}
                    title={venue.venueName}
                    id={venue.venueId}
                    slots={venue.slots}
                    key={venue.venueId}
                    hasAc={venue.hasAc}
                    hasProjector={venue.hasProjector}
                    capacity={venue.seatingCapacity}
                    desc={venue.description}
                    action='create'
                    img='/assets/images/sairamEOMS.png'
                  />
                ))}
            </div>
          </>
        )}

        {venueFormStep === 3 && (
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>
              Step 2.3: Confirm Venue
            </h2>
            <p>Please confirm the selected venues</p>
            {tempVenues.map(venue => (
              <p key={venue.venueId}>
                {capitalize(venue.date)} - {capitalize(venue.session)} -{' '}
                {capitalize(venue.venueName)}{' '}
              </p>
            ))}
          </div>
        )}

        <div className='flex justify-between mt-4'>
          {venueFormStep > 1 && (
            <button
              type='button'
              className='bg-gray-500 text-white py-2 px-4 rounded'
              onClick={handlePreviousStep}
            >
              Previous
            </button>
          )}
          {venueFormStep < 3 && (
            <button
              type='button'
              className={
                (venueFormStep === 1 && selectedSessions.length === 0) ||
                (venueFormStep === 2 && tempVenues.length === 0)
                  ? 'bg-gray-500 cursor-not-allowed text-white py-2 px-4 rounded'
                  : 'bg-blue-500 text-white py-2 px-4 rounded'
              }
              onClick={handleNextStep}
              disabled={
                (venueFormStep === 1 && selectedSessions.length === 0) ||
                (venueFormStep === 2 && tempVenues.length === 0)
              }
            >
              Next
            </button>
          )}
          {venueFormStep == 3 && (
            <button
              type='button'
              className={
                selectedSessions.length != 0
                  ? 'bg-blue-500 text-white py-2 px-4 rounded'
                  : 'bg-gray-500 cursor-not-allowed text-white py-2 px-4 rounded'
              }
              onClick={handleVenueConfirmation}
              disabled={tempVenues.length === 0}
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

let colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
