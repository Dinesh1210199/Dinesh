import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { CreditCard, Plus, BarChart3, Package } from "lucide-react";

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      label: "Open POS Terminal",
      icon: CreditCard,
      variant: "default" as const,
      onClick: () => setLocation("/pos")
    },
    {
      label: "Add New Product", 
      icon: Plus,
      variant: "secondary" as const,
      onClick: () => setLocation("/products")
    },
    {
      label: "Generate Report",
      icon: BarChart3, 
      variant: "outline" as const,
      onClick: () => setLocation("/reports")
    },
    {
      label: "Manage Inventory",
      icon: Package,
      variant: "outline" as const,
      onClick: () => setLocation("/inventory")
    }
  ];

  const recentActivity = [
    { label: "Order #1234 completed", status: "success" },
    { label: "New customer registered", status: "info" },
    { label: "Inventory updated", status: "warning" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                className="w-full justify-start"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "success" 
                    ? "bg-green-500" 
                    : activity.status === "info"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                }`} />
                <p className="text-sm text-gray-600">{activity.label}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
