export const validateStep0 = (
  watch,
  eventOrigin,
  eventSociety,
  currSoc,
  fileUrl
) => {
  const errors = {};

  const fields = {
    EventOrganizer: 'EventOrganizer',
    EventName: 'EventName',
    'EventType.eventType': 'EventType.eventType',
    EventObjective: 'EventObjective',
    EventParticipants: 'EventParticipants',
    EventVenue: 'EventVenue',
    StartTime: 'StartTime',
    EndTime: 'EndTime',
    EventDuration: 'EventDuration',
  };

  Object.entries(fields).forEach(([field, label]) => {
    if (!watch(field)) {
      errors[field] = `${label} is required`;
    }
  });

  // Conditional validation for eventLocation - only required when EventVenue is 'offline'
  if (watch('EventVenue') === 'offline') {
    if (!watch('eventLocation')) {
      errors.eventLocation = 'Event Location is required';
    }
  } else {
    // Remove any existing eventLocation error if EventVenue is not offline
    if (errors.eventLocation) {
      delete errors.eventLocation;
    }
  }

  // Special validations
  if (eventOrigin === '2' && !eventSociety) {
    errors.eventSociety = 'Professional Society is required';
  }
  if (eventOrigin === '3' && !eventSociety) {
    errors.eventSociety = 'Club/Cell is required';
  }
  if (eventOrigin === '4' && !currSoc) {
    errors.currSoc = 'Other Organization is required';
  }
  if (
    watch('EventType.eventType') === 'other' &&
    !watch('EventType.eventTypeOtherOption')
  ) {
    errors['EventType.eventTypeOtherOption'] = 'Event Type Details is required';
  }
  if (fileUrl.poster === '') {
    errors.permissionLetter = 'Permission Letter is required';
  }

  // Remove fields that should be handled by react-hook-form
  // These fields have their own validation rules in the form
  delete errors.StartTime;
  delete errors.EndTime;
  delete errors.EventDuration;

  return Object.keys(errors).length === 0 ? null : errors;
};

export const validateStep2 = (watch, coordinatorfields) => {
  const errors = {};
  coordinatorfields.forEach((_, index) => {
    const coordinator = watch(`eventCoordinators.${index}`);
    const fieldPrefix = `Coordinator ${index + 1}:`;

    if (!coordinator.coordinatorName) {
      errors[`eventCoordinators.${index}.coordinatorName`] =
        `${fieldPrefix} Name is required`;
    }
    if (!coordinator.coordinatorMail) {
      errors[`eventCoordinators.${index}.coordinatorMail`] =
        `${fieldPrefix} Email is required`;
    }
    if (!coordinator.coordinatorPhone) {
      errors[`eventCoordinators.${index}.coordinatorPhone`] =
        `${fieldPrefix} Phone is required`;
    }
    if (!coordinator.coordinatorRole) {
      errors[`eventCoordinators.${index}.coordinatorRole`] =
        `${fieldPrefix} Role is required`;
    }
  });
  return Object.keys(errors).length === 0 ? null : errors;
};

export const validateStep3 = (
  watch,
  resourcepersonfields,
  hasResourcePersons
) => {
  const errors = {};

  if (hasResourcePersons === null) {
    errors.hasResourcePersons =
      'Please select whether there are resource persons';
    return errors;
  }

  if (hasResourcePersons) {
    resourcepersonfields.forEach((_, index) => {
      const person = watch(`eventResourcePerson.${index}`);
      const fieldPrefix = `Resource Person ${index + 1}:`;

      if (!person.ResourcePersonName) {
        errors[`eventResourcePerson.${index}.ResourcePersonName`] =
          `${fieldPrefix} Name is required`;
      }
      if (!person.ResourcePersonMail) {
        errors[`eventResourcePerson.${index}.ResourcePersonMail`] =
          `${fieldPrefix} Email is required`;
      }
      if (!person.ResourcePersonPhone) {
        errors[`eventResourcePerson.${index}.ResourcePersonPhone`] =
          `${fieldPrefix} Phone is required`;
      }
      if (!person.ResourcePersonDesgn) {
        errors[`eventResourcePerson.${index}.ResourcePersonDesgn`] =
          `${fieldPrefix} Designation is required`;
      }
      if (!person.ResourcePersonAddr) {
        errors[`eventResourcePerson.${index}.ResourcePersonAddr`] =
          `${fieldPrefix} Address is required`;
      }
    });
  }
  return Object.keys(errors).length === 0 ? null : errors;
};

export const validateStep4 = (watch, fileUrl, isSponsored) => {
  const errors = {};

  if (!watch('eventStakeholders') || watch('eventStakeholders').length === 0) {
    errors.eventStakeholders = 'Please select at least one stakeholder';
  }

  if (watch('isSponsored') === undefined || watch('isSponsored') === null || watch('isSponsored') === '') {
    errors.isSponsored = 'Please specify if the event is sponsored';
  }

  if (watch('isSponsored') === 'true') {
    if (!watch('Budget')) {
      errors.Budget = 'Budget amount is required';
    }
    if (fileUrl.sanctionLetter === '') {
      errors.sanctionLetter = 'Sanction Letter is required';
    }

    const sponsors = watch('eventSponsors');
    sponsors?.forEach((sponsor, index) => {
      const fieldPrefix = `Sponsor ${index + 1}:`;
      if (!sponsor.name) {
        errors[`eventSponsors.${index}.name`] =
          `${fieldPrefix} Name is required`;
      }
      if (!sponsor.address) {
        errors[`eventSponsors.${index}.address`] =
          `${fieldPrefix} Address is required`;
      }
    });
  }
  return Object.keys(errors).length === 0 ? null : errors;
};
