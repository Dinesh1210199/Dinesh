import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OrderWithItems } from "@shared/schema";

export function RecentOrders() {
  const { data: recentOrders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/dashboard/recent-orders"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm">View All Orders</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm">View All Orders</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {order.items?.length || 0} items
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    ₹{order.total}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                    {order.paymentMethod}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={order.status === "completed" ? "default" : "secondary"}
                      className={
                        order.status === "completed" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      }
                    >
                      {order.status === "completed" ? "Completed" : "Processing"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recentOrders?.length && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent orders</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
