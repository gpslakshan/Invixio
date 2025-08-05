import { v4 as uuidv4 } from "uuid";

// Function to get presigned URL from the API
export const getPresignedUrl = async (fileName: string, fileType: string) => {
  try {
    const response = await fetch("/api/upload/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
        folder: "logos", // Optional: organize files in folders
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
};

// Function to upload file to S3 using presigned URL
export const uploadToS3 = async (file: File, presignedUrl: string) => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to S3");
    }

    return response;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

// Function to delete file from S3
export const deleteFromS3 = async (fileUrl: string) => {
  try {
    // Extract the S3 key from the file URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const response = await fetch("/api/upload/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete file from S3");
    }

    console.log("File deleted from S3 successfully");
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
};

// Function to handle file upload process
export const handleFileUpload = async (file: File) => {
  // Generate unique filename
  const fileId = uuidv4();
  const fileExtension = file.name.split(".").pop();
  const fileName = `logo_${fileId}.${fileExtension}`;

  // Get presigned URL
  const { presignedUrl, fileUrl } = await getPresignedUrl(fileName, file.type);

  // Upload to S3
  await uploadToS3(file, presignedUrl);

  return fileUrl;
};
