"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { societies } from "@/public/data/data";

const statusTypes = {
    0: "Created",
    1: "HOD Approved",
    2: "Approved",
    3: "Changes Required",
    4: "Updated & Pending",
    "-1": "Rejected by HOD",
    "-2": "Rejected by Admin"
};

export default function Report() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10),
    eventOrganizer: "",
    society: "",  // For Professional Society filter
  });

  // Add state for IEEE societies
  const [showIEEESocieties, setShowIEEESocieties] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Format dates to ensure consistency
      const formattedStartDate = new Date(filters.startDate).toISOString().split('T')[0];
      const formattedEndDate = new Date(filters.endDate).toISOString().split('T')[0];

      const searchFilters = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        filters: {
          'eventData.EventOrganizer': filters.eventOrganizer || undefined,
        }
      };

      // Add society filter if Professional Society is selected
      if (filters.eventOrganizer === "2" && filters.society) {
        searchFilters.filters.dept = filters.society;
      }

      console.log("Frontend sending filters:", searchFilters);
      const response = await fetch("/api/filterEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchFilters)
      });

      const data = await response.json();

      if (response.ok) {
        setEvents(data.events);
        console.log("API Response debug info:", data.debug); // Always show debug info for now
      } else {
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Update the filter change handler to handle organizer dependencies
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      
      // Reset society field when organizer type changes
      if (name === 'eventOrganizer') {
        newFilters.society = '';
        setShowIEEESocieties(false);
      }
      
      // Handle IEEE societies special case
      if (name === 'society' && value === 'IEEE') {
        setShowIEEESocieties(true);
      } else if (name === 'society') {
        setShowIEEESocieties(false);
      }
      
      return newFilters;
    });
  };

  if (status === "loading") {
    return <div className="grid place-items-center h-screen">Loading...</div>;
  }

  if (!session?.user?.userType === "admin") {
    return <div className="grid place-items-center h-screen">Not Authorized</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Events Admin Panel</h1>
      
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">Organizer Type</label>
            <select 
              name="eventOrganizer"
              className="border p-2 rounded w-full"
              value={filters.eventOrganizer}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="2">Professional Society</option>
            </select>
          </div>
          {filters.eventOrganizer === "2" && (
            <div>
              <label className="block">Professional Society</label>
              <select 
                name="society"
                className="border p-2 rounded w-full"
                value={filters.society}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {societies.map((society) => (
                  <option key={society} value={society}>{society}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Event ID</th>
              <th className="p-2 border">Event Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Organizer Type</th>
              <th className="p-2 border">Organized by</th>
              <th className="p-2 border">Date & Time</th>
              <th className="p-2 border">Venue</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="p-2 border">{event.ins_id || '-'}</td>
                <td className="p-2 border">{event.eventData?.EventName || '-'}</td>
                <td className="p-2 border">{event.eventData?.EventType?.eventType || '-'}</td>
                <td className="p-2 border">Professional Society</td>
                <td className="p-2 border">{event.dept || '-'}</td>
                <td className="p-2 border">
                  <div>Start: {event.eventData?.StartTime ? new Date(event.eventData.StartTime).toLocaleDateString() : '-'}</div>
                  <div>End: {event.eventData?.EndTime ? new Date(event.eventData.EndTime).toLocaleDateString() : '-'}</div>
                </td>
                <td className="p-2 border">
                  <div>{event.eventData?.EventVenue || '-'}</div>
                  <div className="text-sm text-gray-500">
                    {event.eventData?.eventVenueAddInfo || ''}
                  </div>
                </td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded ${
                    event.status === 2 ? 'bg-green-100 text-green-800' :
                    event.status === 1 ? 'bg-blue-100 text-blue-800' :
                    event.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                    event.status === 3 ? 'bg-orange-100 text-orange-800' :
                    event.status === 4 ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {statusTypes[event.status] || 'Unknown'}
                  </span>
                </td>
                <td className="p-2 border">
                  <Link
                    href={`/events/${event._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
