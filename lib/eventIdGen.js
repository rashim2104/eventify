import { connectMongoDB } from './mongodb';
import Events from '@/models/events';
import User from '@/models/user';
import Club from '@/models/club';
import Society from '@/models/society';
import Department from '@/models/department';

// Cache for config data (refreshes per request but avoids multiple queries)
let configCache = null;

async function getConfigData() {
  if (configCache) return configCache;

  await connectMongoDB();

  const [clubs, societies, departments] = await Promise.all([
    Club.find({ isActive: true }).lean(),
    Society.find({ isActive: true }).lean(),
    Department.find({ isActive: true }).lean(),
  ]);

  configCache = {
    clubCodes: clubs.map(c => c.code),
    societyCodes: societies
      .filter(s => s.type === 'professional')
      .map(s => s.code),
    ieeeSocietyCodes: societies.filter(s => s.type === 'ieee').map(s => s.code),
    deptCodes: departments.map(d => d.code),
    // Build eventIdTemplates lookup from all entities
    eventIdTemplates: {
      ...Object.fromEntries(
        clubs
          .filter(c => c.eventIdTemplate)
          .map(c => [c.code, c.eventIdTemplate])
      ),
      ...Object.fromEntries(
        societies
          .filter(s => s.eventIdTemplate)
          .map(s => [s.code, s.eventIdTemplate])
      ),
      ...Object.fromEntries(
        departments
          .filter(d => d.eventIdTemplate)
          .map(d => [d.code, d.eventIdTemplate])
      ),
    },
  };

  return configCache;
}

// Clear cache (call this after config changes if needed)
export function clearConfigCache() {
  configCache = null;
}

export async function IdGen(eventDoc) {
  await connectMongoDB();

  const config = await getConfigData();
  const {
    clubCodes,
    societyCodes,
    ieeeSocietyCodes,
    deptCodes,
    eventIdTemplates,
  } = config;

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

  // Check if dept is in any of the known categories
  const isKnownDept =
    clubCodes.includes(eventDoc.dept) ||
    societyCodes.includes(eventDoc.dept) ||
    ieeeSocietyCodes.includes(eventDoc.dept) ||
    deptCodes.includes(eventDoc.dept);

  if (!isKnownDept) {
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
    const sampleId = eventIdTemplates[eventDoc.dept] || 'CLGYEARMMDXXXYY';
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
      .replace(/YY$/, String(count + 1).padStart(2, '0'));
    const newIdSEC = sampleId
      .replace('CLG', 'SEC')
      .replace('YEAR', year)
      .replace('MM', month)
      .replace(/YY$/, String(count + 1).padStart(2, '0'));
    newId = newIdSIT + ' / ' + newIdSEC;
  } else {
    const sampleId = eventIdTemplates[eventDoc.dept] || 'CLGYEARMMDXXXYY';
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
      .replace(/YY$/, String(count + 1).padStart(2, '0'));
  }
  return newId;
}
