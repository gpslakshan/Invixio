import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Invoice } from "@/types";

async function getData(): Promise<Invoice[]> {
  // Fetch data from your API here.

  const invoices: Invoice[] = [
    {
      id: "inv-001",
      customer: "Alice Johnson",
      amount: 250.0,
      status: "pending",
      date: "2025-07-15",
    },
    {
      id: "inv-002",
      customer: "Bob Smith",
      amount: 1200.5,
      status: "processing",
      date: "2025-07-10",
    },
    {
      id: "inv-003",
      customer: "Carol Lee",
      amount: 430.75,
      status: "success",
      date: "2025-07-05",
    },
    {
      id: "inv-004",
      customer: "David Kim",
      amount: 89.99,
      status: "failed",
      date: "2025-07-01",
    },
    {
      id: "inv-005",
      customer: "Eve Thompson",
      amount: 300.0,
      status: "success",
      date: "2025-06-28",
    },
    {
      id: "inv-006",
      customer: "Frank White",
      amount: 560.1,
      status: "processing",
      date: "2025-07-12",
    },
    {
      id: "inv-007",
      customer: "Grace Green",
      amount: 799.99,
      status: "pending",
      date: "2025-07-18",
    },
    {
      id: "inv-008",
      customer: "Henry Black",
      amount: 150.75,
      status: "success",
      date: "2025-06-30",
    },
    {
      id: "inv-009",
      customer: "Ivy Brown",
      amount: 945.2,
      status: "failed",
      date: "2025-07-03",
    },
    {
      id: "inv-010",
      customer: "Jack Wilson",
      amount: 400.0,
      status: "processing",
      date: "2025-07-07",
    },
  ];

  return invoices;
}

export default async function InvoicesPage() {
  const data = await getData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <p>Manage your Invoices here.</p>

      <div className="mt-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
