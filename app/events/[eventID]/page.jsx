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
  let email = session?.user?.email;

  // console.log("Const");
  const userType = session?.user?.userType;

  const handleChange = async (event_id, action) => {
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
        console.log("Use Effect");
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
            console.log(data.message);
            setStatusMessage("");
          } else {
            setStatusMessage("Error fetching details.");
            setEventDetails([]);
            console.log(eventDetails);
          }
        } catch (error) {
          console.error("Error:", error);
          setStatusMessage("Error fetching details.");
          setEventDetails([]);
          console.log(eventDetails);
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
                        if (approvalNeeded.toLowerCase() === "yes") {
                          handleChange(eventDetails[0]._id, "ApprovePrinc");
                        } else {
                          handleChange(eventDetails[0]._id, "Approve");
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
    </>
  );
}
