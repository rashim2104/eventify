'use client';

import { useState } from 'react';
import EventCard from '../EventCard/eventcard';

export default function TabBar(props) {
  const [selectedTab, setSelectedTab] = useState('all');
  const [filteredArray, setFilteredArray] = useState(
    filterEvents(props.events, 'all')
  );

  const handleTabClick = tab => {
    setSelectedTab(tab);
    setFilteredArray(filterEvents(props.events, tab));
  };

  function filterEvents(objects, status) {
    // 0 - submitted , 1 - HOD , 2 -IQAC , 3 - HOD comment , 4 - IQAC comment , -1 - HOD reject, -2 - IQAC reject, 5 - Principal Approval
    if (status === 'all') {
      return objects;
    }

    const statusMapping = {
      hodApproved: 1,
      approved: 2,
      rejected: [-1, -2],
      markedForChange: [3, 4],
    };

    const filteredObjects = objects.filter(object => {
      if (status === 'markedForChange' || status === 'rejected') {
        return statusMapping[status].includes(object.status);
      } else {
        return object.status === statusMapping[status];
      }
    });

    return filteredObjects;
  }

  return (
    <>
      <ul className='flex flex-wrap  gap-x-2 gap-y-6 md:flex justify-left p-3 gap-10 text-black'>
        <li>
          <label className='cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedTab === 'all'}
              onChange={() => handleTabClick('all')}
              className='hidden'
            />
            <span
              className={`p-2 px-4 border-2 border-gray-600 border-solid rounded-3xl hover:bg-orange-100 ${selectedTab === 'all'
                  ? 'bg-orange-200 text-orange-500 border-orange-500 font-bold'
                  : ''
                }`}
            >
              All
            </span>
          </label>
        </li>
        <li>
          <label className='cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedTab === 'hodApproved'}
              onChange={() => handleTabClick('hodApproved')}
              className='hidden'
            />
            <span
              className={`p-2 px-4 border-2 border-gray-600 border-solid rounded-3xl hover:bg-orange-100 ${selectedTab === 'hodApproved'
                  ? 'bg-orange-200 text-orange-500 border-orange-500 font-bold'
                  : ''
                }`}
            >
              HoD Approved
            </span>
          </label>
        </li>
        <li>
          <label className='cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedTab === 'markedForChange'}
              onChange={() => handleTabClick('markedForChange')}
              className='hidden'
            />
            <span
              className={`p-2 px-4 border-2 border-gray-600 border-solid rounded-3xl hover:bg-orange-100 ${selectedTab === 'markedForChange'
                  ? 'bg-orange-200 text-orange-500 border-orange-500 font-bold'
                  : ''
                }`}
            >
              Marked for Change
            </span>
          </label>
        </li>
        <li>
          <label className='cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedTab === 'approved'}
              onChange={() => handleTabClick('approved')}
              className='hidden'
            />
            <span
              className={`p-2 px-4 border-2 border-gray-600 border-solid rounded-3xl hover:bg-orange-100 ${selectedTab === 'approved'
                  ? 'bg-orange-200 text-orange-500 border-orange-500 font-bold'
                  : ''
                }`}
            >
              Approved
            </span>
          </label>
        </li>
        <li>
          <label className='cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedTab === 'rejected'}
              onChange={() => handleTabClick('rejected')}
              className='hidden'
            />
            <span
              className={`p-2 px-4 border-2 border-gray-600 border-solid rounded-3xl hover:bg-orange-100 ${selectedTab === 'rejected'
                  ? 'bg-orange-200 text-orange-500 border-orange-500 font-bold'
                  : ''
                }`}
            >
              Rejected
            </span>
          </label>
        </li>
      </ul>
      <div className="p-3">
        <EventCard events={filteredArray} message={props.message} grouped={false} />
      </div>
    </>
  );
}
