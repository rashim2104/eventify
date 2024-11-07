import { connectMongoDB } from "./mongodb";
import Events from "@/models/events";
import User from "@/models/user";
import eventIDs from "@/public/data/eventId";
import { clubsShort,societies,ieeeSocietiesShort,departments } from "@/public/data/data";

export async function IdGen(user_id, dept, college) {
  await connectMongoDB();
  let count;
  const date = new Date();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  let newId;
  if(!clubsShort.includes(dept) && !societies.includes(dept) && !ieeeSocietiesShort.includes(dept) && !departments.includes(dept)){
    const user = await User.findOne({ _id: user_id });
    college = user.college;
    if(college === "common"){
      count = await Events.countDocuments({
        'eventData.EventOrganizer' : "4",
        status: 2,
        'eventData.StartTime': {
          $gte: firstDayOfMonth,
          $lt: lastDayOfMonth,
        },
      });
      newId = SIT + year + month + "OOO" + String(count + 1).padStart(2, "0")+" / "+SEC + year + month + "OOO" + String(count + 1).padStart(2, "0");  
    }else{
      count = await Events.countDocuments({
        'eventData.EventOrganizer' : "4",
        status: 2,
        eventCollege: college,
        'eventData.StartTime': {
          $gte: firstDayOfMonth,
          $lt: lastDayOfMonth,
        },
      });
      newId = college + year + month + "OOO" + String(count + 1).padStart(2, "0");
    }    
  }
  else if(college === "common"){
    const sampleId = eventIDs[dept];
    count = await Events.countDocuments({
      dept: dept,
      status: 2,
      eventCollege: college,
      'eventData.StartTime': {
        $gte: firstDayOfMonth,
        $lt: lastDayOfMonth,
      },
    });
    const newIdSIT = sampleId
      .replace("CLG", "SIT")
      .replace("YEAR", year)
      .replace("MM", month)
      .replace("YY", String(count + 1).padStart(2, "0")); 
    const newIdSEC = sampleId
      .replace("CLG", "SEC")
      .replace("YEAR", year)
      .replace("MM", month)
      .replace("YY", String(count + 1).padStart(2, "0")); 
    newId = newIdSIT+" / "+newIdSEC;
  }else{
    const sampleId = eventIDs[dept];
    count = await Events.countDocuments({
      dept: dept,
      status: 2,
      eventCollege: college,
      'eventData.StartTime': {
        $gte: firstDayOfMonth,
        $lt: lastDayOfMonth,
      },
    });
    newId = sampleId
      .replace("CLG", college)
      .replace("YEAR", year)
      .replace("MM", month)
      .replace("YY", String(count + 1).padStart(2, "0"));
  }
  return newId;
}
