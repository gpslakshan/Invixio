import { Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import Link from "next/link";

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
    cardTitle: "Freelancer",
    cardDescription:
      "Get started with the essentials — perfect for solo professionals.",
    benefits: [
      "Manage 5 Clients",
      "Create Up to 10 Invoices/Month",
      "Send Invoices via Email",
      "Basic Dashboard Insights",
    ],
    priceTitle: "Free",
  },
  {
    id: 1,
    cardTitle: "Professional",
    cardDescription:
      "For growing businesses that need full control and automation.",
    priceTitle: "$29/mo",
    benefits: [
      "Unlimited Clients",
      "Unlimited Invoices",
      "Send Invoices via Email",
      "Advanced Analytics & Exports",
    ],
  },
];

export function Pricing() {
  return (
    <section className="py-16">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-semibold text-primary tracking-wide">Pricing</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Simple pricing for every invoicing need
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Whether you&apos;re just starting out or scaling fast, Invixio has a
          plan that fits. Pay only for what you need — no hidden fees, ever.
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
                <form className="w-full">
                  <Button className="w-full">Buy Plan</Button>
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
