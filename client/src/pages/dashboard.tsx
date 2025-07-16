import { Header } from "@/components/layout/header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { PopularItems } from "@/components/dashboard/popular-items";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentOrders } from "@/components/dashboard/recent-orders";

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PopularItems />
          <QuickActions />
        </div>

        <RecentOrders />
      </main>
    </div>
  );
}
