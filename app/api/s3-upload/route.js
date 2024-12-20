import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticate } from '@/lib/authenticate';
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

export async function POST(req) {
    const ACTION = "S3 Upload";
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
        const formData = await req.formData();
        const file = formData.get('file');

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
        return NextResponse.json(
            { message: "https://eventifys3.s3.ap-south-1.amazonaws.com/" + fileName },
            { status: 200 }
        );

    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Upload Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred during upload" },
            { status: 500 }
        );
    }
}