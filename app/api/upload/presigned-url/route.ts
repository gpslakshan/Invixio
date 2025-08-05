// app/api/upload/presigned-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, folder } = await request.json();

    // Validate input
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    // Validate file type (only allow images)
    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Create the S3 key (file path)
    const key = folder ? `${folder}/${fileName}` : fileName;

    // Create the S3 command for putting an object
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Optional: Add metadata
      Metadata: {
        "uploaded-by": "invixio-web-app",
        "upload-timestamp": Date.now().toString(),
      },
      // Optional: Set ACL if you want the file to be publicly readable
      // ACL: 'public-read',
    });

    // Generate the presigned URL (expires in 5 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    // Generate the file URL (how you'll access the file after upload)
    const fileUrl = `https://${BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "ap-south-1"
    }.amazonaws.com/${key}`;

    return NextResponse.json({
      presignedUrl,
      fileUrl,
      key,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
