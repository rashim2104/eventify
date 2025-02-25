'use client';
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import "@/components/CreateForm/Form.css";
import { toast } from "sonner";
import Image from "next/image";
import styles from '../ViewEvent/ViewEvent.module.css';
import dynamic from 'next/dynamic';

export default function Update() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState({
    geoPhotos: null,
    financialCommitments: null,
    report: null,
    eventPoster: null,
  });
  const [fileUrl, setFileUrl] = useState({
    geoPhotos: [],
    financialCommitments: "",
    report: "",
    eventPoster: "",
  });
  const [uploading, setUploading] = useState({
    geoPhotos: false,
    financialCommitments: false,
    report: false,
    eventPoster: false,
  });
  const {
    handleSubmit,
    watch,
    control,
    register,
    formState: { errors },
  } = useForm();

  const [eventNames, setEventNames] = useState([]);
  const [displayForm, setDisplayForm] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Function to handle image click
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  // Image Modal Component
  const ImageModal = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={onClose}>
        <div className="relative max-w-4xl max-h-[90vh] p-4">
          <button 
            className="absolute top-4 right-4 text-white text-2xl font-bold z-50 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
            onClick={onClose}
          >
            ×
          </button>
          <Image
            src={imageUrl}
            alt="Preview"
            width={1200}
            height={800}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const navbar = document.querySelector('nav');
      const spacer = document.querySelector('.spacer');
      if (navbar && spacer) {
        spacer.style.height = navbar.offsetHeight + 'px';
      }
    }
  }, []);

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

  const handleFileChange = (e, action) => {
    e.preventDefault();
    switch (action) {
      case "geoPhotos":
        setFile((prevState) => ({ ...prevState, geoPhotos: null }));
        if (
          e.target.files[0] &&
          e.target.files[0].type.startsWith("image/") &&
          e.target.files[0].size <= 5000000
        ) {
          setFile((prevState) => ({ ...prevState, geoPhotos: e.target.files }));
        } else {
          toast.error(
            "Invalid file. Please upload an image file of size less than 5MB."
          );
        }
        break;
      case "financialCommitments":
        setFile((prevState) => ({ ...prevState, financialCommitments: null }));
        if (
          e.target.files[0] &&
          (e.target.files[0].type.startsWith("image/") ||
            e.target.files[0].type === "application/pdf") &&
          e.target.files[0].size <= 5000000
        ) {
          setFile((prevState) => ({
            ...prevState,
            financialCommitments: e.target.files,
          }));
        } else {
          toast.error(
"Invalid file. Please upload an image or PDF file of size less than 5MB."
          );
        }
        break;
      case "report":
        setFile((prevState) => ({ ...prevState, report: null }));
        if (e.target.files[0]) {
          if (
            (e.target.files[0].type.startsWith("image/") ||
              e.target.files[0].type === "application/pdf") &&
            e.target.files[0].size <= 5000000
          ) {
            setFile((prevState) => ({ ...prevState, report: e.target.files }));
          } else {
            toast.error(
              "Invalid file. Please upload an image or PDF file of size less than 5MB."
            );
          }
        }
        break;
      case "eventPoster":
        setFile((prevState) => ({ ...prevState, eventPoster: null }));
        if (
          e.target.files[0] &&
          (e.target.files[0].type.startsWith("image/") ||
            e.target.files[0].type === "application/pdf") &&
          e.target.files[0].size <= 5000000
        ) {
          setFile((prevState) => ({
            ...prevState,
            eventPoster: e.target.files,
          }));
        } else {
          toast.error(
            "Invalid file. Please upload an image or PDF file of size less than 5MB."
          );
        }
        break;
      default:
        toast.info("Invalid action");
    }
  };

  const handleUpload = async (e, action) => {
    e.preventDefault();
    let currFile;
    switch (action) {
      case "geoPhotos":
        currFile = file.geoPhotos;
        break;
      case "financialCommitments":
        currFile = file.financialCommitments;
        break;
      case "report":
        currFile = file.report;
        break;
      case "eventPoster":
        currFile = file.eventPoster;
        break;
      default:
        toast.info("Invalid action");
    }
    if (!currFile) return;

    setUploading((prevState) => ({ ...prevState, [action]: true }));

    const uploadPromises = Array.from(currFile).map(async (currFile) => {
      const formData = new FormData();
      formData.append("file", currFile);
      try {
        const response = await fetch("/api/s3-upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          return data.message; // return the file URL
        }
      } catch (error) {
        console.log(error);
      }
    });

    const fileUrls = await Promise.all(uploadPromises);

    switch (action) {
      case "geoPhotos":
        setFileUrl((prevState) => ({ ...prevState, geoPhotos: fileUrls }));
        break;
      case "financialCommitments":
        setFileUrl((prevState) => ({
          ...prevState,
          financialCommitments: fileUrls[0],
        }));
        break;
      case "report":
        setFileUrl((prevState) => ({ ...prevState, report: fileUrls[0] }));
        break;
      case "eventPoster":
        setFileUrl((prevState) => ({ ...prevState, eventPoster: fileUrls[0] }));
        break;
    }

    setUploading((prevState) => ({ ...prevState, [action]: false }));
  };

  const handleDelete = async (e, action) => {
    e.preventDefault();
    setFile((prevState) => ({ ...prevState, [action]: null }));
    const deleteFile = async (fileName) => {
      const formData = new FormData();
      formData.append("fileName", fileName);

      try {
        const response = await fetch("/api/s3-delete", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to delete file");
        }
      } catch (error) {
        console.log(error);
      }
    };

    switch (action) {
      case "geoPhotos":
        for (const photoUrl of fileUrl.geoPhotos) {
          const fileName = photoUrl.replace(
            "https://eventifys3.s3.ap-south-1.amazonaws.com/",
            ""
          );
          await deleteFile(fileName);
        }
        setFileUrl((prevState) => ({ ...prevState, geoPhotos: [] }));
        break;
      case "financialCommitments":
        const financialFileName = fileUrl.financialCommitments.replace(
          "https://eventifys3.s3.ap-south-1.amazonaws.com/",
          ""
        );
        await deleteFile(financialFileName);
        setFileUrl((prevState) => ({ ...prevState, financialCommitments: "" }));
        break;
      case "report":
        const reportFileName = fileUrl.report.replace(
          "https://eventifys3.s3.ap-south-1.amazonaws.com/",
          ""
        );
        await deleteFile(reportFileName);
        setFileUrl((prevState) => ({ ...prevState, report: "" }));
        break;
      case "eventPoster":
        const posterFileName = fileUrl.eventPoster.replace(
          "https://eventifys3.s3.ap-south-1.amazonaws.com/",
          ""
        );
        await deleteFile(posterFileName);
        setFileUrl((prevState) => ({ ...prevState, eventPoster: "" }));
        break;
      default:
        console.error("Invalid action");
    }

    setUploading(false);
  };

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
    return (
      <div>
        <div className={styles['image-container']}>
          <Image
            height={400}
            width={600}
            className="rounded-md cursor-pointer hover:opacity-90 transition-opacity"
            src={url}
            alt={`${type} preview`}
            onClick={() => handleImageClick(url)}
          />
        </div>
      </div>
    );
  };

  const renderFileUpload = (type, label) => {
    return (
      <div className={styles['file-upload-container']}>
        <label className={styles['media-label']}>{label}</label>
        <p className={styles['helper-text']}>Accepted formats: Images or PDF • Max size: 5MB</p>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, type)}
          className="file-input"
        />
        <button
          type="button"
          className="btn-style mt-2"
          disabled={!file[type] || uploading[type]}
          onClick={(e) => handleUpload(e, type)}
        >
          {uploading[type] ? "Uploading..." : "Upload"}
        </button>
      </div>
    );
  };

  useEffect(() => {
    // Fetch event names from the database and update the state
    const fetchEventNames = async () => {
      try {
        const dept = session?.user?.dept;
        const userType = session?.user?.userType;
        const college = session?.user?.college;
        const user_id = session?.user?._id;
        const response = await fetch("/api/fetchUpdate", {
          method: "POST",
          body: JSON.stringify({
            id: user_id,
            dept,
            userType,
            college,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setEventNames(
          data.eventNames.map((item) => ({
            id: item.id,
            eventName: item.eventName,
          }))
        );
      } catch (error) {
        console.error("Error fetching event names:", error);
      }
    };

    fetchEventNames();
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold">
        Loading...
      </div>
    );
  }
  const currUser = session?.user?.userType;
  if (currUser === "student" || currUser === "admin") {
    return (
      <h1 className="grid place-items-center h-screen text-7xl text-red-600	font-extrabold">
        Not Authorized !!
      </h1>
    );
  }

  const validateSubmission = () => {
    const errors = [];
    
    if (!watch("selectedEvent")) {
      errors.push("Event Selection");
    }
    
    if (fileUrl.geoPhotos.length === 0) {
      errors.push("Geo Tagged Photos");
    }
    
    if (!fileUrl.financialCommitments) {
      errors.push("Financial Commitments Document");
    }
    
    if (!fileUrl.report) {
      errors.push("Event Report");
    }
    
    if (!watch("videoLinks")) {
      errors.push("Video Links");
    }
    
    if (!watch("amountSpent")) {
      errors.push("Amount Spent");
    }
  
    if (errors.length > 0) {
      toast.error(`Please complete the following: ${errors.join(", ")}`);
      return false;
    }
    
    return true;
  };
  
  const onSubmit = async (data) => {
    if (!validateSubmission()) {
      return;
    }
  
    const jsonData = {
      selectedEvent: data.selectedEvent,
      videoLinks: data.videoLinks,
      amountSpent: data.amountSpent,
      fileUrl: fileUrl,
    };
  
    try {
      const user_id = session?.user?._id;
      const response = await fetch("/api/updateEvent", {
        method: "POST",
        body: JSON.stringify({
          user_id,
          jsonData,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setDisplayForm(false);
        toast.success("Event updated successfully!");
      } else {
        toast.error("Error updating event details!");
      }
    } catch (error) {
      toast.error("Error updating event");
      console.error("Error updating event:", error);
    }
  };

  return (
    <>
      {displayForm ? (
        <>
          <form
            className="p-5 form flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1 className="form-section-title">Post Event Form</h1>
            {/* Event Dropdown */}
            <div className="input-container">
              <label className="label">Select Event</label>
              <select
                {...register("selectedEvent", {
                  required: "Please select an event",
                })}
              >
                <option value="">-- Select Event --</option>
                {eventNames.map((eventName) => (
                  <option key={eventName.id} value={eventName.id}>
                    {eventName.eventName}
                  </option>
                ))}
              </select>
              {errors.selectedEvent && (
                <p className="error-msg">{errors.selectedEvent.message}</p>
              )}
            </div>

            {watch("selectedEvent") && (
              <>
                {/* Geo Tagged Photos - Multiple File Input */}
                {fileUrl.geoPhotos.length === 0 ? (
                  <div>
                    <form>
                      <label>Geo Tagged Photos:</label>
                      <p className="text-sm text-gray-600">Accepted formats: Images only • Max size: 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "geoPhotos")}
                        multiple
                      />
                      <button
                        type="button"
                        className="btn-style"
                        disabled={
                          !file.geoPhotos ||
                          uploading.geoPhotos ||
                          fileUrl.geoPhotos.length
                        }
                        onClick={(e) => handleUpload(e, "geoPhotos")}
                      >
                        {uploading.geoPhotos ? "Uploading..." : "Upload"}
                      </button>
                    </form>
                  </div>
                ) : null}

                {fileUrl.geoPhotos.length != 0 && (
                  <div className={styles['media-wrapper']}>
                    <label className={styles['media-label']}>Geo Tagged Photos:</label>
                    <br />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fileUrl.geoPhotos.map((photoUrl, index) => (
                        renderMedia(photoUrl, `Geo Photo ${index + 1}`)
                      ))}
                    </div>
                    <button
                      className="mt-4 btn-style"
                      onClick={(e) => handleDelete(e, "geoPhotos")}
                    >
                      Delete Photos
                    </button>
                  </div>
                )}

                {/* Video Links - Input Box */}
                <div className="input-container">
                  <label className="label">
                    Video Links (Type none if there is not any)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Video Links"
                    {...register("videoLinks", {
                      required: "This field is required",
                    })}
                  />
                  {errors.videoLinks && (
                    <p className="error-msg">{errors.videoLinks.message}</p>
                  )}
                </div>

                {fileUrl.eventPoster === "" && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="eventPoster"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Event Poster
                      </label>
                      <p className="text-sm text-gray-600">Accepted formats: Images or PDF • Max size: 5MB</p>
                      <input
                        type="file"
                        id="eventPoster"
                        {...register("eventPoster")}
                        onChange={(e) => handleFileChange(e, "eventPoster")}
                      />
                      <button
                        onClick={(e) => handleUpload(e, "eventPoster")}
                        className="btn-style"
                        disabled={uploading.eventPoster || !file.eventPoster}
                      >
                        {uploading.eventPoster ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </>
                )}
                {fileUrl.eventPoster !== "" && (
                  <div className={styles['media-wrapper']}>
                    {renderMedia(fileUrl.eventPoster, "Event Poster")}
                    <button
                      className="mt-4 btn-style"
                      onClick={(e) => handleDelete(e, "eventPoster")}
                    >
                      Delete File
                    </button>
                  </div>
                )}

                {/* Financial Commitments - File Input (PDF) */}
                {fileUrl.financialCommitments === "" && (
                  <div>
                    <form>
                      <label>Financial Commitments: </label>
                      <p className="text-sm text-gray-600">Accepted formats: Images or PDF • Max size: 5MB</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleFileChange(e, "financialCommitments")
                        }
                      />
                      <button
                        type="button"
                        className="btn-style"
                        disabled={
                          !file.financialCommitments ||
                          uploading.financialCommitments ||
                          fileUrl.financialCommitments
                        }
                        onClick={(e) => {
                          handleUpload(e, "financialCommitments");
                        }}
                      >
                        {uploading.financialCommitments
                          ? "Uploading..."
                          : "Upload"}
                      </button>
                    </form>
                  </div>
                )}

                {fileUrl.financialCommitments !== "" && (
                  <div className={styles['media-wrapper']}>
                    {renderMedia(fileUrl.financialCommitments, "Financial Commitments")}
                    <button
                      className="mt-4 btn-style"
                      onClick={(e) => handleDelete(e, "financialCommitments")}
                    >
                      Delete File
                    </button>
                  </div>
                )}

                {/* Report - File Input (PDF) */}
                {fileUrl.report === "" && (
                  <div>
                    <form>
                      <label>Event Report: </label>
                      <p className="text-sm text-gray-600">Accepted formats: Images or PDF • Max size: 5MB</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, "report")}
                      />
                      <button
                        type="button"
                        className="btn-style"
                        disabled={
                          !file.report || uploading.report || fileUrl.report
                        }
                        onClick={(e) => {
                          handleUpload(e, "report");
                        }}
                      >
                        {uploading.report ? "Uploading..." : "Upload"}
                      </button>
                    </form>
                  </div>
                )}

                {fileUrl.report !== "" && (
                  <div className={styles['media-wrapper']}>
                    {renderMedia(fileUrl.report, "Event Report")}
                    <button
                      className="mt-4 btn-style"
                      onClick={(e) => handleDelete(e, "report")}
                    >
                      Delete File
                    </button>
                  </div>
                )}

                {/* Amount Spent - Input */}
                <div
                  className="input-container"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label htmlFor="amountSpent" className="label">
                    Amount Spent
                  </label>
                  <input
                    type="number"
                    id="amountSpent"
                    name="amountSpent"
                    placeholder="Enter Amount Spent"
                    className="input"
                    {...register("amountSpent", { required: true, min: 1 })}
                    min={0}
                  />
                  <p className="error-msg">
                    {errors.amountSpent && <span>*Invalid Amount Spent</span>}
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-style"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }}
                  disabled={
                    !(
                      fileUrl.geoPhotos.length > 0 &&
                      fileUrl.financialCommitments &&
                      fileUrl.report &&
                      watch("videoLinks") &&
                      watch("amountSpent")
                    )
                  }
                >
                  Submit
                </button>
              </>
            )}
          </form>
          <ImageModal 
            isOpen={isImageModalOpen} 
            onClose={handleCloseModal} 
            imageUrl={selectedImage}
          />
        </>
      ) : (
        <div className="form">
          <section>
            <h1 className="form-section-title">Congratulations!</h1>
            <h3>Details Updated</h3>
          </section>
        </div>
      )}
    </>
  );
}
