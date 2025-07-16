import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ShoppingCart, Calculator, AlertTriangle } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

export function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const metricCards = [
    {
      title: "Today's Sales",
      value: metrics.todaySales,
      change: "+15.2%",
      trend: "up",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Orders Today",
      value: metrics.ordersToday.toString(),
      change: "+8.5%", 
      trend: "up",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Average Order",
      value: metrics.averageOrder,
      change: "-2.1%",
      trend: "down", 
      icon: Calculator,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "Low Stock Items",
      value: metrics.lowStockItems.toString(),
      change: "Action needed",
      trend: "warning",
      icon: AlertTriangle,
      iconBg: "bg-red-100", 
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === "up";
        const isWarning = metric.trend === "warning";
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${
                    isWarning 
                      ? "text-red-600" 
                      : isPositive 
                        ? "text-green-600" 
                        : "text-orange-600"
                  }`}>
                    {!isWarning && (
                      <TrendingUp className={`h-3 w-3 mr-1 ${!isPositive ? "rotate-180" : ""}`} />
                    )}
                    {isWarning && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {metric.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${metric.iconBg} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
