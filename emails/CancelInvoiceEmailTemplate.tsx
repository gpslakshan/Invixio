import {
  Body,
  Tailwind,
  Container,
  Column,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface Props {
  invoiceNumber: string;
  companyName: string;
  clientName: string;
}

export const CancelInvoiceEmailTemplate = ({
  invoiceNumber,
  companyName,
  clientName,
}: Props) => {
  // Update the preview text to reflect the cancellation.
  const previewText = `Your invoice ${invoiceNumber} from ${companyName} has been canceled.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto py-5 mb-16">
            {/* The header section has been updated to reflect the cancellation status. */}
            <Section className="bg-red-600 px-8 py-5">
              <Text className="text-white text-2xl font-bold text-center m-0">
                Invoice Canceled
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-base leading-6 mb-5 m-0">
                Dear {clientName},
              </Text>
              {/* The body text has been updated to inform the client of the cancellation. */}
              <Text className="text-sm leading-6 text-slate-600 my-4">
                This email is to confirm that invoice{" "}
                <strong>{invoiceNumber}</strong> from {companyName} has been
                successfully canceled.
              </Text>

              {/* Removed the download button section and related text. */}
              <Text className="text-sm leading-6 text-slate-600 my-4">
                If you have any questions or concerns regarding this
                cancellation, please don't hesitate to contact us.
              </Text>
              <Text className="text-sm leading-6 text-slate-600 mt-8">
                Best regards,
                <br />
                {companyName}
              </Text>
            </Section>
            <Section className="border-t border-slate-200 px-8 py-5 mt-5">
              <Text className="text-xs text-slate-400 text-center m-0">
                This email was sent automatically. Please do not reply to this
                email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default CancelInvoiceEmailTemplate;
