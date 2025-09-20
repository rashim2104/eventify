import { connectMongoDB } from './mongodb';
import Events from '@/models/events';
import User from '@/models/user';
import eventIDs from '@/public/data/eventId';
import {
  clubsShort,
  societies,
  ieeeSocietiesShort,
  departments,
} from '@/public/data/data';

export async function IdGen(eventDoc) {
  await connectMongoDB();
  let count;

  // Use event start date from the document
  const eventStartDate = new Date(eventDoc.eventData.StartTime);

  // Use event start date for month/year
  const year = eventStartDate.getFullYear();
  const month = String(eventStartDate.getMonth() + 1).padStart(2, '0');

  // Calculate first/last day of event's month for querying
  const firstDayOfMonth = new Date(
    eventStartDate.getFullYear(),
    eventStartDate.getMonth(),
    1
  )
    .toISOString()
    .slice(0, 10);
  const lastDayOfMonth = new Date(
    eventStartDate.getFullYear(),
    eventStartDate.getMonth() + 1,
    0
  )
    .toISOString()
    .slice(0, 10);

  const SIT = 'SIT';
  const SEC = 'SEC';
  let newId;

  if (
    !clubsShort.includes(eventDoc.dept) &&
    !societies.includes(eventDoc.dept) &&
    !ieeeSocietiesShort.includes(eventDoc.dept) &&
    !departments.includes(eventDoc.dept)
  ) {
    const user = await User.findOne({ _id: eventDoc.user_id });
    let college = user.college;
    if (college === 'common') {
      count = await Events.countDocuments({
        'eventData.EventOrganizer': '4',
        status: 2,
        'eventData.StartTime': {
          $gte: firstDayOfMonth,
          $lt: lastDayOfMonth,
        },
      });
      newId =
        SIT +
        year +
        month +
        'OOO' +
        String(count + 1).padStart(2, '0') +
        ' / ' +
        SEC +
        year +
        month +
        'OOO' +
        String(count + 1).padStart(2, '0');
    } else {
      count = await Events.countDocuments({
        'eventData.EventOrganizer': '4',
        status: 2,
        eventCollege: college,
        'eventData.StartTime': {
          $gte: firstDayOfMonth,
          $lt: lastDayOfMonth,
        },
      });
      newId =
        college + year + month + 'OOO' + String(count + 1).padStart(2, '0');
    }
  } else if (eventDoc.eventCollege === 'common') {
    const sampleId = eventIDs[eventDoc.dept];
    count = await Events.countDocuments({
      dept: eventDoc.dept,
      status: 2,
      eventCollege: eventDoc.eventCollege,
      'eventData.StartTime': {
        $gte: firstDayOfMonth,
        $lt: lastDayOfMonth,
      },
    });
    const newIdSIT = sampleId
      .replace('CLG', 'SIT')
      .replace('YEAR', year)
      .replace('MM', month)
      .replace(/YY$/, String(count + 1).padStart(2, '0')); // Replace only last YY
    const newIdSEC = sampleId
      .replace('CLG', 'SEC')
      .replace('YEAR', year)
      .replace('MM', month)
      .replace(/YY$/, String(count + 1).padStart(2, '0')); // Replace only last YY
    newId = newIdSIT + ' / ' + newIdSEC;
  } else {
    const sampleId = eventIDs[eventDoc.dept];
    count = await Events.countDocuments({
      dept: eventDoc.dept,
      status: 2,
      eventCollege: eventDoc.eventCollege,
      'eventData.StartTime': {
        $gte: firstDayOfMonth,
        $lt: lastDayOfMonth,
      },
    });
    newId = sampleId
      .replace('CLG', eventDoc.eventCollege)
      .replace('YEAR', year)
      .replace('MM', month)
      .replace(/YY$/, String(count + 1).padStart(2, '0')); // Replace only last YY
  }
  return newId;
}
