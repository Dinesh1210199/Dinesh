import { Header } from "@/components/layout/header";
import { ProductTable } from "@/components/products/product-table";

export default function Products() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Product Management" />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <ProductTable />
      </main>
    </div>
  );
}
