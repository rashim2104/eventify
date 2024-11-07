import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const {email,isSuperAdmin} = await authenticate(req);
  await connectMongoDB();

  const valueToJson = await req.json();
  try {
    if(valueToJson.action === 'user'){
    const {oldPassword,newPassword } = valueToJson;

    const user = await User.findOne({ email });

    if (!user) throw new Error("User doesn't exists");
  
  const passwordsMatch = await bcrypt.compare(oldPassword, user.password);

  if(!passwordsMatch) throw new Error('Wrong password');
  const salt = await bcrypt.genSalt(10);
  const newPasswordHashed = await bcrypt.hash(newPassword, salt);
    
  await User.updateOne({ email }, { password: newPasswordHashed });
  logger(user._id,"Change password","Password changed",201);
  return NextResponse.json({ message: "Password Changed" }, { status: 201 });}
  else if(valueToJson.action === 'admin'){
    if(!isSuperAdmin){
      logger(email,"Change password","Unauthorized Access",401);
      return NextResponse.json(
        { message: "You are not authorized to perform this action." },
        { status: 401 }
      );
    }
    const{_id} = valueToJson;
    const existingUser = await User.findById(_id);

    if (!existingUser) {
      logger(email,"Change password","User not found",500);
      return NextResponse.json(
        { message: "User not found." },
        { status: 500 }
      );
    }

    // Update the user details
    existingUser.password = "$2a$10$2IW2QdaUVRs.8VpgriyqZ.oY34Skm0Sli6E95s09Ax3gqe5gWr2VK";

    // Save the updated user
    await existingUser.save();

    logger(email,"Change password","Password changed to Welcome@123",200);
    return NextResponse.json({ message: "Password updated to Welcome@123" }, { status: 200 });
  }
  } catch (error) {
    logger(user._id,"Change password",error,500);
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: "An error occurred while Creating Event." },
      { status: 500 }
    );
  }
}
