// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { authenticate } from '@/lib/authenticate';
import { logger } from "@/lib/logger";

export async function POST(req) {
  const user = await authenticate(req);
  if(!user.isSuperAdmin){
    logger(user._id,"Fetch User","Not Authorized",401);
    return NextResponse.json(
      { message: "You are not authorized to perform this action." },
      { status: 401 }
    );
  }
  // Ensure database connection
  await connectMongoDB();

  const {action, mail} = await req.json();
  let userDetails;
  try {
    if(action === 'fetchUser'){
      // Fetch the details of the user.
      userDetails = await User.find({ email: mail });
      if (userDetails.length === 0) {
        logger(user._id,"Fetch User","Not Found",404);
        return NextResponse.json(
          { message: "User not found" },
          { status: 200 }
        );
      } else {
        logger(user._id,"Fetch User","Fetched Successfully",200);
        return NextResponse.json({ message: userDetails }, { status: 200 });
      }
    }else if(action === 'deleteUser'){
      // Delete the user from the collection
      const deletedUser = await User.deleteOne({ email: mail });
      logger(user._id,"Delete User","Deleted Successfully",200);
      return NextResponse.json({ message: "User Deleted Successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error('Error processing event:', error);
    logger(user._id,"Fetch User",error,500);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
