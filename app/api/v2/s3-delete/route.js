import { NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function deleteFileS3(fileName) {
    const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    };
    const command = new DeleteObjectCommand(deleteParams);
    return await s3Client.send(command);
}

export async function POST(req) {
    const ACTION = "S3 Delete";
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
        const fileName = formData.get('fileName');

        if (!fileName) {
            await logger(
                user._id,
                ACTION,
                "No File Name Provided",
                400
            );
            return NextResponse.json(
                { message: "No file found" },
                { status: 400 }
            );
        }

        const response = await deleteFileS3(fileName);
        await logger(
            user._id,
            ACTION,
            `File Deleted Successfully: ${fileName}`,
            200
        );
        return NextResponse.json(
            { message: response },
            { status: 200 }
        );
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "File Deletion Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "Failed to delete file" },
            { status: 500 }
        );
    }
}