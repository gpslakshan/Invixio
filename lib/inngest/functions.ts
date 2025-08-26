import { InvoiceStatus } from "@prisma/client";
import { prisma } from "../db";
import { inngest } from "./client";

// Define the Inngest cron job function
export const markOverdueInvoices = inngest.createFunction(
  {
    id: "mark-overdue-invoices",
    name: "Mark Overdue Invoices",
  },
  { cron: "0 0 * * *" }, // Run every day at midnight (UTC)
  async ({ step }) => {
    // Log the start of the job for monitoring purposes
    console.log("Starting the mark overdue invoices cron job...");

    try {
      // Find all invoices that are due today or in the past, and are not yet 'PAID' or 'OVERDUE'
      const overdueInvoices = await step.run(
        "Find overdue invoices",
        async () => {
          // Find invoices where the due date is before the current date and the status is 'PENDING'
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to midnight for an accurate comparison

          return prisma.invoice.findMany({
            where: {
              dueDate: {
                // Finds invoices where the due date is earlier than today. In Prisma queries, lt stands for "less than".
                lt: today,
              },
              status: {
                // We only want to update invoices that are not already paid or marked as overdue
                notIn: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
              },
            },
          });
        }
      );

      // If no overdue invoices are found, we can exit gracefully
      if (overdueInvoices.length === 0) {
        console.log("No new overdue invoices found.");
        return { message: "No new overdue invoices found." };
      }

      console.log(
        `Found ${overdueInvoices.length} invoices to mark as overdue.`
      );

      // Update each found invoice's status to 'OVERDUE'
      // We use a transaction to ensure all updates succeed or fail together
      await step.run("Update invoices to overdue", async () => {
        const updatePromises = overdueInvoices.map((invoice) => {
          return prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: InvoiceStatus.OVERDUE },
          });
        });

        return prisma.$transaction(updatePromises);
      });

      // Log a success message
      console.log(
        `Successfully updated ${overdueInvoices.length} invoices to overdue.`
      );

      // Return a success message with the count of updated invoices
      return {
        message: `Successfully updated ${overdueInvoices.length} invoices to overdue.`,
      };
    } catch (error) {
      // Log any errors that occur during the process
      console.error(
        "An error occurred during the mark overdue invoices:",
        error
      );
      // Re-throw the error so Inngest can handle retries and alerts
      throw error;
    } finally {
      // It's a good practice to disconnect Prisma after the operation is complete
      await prisma.$disconnect();
    }
  }
);
