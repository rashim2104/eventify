'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import '../styles/doodle.css';

const features = [
  {
    title: 'Smart Event Forms',
    description: 'Create and edit event proposals with customizable forms and detailed planning options.',
    icon: '📝',
    color: 'bg-blue-50',
    iconBg: 'bg-blue-500',
  },
  {
    title: 'Venue Management',
    description: 'Book venues, check availability, and manage reservations with calendar integration.',
    icon: '🏛️',
    color: 'bg-green-50',
    iconBg: 'bg-green-500',
  },
  {
    title: 'Approval Tracking',
    description: 'Real-time tracking of multi-level approvals with status updates and history.',
    icon: '✅',
    color: 'bg-orange-50',
    iconBg: 'bg-orange-500',
  },
  {
    title: 'Post-Event Documentation',
    description: 'Collect event photos, attendance records, and OD lists through structured forms.',
    icon: '📸',
    color: 'bg-purple-50',
    iconBg: 'bg-purple-500',
  },
  {
    title: 'Email Notifications',
    description: 'Automated alerts for approvals, rejections, and important updates.',
    icon: '✉️',
    color: 'bg-yellow-50',
    iconBg: 'bg-yellow-500',
  },
  {
    title: 'Report Generation',
    description: 'Generate comprehensive reports for multiple events with custom filters.',
    icon: '📊',
    color: 'bg-red-50',
    iconBg: 'bg-red-500',
  },
];

const steps = [
  { step: '1', title: 'Create Event Request', description: 'Submit detailed event proposals using smart forms.' },
  { step: '2', title: 'Book Venue', description: 'Check availability and reserve venues for your dates.' },
  { step: '3', title: 'Track Approvals', description: 'Monitor approval status across different levels.' },
  { step: '4', title: 'Conduct Event', description: 'Execute event and submit post-event documentation.' },
  { step: '5', title: 'Generate Reports', description: 'Create comprehensive event reports and analytics.' },
];

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col'>
      {/* Navigation Bar */}
      <nav className='bg-white/80 backdrop-blur-md shadow-md fixed w-full z-50'>
        <div className='w-full px-4'>
          <div className='flex justify-between items-center h-14 sm:h-16'>
            <Image
              src='/assets/images/logo.png'
              width={150}
              height={80}
              quality={100}
              alt='Eventify Logo'
              priority
              className='w-32 sm:w-40 md:w-44 h-auto'
            />
            <Link
              href='/'
              className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5 text-sm sm:text-base'
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='pt-20 sm:pt-24 pb-12 sm:pb-16 relative doodle-background'>
        <div className='relative z-10 pt-4 sm:pt-8'>
          <div className='max-w-6xl mx-auto text-center px-4 mt-4 sm:mt-8'>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 sm:mb-8 leading-tight'>
              Transform Your
              <br />
              <span className='bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                College Events
              </span>
            </h1>
            <p className='text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto px-2'>
              Streamline planning, approvals, and management in one powerful platform.
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 items-center px-4'>
              <Link
                href='/dashboard'
                className='w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5 text-base sm:text-lg font-semibold text-center'
              >
                Get Started Now
              </Link>
              <Link
                href='#features'
                className='w-full sm:w-auto bg-white text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5 border border-gray-200 text-base sm:text-lg font-semibold text-center'
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id='features' className='py-12 sm:py-16 md:py-20 bg-white/50 backdrop-blur-md'>
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16'>
            Comprehensive Event Management Features
          </h2>
          <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10'>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`${feature.iconBg} text-white w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4`}
                >
                  <span className='text-xl sm:text-2xl'>{feature.icon}</span>
                </div>
                <h3 className='text-lg sm:text-xl font-semibold mb-2'>{feature.title}</h3>
                <p className='text-sm sm:text-base text-gray-600'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16'>
            Event Management Workflow
          </h2>
          <div className='space-y-4 sm:space-y-6 max-w-3xl mx-auto'>
            {steps.map((step, index) => (
              <div
                key={index}
                className='flex items-start gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300'
              >
                <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold shrink-0 text-sm sm:text-base'>
                  {step.step}
                </div>
                <div>
                  <h3 className='text-lg sm:text-xl font-semibold mb-1 sm:mb-2'>{step.title}</h3>
                  <p className='text-sm sm:text-base text-gray-600'>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 sm:py-12 mt-auto'>
        <div className='max-w-6xl mx-auto px-4 text-center'>
          <div className='flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 mb-6'>
            <div className='w-40 sm:w-48 md:w-auto'>
              <Image
                src='/assets/images/SairamEOMS-white.png'
                width={180}
                height={70}
                quality={100}
                priority
                alt='Sairam EOMS Logo'
                className='object-contain w-full h-auto'
              />
            </div>
            <div className='hidden md:block border-l border-gray-600 h-16' />
            <div className='w-40 sm:w-48 md:w-auto'>
              <Image
                src='/assets/images/logo-white.png'
                width={180}
                height={70}
                quality={100}
                priority
                alt='Eventify Logo'
                className='object-contain w-full h-auto'
              />
            </div>
          </div>
          <div className='h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-6' />
          <p className='text-gray-400 text-sm sm:text-base'>
            © {new Date().getFullYear()} Eventify - Sairam Institutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
