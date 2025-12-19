'use client';
import Calven from '@/components/Calendar/calven';
// import CalAvail from "@/components/Calendar/calAvail";
import React, { useState } from 'react';

export default function VenuesAvailablity() {
  const handleVenueChange = (venue, userVenueValue) => {
    if (venue.length === 0 && userVenueValue === '') {
      toast.error('Please select venue');
      return;
    }
    const transformedData = venue.map(item => ({
      venueId: item.venueId,
      venueName: item.venueName,
      reservationDate: item.date,
      reservationSession: item.session,
      userId: session?.user?._id,
    }));
    setVenueList(transformedData);
    setUserVenue(userVenueValue);
    completeFormStep();
  };
  return (
    <>
      {/* <Calven handleVenueChange={handleVenueChange} /> */}
      {/* <CalAvail handleVenueChange={handleVenueChange}/> */}
    </>
  );
}
