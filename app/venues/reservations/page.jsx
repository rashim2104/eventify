"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function VenueReservations() {
  const { data: session, status } = useSession();
  const [venues, setVenues] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    venue: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/allVenues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setVenues(data.message);
      }
    } catch (error) {
      toast.error("Error fetching venues");
    }
  };

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/venue/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations);
        toast.success("Reservations fetched successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch reservations");
      }
    } catch (error) {
      toast.error("Error fetching reservations: " + error.message);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    fetchReservations();
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session?.user?.userType !== "admin") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold text-red-600">
        Not Authorized
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Venue Reservations</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Venue</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.venue}
              onChange={(e) =>
                setFilters({ ...filters, venue: e.target.value })
              }
            >
              <option value="">All Venues</option>
              {venues.map((venue) => (
                <option key={venue.venueId} value={venue.venueId}>
                  {venue.venueName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      {reservations.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.venueName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.reservationDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.reservationSession}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.eventName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        reservation
                      )}`}
                    >
                      {getStatusText(reservation)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 bg-white rounded-lg shadow">
          {isLoading ? "Loading..." : "No reservations found. Try adjusting your filters."}
        </div>
      )}
    </div>
  );
}

function getStatusColor(reservation) {
  const now = new Date();
  const reservationDate = new Date(reservation.reservationDate);

  if (reservationDate < now) {
    return "bg-gray-100 text-gray-800";
  } else if (reservationDate.toDateString() === now.toDateString()) {
    return "bg-green-100 text-green-800";
  } else {
    return "bg-blue-100 text-blue-800";
  }
}

function getStatusText(reservation) {
  const now = new Date();
  const reservationDate = new Date(reservation.reservationDate);

  if (reservationDate < now) {
    return "Past";
  } else if (reservationDate.toDateString() === now.toDateString()) {
    return "Ongoing";
  } else {
    return "Upcoming";
  }
}
