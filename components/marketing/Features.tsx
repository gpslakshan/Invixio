import { FileText, LayoutDashboard, Eye, BarChart } from "lucide-react";

const features = [
  {
    name: "Streamlined Invoicing & Management",
    description:
      "Create, edit, and send professional invoices in minutes. Our intuitive dashboard gives you a complete overview of all your billing, allowing you to easily track, update, and manage every invoice in one place.",
    icon: LayoutDashboard,
  },
  {
    name: "Instant Invoice Preview",
    description:
      "See exactly what your clients will see, before you even send it. Our real-time preview feature lets you perfect every detail of your invoice, ensuring it looks professional and polished from the start.",
    icon: Eye,
  },
  {
    name: "Real-Time Insights & Analytics",
    description:
      "Make smarter business decisions with a powerful dashboard. Get a clear view of your financial health, track payment statuses, and gain valuable insights into your cash flow with easy-to-read reports.",
    icon: BarChart,
  },
  {
    name: "Professional & Sharable Invoices",
    description:
      "Present a polished brand image with every invoice you send. Generate high-quality PDF invoices that are ready to download, print, or send directly to your clients via email with just a click.",
    icon: FileText,
  },
];

export function Features({ id }: { id: string }) {
  return (
    <section className="py-16" id={id}>
      <div className="max-w-2xl mx-auto lg:text-center">
        <p className="font-semibold leading-7 text-primary">Why Invixio?</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          All-in-one invoicing made effortless
        </h1>
        <p className="mt-6 text-base leading-snug text-muted-foreground">
          From seamless invoice creation to powerful tracking and insights,
          Invixio gives you everything you need to manage billing with ease and
          confidence.
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
    </section>
  );
}
