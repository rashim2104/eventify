import { NextResponse } from 'next/server';
import { S3Client,DeleteObjectCommand  } from '@aws-sdk/client-s3';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

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
    try {
        const formData = await req.formData();
        const fileName = formData.get('fileName');
        if(!fileName){
            return NextResponse.json({message: "No file found"}, { status: 400 });
        }
        const response = await deleteFileS3(fileName);
        logger(user._id,"S3 Delete",response,200);
        return NextResponse.json({message: response}, { status: 200 });        
    } catch (error) {
        logger(user._id,"S3 Delete",error,500);
        console.log(error);
        return NextResponse.json({message: error}, { status: 200 });
    }
}