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
