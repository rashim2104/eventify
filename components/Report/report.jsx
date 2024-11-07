"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import viewEvent from "../ViewEvent/viewevent";
import {
  clubsShort,
  clubs,
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
} from "@/public/data/data";

export default function Report() {
  const { data: session, status } = useSession();

  const [eventName, setEventName] = useState("");
  const [department, setDepartment] = useState([]);
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [organizer, setOrganizer] = useState("");

  const [eventStatus, setEventStatus] = useState(["All"]);
  const [eventCollege, setEventCollege] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().substr(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substr(0, 10)
  );
  const [events, setEvents] = useState([]);
  const [currSoc, setCurrSoc] = useState("");

  function handleChange(e) {
    if (e.target.checked) {
      setEventStatus((prevStatus) => [...prevStatus, e.target.value]);
    } else {
      setEventStatus((prevStatus) =>
        prevStatus.filter((status) => status !== e.target.value)
      );
    }
  }

  function handleCollegeChange(e) {
    if (e.target.checked) {
      setEventCollege((prevStatus) => [...prevStatus, e.target.value]);
    } else {
      setEventCollege((prevStatus) =>
        prevStatus.filter((status) => status !== e.target.value)
      );
    }
  }
  // const handleEventNameChange = (e) => {
  //   setEventName(e.target.value);
  //   // Make an API call to fetch events based on the eventName
  //   // You can modify the API endpoint and request payload as per your requirements
  //   fetch("/api/searchEvent", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       eventName: e.target.value,
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => setSearchedEvents(data.events))
  //     .catch((error) => console.error("Error searching events:", error));
  // };

  const handleSearch = async (e, action) => {
    e.preventDefault();
    try {
      let data;
      if (action === "HOD") {
        data = JSON.stringify({
          eventStatus,
          startDate,
          endDate,
        });
      } else {
        data = JSON.stringify({
          organizer,
          department: department === "IEEE" ? currSoc : department,
          eventCollege,
          startDate,
          endDate,
        });
      }
      // Make an API call to fetch events based on the search criteria
      const response = await fetch("/api/filterEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        toast.success("Events fetched successfully");
        setCurrSoc("");
        setOrganizer([]);
        setDepartment("");
        setEventCollege([]);
      }
    } catch (error) {
      console.error("Error searching events:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold">
        Loading...
      </div>
    );
  }

  const currUser = session?.user?.userType;
  if (currUser === "student" || currUser === "staff") {
    return (
      <h1 className="grid place-items-center h-screen text-7xl text-red-600	font-extrabold">
        Not Authorized !!
      </h1>
    );
  }

  return (
    <div>
      <div>
        {currUser === "HOD" ? (
          <div>
            <label className="font-bold">Select Status</label>
            <div className="p-2 m-2 border  flex flex-col">
              <label>
                <input
                  type="checkbox"
                  value="All"
                  checked={eventStatus.includes("All")}
                  onChange={handleChange}
                />
                All
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Created"
                  checked={eventStatus.includes("Created")}
                  onChange={handleChange}
                />
                Created
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Approved"
                  checked={eventStatus.includes("Approved")}
                  onChange={handleChange}
                />
                Approved
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Rejected"
                  checked={eventStatus.includes("Rejected")}
                  onChange={handleChange}
                />
                Rejected
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Marked for change"
                  checked={eventStatus.includes("Marked for change")}
                  onChange={handleChange}
                />
                Marked for change
              </label>
            </div>
            <div className="flex flex-col gap-3 ml-3">
              <label className="flex gap-3">
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    console.log(e.target.value);
                  }}
                />
              </label>
              <label className="flex gap-3">
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <button
              className="px-4 py-2 rounded-full m-3 bg-orange-400 text-white"
              onClick={(e) => handleSearch(e, "HOD")}
            >
              Search
            </button>
            {events.length > 0 ? (
              <ul className="bg-gray-200 border border-gray-800 p-4 flex flex-col gap-2 mt-2 mb-5 rounded md:w-1/2">
                {events.map((event) => (
                  <li
                    key={event._id}
                    className="flex align-middle justify-between"
                  >
                    <span>{event.eventData.EventName}</span>
                    <a
                      target="blank"
                      href={`${process.env.URL}/events/${event._id}`}
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className=" mb-2 mt-3 md:mt-0">No events found</p>
            )}
          </div>
        ) : (
          <div>
            <label className="font-bold">Select Status</label>
            <div className="p-2 m-2 border  flex flex-col">
              <label>
                <input
                  type="checkbox"
                  value={session?.user?.college}
                  checked={eventCollege.includes(session?.user?.college)}
                  onChange={handleCollegeChange}
                />
                {session?.user?.college}
              </label>
              <label>
                <input
                  type="checkbox"
                  value="common"
                  checked={eventCollege.includes("common")}
                  onChange={handleCollegeChange}
                />
                Common
              </label>
            </div>
            <div className="flex flex-col gap-3 ml-3">
              <label className="flex gap-3">
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    console.log(e.target.value);
                  }}
                />
              </label>
              <label className="flex gap-3">
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-col w-1/2 mt-3">
              <label className="font-bold" for="organizer">
                Event Organizer
              </label>
              <select
                value={organizer}
                className="p-2 m-2 border"
                id="organizer"
                onChange={(e) => setOrganizer(e.target.value)}
              >
                <option value="" selected disabled>
                  Select an Option
                </option>
                <option value="department">Department</option>
                <option value="aicte">AICTE Idea Lab</option>
                <option value="professionalsocieties">
                  Professional Societies (IEEE,ISTE,EDS)
                </option>
                <option value="clubs">Clubs and Cells</option>
                <option value="others">Others</option>
              </select>

              {organizer === "department" &&
                session?.user?.college === "SIT" && (
                  <label className="block mb-4">
                    Dept
                    <div className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full">
                      <div>
                        <label>
                          <input
                            type="checkbox"
                            value="all"
                            checked={
                              department.length ===
                              [
                                "CS",
                                "IT",
                                "EE",
                                "EC",
                                "ME",
                                "SC",
                                "CO",
                                "AI",
                                "MB",
                                "PH",
                                "EN",
                                "MA",
                                "CH",
                                "PD",
                                "TA",
                              ].length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDepartment([
                                  "CS",
                                  "IT",
                                  "EE",
                                  "EC",
                                  "ME",
                                  "SC",
                                  "CO",
                                  "AI",
                                  "MB",
                                  "PH",
                                  "EN",
                                  "MA",
                                  "CH",
                                  "PD",
                                  "TA",
                                ]);
                              } else {
                                setDepartment([]);
                              }
                            }}
                          />
                          Select All
                        </label>
                      </div>
                      {/* options */}
                      {[
                        { value: "CS", label: "CSE" },
                        { value: "IT", label: "IT" },
                        { value: "EE", label: "EEE" },
                        { value: "EC", label: "ECE" },
                        { value: "ME", label: "MECH" },
                        { value: "SC", label: "Cyber Security" },
                        { value: "CO", label: "CCE" },
                        { value: "AI", label: "AI-DS" },
                        { value: "MB", label: "MBA" },
                        { value: "PH", label: "Physics" },
                        { value: "EN", label: "English" },
                        { value: "MA", label: "Maths" },
                        { value: "CH", label: "Chemistry" },
                        { value: "PD", label: "Physical Director" },
                        { value: "TA", label: "Tamil" },
                      ].map((option) => (
                        <div key={option.value}>
                          <label>
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={department.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDepartment([
                                    ...department,
                                    e.target.value,
                                  ]);
                                } else {
                                  setDepartment(
                                    department.filter(
                                      (dept) => dept !== e.target.value
                                    )
                                  );
                                }
                              }}
                            />
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </label>
                )}
              {organizer === "department" &&
                session?.user?.college === "SEC" && (
                  <label className="block mb-4">
                    Dept
                    <div className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full">
                      <div>
                        <label>
                          <input
                            type="checkbox"
                            value="all"
                            checked={
                              department.length ===
                              [
                                "AI",
                                "AM",
                                "CB",
                                "CS",
                                "EE",
                                "EC",
                                "EI",
                                "ME",
                                "CE",
                                "IT",
                                "IC",
                                "CI",
                                "MB",
                                "CJ",
                                "PH",
                                "EN",
                                "MA",
                                "CH",
                                "PD",
                                "TA",
                              ].length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDepartment([
                                  "AI",
                                  "AM",
                                  "CB",
                                  "CS",
                                  "EE",
                                  "EC",
                                  "EI",
                                  "ME",
                                  "CE",
                                  "IT",
                                  "IC",
                                  "CI",
                                  "MB",
                                  "CJ",
                                  "PH",
                                  "EN",
                                  "MA",
                                  "CH",
                                  "PD",
                                  "TA",
                                ]);
                              } else {
                                setDepartment([]);
                              }
                            }}
                          />
                          Select All
                        </label>
                      </div>
                      {/* options */}
                      {[
                        { value: "AI", label: "AI-DS" },
                        { value: "AM", label: "AI-ML" },
                        { value: "CB", label: "CSBS" },
                        { value: "CS", label: "CSE" },
                        { value: "EE", label: "EEE" },
                        { value: "EC", label: "ECE" },
                        { value: "EI", label: "E&I" },
                        { value: "ME", label: "MECH" },
                        { value: "CE", label: "CIVIL" },
                        { value: "IT", label: "IT" },
                        { value: "IC", label: "ICE" },
                        { value: "CI", label: "IOT" },
                        { value: "MB", label: "MBA" },
                        { value: "CJ", label: "M.Tech CSE" },
                        { value: "PH", label: "Physics" },
                        { value: "EN", label: "English" },
                        { value: "MA", label: "Maths" },
                        { value: "CH", label: "Chemistry" },
                        { value: "PD", label: "Physical Director" },
                        { value: "TA", label: "Tamil" },
                      ].map((option) => (
                        <div key={option.value}>
                          <label>
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={department.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDepartment([
                                    ...department,
                                    e.target.value,
                                  ]);
                                } else {
                                  setDepartment(
                                    department.filter(
                                      (dept) => dept !== e.target.value
                                    )
                                  );
                                }
                              }}
                            />
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </label>
                )}
              {organizer === "professionalsocieties" && (
                <label className="block mb-4">
                  Professional Societies
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                  >
                    {" "}
                    <option value="" selected disabled>
                      Select a Professional Society
                    </option>
                    {societies.map((society, index) => (
                      <option key={index} value={society}>
                        {society}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {organizer === "professionalsocieties" &&
                (department === "IEEE" ||
                  ieeeSocieties.includes(department)) && (
                  <label className="block mb-4">
                    IEEE Society Name
                    <div className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full">
                      {/* Select All option */}
                      <div>
                        <label>
                          <input
                            type="checkbox"
                            value="all"
                            checked={
                              currSoc.length === ieeeSocietiesShort.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrSoc(ieeeSocietiesShort);
                              } else {
                                setCurrSoc([]);
                              }
                            }}
                          />
                          Select All
                        </label>
                      </div>
                      {/* options */}
                      {ieeeSocieties.map((option, index) => (
                        <div key={index}>
                          <label>
                            <input
                              type="checkbox"
                              value={ieeeSocietiesShort[index]}
                              checked={currSoc.includes(
                                ieeeSocietiesShort[index]
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCurrSoc([...currSoc, e.target.value]);
                                } else {
                                  setCurrSoc(
                                    currSoc.filter(
                                      (soc) => soc !== e.target.value
                                    )
                                  );
                                }
                              }}
                            />
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </label>
                )}
              {organizer === "clubs" && (
                <label className="block mb-4">
                  Clubs
                  <div className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full">
                    {/* Select All option */}
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          value="all"
                          checked={department.length === clubsShort.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDepartment(clubsShort);
                            } else {
                              setDepartment([]);
                            }
                          }}
                        />
                        Select All
                      </label>
                    </div>
                    {/* options */}
                    {clubs.map((club, index) => (
                      <div key={index}>
                        <label>
                          <input
                            type="checkbox"
                            value={clubsShort[index]}
                            checked={department.includes(clubsShort[index])}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDepartment([...department, e.target.value]);
                              } else {
                                setDepartment(
                                  department.filter(
                                    (dept) => dept !== e.target.value
                                  )
                                );
                              }
                            }}
                          />
                          {club}
                        </label>
                      </div>
                    ))}
                  </div>
                </label>
              )}
            </div>
            <button
              className="px-4 py-2 rounded-full m-3 bg-orange-400 text-white"
              onClick={(e) => handleSearch(e, "admin")}
            >
              Search
            </button>
            {events.length > 0 ? (
              <ul className="bg-gray-200 border border-gray-800 p-4 flex flex-col gap-2 mt-2 mb-5 rounded md:w-1/2">
                {events.map((event) => (
                  <li
                    key={event._id}
                    className="flex align-middle justify-between"
                  >
                    <span>{event.eventData.EventName}</span>
                    <a
                      target="blank"
                      href={`${process.env.URL}/events/${event._id}`}
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className=" mb-2 mt-3 md:mt-0">No events found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
