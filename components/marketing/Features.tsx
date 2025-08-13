import { FileText, LayoutDashboard, Users, SendHorizonal } from "lucide-react";

const features = [
  {
    name: "Client Management",
    description:
      "Add, view, and manage all your clients in one centralized hub for seamless invoicing.",
    icon: Users,
  },
  {
    name: "Invoice Management",
    description:
      "Create, edit, and track invoices with detailed statuses and payment updates.",
    icon: FileText,
  },
  {
    name: "Sending Invoices",
    description:
      "Send professional invoices to your clients via email with just a few clicks.",
    icon: SendHorizonal,
  },
  {
    name: "Dashboard & Overview",
    description:
      "Get a snapshot of your invoicing activity, revenue, and outstanding payments.",
    icon: LayoutDashboard,
  },
];

export function Features() {
  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto lg:text-center">
        <p className="font-semibold leading-7 text-primary">Why Invixio?</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          All-in-one invoicing made effortless
        </h1>
        <p className="mt-6 text-base leading-snug text-muted-foreground">
          Invixio helps you manage clients, send invoices, and monitor your
          business growth from one simple dashboard.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none md:grid-cols-2 md:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-16">
              <div className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                {feature.name}
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-snug">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
