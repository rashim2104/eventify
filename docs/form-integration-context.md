# EventForm Integration Context & Architecture

## Overview

This document provides a comprehensive understanding of how the EventForm works, how the Calven component integrates with it, and the complete data flow architecture.

## Form Structure & Flow

### Main Form Component (`EventForm.jsx`)

The EventForm is a 5-step wizard form:

1. **Step 0**: Basic Information (Event details, type, organizer, dates & times)
2. **Step 1**: Session Selection (Venue selection with integrated functionality)
3. **Step 2**: Coordinator Details (Staff coordinators)
4. **Step 3**: Resource Person Details (External speakers/guests)
5. **Step 4**: Budget & Documents (Sponsors, budget, sanction letters)
6. **Step 5**: Success (Confirmation)

### Key Data Structures

#### Form State Management

```javascript
// Main form data structure
const formData = {
  // Basic Info
  EventOrganizer: '1', // 1=Department, 2=Society, 3=Club, 4=Other, 5=AICTE
  EventName: 'Event Title',
  EventType: { eventType: 'Workshop', eventTypeOtherOption: '' },
  EventObjective: 'Objective text',
  EventParticipants: 100,
  EventVenue: 'offline', // online/offline
  eventLocation: 'On-Campus', // On-Campus/Off-Campus
  StartTime: '2024-01-01T10:00',
  EndTime: '2024-01-01T16:00',
  EventDuration: 6,
  eventVenueAddInfo: 'Venue details for online/off-campus',

  // Coordinators
  eventCoordinators: [
    {
      coordinatorName: 'John Doe',
      coordinatorMail: 'john@college.edu',
      coordinatorPhone: '9876543210',
      coordinatorRole: 'Assistant Professor',
      staffId: 'STAFF001',
      fetched: true,
    },
  ],

  // Resource Persons
  eventResourcePerson: [
    {
      ResourcePersonName: 'Dr. Smith',
      ResourcePersonMail: 'smith@external.edu',
      ResourcePersonPhone: '9876543211',
      ResourcePersonDesgn: 'Professor',
      ResourcePersonAddr: 'University Address',
    },
  ],

  // Budget & Stakeholders
  eventStakeholders: ['Internal Stakeholders', 'External Stakeholders'],
  isSponsored: 'true', // "true"/"false"
  Budget: 50000,
  eventSponsors: [{ name: 'Company XYZ', address: 'Company Address' }],

  // Files
  fileUrl: {
    poster: 'https://s3-url/poster.pdf',
    sanctionLetter: 'https://s3-url/sanction.pdf',
  },
};
```

#### Venue Selection Data Structure

```javascript
// Venue list structure (stored in venueList state)
const venueList = [
  {
    venueId: 'VEN001',
    venueName: 'Auditorium',
    reservationDate: '01-01-24', // dd-MM-yy format
    reservationSession: 'forenoon', // forenoon/afternoon
    userId: 'user123',
  },
  {
    venueId: 'VEN002',
    venueName: 'Conference Hall',
    reservationDate: '01-01-24',
    reservationSession: 'afternoon',
    userId: 'user123',
  },
];
```

## Calven Component Integration

### Calven's Internal 3-Step Process

#### Step 1: Date & Session Selection

- User selects date from calendar
- User selects session(s): "forenoon" and/or "afternoon"
- Data stored in `selectedSessions` array

#### Step 2: Venue Selection

- Calls `/api/venue/fetchAvailability` with selected sessions
- Displays interactive campus map
- Shows available venues by blocks (LMS, SIT, B Block, A Block, E Block, G Block, Sigma)
- Users can click blocks to see available venues
- Selected venues stored in `tempVenues` array

#### Step 3: Confirmation

- Shows summary of selected venues
- User confirms selection
- Calls `handleVenueChange(tempVenues, userVenue)` to parent

### Calven Data Flow

```javascript
// Internal Calven state
{
  venueFormStep: 1, // 1=Date/Session, 2=Venue Select, 3=Confirm
  selectedDate: Date,
  selectedSessions: [
    { date: "01-01-24", session: "forenoon" },
    { date: "01-01-24", session: "afternoon" }
  ],
  venues: {
    raw: {
      prevReservation: [...], // Existing reservations
      venueList: [...] // Available venues
    },
    filtered: [...] // Venues filtered by block
  },
  tempVenues: [
    {
      date: "01-01-24",
      session: "forenoon",
      venueId: "VEN001",
      venueName: "Auditorium"
    }
  ],
  userVenue: "" // For custom venues
}
```

