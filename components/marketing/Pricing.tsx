import Link from "next/link";
import { Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import SubmitButton from "../shared/SubmitButton";
import { createCheckoutSession } from "@/app/actions/subscriptions";

interface PricingPlan {
  id: number;
  cardTitle: string;
  cardDescription: string;
  priceTitle: string;
  benefits: string[];
}

export const PricingPlans: PricingPlan[] = [
  {
    id: 0,
    cardTitle: "Starter",
    cardDescription:
      "Perfect for freelancers and small businesses just getting started. No credit card required.",
    benefits: [
      "Create and send up to 5 invoices per month",
      "Download and print professional PDF invoices",
      "Real-time invoice preview",
      "Track invoice status",
    ],
    priceTitle: "$0/month",
  },
  {
    id: 1,
    cardTitle: "Pro",
    cardDescription:
      "Best for growing businesses that need unlimited invoices and advanced analytics.",
    priceTitle: "$29/month",
    benefits: [
      "Unlimited invoices",
      "Advanced dashboard and analytics",
      "Automatic overdue payment reminders",
      "Priority customer support",
    ],
  },
];

export function Pricing({ id }: { id?: string }) {
  return (
    <section className="py-16" id={id}>
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-semibold text-primary tracking-wide">Pricing</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Simple pricing for every invoicing need
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Whether you&apos;re just starting out or scaling your business,
          Invixio offers flexible plans to fit your invoicing needs—no hidden
          fees, no surprises.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 mt-16 md:grid-cols-2">
        {PricingPlans.map((item) => (
          <Card
            key={item.id}
            className={`flex flex-col justify-between ${
              item.id === 1 ? "border-primary shadow-lg" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>
                {item.id === 1 ? (
                  <div className="flex items-center justify-between">
                    <h3 className="text-primary">{item.cardTitle}</h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Most Popular
                    </span>
                  </div>
                ) : (
                  <>{item.cardTitle}</>
                )}
              </CardTitle>
              <CardDescription>{item.cardDescription}</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="mt-4 text-4xl font-bold tracking-tight">
                {item.priceTitle}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {item.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5" size={18} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-6">
              {item.id === 1 ? (
                <form className="w-full" action={createCheckoutSession}>
                  <SubmitButton text="Buy Plan" classname="mt-5 w-full" />
                </form>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard">Try for Free</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
