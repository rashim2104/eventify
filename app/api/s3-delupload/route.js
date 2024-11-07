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

async function uploadFiletoS3(buffer, fileName){
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
    const data = await s3Client.send(command);
    return newFileName;
}
async function deleteFileS3(fileName){
    const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    };
    const command = new DeleteObjectCommand (deleteParams);
    const data = await s3Client.send(command);
    return data;
}
 
export async function POST(req){
    const user = await authenticate(req);
    await connectMongoDB();
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const oldFileName = formData.get('oldFileName').replace("https://eventify-file-storage.s3.ap-south-1.amazonaws.com/", "");
        const id = formData.get('id');
        const action = `eventData.fileUrl.${formData.get('action')}`;
        if(!file){
            logger(user._id,"S3 DeleteUpload","No file found",400);
            return NextResponse.json({message: "No file found"}, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = await uploadFiletoS3(buffer, file.name);
        
        const delResponse = await deleteFileS3(oldFileName);

        const updatedEvent = await Events.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    [action] : "https://eventify-file-storage.s3.ap-south-1.amazonaws.com/" + fileName
                },
            },
        );
        logger(user._id,"S3 DeleteUpload","Success",200);
        return NextResponse.json({message: "https://eventify-file-storage.s3.ap-south-1.amazonaws.com/"+fileName}, { status: 200 });        
    } catch (error) {
        console.log(error);
        logger(user._id,"S3 DeleteUpload",error,400);
        return NextResponse.json({message: error}, { status: 400 });
    }
}