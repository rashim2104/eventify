'use client';
import Image from 'next/image';
import Link from 'next/link';
export default function StatusCard({ events, message }) {
  function getStatusText(status) {
    switch (status) {
      case 0:
        return ['bg-gray-800', '#465467', '#151e2c', '#2f3b4b'];
      case 1:
        return ['bg-[#3db06a]', '#f3eeed', '#2c3437', '#bbe993'];
      case 2:
        return ['bg-[#3db06a]', '#f3eeed', '#2c3437', '#bbe993'];
      case -1:
        return ['bg-[#ff5f53]', '#e7dccc', '#420707', '#b03733'];
      case -2:
        return ['bg-[#ff5f53]', '#e7dccc', '#420707', '#b03733'];
      case 3:
        return ['bg-[#ffb521]', '#ffe6b3', '#6c4b00', '#df9c01'];
      case 4:
        return ['bg-[#ffb521]', '#ffe6b3', '#6c4b00', '#df9c01'];
      case 5:
        return ['bg-[#200389]', '#acd3fb', '#201546', '#4d69a5'];
      default:
        return ['bg-gray-800', '#465467', '#151e2c', '#2f3b4b'];
    }
  }

  const formatDate = dateString => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <>
      <div className='w-full flex gap-x-5 gap-y-3 py-4 flex-wrap'>
        {events.length === 0 && <h1>No Events Found</h1>}
        {events.length > 0 &&
          events.map((event, index) => {
            const color = getStatusText(event.status);
            return (
              <div
                key={index}
                className={`w-full rounded-lg px-6 py-2 pb-4 text-sm shadow ${color[0]} text-gray-100 relative overflow-hidden px-8 py-6 mb-3 xl:w-5/12`}
              >
                <div className='py-2'>
                  <svg
                    width='314'
                    height='214'
                    viewBox='0 0 314 214'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='absolute right-0 top-0 z-10'
                  >
                    <path
                      d='M174.5 6V-23.5L233 36H204.5C187.931 36 174.5 22.5685 174.5 6Z'
                      fill={color[1]}
                    ></path>
                    <path
                      d='M174.5 6V-23.5L116 36H144.5C161.069 36 174.5 22.5685 174.5 6Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M116.5 65.5V36L175 95.5H146.5C129.931 95.5 116.5 82.0685 116.5 65.5Z'
                      fill={color[1]}
                    ></path>
                    <path
                      d='M116.5 65.5V36L58 95.5H86.5C103.069 95.5 116.5 82.0685 116.5 65.5Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M59.5 125V95.5L118 155H89.5C72.9315 155 59.5 141.569 59.5 125Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M59.5 125V95.5L1.00003 155H29.5C46.0686 155 59.5 141.569 59.5 125Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M58.5 184.5L58.5 214L-5.20166e-06 154.5L28.5 154.5C45.0685 154.5 58.5 167.931 58.5 184.5Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M58.5 184.5L58.5 214L117 154.5L88.5 154.5C71.9315 154.5 58.5 167.931 58.5 184.5Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M174.5 125V95.5L233 155H204.5C187.931 155 174.5 141.569 174.5 125Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M174.5 125V95.5L116 155H144.5C161.069 155 174.5 141.569 174.5 125Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M173.5 184.5L173.5 214L115 154.5L143.5 154.5C160.069 154.5 173.5 167.931 173.5 184.5Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M173.5 184.5L173.5 214L232 154.5L203.5 154.5C186.931 154.5 173.5 167.931 173.5 184.5Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M289.5 125V95.5L348 155H319.5C302.931 155 289.5 141.569 289.5 125Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M289.5 125V95.5L231 155H259.5C276.069 155 289.5 141.569 289.5 125Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M288.5 184.5L288.5 214L230 154.5L258.5 154.5C275.069 154.5 288.5 167.931 288.5 184.5Z'
                      fill={color[2]}
                    ></path>
                    <path
                      d='M288.5 184.5L288.5 214L347 154.5L318.5 154.5C301.931 154.5 288.5 167.931 288.5 184.5Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M286.5 6V-23.5L345 36H316.5C299.931 36 286.5 22.5685 286.5 6Z'
                      fill={color[1]}
                    ></path>
                    <path
                      d='M286.5 6V-23.5L228 36H256.5C273.069 36 286.5 22.5685 286.5 6Z'
                      fill={color[3]}
                    ></path>
                    <path
                      d='M346.5 66.5V37L288 96.5H316.5C333.069 96.5 346.5 83.0685 346.5 66.5Z'
                      fill={color[3]}
                    ></path>
                    <g opacity='1'>
                      <path
                        d='M233 65.5V36L291.5 95.5H263C246.431 95.5 233 82.0685 233 65.5Z'
                        fill={color[1]}
                      ></path>
                      <path
                        d='M233 65.5V36L174.5 95.5H203C219.569 95.5 233 82.0685 233 65.5Z'
                        fill={color[3]}
                      ></path>
                    </g>
                  </svg>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='mt-2 grid grid-cols-1 gap-4 z-20'>
                      <div>
                        <h1 className='forge-h5 font-bold text-gray-100 text-4xl '>
                          {event.eventData.EventName}
                        </h1>
                        <div className='flex flex-col'>
                          <a
                            href={`/events/${event._id}`}
                            onClick={e => e.preventDefault()}
                            className=''
                          ></a>
                        </div>
                      </div>
                      {event.status == 2 && (
                        <div className='flex flex-col'>
                          <p className='flex gap-1 text-lg'>{event.ins_id}</p>
                        </div>
                      )}
                      <div className='flex flex-col'>
                        <p className='flex gap-1 text-xl'>
                          <Image
                            src='/assets/icons/location.png'
                            width={30}
                            height={25}
                            alt=''
                          />
                          {event.eventData.EventVenue}
                        </p>
                      </div>
                      <div className='flex  flex-col'>
                        <p className='flex gap-1 text-xl'>
                          <Image
                            src='/assets/icons/time.png'
                            width={30}
                            height={25}
                            alt=''
                          />
                          {formatDate(event.eventData.StartTime)}
                        </p>
                      </div>
                      <div className='flex flex-col'>
                        <p className='flex gap-1 text-xl'>
                          <Image
                            src='/assets/icons/time.png'
                            width={30}
                            height={25}
                            alt=''
                          />
                          {formatDate(event.eventData.EndTime)}
                        </p>
                      </div>
                      <div className='flex'>
                        <Link
                          href={`${process.env.NEXT_PUBLIC_URL}/events/${event._id}`}
                          className='hover:text-white'
                        >
                          <svg
                            className='h-8 w-8 white hover:text-black'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        {message && (
          <div style={{ maxWidth: '50vw', wordWrap: 'break-word' }}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}
