import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get today's date at midnight UTC for consistent comparison
export function getTodayDate() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC
  return today;
}

// Helper function to create raw email with attachment
export function createRawEmailWithAttachment(
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlBody: string,
  attachmentBase64: string,
  attachmentName: string
): Buffer {
  const boundary = "----=_NextPart_" + Date.now();

  let rawEmail = "";

  // Email headers
  rawEmail += `From: ${fromEmail}\r\n`;
  rawEmail += `To: ${toEmail}\r\n`;
  rawEmail += `Subject: ${subject}\r\n`;
  rawEmail += `MIME-Version: 1.0\r\n`;
  rawEmail += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

  // HTML email body
  rawEmail += `--${boundary}\r\n`;
  rawEmail += `Content-Type: text/html; charset=UTF-8\r\n`;
  rawEmail += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
  rawEmail += `${htmlBody}\r\n\r\n`;

  // PDF attachment
  rawEmail += `--${boundary}\r\n`;
  rawEmail += `Content-Type: application/pdf\r\n`;
  rawEmail += `Content-Transfer-Encoding: base64\r\n`;
  rawEmail += `Content-Disposition: attachment; filename="${attachmentName}"\r\n\r\n`;

  // Convert base64 and add line breaks every 76 characters
  const base64WithLineBreaks =
    attachmentBase64.match(/.{1,76}/g)?.join("\r\n") || attachmentBase64;
  rawEmail += `${base64WithLineBreaks}\r\n\r\n`;

  rawEmail += `--${boundary}--\r\n`;

  return Buffer.from(rawEmail);
}
