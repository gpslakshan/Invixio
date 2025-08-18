import * as React from "react";
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
  Link,
} from "@react-email/components";

/**
 * Props for the ReminderInvoiceEmailTemplate component.
 */
interface Props {
  invoiceNumber: string;
  companyName: string;
  clientName: string;
  total: number;
  dueDate: Date;
  downloadUrl: string;
}

/**
 * A React component for a reminder invoice email template.
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered email template component.
 */
export const ReminderInvoiceEmailTemplate = ({
  invoiceNumber,
  companyName,
  clientName,
  total,
  dueDate,
  downloadUrl,
}: Props): React.JSX.Element => {
  // Preview text that appears in the email client's inbox view.
  const previewText = `Reminder: Your invoice ${invoiceNumber} from ${companyName} is due soon.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto py-5 mb-16">
            <Section className="bg-violet-600 px-8 py-5">
              <Text className="text-white text-2xl font-bold text-center m-0">
                Invoice Reminder
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-base leading-6 mb-5 m-0">
                Hi {clientName},
              </Text>
              <Text className="text-sm leading-6 text-slate-600 my-4">
                This is a friendly reminder that invoice{" "}
                <strong>{invoiceNumber}</strong> from {companyName} is due soon.
                <br />
                Please find the invoice details below.
              </Text>

              <Section className="bg-slate-50 rounded-lg p-5 my-5">
                <Row className="mb-3">
                  <Column className="w-full align-top">
                    <Text className="text-xs font-semibold text-slate-500 uppercase mb-1 m-0">
                      Invoice Number:
                    </Text>
                    <Text className="text-base font-semibold text-slate-800 mb-4 m-0">
                      {invoiceNumber}
                    </Text>
                  </Column>
                </Row>
                <Row className="mb-3">
                  <Column className="w-full align-top">
                    <Text className="text-xs font-semibold text-slate-500 uppercase mb-1 m-0">
                      Total Amount:
                    </Text>
                    <Text className="text-base font-semibold text-slate-800 mb-4 m-0">
                      ${total.toFixed(2)}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column className="w-full align-top">
                    <Text className="text-xs font-semibold text-slate-500 uppercase mb-1 m-0">
                      Due Date:
                    </Text>
                    <Text className="text-base font-semibold text-slate-800 mb-4 m-0">
                      {dueDate.toLocaleDateString()}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Download Button Section */}
              <Section className="text-center my-8">
                <Link
                  href={downloadUrl}
                  className="bg-violet-600 text-white px-8 py-3 rounded-lg font-semibold text-base no-underline inline-block"
                >
                  Download Invoice PDF
                </Link>
              </Section>

              <Text className="text-sm leading-6 text-slate-600 my-4">
                If you have already made this payment, please disregard this
                email. If you have any questions, please don't hesitate to
                contact us.
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

export default ReminderInvoiceEmailTemplate;