## Integration Points

### 1. Triggering Venue Selection

Venue selection is triggered when:

- `EventVenue === 'offline'` (Offline event)
- `eventLocation === 'On-Campus'` (On-campus location)

### 2. Data Integration

The ScheduleStep component automatically uses the date/time information from BasicInfoStep:

- `StartTime` and `EndTime` from the form data
- Date range is calculated and displayed
- Sessions are applied to all dates in the range

### 3. Data Flow

```javascript
const handleVenueChange = (venue, userVenueValue) => {
  // Transform selected venues to form's venueList format
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
```

## API Integration

### Venue Availability API

**Endpoint**: `/api/venue/fetchAvailability`
**Method**: POST
**Request**:

```javascript
{
  selectedSessions: [
    { date: '01-01-24', session: 'forenoon' },
    { date: '01-01-24', session: 'afternoon' },
  ];
}
```

**Response**:

```javascript
{
  message: {
    prevReservations: [...], // Existing bookings
    venueList: [...] // Available venues with details
  }
}
```

### Event Creation API

**Endpoint**: `/api/v2/createEvent`
**Method**: POST
**Request**:

```javascript
{
  user_id: "user123",
  dept: "CSE",
  userType: "staff",
  eventData: {
    // Complete form data including venueList
    ...formData,
    venueList: transformedVenueData,
    fileUrl: { poster: "...", sanctionLetter: "..." },
    eventVenueAddInfo: "...",
    isResourcePerson: true/false
  },
  college: "SIT"
}
```

## State Management Architecture

### Shared State Hook (`useEventForm.js`)

Manages shared state across all form steps:

```javascript
const {
  // Form state
  eventOrigin,
  setEventOrigin,
  eventSociety,
  setEventSociety,
  currSoc,
  setCurrSoc,

  // File handling
  file,
  uploading,
  fileUrl,
  setFileUrl,

  // Venue management
  venueList,
  setVenueList,
  userVenue,
  setUserVenue,

  // Resource persons
  hasResourcePersons,
  setHasResourcePersons,

  // Coordinators
  fetchedCoordinators,
  setFetchedCoordinators,

  // Computed values
  isEventVenueOnline, // watch('EventVenue')
  isEventVenueOffCampus, // watch('eventLocation')
  isSponsored, // watch('isSponsored')

  // Handler functions
  fetchStaffDetails,
  handleResourcePersonQuestion,
  handleFileChange,
  handleUpload,
  handleDelete,
  handleVenueChange,
} = useEventForm(control, getValues, setValue, watch, trigger);
```

## Validation Integration

### Step-by-Step Validation

Each step has specific validation functions:

- `validateStep0()` - Basic info validation
- `validateStep2()` - Coordinator validation
- `validateStep3()` - Resource person validation
- `validateStep4()` - Budget & sponsor validation

### Venue Validation

Calven handles its own internal validation, but the main form validates:

- At least one venue selected for on-campus offline events
- Venue information provided for online/off-campus events

## Component Architecture

### Step Components

Each step is a separate component:

- `BasicInfoStep` - Step 0 (Date/time selection)
- `ScheduleStep` - Step 1 (Session selection and venue booking)
- `CoordinatorStep` - Step 2
- `ResourcePersonStep` - Step 3
- `BudgetStep` - Step 4
- `SuccessStep` - Step 5

### Integration Benefits

1. **Separation of Concerns**: ScheduleStep handles all scheduling and venue selection logic
2. **Seamless Data Flow**: Dates from BasicInfoStep automatically used in Session Selection
3. **Consistent Data Flow**: Standardized venue data structure maintained
4. **Better UX**: No need to re-enter dates - uses existing form data
5. **Error Handling**: Proper validation and user feedback throughout the flow
6. **State Management**: Shared state through custom hook

## Future Improvements

### Potential Enhancements

1. **Multi-day Events**: Support multiple date selections
2. **Venue Preferences**: Allow users to set preferred venues
3. **Conflict Resolution**: Better handling of venue conflicts
4. **Real-time Updates**: Live availability checking
5. **Mobile Optimization**: Improved mobile experience for venue selection

### API Improvements

1. **Batch Operations**: Support for creating multiple reservations
2. **Validation Endpoints**: Separate validation APIs
3. **Search & Filter**: Advanced venue search capabilities
4. **Booking History**: Integration with user's booking history

This architecture provides a solid foundation for the event management system while maintaining flexibility for future enhancements.
