import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useEventForm = (control, getValues, setValue, watch, trigger) => {
  const { data: session } = useSession();
  const [eventOrigin, setEventOrigin] = useState('1');
  const [eventSociety, setEventSociety] = useState('');
  const [currSoc, setCurrSoc] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState({ poster: '', sanctionLetter: '' });
  const [venueList, setVenueList] = useState([]);
  const [userVenue, setUserVenue] = useState('');
  const [hasResourcePersons, setHasResourcePersons] = useState(null);
  const [fetchedCoordinators, setFetchedCoordinators] = useState([]);

  // Watch specific form fields
  const isEventVenueOnline = watch('EventVenue');
  const isEventVenueOffCampus = watch('eventLocation');
  const isSponsored = watch('isSponsored');

  // Function to fetch staff details based on staff ID
  const fetchStaffDetails = async index => {
    const staffId = getValues(`eventCoordinators.${index}.staffId`);
    try {
      const response = await fetch('/api/fetchStaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        });
        setFetchedCoordinators(prev => [...prev, index]);

        // Trigger validation for the updated fields
        trigger(`eventCoordinators.${index}.coordinatorName`);
        trigger(`eventCoordinators.${index}.coordinatorMail`);
        trigger(`eventCoordinators.${index}.coordinatorPhone`);
        trigger(`eventCoordinators.${index}.coordinatorRole`);
      } else {
        // Staff ID validation error will be handled by the validation system
        console.error('Invalid Staff ID. Please enter a valid ID.');
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
    }
  };

  // Function to handle the yes/no question for resource persons
  const handleResourcePersonQuestion = e => {
    const value = e.target.value === 'yes';
    setHasResourcePersons(value);
  };

  // File handling functions
  const handleFileChange = e => {
    e.preventDefault();
    setFile(null);
    let fileType = '';
    let file;
    if (e.target.files[0]) {
      file = e.target.files[0];
      fileType = file.type;
    }
    const validImageTypes = [
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    const validFileTypes = [...validImageTypes, 'application/pdf'];
    if (file && validFileTypes.includes(fileType) && file.size <= 5000000) {
      setFile(file);
    } else {
      // File validation error will be handled by the validation system
      console.error(
        'Invalid file: Please select an image or PDF file under 5MB.'
      );
    }
  };

  const handleUpload = async (e, action) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/s3-upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        if (action === 'poster') {
          setFileUrl(prevState => ({ ...prevState, poster: data.message }));
        } else if (action === 'sanctionLetter') {
          setFileUrl(prevState => ({
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

  const handleDelete = async (e, action) => {
    e.preventDefault();
    const formData = new FormData();
    let fileName = '';
    if (action === 'poster') {
      fileName = fileUrl.poster.replace(
        'https://eventifys3.s3.ap-south-1.amazonaws.com/',
        ''
      );
    } else if (action === 'sanctionLetter') {
      fileName = fileUrl.sanctionLetter.replace(
        'https://eventifys3.s3.ap-south-1.amazonaws.com/',
        ''
      );
    }
    formData.append('fileName', fileName);
    try {
      const response = await fetch('/api/s3-delete', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        if (action === 'poster') {
          setFileUrl(prevState => ({ ...prevState, poster: '' }));
        } else if (action === 'sanctionLetter') {
          setFileUrl(prevState => ({ ...prevState, sanctionLetter: '' }));
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
    if (venue.length === 0 && userVenueValue === '') {
      // Venue validation error will be handled by the validation system
      return;
    }
    const transformedData = venue.map(item => ({
      venueId: item.venueId,
      venueName: item.venueName,
      reservationDate: item.date,
      reservationSession: item.session,
      userId: session?.user?._id,
    }));
    setVenueList(transformedData);
    setUserVenue(userVenueValue);
  };

  // Watch EventOrganizer changes to update eventOrigin
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'EventOrganizer' && value.EventOrganizer) {
        setEventOrigin(value.EventOrganizer.toString());
        // Reset dependent fields when EventOrganizer changes
        setEventSociety('');
        setCurrSoc('');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return {
    eventOrigin,
    setEventOrigin,
    eventSociety,
    setEventSociety,
    currSoc,
    setCurrSoc,
    file,
    uploading,
    fileUrl,
    setFileUrl,
    venueList,
    setVenueList,
    userVenue,
    setUserVenue,
    hasResourcePersons,
    setHasResourcePersons,
    fetchedCoordinators,
    setFetchedCoordinators,
    isEventVenueOnline,
    isEventVenueOffCampus,
    isSponsored,
    fetchStaffDetails,
    handleResourcePersonQuestion,
    handleFileChange,
    handleUpload,
    handleDelete,
    handleVenueChange,
  };
};
