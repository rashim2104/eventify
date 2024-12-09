import { useState } from "react";
import React, { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Image from "next/image";
import "./Form.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
  clubs,
  clubsShort,
} from "@/public/data/data";
import Calven from "../Calendar/calven";

function Form() {
  const [eventOrigin, setEventOrigin] = useState("1");
  const [eventSociety, setEventSociety] = useState("");
  const [currSoc, setCurrSoc] = useState("");
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState({ poster: "", sanctionLetter: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const [venueList, setVenueList] = useState([]);
  const [userVenue, setUserVenue] = useState("");
  const {
    watch,
    handleSubmit,
    control,
    register,
    formState: { errors, isValid },
    getValues,
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      eventSponsors: [
        {
          name: "",
          address: "",
        },
      ],
      eventCoordinators: [
        {
          coordinatorName: "",
          coordinatorMail: "",
          coordinatorPhone: "",
          coordinatorRole: "",
          staffId: "",
          fetched: false, // Add fetched state
        },
      ],
      eventResourcePerson: [
        {
          ResourcePersonName: "",
          ResourcePersonMail: "",
          ResourcePersonPhone: "",
          ResourcePersonDesgn: "",
          ResourcePersonAddr: "",
        },
      ],
    },
  });

  // Initialize state variables
  const [formStep, setFormStep] = useState(0);
  const [fetchedCoordinators, setFetchedCoordinators] = useState([]); // Track which coordinators have been fetched

  // Function to proceed to the next form step
  const completeFormStep = () => {
    setFormStep((curr) => curr + 1);
  };

  // Options for a dropdown or other selection element
  const options = [
    {
      index: 0,
      value: "Internal Stakeholders",
      label: "Internal Stakeholders",
    },
    {
      index: 1,
      value: "External Stakeholders",
      label: "External Stakeholders",
    },
    {
      index: 2,
      value: "International Stakeholders",
      label: "International Stakeholders",
    },
  ];

  // Initialize useFieldArray hooks for various form sections
  const {
    fields: coordinatorfields,
    append: coordinatorappend,
    remove: coordinatorremove,
  } = useFieldArray({
    name: "eventCoordinators",
    control,
  });

  const {
    fields: resourcepersonfields,
    append: resourcepersonappend,
    remove: resourcepersonremove,
  } = useFieldArray({
    name: "eventResourcePerson",
    control,
  });

  const {
    fields: sponsorfield,
    append: sponsorappend,
    remove: sponsorremove,
  } = useFieldArray({
    name: "eventSponsors",
    control,
  });

  // Watch specific form fields
  const isEventVenueOnline = watch("EventVenue");
  const isEventVenueOffCampus = watch("eventLocation");
  const isSponsored = watch("isSponsored");

  // Function to fetch staff details based on staff ID
  const fetchStaffDetails = async (index) => {
    const staffId = getValues(`eventCoordinators.${index}.staffId`);
    try {
      const response = await fetch("api/fetchStaff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staffId }),
      });

      const data = await response.json();

      if (response.ok) {
        setValue(
          `eventCoordinators.${index}.coordinatorName`,
          data.staff.name,
          {
            shouldValidate: true,
          }
        );
        setValue(
          `eventCoordinators.${index}.coordinatorMail`,
          data.staff.email,
          { shouldValidate: true }
        );
        setValue(
          `eventCoordinators.${index}.coordinatorPhone`,
          data.staff.phone,
          { shouldValidate: true }
        );
        setValue(
          `eventCoordinators.${index}.coordinatorRole`,
          data.staff.role,
          {
            shouldValidate: true,
          }
        );
        setValue(`eventCoordinators.${index}.fetched`, true, {
          shouldValidate: true,
        }); // Set fetched to true
        setFetchedCoordinators((prev) => [...prev, index]); // Update fetched state

        // Trigger validation for the updated fields
        trigger(`eventCoordinators.${index}.coordinatorName`);
        trigger(`eventCoordinators.${index}.coordinatorMail`);
        trigger(`eventCoordinators.${index}.coordinatorPhone`);
        trigger(`eventCoordinators.${index}.coordinatorRole`);
      } else {
        toast.error("Invalid Staff ID. Please enter a valid ID.");
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
    }
  };

  // Function to reset coordinator fields
  const resetCoordinatorFields = () => {
    coordinatorfields.forEach((_, index) => {
      setValue(`eventCoordinators.${index}.staffId`, "");
      setValue(`eventCoordinators.${index}.fetched`, false);
    });
  };

  // Function to handle form reset
  const resetForm = () => {
    reset();
    resetCoordinatorFields(); // Reset coordinator fields when form is reset
  };
  const handleFileChange = (e) => {
    e.preventDefault();
    setFile(null);
    let fileType = "";
    let file;
    if (e.target.files[0]) {
      file = e.target.files[0];
      fileType = file.type;
    }
    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    const validFileTypes = [...validImageTypes, "application/pdf"];
    if (file && validFileTypes.includes(fileType) && file.size <= 5000000) {
      setFile(file);
    } else {
      toast.error("Please select an image or PDF file under 5MB.");
    }
  };
  const handleUpload = async (e, action) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        if (action === "poster") {
          setFileUrl((prevState) => ({ ...prevState, poster: data.message }));
        } else if (action === "sanctionLetter") {
          setFileUrl((prevState) => ({
            ...prevState,
            sanctionLetter: data.message,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  // Git FIx

  const handleDelete = async (e, action) => {
    e.preventDefault();
    const formData = new FormData();
    let fileName = "";
    if (action === "poster") {
      fileName = fileUrl.poster.replace(
        "https://eventifys3.s3.ap-south-1.amazonaws.com/",
        ""
      );
    } else if (action === "sanctionLetter") {
      fileName = fileUrl.sanctionLetter.replace(
        "https://eventifys3.s3.ap-south-1.amazonaws.com/",
        ""
      );
    }
    formData.append("fileName", fileName);
    try {
      const response = await fetch("/api/s3-delete", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        if (action === "poster") {
          setFileUrl((prevState) => ({ ...prevState, poster: "" }));
        } else if (action === "sanctionLetter") {
          setFileUrl((prevState) => ({ ...prevState, sanctionLetter: "" }));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleVenueChange = (venue, userVenueValue) => {
    if (venue.length === 0 && userVenueValue === "") {
      toast.error("Please select venue");
      return;
    }
    const transformedData = venue.map((item) => ({
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

  const submitForm = async (eventData) => {
    setIsSubmitting(true);

    // Remove unwanted fields from eventCoordinators
    const filteredEventCoordinators = eventData.eventCoordinators.map(
      ({ staffId, fetched, ...rest }) => rest
    );

    // Update eventData with filtered eventCoordinators
    eventData = {
      ...eventData,
      eventCoordinators: filteredEventCoordinators,
      fileUrl,
      venueList,
      eventVenueAddInfo: getValues("eventVenueAddInfo"),
      isResourcePerson: hasResourcePersons,
    };

    const user_id = session?.user?._id;
    let dept = "";
    let college = session?.user?.college;
    console.log(college);

    // Existing logic for dept and college determination
    if (eventData.dept === "SBIT") {
      dept = college === "SIT" ? "SBIT" : "SBEC";
    }
    if (eventOrigin == 1 || eventOrigin == 5) {
      dept = session?.user?.dept;
    } else if (eventOrigin == 2) {
      if (eventSociety === "IEEE" || EventOrganizer === "4") {
        dept = currSoc;
        college = "common";
        console.log(2, "IEEE");
      } else {
        dept = eventSociety;
        college = "common";
        console.log(2, "Other");
      }
    } else if (eventOrigin == 3) {
      dept = eventSociety;
      college = "common";
      console.log(3);
    } else if (eventOrigin == 4) {
      dept = currSoc;
      college = "common";
      console.log(4);
    }

    const userType = session?.user?.userType;
    const status = await fetch("/api/createEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        dept,
        userType,
        eventData,
        college,
      }),
    });

    if (status.ok) {
      completeFormStep();
      toast.success("Event Created Successfully!");
      router.replace("/create");
    } else {
      const data = await status.json();
      if (data.message.startsWith("Invalid data")) {
        toast.error(
          String(data.message).replace("Invalid data:", "").replace(/\"/g, "")
        );
      } else {
        toast.error("Error in creating event");
      }
    }
    setIsSubmitting(false);
  };

  const prevForm = () => {
    setFormStep((curr) => curr - 1);
  };
  const eventVenueAddInfo = watch("eventVenueAddInfo");

  useEffect(() => {
    console.log(getValues("eventVenueAddInfo"));
  }, [eventVenueAddInfo]);

  const [hasResourcePersons, setHasResourcePersons] = useState(null);

  // Function to handle the yes/no question
  const handleResourcePersonQuestion = (e) => {
    const value = e.target.value === "yes";
    setHasResourcePersons(value);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="form">
      {formStep < 5 && (
        <div className="status-panel">
          {formStep >= 1 && (
            <button
              className="prevButton btn-style"
              id="preBtn"
              type="button"
              onClick={prevForm}
            >
              <Image
                src="/assets/icons/back.svg"
                width={15}
                height={15}
                alt="back"
              />
            </button>
          )}
          <div className="progress-box">
            Step {formStep + 1} of 5
            <progress
              id="step"
              value={(formStep + 1) * 20}
              max="100"
            ></progress>
          </div>
        </div>
      )}
      {formStep === 0 && (
        <section className="first">
          <h1 className="form-section-title">Basic Details</h1>
          <div className="input-container">
            <Controller
              name="EventOrganizer"
              control={control}
              defaultValue={1}
              rules={{ required: true }}
              render={({ field }) => (
                <div className="space-box">
                  <label htmlFor="eventOrganizer">Event Organizer </label>
                  <select {...field} className="round">
                    <option value="" disabled selected>
                      Select an option
                    </option>
                    <option value="1">Department</option>
                    <option value="5">AICTE Idea Lab</option>
                    <option value="2">
                      Professional Societies (IEEE,ISTE,EDS)
                    </option>
                    <option value="3">Clubs and Cells</option>
                    <option value="4">Other</option>
                  </select>

                  {setEventOrigin(field.value)}

                  {field.value == 2 && (
                    <div>
                      <div>
                        <select
                          {...field}
                          value={eventSociety}
                          onChange={(e) => {
                            setEventSociety(e.target.value);
                          }}
                          className="round"
                        >
                          <option value="" disabled selected>
                            Select an Option
                          </option>
                          {societies.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  {eventOrigin == 2 &&
                    (eventSociety === "IEEE" ||
                      ieeeSocieties.includes(eventSociety)) && (
                      <div>
                        <select
                          value={currSoc}
                          onChange={(e) => setCurrSoc(e.target.value)}
                          className="round"
                        >
                          <option value="" disabled>
                            Select an Option
                          </option>
                          {ieeeSocieties.map((option, index) => (
                            <option
                              key={index}
                              value={ieeeSocietiesShort[index]}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  {field.value == 3 && (
                    <div>
                      <select
                        {...field}
                        value={eventSociety}
                        onChange={(e) => {
                          setEventSociety(e.target.value);
                        }}
                        className="round"
                      >
                        <option value="" disabled selected>
                          Select an Option
                        </option>
                        {clubs.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {field.value == 4 && (
                    <div>
                      <label className="w-full">
                        <input
                          className="other-input mt-6 border-0.5 border-black"
                          placeholder="Please specify"
                          required
                          onChange={(e) => setCurrSoc(e.target.value)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
          <div className="input-container">
            <label htmlFor="EventName" className="label">
              Event Name
            </label>
            <input
              type="text"
              id="EventName"
              placeholder="Enter The Name Of The Event"
              name="EventName"
              {...register("EventName", { required: true })}
            />
            <p className="error-msg">
              {errors.EventName && <span>*This field is required</span>}
            </p>
          </div>

          <div>
            <Controller
              name="EventType.eventType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div className="space-box">
                  <label htmlFor="eventType">Event Type </label>
                  <select {...field} className="round">
                    <option disabled selected value="">
                      Select an option
                    </option>
                    <option value="Workshop">Workshop</option>
                    <option value="FDP">FDP</option>
                    <option value="Bootcamp">BootCamp</option>
                    <option value="Conference">Conference</option>
                    <option value="other">Other</option>
                  </select>
                  {field.value === "other" && (
                    <div className="input-container">
                      <br />
                      <label>
                        <input
                          type="text"
                          className="other-input"
                          placeholder="Please specify"
                          {...register("EventType.eventTypeOtherOption", {
                            required: true,
                          })}
                        />
                      </label>
                      <p className="error-msg">
                        {errors.EventType &&
                          errors.EventType.eventTypeOtherOption && (
                            <span>*This field is required</span>
                          )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <div className="text-area">
            <label htmlFor="EventObj">Objective of the Event</label>
            <textarea
              {...register("EventObjective", { required: true })}
              placeholder="Enter the objective"
            ></textarea>
            <p className="error-msg">
              {errors.EventObjective && <span>*This field is required</span>}
            </p>
          </div>

          <div className="input-container">
            <label htmlFor="EventName" className="label">
              Expected Number of Participants
            </label>
            <input
              type="number"
              id="EventParticipants"
              placeholder="Enter expected number of participants"
              name="EventParticipants"
              {...register("EventParticipants", { required: true, min: 0 })}
            />
            <p className="error-msg">
              {errors.EventParticipants && <span>*This field is required</span>}
            </p>
          </div>

          <div className="input-container">
            <label className="label">Event Venue</label>
            <div className="mt-4 flex flex-col gap-3 items-start">
              <label htmlFor="EventVenueOnline" className="flex gap-3">
                <input
                  type="radio"
                  id="EventVenueOnline"
                  value="online"
                  name="EventVenue"
                  {...register("EventVenue", { required: true })}
                />
                Online
              </label>
              <label htmlFor="EventVenueOffline" className="flex gap-3">
                <input
                  type="radio"
                  id="EventVenueOffline"
                  value="offline"
                  name="EventVenue"
                  {...register("EventVenue", { required: true })}
                />
                Offline
              </label>
            </div>
            <p className="error-msg">
              {errors.EventVenue && <span>*This field is required</span>}
            </p>
          </div>

          {/* <div>
            <Controller
                name="eventLocation"
                rules={{ required: true }}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="space-box">
                    <label htmlFor="eventLocation">Event Location : </label>
                    <div className="radio-container">
                      <input
                        type="radio"
                        value="On-Campus"
                        onChange={onChange}
                        checked={value === "On-Campus"}
                      />
                      <label>On-Campus</label>
                    </div>
                    <div className="radio-container">
                      <input
                        type="radio"
                        value="Off-Campus"
                        onChange={onChange}
                        checked={value === "Off-Campus"}
                      />
                      <label>Off-Campus</label>
                    </div>
                    <p className="error-msg">
                      {errors.eventLocation && "Please select one"}
                    </p>
                  </div>
                )}
              />
          </div> */}

          <div className="input-container">
            <label className="label">Is Event On-campus?</label>
            <div className="flex flex-col mt-4 gap-3 items-start ">
              <label htmlFor="EventLocationOnCampus" className="flex gap-3">
                <input
                  type="radio"
                  id="EventLocationOnCampus"
                  value="On-Campus"
                  name="eventLocation"
                  {...register("eventLocation", { required: true })}
                />
                Yes
              </label>
              <label htmlFor="EventLocationOffCampus" className="flex gap-3">
                <input
                  type="radio"
                  id="EventLocationOffCampus"
                  value="Off-Campus"
                  name="eventLocation"
                  {...register("eventLocation", { required: true })}
                />
                No
              </label>
            </div>
            <p className="error-msg">
              {errors.eventLocation && <span>*This field is required</span>}
            </p>
          </div>

          <label>Permission Letter: </label>
          {fileUrl.poster === "" && (
            <div>
              <input
                type="file"
                accept="image/*, application/pdf"
                onChange={handleFileChange}
              />
              <button
                className="btn-style"
                type="button"
                disabled={!file || uploading || fileUrl.poster}
                onClick={(e) => handleUpload(e, "poster")}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}

          {fileUrl.poster !== "" && (
            <div>
              <label>File Uploaded Successfully!</label>
              <br />
              {fileUrl.poster.endsWith(".pdf") ? (
                <iframe src={fileUrl.poster} width={450} height={500} />
              ) : (
                <Image
                  height={300}
                  width={300}
                  className="rounded-md"
                  src={fileUrl.poster}
                  alt="poster"
                />
              )}
              <button
                className="mt-2 mb-2 btn-style"
                onClick={(e) => handleDelete(e, "poster")}
              >
                Delete File
              </button>
            </div>
          )}
          <div className="space-box">
            <label>Start Date & Time:</label>
            <input
              name="eventStartDateTime"
              type="datetime-local"
              className="calander"
              {...register("StartTime", { required: true })}
              min={new Date().toISOString().substring(0, 16)}
            />
            <p className="error-msg">
              {errors.StartTime && <span>*This field is required</span>}
            </p>
          </div>

          <div className="space-box">
            <label>End Date & Time:</label>
            <input
              name="eventEndDateTime"
              type="datetime-local"
              className="calander"
              {...register("EndTime", {
                required: true,
                validate: {
                  isAfterStartTime: (value) =>
                    new Date(value) > new Date(getValues("StartTime")) ||
                    "End time must be after start time",
                },
              })}
              min={new Date().toISOString().substring(0, 16)}
            />
            <p className="error-msg">
              {errors.EndTime && <span>{errors.EndTime.message}</span>}
            </p>
          </div>

          <div
            className="input-container"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label htmlFor="EventDuration" className="label">
              Event Duration (in hours)
            </label>
            <input
              type="number"
              id="EventDuration"
              name="EventDuration"
              placeholder="Enter The Duration Of The Event"
              className="input"
              {...register("EventDuration", { required: true, min: 1 })}
              min={0}
            />
            <p className="error-msg">
              {errors.EventDuration && <span>*Invalid Event Duration</span>}
            </p>
          </div>

          <button
            disabled={!isValid || fileUrl.poster === ""}
            onClick={completeFormStep}
            type="button"
            className="btn btn-style"
          >
            Next
          </button>
        </section>
      )}
      {formStep === 1 && (
        <section>
          <div>
            {isEventVenueOnline === "offline" &&
            isEventVenueOffCampus === "On-Campus" ? (
              <Calven
                handleVenueChange={handleVenueChange}
                startDate={getValues("StartTime")}
                endDate={getValues("EndTime")}
              />
            ) : (
              <>
                <div className="input-container mb-3">
                  <label htmlFor="eventVenueAddInfo" className="label">
                    Event Venue
                  </label>
                  <input
                    type="text"
                    id="eventVenueAddInfo"
                    placeholder="Enter The Event Venue"
                    name="eventVenueAddInfo"
                    {...register("eventVenueAddInfo", { required: true })}
                  />
                  <p className="error-msg">
                    {errors.eventVenueAddInfo && (
                      <span>*This field is required</span>
                    )}
                  </p>
                </div>
                <button
                  disabled={!isValid}
                  onClick={completeFormStep}
                  type="button"
                  className="btn btn-style"
                >
                  Next
                </button>
              </>
            )}
          </div>
        </section>
      )}
      {formStep === 2 && (
        <section>
          <h1 className="form-section-title">Coordinator Details</h1>

          {coordinatorfields.map((field, index) => {
            const isFetched = watch(`eventCoordinators.${index}.fetched`);

            return (
              <div className="card" key={field.id}>
                <h4 style={{ color: "#bbb" }}>Coordinator {index + 1}</h4>

                {/* Conditionally render the Staff ID field and fetch button */}
                {!isFetched && (
                  <>
                    <div className="input-container">
                      <label htmlFor={`StaffId-${index}`} className="label">
                        Staff ID Number
                      </label>
                      <input
                        type="text"
                        id={`StaffId-${index}`}
                        name={`StaffId-${index}`}
                        placeholder="Enter the Staff ID Number"
                        {...register(`eventCoordinators.${index}.staffId`, {
                          pattern: {
                            message:
                              "Invalid Staff ID. Please enter a valid number.",
                          },
                        })}
                      />
                      <p className="error-msg">
                        {errors.eventCoordinators &&
                          errors.eventCoordinators[index] &&
                          errors.eventCoordinators[index].staffId && (
                            <span>
                              {errors.eventCoordinators[index].staffId.message}
                            </span>
                          )}
                      </p>
                      <button
                        type="button"
                        className="btn-style"
                        onClick={() => fetchStaffDetails(index)}
                      >
                        Get Staff Details
                      </button>
                    </div>
                  </>
                )}

                {/* Coordinator Name Field */}
                <div className="input-container">
                  <label htmlFor={`CoordinatorName-${index}`} className="label">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    id={`CoordinatorName-${index}`}
                    name={`CoordinatorName-${index}`}
                    placeholder="Enter The Name Of The Coordinator"
                    {...register(`eventCoordinators.${index}.coordinatorName`, {
                      required: "Coordinator Name is required",
                      pattern: {
                        value: /^[A-Za-z\s.]+$/,
                        message:
                          "Invalid name. Please enter a valid name without any special characters or numbers.",
                      },
                    })}
                  />
                  <p className="error-msg">
                    {errors.eventCoordinators &&
                      errors.eventCoordinators[index] &&
                      errors.eventCoordinators[index].coordinatorName && (
                        <span>
                          {
                            errors.eventCoordinators[index].coordinatorName
                              .message
                          }
                        </span>
                      )}
                  </p>
                </div>

                {/* Coordinator E-mail Field */}
                <div className="input-container">
                  <label htmlFor={`CoordinatorMail-${index}`} className="label">
                    Coordinator E-mail
                  </label>
                  <input
                    type="email"
                    id={`CoordinatorMail-${index}`}
                    name={`CoordinatorMail-${index}`}
                    placeholder="Enter The Mail Of The Coordinator"
                    {...register(`eventCoordinators.${index}.coordinatorMail`, {
                      required: "Coordinator Mail is required",
                      pattern: /^\S+@\S+$/i,
                    })}
                  />
                  <p className="error-msg">
                    {errors.eventCoordinators &&
                      errors.eventCoordinators[index] &&
                      errors.eventCoordinators[index].coordinatorMail && (
                        <span>
                          {
                            errors.eventCoordinators[index].coordinatorMail
                              .message
                          }
                        </span>
                      )}
                  </p>
                </div>

                {/* Coordinator Phone Field */}
                <div className="input-container">
                  <label
                    htmlFor={`CoordinatorPhone-${index}`}
                    className="label"
                  >
                    Coordinator Phone
                  </label>
                  <input
                    type="tel"
                    id={`CoordinatorPhone-${index}`}
                    name={`CoordinatorPhone-${index}`}
                    placeholder="Enter The No. Of The Coordinator"
                    {...register(
                      `eventCoordinators.${index}.coordinatorPhone`,
                      {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: "Invalid phone number",
                        },
                      }
                    )}
                  />
                  <p className="error-msg">
                    {errors.eventCoordinators &&
                      errors.eventCoordinators[index] &&
                      errors.eventCoordinators[index].coordinatorPhone && (
                        <span>
                          {
                            errors.eventCoordinators[index].coordinatorPhone
                              .message
                          }
                        </span>
                      )}
                  </p>
                </div>

                {/* Coordinator Role Field */}
                <div className="input-container">
                  <label htmlFor={`CoordinatorRole-${index}`} className="label">
                    Coordinator Role
                  </label>
                  <input
                    type="text"
                    id={`CoordinatorRole-${index}`}
                    name={`CoordinatorRole-${index}`}
                    placeholder="Enter The Role Of The Coordinator"
                    {...register(`eventCoordinators.${index}.coordinatorRole`, {
                      required: true,
                    })}
                  />
                  <p className="error-msg">
                    {errors.eventCoordinators &&
                      errors.eventCoordinators[index] &&
                      errors.eventCoordinators[index].coordinatorRole && (
                        <span>*This field is required</span>
                      )}
                  </p>
                </div>

                {/* Remove Coordinator Button */}
                {index > 0 && (
                  <button
                    type="button"
                    className="btn-style"
                    onClick={() => {
                      coordinatorremove(index);
                      setFetchedCoordinators((prev) =>
                        prev.filter((id) => id !== index)
                      );
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}

          {/* Buttons Section */}
          <div className="buttons">
            <button
              type="button"
              className="btn-style"
              onClick={() => coordinatorappend({ staffId: "", fetched: false })}
            >
              Add Coordinator
            </button>
            <button type="button" className="btn-style" onClick={resetForm}>
              Reset
            </button>
            <button
              disabled={!isValid}
              onClick={completeFormStep}
              className="btn-style"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {formStep === 3 && (
        <section>
          <h1 className="form-section-title">Resource Person Details</h1>

          {/* Question on whether there are resource persons */}
          <div className="input-container">
            <label htmlFor="hasResourcePersons" className="label">
              Are there any resource persons for the event?
            </label>
            <select
              id="hasResourcePersons"
              name="hasResourcePersons"
              onChange={handleResourcePersonQuestion}
              defaultValue=""
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Conditionally render resource person details if 'Yes' is selected */}
          {hasResourcePersons && (
            <>
              {resourcepersonfields.map((field, index) => (
                <div className="card" key={index}>
                  <h4 style={{ color: "#bbb" }}>Resource Person {index + 1}</h4>

                  {/* Name Field */}
                  <div className="input-container">
                    <label
                      htmlFor={`ResourcePersonName-${index}`}
                      className="label"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id={`ResourcePersonName-${index}`}
                      name={`ResourcePersonName-${index}`}
                      placeholder="Enter The Name Of The ResourcePerson"
                      {...register(
                        `eventResourcePerson.${index}.ResourcePersonName`,
                        {
                          required: "Resource Person name is required",
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message:
                              "Invalid name. Please enter a valid name without any special characters or numbers.",
                          },
                        }
                      )}
                    />
                    <p className="error-msg">
                      {errors.eventResourcePerson &&
                        errors.eventResourcePerson[index] &&
                        errors.eventResourcePerson[index]
                          .ResourcePersonName && (
                          <span>
                            {
                              errors.eventResourcePerson[index]
                                .ResourcePersonName.message
                            }
                          </span>
                        )}
                    </p>
                  </div>

                  {/* E-mail Field */}
                  <div className="input-container">
                    <label
                      htmlFor={`ResourcePersonMail-${index}`}
                      className="label"
                    >
                      E-mail
                    </label>
                    <input
                      type="email"
                      id={`ResourcePersonMail-${index}`}
                      name={`ResourcePersonMail-${index}`}
                      placeholder="Enter The Mail Of The ResourcePerson"
                      {...register(
                        `eventResourcePerson.${index}.ResourcePersonMail`,
                        {
                          required: "Resource Person Mail is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        }
                      )}
                    />
                    <p className="error-msg">
                      {errors.eventResourcePerson &&
                        errors.eventResourcePerson[index] &&
                        errors.eventResourcePerson[index]
                          .ResourcePersonMail && (
                          <span>
                            {
                              errors.eventResourcePerson[index]
                                .ResourcePersonMail.message
                            }
                          </span>
                        )}
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div className="input-container">
                    <label
                      htmlFor={`ResourcePersonPhone-${index}`}
                      className="label"
                    >
                      Phone
                    </label>
                    <input
                      type="number"
                      id={`ResourcePersonPhone-${index}`}
                      name={`ResourcePersonPhone-${index}`}
                      placeholder="Enter The No. Of The ResourcePerson"
                      {...register(
                        `eventResourcePerson.${index}.ResourcePersonPhone`,
                        {
                          required: "Resource Person phone number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Invalid phone number",
                          },
                        }
                      )}
                    />
                    <p className="error-msg">
                      {errors.eventResourcePerson &&
                        errors.eventResourcePerson[index] &&
                        errors.eventResourcePerson[index]
                          .ResourcePersonPhone && (
                          <span>
                            {
                              errors.eventResourcePerson[index]
                                .ResourcePersonPhone.message
                            }
                          </span>
                        )}
                    </p>
                  </div>

                  {/* Designation Field */}
                  <div className="input-container">
                    <label
                      htmlFor={`ResourcePersonDesgn-${index}`}
                      className="label"
                    >
                      Designation
                    </label>
                    <input
                      type="text"
                      id={`ResourcePersonDesgn-${index}`}
                      name={`ResourcePersonDesgn-${index}`}
                      placeholder="Enter The Designation Of The ResourcePerson"
                      {...register(
                        `eventResourcePerson.${index}.ResourcePersonDesgn`,
                        {
                          required: "Designation is Required",
                        }
                      )}
                    />
                    <p className="error-msg">
                      {errors.eventResourcePerson &&
                        errors.eventResourcePerson[index] &&
                        errors.eventResourcePerson[index]
                          .ResourcePersonDesgn && (
                          <span>
                            {
                              errors.eventResourcePerson[index]
                                .ResourcePersonDesgn.message
                            }
                          </span>
                        )}
                    </p>
                  </div>

                  {/* Official Address Field */}
                  <div className="text-area">
                    <label htmlFor={`ResourcePersonAddr-${index}`}>
                      Official Address
                    </label>
                    <textarea
                      id={`ResourcePersonAddr-${index}`}
                      name={`ResourcePersonAddr-${index}`}
                      placeholder="Enter The Official Address Of The ResourcePerson"
                      {...register(
                        `eventResourcePerson.${index}.ResourcePersonAddr`,
                        {
                          required: "Address is Required",
                        }
                      )}
                    ></textarea>
                    <p className="error-msg">
                      {errors.eventResourcePerson &&
                        errors.eventResourcePerson[index] &&
                        errors.eventResourcePerson[index]
                          .ResourcePersonAddr && (
                          <span>
                            {
                              errors.eventResourcePerson[index]
                                .ResourcePersonAddr.message
                            }
                          </span>
                        )}
                    </p>
                  </div>

                  {/* Remove button */}
                  {index > 0 && (
                    <button
                      type="button"
                      id="minus2"
                      className="btn-style"
                      onClick={() => resourcepersonremove(index)}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              {/* Add Resource Person button */}
              <div className="buttons">
                <button
                  className="btn-style"
                  type="button"
                  onClick={() => {
                    resourcepersonappend({});
                  }}
                >
                  Add Resource Person
                </button>
                <button
                  disabled={!isValid} // Enable only if the form is valid
                  onClick={completeFormStep}
                  type="button"
                  className="btn btn-style"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* Show 'Next' button if 'No' is selected */}
          {hasResourcePersons === false && (
            <button
              onClick={completeFormStep}
              type="button"
              className="btn btn-style"
            >
              Next
            </button>
          )}
        </section>
      )}

      {formStep === 4 && (
        <section>
          <h1 className="form-section-title">Budget Details</h1>
          <div>
            <Controller
              name="eventStakeholders"
              control={control}
              defaultValue={[]}
              rules={{ required: true }}
              render={({ field }) => (
                <div>
                  <label className="checkbox-box">Event Stakeholders : </label>
                  {options.map((option) => (
                    <div key={option.index} className="check-box">
                      <label key={option.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={option.value}
                          onChange={(e) => {
                            const { checked, value } = e.target;
                            if (checked) {
                              field.onChange([...field.value, value]);
                            } else {
                              field.onChange(
                                field.value.filter((val) => val !== value)
                              );
                            }
                          }}
                          checked={field.value.includes(option.value)}
                        />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          <div>
            <label>Is the event sponsored?</label>
            <div>
              <label>
                <input
                  type="radio"
                  {...register("isSponsored", { required: true })}
                  value={true}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  {...register("isSponsored", { required: true })}
                  value={false}
                />
                No
              </label>
              <p className="error-msg">
                {errors.isSponsored && <span>*This field is required</span>}
              </p>
            </div>
          </div>

          {isSponsored === "true" && (
            <div>
              <div className="input-container">
                <label htmlFor="Budget" className="label">
                  Budget Rs.
                </label>
                <input
                  type="number"
                  id="Budget"
                  name="Budget"
                  placeholder="Enter The Budget"
                  className="input"
                  {...register("Budget", { required: true, min: 0 })}
                  min={0}
                />
                <p className="error-msg">
                  {errors.Budget && <span>*Invalid Budget</span>}
                </p>
              </div>
              <label>Sponsor(s) Information:</label>
              <br />
              <br></br>
              {sponsorfield.map((sponsor, index) => (
                <div key={index} className="card">
                  <div className="space-box">
                    <h4 style={{ color: "#bbb" }}>Sponsor {index + 1}</h4>
                  </div>
                  <div className="input-container">
                    <label htmlFor="eventSponsor" className="label">
                      Sponsor name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter The Name Of The Sponsor"
                      {...register(`eventSponsors.${index}.name`, {
                        required: "Sponsor name is Required",
                      })}
                    />
                    <p className="error-msg">
                      {errors.eventSponsors &&
                        errors.eventSponsors[index] &&
                        errors.eventSponsors[index].name && (
                          <span>
                            {errors.eventSponsors[index].name.message}
                          </span>
                        )}
                    </p>
                  </div>
                  <br />

                  <div className="text-area">
                    <label htmlFor="SponsorAddr">Sponsor Address</label>
                    <textarea
                      {...register(`eventSponsors.${index}.address`, {
                        required: "Sponsor Address is Required",
                      })}
                    ></textarea>
                    <p className="error-msg">
                      {errors.eventSponsors &&
                        errors.eventSponsors[index] &&
                        errors.eventSponsors[index].address && (
                          <span>
                            {errors.eventSponsors[index].address.message}
                          </span>
                        )}
                    </p>
                  </div>
                  <br />
                  {index >= 0 && (
                    <button
                      type="button"
                      id="minus3"
                      className="btn-style"
                      onClick={() => sponsorremove(index)}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <br />
              <button
                className="btn-style"
                type="button"
                onClick={() => sponsorappend({})}
              >
                Add Sponsor
              </button>
            </div>
          )}
          {isSponsored === "true" && (
            <div>
              <label>Sanction Letter: </label>
              {fileUrl.sanctionLetter === "" && (
                <>
                  <input
                    type="file"
                    accept="image/*, application/pdf"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="btn-style"
                    disabled={!file || uploading || fileUrl.sanctionLetter}
                    onClick={(e) => handleUpload(e, "sanctionLetter")}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </>
              )}
            </div>
          )}
          {isSponsored && fileUrl.sanctionLetter !== "" && (
            <div>
              <label>Sanction Letter Uploaded Successfully!</label>
              <br />
              {fileUrl.sanctionLetter.endsWith(".pdf") ? (
                <iframe src={fileUrl.sanctionLetter} width={450} height={500} />
              ) : (
                <Image
                  height={300}
                  width={300}
                  className="rounded-md"
                  src={fileUrl.sanctionLetter}
                  alt="sanction letter"
                />
              )}
              <button
                className="mt-2 mb-2 btn-style"
                onClick={(e) => handleDelete(e, "sanctionLetter")}
              >
                Delete Letter
              </button>
            </div>
          )}

          <button
            className="btn-style"
            disabled={
              !isValid ||
              isSubmitting ||
              (isSponsored === "true" && fileUrl.sanctionLetter === "")
            }
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </section>
      )}
      {formStep === 5 && (
        <section>
          <h1 className="form-section-title">Congratulations!</h1>
          <h3>Event Created</h3>
        </section>
      )}
    </form>
  );
}

export default Form;
