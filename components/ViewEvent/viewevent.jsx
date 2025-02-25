'use client';
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import Viewer from 'react-viewer';
import { Worker, Viewer as PDFViewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import * as pdfjs from 'pdfjs-dist';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import "@/components/CreateForm/Form.css";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import {
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
  clubs,
  clubsShort,
} from "@/public/data/data";
import CalvenView from "../Calendar/calvenView";

function ViewEvent(props) {
  const [eventOrigin, setEventOrigin] = useState();
  const [eventSociety, setEventSociety] = useState(props.dept);
  const [currSoc, setCurrSoc] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const { data: session, status } = useSession();
  const statusEvent = props.data.status;
  const comment =
    props.data.comment === "" ? "No Comments" : props.data.comment;
  const [fileUrl, setFileUrl] = useState({ ...props.data.eventData.fileUrl });
  const [tempFileUrl, setTempFileUrl] = useState({
    ...props.data.eventData.fileUrl,
  });
  const [file, setFile] = useState(null);
  const [venueList, setVenueList] = useState(props.data.eventData.venueList);
  const eventVenueAddInfo = props.data.eventData.eventVenueAddInfo;
  const {
    watch,
    handleSubmit,
    control,
    register,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      ...props.eventData,
      StartTime: props.eventData.StartTime
        ? new Date(
          new Date(props.eventData.StartTime).getTime() + 5.5 * 60 * 60 * 1000
        )
          .toISOString()
          .substring(0, 16)
        : "",
      EndTime: props.eventData.EndTime
        ? new Date(
          new Date(props.eventData.EndTime).getTime() + 5.5 * 60 * 60 * 1000
        )
          .toISOString()
          .substring(0, 16)
        : "",
    },
  });
  useEffect(() => {
    if (ieeeSocietiesShort.includes(props.data.dept)) {
      setCurrSoc(props.data.dept);
      setValue("EventOrganizer", 2, true);
      setEventOrigin(2);
      setEventSociety("IEEE");
    }
    if (clubsShort.includes(props.data.dept)) {
      setCurrSoc(props.data.dept);
      setValue("EventOrganizer", 3, true);
      setEventOrigin(3);
      setEventSociety(props.data.dept);
    }
    if (societies.includes(props.data.dept)) {
      setCurrSoc(props.data.dept);
      setValue("EventOrganizer", 2, true);
      setEventOrigin(2);
      setEventSociety(props.data.dept);
    }
    if (props.eventData.EventOrganizer == 4) {
      setCurrSoc(props.data.dept);
    }
    SetVenueSpecs({
      isEventOnCampus:
        props.eventData.eventLocation === "On-Campus" ? true : false,
      isEventOnline: props.eventData.EventVenue === "online" ? true : false,
    });
    // console.log(eventData);
  }, [isValid, errors, props, setValue]);

  useEffect(() => {
    if (props.eventData) {
      setValue("videoLinks", props.eventData.videoLinks || "");
      setValue("amountSpent", props.eventData.amountSpent || "");
    }
  }, [isValid, errors, props, setValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const navbar = document.querySelector('nav');
      const spacer = document.querySelector('.spacer');
      if (navbar && spacer) {
        spacer.style.height = navbar.offsetHeight + 'px';
      }
    }
  }, []);

  const downloadPDF = (blob, filename) => {
    if (typeof window === 'undefined') return;
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const checkImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // Skip validation during server-side rendering
        resolve(true);
        return;
      }
      const tempImg = document.createElement('img');
      tempImg.onload = () => {
        const { width, height } = tempImg;
        resolve(width >= 800 && height >= 400);
      };
      tempImg.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      tempImg.src = URL.createObjectURL(file);
    });
  };

  const generatePDF = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: props.data._id }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Event_Report - ${props.data.ins_id} ${props.data.eventData.EventName}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const [formStep, setFormStep] = useState(0);
  const [hasResourcePersons, setHasResourcePersons] = useState(props.data.eventData.isResourcePerson);
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

  const [venueSpecs, SetVenueSpecs] = useState({
    isEventOnline: false,
    isEventOnCampus: false,
  });
  const isSponsored = watch("isSponsored");

  const handleVenueChange = (venue) => {
    if (venue.length === 0) {
      toast.error("Please select venue");
      return;
    }
    const transformedData = venue.map((item) => ({
      venueId: item.venueId,
      reservationDate: item.date,
      reservationSession: item.session,
      userId: session?.user?._id,
    }));
    setVenueList(transformedData);
    completeFormStep();
  };

  const submitForm = async (eventData) => {
    setIsSubmitting(true);
    const user_id = session?.user?._id;
    let dept = "";
    let college = session?.user?.college;
    eventData = {
      ...eventData,
      fileUrl,
      venueList,
      eventVenueAddInfo,
      EventVenue: venueSpecs.isEventOnline ? "online" : "offline",
      eventLocation: venueSpecs.isEventOnCampus ? "On-Campus" : "Off-Campus",
    };
    if (eventOrigin == 1 || eventOrigin == 5) {
      dept = session?.user?.dept;
    } else if (eventOrigin == 2) {
      if (eventSociety === "IEEE") {
        dept = currSoc;
        college = "common";
      } else {
        dept = eventSociety;
      }
    } else if (eventOrigin == 3) {
      dept = eventSociety;
      college = "common";
    } else if (eventOrigin == 4) {
      dept = currSoc;
    }

    const currStatus = props.data.status;
    const _id = props.data._id;
    const userType = session?.user?.userType;
    const status = await fetch("/api/editEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id,
        user_id,
        dept,
        userType,
        eventData,
        status: currStatus,
        college,
      }),
    });
    if (status.ok) {
      completeFormStep();
      router.replace("/status");
      toast.success("Event Updated Successfully");
    } else {
      toast.error("Error Updating Event!");
    }
    setIsSubmitting(false);
  };

  const prevForm = () => {
    setFormStep((curr) => curr - 1);
  };

  const deleteForm = async () => {
    const _id = props.data._id;

    const response = await fetch("/api/deleteEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id,
      }),
    });

    if (response.ok) {
      toast.success("Event deleted successfully");
      router.replace("/status");
    } else {
      toast.error("Error Deleting Event!");
    }
  };
  const handleFileChange = (e) => {
    e.preventDefault();
    setFile(null);
    let file;
    let fileType;
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
  const handleDelUpload = async (e, action) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("oldFileName", tempFileUrl[action]);
    formData.append("id", props.data._id);
    formData.append("action", action);
    try {
      const response = await fetch("/api/s3-delupload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        // location.reload();
        if (action === "poster") {
          setFileUrl((prevState) => ({ ...prevState, poster: data.message }));
          setTempFileUrl((prevState) => ({
            ...prevState,
            poster: "",
          }));
        } else {
          setFileUrl((prevState) => ({
            ...prevState,
            sanctionLetter: data.message,
          }));
          setTempFileUrl((prevState) => ({
            ...prevState,
            sanctionLetter: "",
          }));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const validateStep0 = () => {
    if (!isValid) {
      const errors = [];
      if (!watch("EventName")) errors.push("Event Name");
      if (!watch("EventType.eventType")) errors.push("Event Type");
      if (!watch("EventObjective")) errors.push("Event Objective");
      if (!watch("EventVenue")) errors.push("Event Venue");
      if (!watch("eventLocation")) errors.push("Event Location");
      if (!watch("StartTime")) errors.push("Start Date & Time");
      if (!watch("EndTime")) errors.push("End Date & Time");
      if (!watch("EventDuration")) errors.push("Event Duration");
      if (fileUrl.poster === "") errors.push("Permission Letter");

      if (errors.length > 0) {
        toast.error(`Please fill in required fields: ${errors.join(", ")}`);
        return false;
      }
    }
    return true;
  };

  const validateStep1 = () => {
    if (!isValid) {
      if (isEventVenueOnline === "offline" && isEventVenueOffCampus === "On-Campus") {
        if (venueList.length === 0) {
          toast.error("Please select at least one venue");
          return false;
        }
      } else if (!eventVenueAddInfo) {
        toast.error("Please provide venue details");
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    if (!isValid) {
      const errors = [];
      const coordinators = watch("eventCoordinators");
      coordinators.forEach((coord, index) => {
        if (!coord.coordinatorName) errors.push(`Coordinator ${index + 1} Name`);
        if (!coord.coordinatorMail) errors.push(`Coordinator ${index + 1} Email`);
        if (!coord.coordinatorPhone) errors.push(`Coordinator ${index + 1} Phone`);
        if (!coord.coordinatorRole) errors.push(`Coordinator ${index + 1} Role`);
      });
      if (errors.length > 0) {
        toast.error(`Please fill in coordinator details: ${errors.join(", ")}`);
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    if (hasResourcePersons === null) {
      toast.error("Please select whether there are resource persons for the event");
      return false;
    }
    if (hasResourcePersons && !isValid) {
      const errors = [];
      resourcepersonfields.forEach((_, index) => {
        const person = watch(`eventResourcePerson.${index}`);
        if (!person.ResourcePersonName) errors.push(`Resource Person ${index + 1} Name`);
        if (!person.ResourcePersonMail) errors.push(`Resource Person ${index + 1} Email`);
        if (!person.ResourcePersonPhone) errors.push(`Resource Person ${index + 1} Phone`);
        if (!person.ResourcePersonDesgn) errors.push(`Resource Person ${index + 1} Designation`);
        if (!person.ResourcePersonAddr) errors.push(`Resource Person ${index + 1} Address`);
      });
      if (errors.length > 0) {
        toast.error(`Please fill in resource person details: ${errors.join(", ")}`);
        return false;
      }
    }
    return true;
  };

  const validateStep4 = () => {
    if (!isValid) {
      const errors = [];
      if (!watch("eventStakeholders") || watch("eventStakeholders").length === 0) {
        errors.push("Event Stakeholders");
      }
      if (!watch("isSponsored")) {
        errors.push("Sponsorship Status");
      }
      if (watch("isSponsored") === "true") {
        if (!watch("Budget")) errors.push("Budget");
        if (fileUrl.sanctionLetter === "") errors.push("Sanction Letter");
        const sponsors = watch("eventSponsors") || [];
        sponsors.forEach((sponsor, index) => {
          if (!sponsor.name) errors.push(`Sponsor ${index + 1} Name`);
          if (!sponsor.address) errors.push(`Sponsor ${index + 1} Address`);
        });
      }
      if (errors.length > 0) {
        toast.error(`Please fill in required fields: ${errors.join(", ")}`);
        return false;
      }
    }
    return true;
  };

  const completeFormStep = () => {
    let isValid = false;
    switch (formStep) {
      case 0:
        isValid = validateStep0();
        break;
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setFormStep((curr) => curr + 1);
      toast.success("Proceeding to next step");
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const zoomPluginInstance = zoomPlugin();

  const [viewerState, setViewerState] = useState({
    visible: false,
    activeImage: null,
    width: 0,
    height: 0
  });

  const [navbarHeight, setNavbarHeight] = useState(0);
  const navRef = useRef(null);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('nav');
      const spacer = document.querySelector('.spacer');
      if (navbar && spacer) {
        const totalHeight = navbar.offsetHeight + spacer.offsetHeight;
        setNavbarHeight(totalHeight);
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, []);

  const handleImageView = (imageUrl) => {
    // Create a temporary HTML image element
    const tempImg = document.createElement('img');
    tempImg.src = imageUrl;
    
    tempImg.onload = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = (window.innerHeight - navbarHeight) * 0.9;
      
      // Calculate dimensions maintaining aspect ratio
      let width = tempImg.naturalWidth;
      let height = tempImg.naturalHeight;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      setViewerState({
        visible: true,
        activeImage: imageUrl,
        width,
        height
      });
    };
  };

  const renderMedia = (url, type) => {
    if (!url) return null;

    if (url.endsWith('.pdf')) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      return (
        <div className="media-container">
          <div className="pdf-container">
            <iframe
              src={googleDocsUrl}
              width="100%"
              height="600"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="image-container">
          <Image
            height={400}
            width={600}
            className="rounded-md cursor-pointer hover:opacity-90 transition-opacity"
            src={url}
            alt={`${type} preview`}
            onClick={() => handleImageView(url)}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} className="form relative">
        <div className="flex absolute top-16 right-10 gap-3">
          {session?.user?._id === props.data.user_id &&
            ((session?.user?.userType === "staff" &&
              (statusEvent === 0 || statusEvent === 3 || statusEvent === 4)) ||
              (session?.user?.userType === "HOD" &&
                (statusEvent === 1 || statusEvent === 4)) ||
              (session?.user?.userType === "admin" && statusEvent === 2)) &&
            formStep !== 5 &&
            new Date(props.data.eventData.EndTime) > new Date() && (
              <div
                className="cursor-pointer bg-[#FE914E] rounded-full w-16 h-16 flex items-center justify-center"
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
                  width={40}
                  height={40}
                  alt="logo"
                />
              </div>
            )}
          <div
            className="cursor-pointer bg-[#FE914E] rounded-full w-16 h-16 flex items-center justify-center"
            onClick={generatePDF}
          >
            <Image
              src={"/assets/images/download.png"}
              width={40}
              height={40}
              alt="logo"
            />
          </div>
          {session?.user?._id === props.data.user_id &&
            ((session?.user?.userType === "staff" && statusEvent === 0) ||
              (session?.user?.userType === "HOD" && statusEvent === 1) ||
              (session?.user?.userType === "admin" && statusEvent === 2)) &&
            formStep != 5 && (
              <div
                className="cursor-pointer bg-[#FE914E] rounded-full w-16 h-16 flex items-center justify-center"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this event?")
                  ) {
                    deleteForm();
                  }
                }}
              >
                <Image
                  src={"/assets/icons/delete.png"}
                  width={40}
                  height={40}
                  alt="logo"
                />
              </div>
            )}
        </div>
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
        {props.data.status !== "" && (
          <div className="status-panel">
            <div className="status-box bg-orange-200 p-2 rounded">
              <h2 className="font-bold">
                {props.data.status == 0
                  ? "Pending"
                  : props.data.status == 1
                    ? "Approved by HOD/Society Incharge/Club Incharge"
                    : props.data.status == 2
                      ? `${props.data.ins_id}`
                      : props.data.status == 3
                        ? "Marked for Change by by HOD/Society Incharge/Club Incharge"
                        : props.data.status == 4
                          ? "Marked for Change by IQAC Member"
                          : props.data.status == 5
                            ? "Principal Approval Pending"
                            : "Rejected"}
              </h2>
            </div>
          </div>
        )}
        {formStep === 0 && (
          <section className="first">
            <h1 className="form-section-title">Basic Details</h1>
            <div className="input-container">
              <label htmlFor="comments">
                {statusEvent === 3
                  ? "Comment by HOD/Society Incharge/Club Incharge"
                  : statusEvent === 4
                    ? "Commented by IQAC Member"
                    : "Comment"}
              </label>
              <input
                disabled
                value={comment}
                className="other-input mt-6 mb-4 border-0.5 border-black"
                type="text"
                id="comments"
              />
              <Controller
                name="EventOrganizer"
                control={control}
                defaultValue={1}
                disabled={!isEdit}
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
                            disabled={!isEdit}
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
                            disabled={!isEdit}
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
                          disabled={!isEdit}
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
                            value={currSoc}
                            disabled={!isEdit}
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
                disabled={!isEdit}
                placeholder="Enter The Name Of The Event"
                name="EventName"
                {...register("EventName", { required: true })}
                required
              // onChange={(e) => alert(e.target.value)}
              />
              <p className="error-msg">
                {errors.EventName && <span>*This field is required</span>}
              </p>
            </div>

            <div>
              <Controller
                name="EventType.eventType"
                disabled={!isEdit}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="space-box">
                    <label htmlFor="eventType">Event Type </label>
                    <select {...field} className="round">
                      <option value="">Select an option</option>
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
                            disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
                min={0}
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
                    disabled={!isEdit}
                    name="EventVenue"
                    checked={venueSpecs.isEventOnline}
                    onChange={() =>
                      SetVenueSpecs((prev) => ({
                        ...prev,
                        isEventOnline: true,
                      }))
                    }
                  />
                  Online
                </label>
                <label htmlFor="EventVenueOffline" className="flex gap-3">
                  <input
                    type="radio"
                    id="EventVenueOffline"
                    value="offline"
                    name="EventVenue"
                    disabled={!isEdit}
                    checked={!venueSpecs.isEventOnline}
                    onChange={() =>
                      SetVenueSpecs((prev) => ({
                        ...prev,
                        isEventOnline: false,
                      }))
                    }
                  />
                  Offline
                </label>
              </div>
              <p className="error-msg">
                {errors.EventVenue && <span>*This field is required</span>}
              </p>
            </div>

            <div className="input-container">
              <label className="label">Is Event On-campus?</label>
              <div className="flex flex-col mt-4 gap-3 items-start ">
                <label htmlFor="EventLocationOnCampus" className="flex gap-3">
                  <input
                    type="radio"
                    id="EventLocationOnCampus"
                    value="On-Campus"
                    name="eventLocation"
                    disabled={!isEdit}
                    checked={venueSpecs.isEventOnCampus}
                    onChange={() =>
                      SetVenueSpecs((prev) => ({
                        ...prev,
                        isEventOnCampus: true,
                      }))
                    }
                  />
                  Yes
                </label>
                <label htmlFor="EventLocationOffCampus" className="flex gap-3">
                  <input
                    type="radio"
                    id="EventLocationOffCampus"
                    value="Off-Campus"
                    name="eventLocation"
                    disabled={!isEdit}
                    checked={!venueSpecs.isEventOnCampus}
                    onChange={() =>
                      SetVenueSpecs((prev) => ({
                        ...prev,
                        isEventOnCampus: false,
                      }))
                    }
                  />
                  No
                </label>
              </div>
              <p className="error-msg">
                {errors.eventLocation && <span>*This field is required</span>}
              </p>
            </div>

            {fileUrl.poster && (
              <div className="media-container">
                <label className="media-label">Permission Letter:</label>
                {renderMedia(fileUrl.poster)}
                {session?.user?._id === props.data.user_id && (
                  <div className="media-actions">
                    <button
                      type="button"
                      disabled={!isEdit}
                      className="btn-style"
                      onClick={() => {
                        setTempFileUrl((prevState) => ({
                          ...prevState,
                          poster: fileUrl.poster,
                        }));
                        setFileUrl((prevState) => ({ ...prevState, poster: "" }));
                      }}
                    >
                      Replace Permission Letter
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Pushing code to git */}
            {fileUrl.poster === "" && renderFileUpload("poster", "Permission Letter")}

            <div className="space-box">
              <label>Start Date & Time:</label>
              <input
                name="eventStartDateTime"
                type="datetime-local"
                className="calander"
                disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
                {...register("EventDuration", { required: true, min: 0 })}
                required
              />
              <p className="error-msg">
                {errors.EventDuration && <span>*This field is required</span>}
              </p>
            </div>

            <button
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
              {venueSpecs.isEventOnCampus && !venueSpecs.isEventOnline ? (
                <CalvenView
                  isEdit={isEdit}
                  eventUser={props.data.user_id}
                  handleVenueChange={handleVenueChange}
                  venueList={props.eventData.venueList}
                  venueAddInfo={props.eventData.eventVenueAddInfo}
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
                      disabled={!isEdit}
                      {...register("eventVenueAddInfo", { required: true })}
                    />
                    <p className="error-msg">
                      {errors.eventVenueAddInfo && (
                        <span>*This field is required</span>
                      )}
                    </p>
                  </div>
                  <button
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
              return (
                <div className="card" key={index}>
                  <h4 style={{ color: "#bbb" }}>Coordinator {index + 1}</h4>
                  <div className="input-container">
                    <label htmlFor="CoordinatorName" className="label">
                      Coordinator Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEdit}
                      id="CoordinatorName"
                      name="CoordinatorName"
                      placeholder="Enter The Name Of The Coordinator"
                      {...register(`eventCoordinators.${index}.coordinatorName`, {
                        required: "Coordinator Name is required",
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message:
                            "Invalid name. Please enter a valid name without any special characters or numbers.",
                        },
                      })}
                      required
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

                  <div className="input-container">
                    <label htmlFor="CoordinatorMail" className="label">
                      Coordinator E-mail
                    </label>
                    <input
                      type="email"
                      id="CoordinatorMail"
                      disabled={!isEdit}
                      name="CoordinatorMail"
                      placeholder="Enter The Mail Of The Coordinator"
                      {...register(`eventCoordinators.${index}.coordinatorMail`, {
                        required: "Coordinator Mail is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email format",
                        },
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

                  <div className="input-container">
                    <label htmlFor="CoordinatorPhone" className="label">
                      Coordinator Phone
                    </label>
                    <input
                      type="tel"
                      id="CoordinatorPhone"
                      name="CoordinatorPhone"
                      disabled={!isEdit}
                      placeholder="Enter The No. Of The Coordinator"
                      {...register(
                        `eventCoordinators.${index}.coordinatorPhone`,
                        {
                          required: "Coordinator Phone is required",
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
                  <div className="input-container">
                    <label htmlFor="CoordinatorRole" className="label">
                      Designation
                    </label>
                    <input
                      type="text"
                      id="CoordinatorRole"
                      name="CoordinatorRole"
                      disabled={!isEdit}
                      placeholder="Enter The Designation Of The Coordinator"
                      {...register(`eventCoordinators.${index}.coordinatorRole`, {
                        required: true,
                      })}
                      required
                    />

                    <p className="error-msg">
                      {errors.CoordinatorRole && (
                        <span>*This field is required</span>
                      )}
                    </p>
                    <br />
                    <br />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      id="minus1"
                      disabled={!isEdit}
                      onClick={() => coordinatorremove(index)}
                    >
                      X
                    </button>
                  )}
                </div>
              );
            })}
            <div className="buttons">
              <button
                type="button"
                className="btn-style"
                id="plus"
                disabled={!isEdit}
                onClick={() => {
                  coordinatorappend({});
                }}
              >
                Add Coordinator
              </button>
              <button
                onClick={completeFormStep}
                type="button"
                className="btn btn-style"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {formStep === 3 && (
          <section>
            <h1 className="form-section-title">Resource Person Details</h1>
            <div className="input-container">
              <label htmlFor="hasResourcePersons" className="label">
                Are there any resource persons for the event?
              </label>
              <select
                id="hasResourcePersons"
                name="hasResourcePersons"
                onChange={(e) => setHasResourcePersons(e.target.value === "yes")}
                defaultValue={props.data.eventData.isResourcePerson ? "yes" : "no"}
                disabled={!isEdit}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hasResourcePersons && (
              <>
                {resourcepersonfields.map((field, index) => {
                  return (
                    <div className="card" key={index}>
                      <h4 style={{ color: "#bbb" }}>Resource Person {index + 1}</h4>
                      <div className="input-container">
                        <input
                          type="text"
                          id="ResourcePersonName"
                          disabled={!isEdit}
                          name="ResourcePersonName"
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
                          required
                        />

                        <p className="error-msg">
                          {errors.eventResourcePerson &&
                            errors.eventResourcePerson[index] &&
                            errors.eventResourcePerson[index].ResourcePersonName && (
                              <span>
                                {
                                  errors.eventResourcePerson[index].ResourcePersonName
                                    .message
                                }
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="input-container">
                        <label htmlFor="ResourcePersonMail" className="label">
                          E-mail
                        </label>
                        <input
                          type="email"
                          id="ResourcePersonMail"
                          disabled={!isEdit}
                          name="ResourcePersonMail"
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
                          required
                        />

                        <p className="error-msg">
                          {errors.eventResourcePerson &&
                            errors.eventResourcePerson[index] &&
                            errors.eventResourcePerson[index].ResourcePersonMail && (
                              <span>
                                {
                                  errors.eventResourcePerson[index].ResourcePersonMail
                                    .message
                                }
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="input-container">
                        <label htmlFor="ResourcePersonPhone" className="label">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="ResourcePersonPhone"
                          disabled={!isEdit}
                          name="ResourcePersonPhone"
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
                          required
                        />

                        <p className="error-msg">
                          {errors.eventResourcePerson &&
                            errors.eventResourcePerson[index] &&
                            errors.eventResourcePerson[index].ResourcePersonPhone && (
                              <span>
                                {
                                  errors.eventResourcePerson[index]
                                    .ResourcePersonPhone.message
                                }
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="input-container">
                        <label htmlFor="ResourcePersonDesgn" className="label">
                          Designation
                        </label>
                        <input
                          type="text"
                          id="ResourcePersonDesgn"
                          disabled={!isEdit}
                          name="ResourcePersonDesgn"
                          placeholder="Enter The Designation Of The ResourcePerson"
                          {...register(
                            `eventResourcePerson.${index}.ResourcePersonDesgn`,
                            { required: "Designation is Required" }
                          )}
                          required
                        />

                        <p className="error-msg">
                          {errors.eventResourcePerson &&
                            errors.eventResourcePerson[index] &&
                            errors.eventResourcePerson[index].ResourcePersonDesgn && (
                              <span>
                                {
                                  errors.eventResourcePerson[index]
                                    .ResourcePersonDesgn.message
                                }
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="text-area">
                        <label htmlFor="textarea">Official Address</label>
                        <textarea
                          {...register(
                            `eventResourcePerson.${index}.ResourcePersonAddr`,
                            { required: "Address is Required" }
                          )}
                          disabled={!isEdit}
                        ></textarea>
                        <p className="error-msg">
                          {errors.eventResourcePerson &&
                            errors.eventResourcePerson[index] &&
                            errors.eventResourcePerson[index].ResourcePersonAddr && (
                              <span>
                                {
                                  errors.eventResourcePerson[index].ResourcePersonAddr
                                    .message
                                }
                              </span>
                            )}
                        </p>
                        <br />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          id="minus2"
                          disabled={!isEdit}
                          onClick={() => resourcepersonremove(index)}
                        >
                          X
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="buttons">
                  <button
                    type="button"
                    disabled={!isEdit}
                    className="btn-style"
                    onClick={() => {
                      resourcepersonappend({});
                    }}
                  >
                    Add Resource Person
                  </button>
                  <button
                    onClick={completeFormStep}
                    type="button"
                    className="btn btn-style"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {!hasResourcePersons && (
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
            {/* <div>
              <Controller
                name="eventLocation"
                disabled={!isEdit}
                rules={{ required: true }}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="space-box">
                    <label htmlFor="eventLocation">Event Location : </label>
                    <div className="radio-container">
                      <input
                        type="radio"
                        disabled={!isEdit}
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
                        disabled={!isEdit}
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
                            disabled={!isEdit}
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
                    disabled={!isEdit}
                    {...register("isSponsored", { required: true })}
                    value={true}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    disabled={!isEdit}
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
                    disabled={!isEdit}
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
                        disabled={!isEdit}
                        placeholder="Enter The Name Of The Sponsor"
                        {...register(`eventSponsors.${index}.name`, {
                          required: "Sponsor name is Required",
                        })}
                        required
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
                        disabled={!isEdit}
                      ></textarea>
                    </div>
                    <br />
                    {index > 0 && (
                      <button
                        type="button"
                        id="minus3"
                        disabled={!isEdit}
                        onClick={() => sponsorremove(index)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <br />
                <button
                  type="button"
                  disabled={!isEdit}
                  onClick={() => {
                    sponsorappend({});
                  }}
                >
                  Add Sponsor
                </button>
              </div>
            )}
            {isSponsored === "true" && fileUrl.sanctionLetter === "" && (
              <div>
                <form>
                  <label>Sanction Letter: </label>
                  <p className="text-sm text-gray-600">Accepted formats: Images or PDF • Max size: 5MB</p>
                  {session.user._id === props.data.user_id && (
                    <>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                      />
                      <button
                        type="button"
                        disabled={!file || uploading || fileUrl.sanctionLetter}
                        onClick={(e) => handleDelUpload(e, "sanctionLetter")}
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                    </>
                  )}
                </form>
              </div>
            )}
            {isSponsored && fileUrl.sanctionLetter !== "" && (
              <div>
                <br />
                <label>Sanction Letter: </label>
                {renderMedia(fileUrl.sanctionLetter)}
                {session.user._id === props.data.user_id && (
                  <>
                    <button
                      type="button"
                      className="mt-2 mb-2 btn-style"
                      disabled={!isEdit}
                      onClick={() => {
                        setTempFileUrl((prevState) => ({
                          ...prevState,
                          sanctionLetter: fileUrl.sanctionLetter,
                        }));
                        setFileUrl((prevState) => ({
                          ...prevState,
                          sanctionLetter: "",
                        }));
                      }}
                    >
                      Replace Letter
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (!validateStep4()) {
                  return;
                }
                submitForm(getValues());
              }}
              className="btn btn-style"
              disabled={isSubmitting || !isEdit}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </section>
        )}
        {/* {true && <button onClick={() => generatePDF()}>Download</button>} */}
      </form>
      <Viewer
        visible={viewerState.visible}
        onClose={() => setViewerState({ visible: false, activeImage: null })}
        images={[{ src: viewerState.activeImage }]}
        zoomable
        scalable
        rotatable
        downloadable
        noNavbar
        className="custom-viewer"
        drag={false}
        noImgDetails
        changeable={false}
        zIndex={1001}
      />
    </>
  );
}

export default ViewEvent;
