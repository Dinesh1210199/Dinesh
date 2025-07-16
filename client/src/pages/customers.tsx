import { Header } from "@/components/layout/header";
import { CustomerTable } from "@/components/customers/customer-table";

export default function Customers() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Customer Management" />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <CustomerTable />
      </main>
    </div>
  );
}
