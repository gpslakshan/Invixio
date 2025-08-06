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
import * as React from "react";

interface Props {
  invoiceNumber: string;
  companyName: string;
  clientName: string;
  total: number;
  dueDate: Date;
  downloadUrl: string;
}

export const InvoiceEmailTemplate = ({
  invoiceNumber,
  companyName,
  clientName,
  total,
  dueDate,
  downloadUrl,
}: Props) => {
  const previewText = `Your invoice ${invoiceNumber} from ${companyName} is ready for download.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto py-5 mb-16">
            <Section className="bg-violet-600 px-8 py-5">
              <Text className="text-white text-2xl font-bold text-center m-0">
                Invoice
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-base leading-6 mb-5 m-0">
                Dear {clientName},
              </Text>
              <Text className="text-sm leading-6 text-slate-600 my-4">
                Your invoice <strong>{invoiceNumber}</strong> from {companyName}{" "}
                is ready for download.
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
                Click the button above to download your invoice PDF. If you have
                any questions regarding this invoice, please don't hesitate to
                contact us.
              </Text>
              <Text className="text-sm leading-6 text-slate-600 my-4">
                Thank you for your business!
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

export default InvoiceEmailTemplate;
