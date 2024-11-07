"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function Approve() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Only run getEvents() when the session is resolved (status is not 'loading')
    if (status === "authenticated" || status === "unauthenticated") {
      getEvents();
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold">
        Loading...
      </div>
    );
  }

  const currUser = session?.user?.userType;
  if (currUser === "student" || currUser === "staff") {
    toast.error("Not Authorized");
    redirect("/dashboard");
    return (
      <h1 className="grid place-items-center h-screen text-7xl text-red-600	font-extrabold">
        Not Authorized !!
      </h1>
    );
  }

  async function getEvents() {
    const user_id = session?.user?._id;
    const dept = session?.user?.dept;
    const userType = session?.user?.userType;
    const college = session?.user?.college;

    fetch("/api/fetchApprove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        dept,
        college,
        userType,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message && data.message.length > 0) {
          const currentDate = new Date();
          const futureEvents = data.message.filter(
            (event) => new Date(event.eventData.StartTime) > currentDate
          );

          if (futureEvents.length > 0) {
            setEvents(futureEvents);
            console.log(futureEvents);
            setMessage("");
          } else {
            setMessage("No future events to Approve.");
            setEvents([]);
          }
        } else {
          setMessage("No events to Approve.");
          setEvents([]);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("Error fetching events.");
      });
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="w-full flex gap-5 py-4 flex-wrap">
      {events.length > 0 &&
        events.map((event, index) => (
          <div
            key={index}
            className="rounded-lg pb-4 text-sm shadow  bg-gray-800 text-gray-100 relative overflow-hidden px-8 py-6 mb-3 xl:w-5/12"
          >
            <div>
              <div className="py-2">
                <svg
                  width="314"
                  height="214"
                  viewBox="0 0 314 214"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-0 top-0 z-10"
                >
                  <path
                    d="M174.5 6V-23.5L233 36H204.5C187.931 36 174.5 22.5685 174.5 6Z"
                    fill="#465467"
                  ></path>
                  <path
                    d="M174.5 6V-23.5L116 36H144.5C161.069 36 174.5 22.5685 174.5 6Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M116.5 65.5V36L175 95.5H146.5C129.931 95.5 116.5 82.0685 116.5 65.5Z"
                    fill="#465467"
                  ></path>
                  <path
                    d="M116.5 65.5V36L58 95.5H86.5C103.069 95.5 116.5 82.0685 116.5 65.5Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M59.5 125V95.5L118 155H89.5C72.9315 155 59.5 141.569 59.5 125Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M59.5 125V95.5L1.00003 155H29.5C46.0686 155 59.5 141.569 59.5 125Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M58.5 184.5L58.5 214L-5.20166e-06 154.5L28.5 154.5C45.0685 154.5 58.5 167.931 58.5 184.5Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M58.5 184.5L58.5 214L117 154.5L88.5 154.5C71.9315 154.5 58.5 167.931 58.5 184.5Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M174.5 125V95.5L233 155H204.5C187.931 155 174.5 141.569 174.5 125Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M174.5 125V95.5L116 155H144.5C161.069 155 174.5 141.569 174.5 125Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M173.5 184.5L173.5 214L115 154.5L143.5 154.5C160.069 154.5 173.5 167.931 173.5 184.5Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M173.5 184.5L173.5 214L232 154.5L203.5 154.5C186.931 154.5 173.5 167.931 173.5 184.5Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M289.5 125V95.5L348 155H319.5C302.931 155 289.5 141.569 289.5 125Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M289.5 125V95.5L231 155H259.5C276.069 155 289.5 141.569 289.5 125Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M288.5 184.5L288.5 214L230 154.5L258.5 154.5C275.069 154.5 288.5 167.931 288.5 184.5Z"
                    fill="#151E2C"
                  ></path>
                  <path
                    d="M288.5 184.5L288.5 214L347 154.5L318.5 154.5C301.931 154.5 288.5 167.931 288.5 184.5Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M286.5 6V-23.5L345 36H316.5C299.931 36 286.5 22.5685 286.5 6Z"
                    fill="#465467"
                  ></path>
                  <path
                    d="M286.5 6V-23.5L228 36H256.5C273.069 36 286.5 22.5685 286.5 6Z"
                    fill="#2F3B4B"
                  ></path>
                  <path
                    d="M346.5 66.5V37L288 96.5H316.5C333.069 96.5 346.5 83.0685 346.5 66.5Z"
                    fill="#2F3B4B"
                  ></path>
                  <g opacity="1">
                    <path
                      d="M233 65.5V36L291.5 95.5H263C246.431 95.5 233 82.0685 233 65.5Z"
                      fill="#465467"
                    ></path>
                    <path
                      d="M233 65.5V36L174.5 95.5H203C219.569 95.5 233 82.0685 233 65.5Z"
                      fill="#2F3B4B"
                    ></path>
                  </g>
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-3">
                  <div className="mt-2 grid grid-cols-1 gap-4 z-20">
                    <div>
                      <h1 className="forge-h5 font-bold text-gray-100 text-4xl ">
                        {event.eventData.EventName}
                      </h1>
                    </div>
                    <div className="flex flex-col">
                      <p className="flex gap-1 text-xl">
                        <Image
                          src="/assets/icons/location.png"
                          width={30}
                          height={25}
                          alt=""
                        />
                        {event.eventData.EventVenue}
                      </p>
                    </div>
                    <div className="flex  flex-col">
                      <p className="flex gap-1 text-xl">
                        <Image
                          src="/assets/icons/time.png"
                          width={30}
                          height={25}
                          alt=""
                        />
                        {formatDate(event.eventData.StartTime)}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="flex gap-1 text-xl pb-4">
                        <Image
                          src="/assets/icons/time.png"
                          width={30}
                          height={25}
                          alt=""
                        />
                        {formatDate(event.eventData.EndTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={`${process.env.URL}/events/${event._id}`}
              target="_blank"
              className="hover:text-white"
            >
              <svg
                className="h-8 w-8 white hover:text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </Link>
          </div>
        ))}
      {message && (
        <div style={{ maxWidth: "50vw", wordWrap: "break-word" }}>
          {message}
        </div>
      )}
    </div>
  );
}
