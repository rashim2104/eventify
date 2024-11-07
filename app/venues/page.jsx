"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function Venues() {
  const { data: session, status } = useSession();
  const [venues, setVenues] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/allVenues");
        if (response.ok) {
          const data = await response.json();
          setVenues(data.venues);
        } else {
          toast.error("Error fetching venues");
        }
      } catch (error) {
        toast.error("Error fetching venues");
      }
    };

    fetchVenues();
  }, [isEdit]);

  const handleInputChange = (e, index, field) => {
    const updatedVenues = [...venues];
    updatedVenues[index][field] =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setVenues(updatedVenues);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/editVenues", {
        method: "POST",
        body: JSON.stringify({ venues }),
        headers: {
          "Content-Type": "application/json",
        },
      });
        if (response.ok) {
          setIsEdit(false);
        toast.success("Venues updated successfully");
      } else {
        toast.error("Error updating venues");
      }
    } catch (error) {
      toast.error("Error updating venues");
    }
    setSubmitting(false);
  };

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold">
        Loading...
      </div>
    );
  }

  const isAdmin = session?.user?.userType === "admin";

  const uniqueParentBlocks = [
    ...new Set(venues.map((venue) => venue.parentBlock)),
  ];

  return (
    <div className="bg-gray-200 flex flex-col mt-5 p-12 rounded-xl">
      <div className="flex gap-3 items-center">
        <p className="text-3xl font-bold">Venues</p>
        {venues.length > 0 && (
          <div
            className="cursor-pointer bg-[#FE914E] rounded-full w-12 h-12 flex items-center justify-center"
            onClick={() => {
              setIsEdit((prevIsEdit) => !prevIsEdit);
              toast.info(
                !isEdit
                  ? "You can edit the details now!"
                  : "Editing is disabled."
              );
            }}
          >
            <Image
              src={"/assets/icons/edit.png"}
              width={30}
              height={30}
              alt="Edit"
            />
          </div>
        )}
      </div>
      {venues.length > 0 ? (
        <table className="w-full table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Venue Name</th>
              <th className="px-4 py-2">AC</th>
              <th className="px-4 py-2">Projector</th>
              <th className="px-4 py-2">Seating Capacity</th>
              <th className="px-4 py-2">Parent Block</th>
              <th className="px-4 py-2">Availability</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((venue, index) => (
              <tr key={venue.venueId}>
                <td className="border px-4 py-2">
                  {isEdit ? (
                    <input
                      type="text"
                      value={venue.venueName}
                      onChange={(e) => handleInputChange(e, index, "venueName")}
                      className="p-2 rounded w-full"
                    />
                  ) : (
                    venue.venueName
                  )}
                </td>
                <td className="border px-4 py-2">
                  {isEdit ? (
                    <input
                      type="checkbox"
                      checked={venue.hasAc}
                      onChange={(e) => handleInputChange(e, index, "hasAc")}
                    />
                  ) : venue.hasAc ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>
                <td className="border px-4 py-2">
                  {isEdit ? (
                    <input
                      type="checkbox"
                      checked={venue.hasProjector}
                      onChange={(e) =>
                        handleInputChange(e, index, "hasProjector")
                      }
                    />
                  ) : venue.hasProjector ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>
                <td className="border px-4 py-2">
                  {isEdit ? (
                    <input
                      type="number"
                      value={venue.seatingCapacity}
                      onChange={(e) =>
                        handleInputChange(e, index, "seatingCapacity")
                      }
                      className="p-2 rounded w-full"
                    />
                  ) : (
                    venue.seatingCapacity
                  )}
                </td>
                <td className="border px-4 py-2">
                  {isEdit ? (
                    <select
                      value={venue.parentBlock}
                      onChange={(e) =>
                        handleInputChange(e, index, "parentBlock")
                      }
                      className="p-2 rounded w-full"
                    >
                      {uniqueParentBlocks.map((block) => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  ) : (
                    venue.parentBlock
                  )}
                </td>
                <td className="border px-4 py-2">
                  {isEdit ? (
                    <input
                      type="checkbox"
                      checked={venue.isAvailable}
                      onChange={(e) =>
                        handleInputChange(e, index, "isAvailable")
                      }
                    />
                  ) : venue.isAvailable ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No venues available</p>
      )}
      {isEdit && (
        <button
          className="mt-4 bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Changes"}
        </button>
      )}
    </div>
  );
}