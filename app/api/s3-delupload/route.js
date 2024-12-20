import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from '@/lib/logger';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function uploadFiletoS3(buffer, fileName) {
    const fileBuffer = buffer;
    const fileParts = fileName.split('.');
    const fileExtension = fileParts.pop();
    const baseFileName = fileParts.join('.');
    const newFileName = `${baseFileName}-${Date.now()}.${fileExtension}`;
    const contentType = fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg';
    
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: newFileName,
        Body: fileBuffer,
        ContentType: contentType
    };
    
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    return newFileName;
}

async function deleteFileS3(fileName) {
    const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    };
    const command = new DeleteObjectCommand(deleteParams);
    return await s3Client.send(command);
}

export async function POST(req) {
    const ACTION = "S3 DeleteUpload";
    let user;

    try {
        user = await authenticate(req);
    } catch (error) {
        await logger(
            "UNKNOWN",
            ACTION,
            "Authentication Failed: " + error.message,
            401
        );
        return NextResponse.json(
            { message: "Authentication failed" },
            { status: 401 }
        );
    }

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Database Connection Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "Database connection failed" },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const oldFileName = formData.get('oldFileName').replace("https://eventifys3.s3.ap-south-1.amazonaws.com/", "");
        const id = formData.get('id');
        const action = `eventData.fileUrl.${formData.get('action')}`;

        if (!file) {
            await logger(
                user._id,
                ACTION,
                "No File Found",
                400
            );
            return NextResponse.json(
                { message: "No file found" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = await uploadFiletoS3(buffer, file.name);
        await logger(
            user._id,
            ACTION,
            `File Uploaded Successfully: ${fileName}`,
            200
        );

        await deleteFileS3(oldFileName);
        await logger(
            user._id,
            ACTION,
            `Old File Deleted Successfully: ${oldFileName}`,
            200
        );

        const updatedEvent = await Events.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    [action]: "https://eventifys3.s3.ap-south-1.amazonaws.com/" + fileName
                },
            }
        );

        await logger(
            user._id,
            ACTION,
            `Event Updated Successfully - ID: ${id}`,
            200
        );
        return NextResponse.json(
            { message: "https://eventifys3.s3.ap-south-1.amazonaws.com/" + fileName },
            { status: 200 }
        );

    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Operation Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred during the operation" },
            { status: 500 }
        );
    }
}