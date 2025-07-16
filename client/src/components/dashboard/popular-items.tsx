import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PopularItem } from "@shared/schema";

export function PopularItems() {
  const { data: popularItems, isLoading } = useQuery<PopularItem[]>({
    queryKey: ["/api/dashboard/popular-items"],
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Popular Items Today</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Popular Items Today</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularItems?.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <img 
                src={item.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{item.sold} sold</p>
                <p className="text-sm text-gray-500">{item.revenue}</p>
              </div>
            </div>
          ))}
          {!popularItems?.length && (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales data available for today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
