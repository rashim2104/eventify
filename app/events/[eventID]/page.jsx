"use client";
"use session";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import Image from "next/image";
import "@/components/CreateForm/Form.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ViewEvent from "@/components/ViewEvent/viewevent";
import {
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
  clubs,
  clubsShort,
} from "@/public/data/data";

export default function EventInfo({ params }) {
  const [eventOrigin, setEventOrigin] = useState("1");
  const [eventSociety, setEventSociety] = useState("");
  const [currSoc, setCurrSoc] = useState("");
  const { data: session, status } = useSession();
  const [eventDetails, setEventDetails] = useState([{ eventData: {} }]);
  const [statusMessage, setStatusMessage] = useState("");
  const [redirectStatus, setRedirectStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [formStep, setFormStep] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEventIdModal, setShowEventIdModal] = useState(false);
  const [suggestedEventId, setSuggestedEventId] = useState("");
  const [customEventId, setCustomEventId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  let email = session?.user?.email;

  // console.log("Const");
  const userType = session?.user?.userType;

  const handleChange = async (event_id, action, customEventId = null) => {
    try {
      const user_id = session?.user?._id;
      const response = await fetch("/api/approveEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id,
          user_id,
          userType,
          action,
          comment: comment,
          customEventId: customEventId, // Make sure we're sending the customEventId
        }),
      });

      if (response.ok) {
        // Handle success
        action === "Approve"
          ? toast.success("Event Approved Successfully")
          : action === "Comment"
          ? toast.success("Event marked for change")
          : action === "ApprovePrinc"
          ? toast.success("Event Forwarded to Principal Successfully")
          : toast.error("Event Rejected Successfully");

        setRedirectStatus(true);
      } else {
        // Handle error
        toast.error("Failed to approve event");
        setRedirectStatus(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setRedirectStatus(false);
    }
  };

  const generateEventId = async () => {
    try {
      const response = await fetch("/api/generateEventId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: eventDetails[0].user_id,
          dept: eventDetails[0].dept,
          college: eventDetails[0].eventCollege,
        }),
      });
      const data = await response.json();
      setSuggestedEventId(data.eventId);
      setCustomEventId(data.eventId);
      setShowEventIdModal(true);
    } catch (error) {
      console.error("Error generating event ID:", error);
      toast.error("Failed to generate event ID");
    }
  };

  const handleApproveWithEventId = () => {
    if (!customEventId.trim()) {
      toast.error("Event ID cannot be empty");
      return;
    }
    // Pass the customEventId directly
    handleChange(eventDetails[0]._id, "Approve", customEventId);
    setShowEventIdModal(false);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (redirectStatus) router.replace("/approve");
      // Only run getEvents() when the session is resolved (status is not 'loading')
      else if (status === "authenticated" || status === "unauthenticated") {
        const eventId = params.eventID;
        // const dept = session?.user?.dept;
        const userType = session?.user?.userType;
        try {
          const response = await fetch("/api/eventDetails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId,
              userType,
            }),
          });
          const data = await response.json();
          if (
            data.message &&
            data.message.length > 0 &&
            data.message !== "An error occurred while fetching data."
          ) {
            setEventDetails(data.message);
            setStatusMessage("");
          } else {
            setStatusMessage("Error fetching details.");
            setEventDetails([]);
          }
        } catch (error) {
          console.error("Error:", error);
          setStatusMessage("Error fetching details.");
          setEventDetails([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status, redirectStatus]);

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold">
        Loading...
      </div>
    );
  }
  const currUser = session?.user?.userType;
  if (currUser === "student") {
    return (
      <h1 className="grid place-items-center h-screen text-7xl text-red-600	font-extrabold">
        Not Authorized !!
      </h1>
    );
  }
  return (
    <>
      <div>
        <div>
          {eventDetails.length != 0 ? (
            <div className="flex flex-col items-left gap-3">
              {!loading && (
                <>
                  <ViewEvent
                    eventData={eventDetails[0].eventData}
                    dept={eventDetails[0].dept}
                    data={eventDetails[0]}
                  />
                </>
              )}
              {(email === "principal@sairamit.edu.in" ||
                email === "principal@sairam.edu.in") &&
                eventDetails[0].status == 5 && (
                  <>
                    <div className="flex gap-3 bg-white justify-center rounded-xl border-2 border-black-400 p-4">
                      <button
                        className="text-white bg-green-500 font-xl hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800 cursor-pointer"
                        onClick={() =>
                          handleChange(eventDetails[0]._id, "Approve")
                        }
                      >
                        Approve
                      </button>
                    </div>
                  </>
                )}
              {((userType === "HOD" && eventDetails[0].status == 0) ||
                (userType === "admin" && eventDetails[0].status == 1)) && (
                <div className="flex gap-3 bg-white justify-center rounded-xl border-2 border-black-400 p-4">
                  <button
                    className="text-white bg-green-500 font-xl hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800 cursor-pointer"
                    onClick={() => {
                      if (userType === "admin") {
                        const approvalNeeded = window.prompt(
                          "Does this event need principal's approval? (yes/no)"
                        );
                        if (approvalNeeded?.toLowerCase() === "yes") {
                          handleChange(eventDetails[0]._id, "ApprovePrinc");
                        } else {
                          generateEventId();
                        }
                      } else {
                        handleChange(eventDetails[0]._id, "Approve");
                      }
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="text-white bg-red-500 font-xl hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-800 cursor-pointer"
                    onClick={() => handleChange(eventDetails[0]._id, "Reject")}
                  >
                    Reject
                  </button>
                  <button
                    className="text-white bg-yellow-400 font-xl hover:text-white border border-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-500 dark:text-yellow-500 dark:hover:text-white dark:hover:bg-yellow-600 dark:focus:ring-yellow-800 cursor-pointer"
                    type="button"
                    onClick={() => setShowModal(true)}
                  >
                    Mark for Change
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>No event details available.</p>
          )}
        </div>
      </div>
      {/* Moved closing parenthesis for the div containing the event details map function to the end */}
      {showModal ? (
        <div>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="relative p-6 flex-auto">
                  <label htmlFor="">Add a Comment</label>
                  <textarea
                    className="my-4 text-blueGray-500 text-lg leading-relaxed w-full h-40 outline rounded"
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex items-center justify-end p-6  rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      handleChange(eventDetails[0]._id, "Comment");
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </div>
      ) : (
        <p></p>
      )}
      {showEventIdModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <h3 className="text-lg font-bold mb-4">Event ID Confirmation</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Event ID:
                  </label>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={customEventId}
                        onChange={(e) => setCustomEventId(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 p-2 bg-gray-50 rounded border">
                        {customEventId}
                      </div>
                    )}
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    >
                      {isEditing ? (
                        <span>Done</span>
                      ) : (
                        <span>Edit</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowEventIdModal(false);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleApproveWithEventId();
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Confirm & Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
