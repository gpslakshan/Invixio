import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { frequentlyAskedQuestions } from "@/constants";

const FAQs = ({ id }: { id: string }) => {
  return (
    <section className="py-16" id={id}>
      <div className="max-w-2xl mx-auto lg:text-center">
        <p className="font-semibold leading-7 text-primary">FAQs</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-6 text-base leading-snug text-muted-foreground">
          Find answers to common questions about Invixio&apos;s features,
          pricing, and how to get started. Whether you&apos;re on the Free plan
          or Pro, we&apos;ve got you covered.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-4xl">
        <Accordion type="single" collapsible className="w-full">
          {frequentlyAskedQuestions.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQs;
