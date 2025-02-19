"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Report() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10),
    eventOrganizer: "",
    college: "",
  });

  const organizerTypes = {
    "1": "Department",
    "2": "Professional Society",
    "3": "Club/Cell",
    "4": "Others",
    "5": "AICTE"
  };

  const postUpdateStatus = {
    0: "Not Updated",
    1: "Pending Review",
    2: "Approved",
    3: "Changes Required"
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending filters:", filters); // Debug outgoing request
      const response = await fetch("/api/filterEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
      });

      const data = await response.json();
      console.log("API Response:", data); // Debug incoming response

      if (response.ok) {
        setEvents(data.events);
        // Add debug info display
        if (process.env.NODE_ENV === 'development') {
          console.log("Debug info:", data.debug);
        }
      } else {
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
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
        <div className="flex gap-4">
          <div>
            <label className="block">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block">Organizer Type</label>
            <select 
              className="border p-2 rounded"
              value={filters.eventOrganizer}
              onChange={(e) => setFilters({...filters, eventOrganizer: e.target.value})}
            >
              <option value="">All</option>
              {Object.entries(organizerTypes).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block">College</label>
            <select 
              className="border p-2 rounded"
              value={filters.college}
              onChange={(e) => setFilters({...filters, college: e.target.value})}
            >
              <option value="">All</option>
              <option value="SIT">SIT</option>
              <option value="SEC">SEC</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Event Name</th>
              <th className="p-2 border">Organizer</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">College</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Post Event Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="p-2 border">{event.eventData.EventName}</td>
                <td className="p-2 border">{organizerTypes[event.eventData.EventOrganizer]}</td>
                <td className="p-2 border">{event.dept}</td>
                <td className="p-2 border">{event.eventCollege}</td>
                <td className="p-2 border">
                  {new Date(event.eventData.StartTime).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded ${
                    event.updateStatus === 0 ? 'bg-red-100 text-red-800' :
                    event.updateStatus === 1 ? 'bg-yellow-100 text-yellow-800' :
                    event.updateStatus === 2 ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {postUpdateStatus[event.updateStatus]}
                  </span>
                </td>
                <td className="p-2 border">
                  <a
                    href={`/events/${event._id}`}
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
