import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@shared/schema";

export function CustomerTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers", searchQuery || undefined].filter(Boolean),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCustomer = (customerId: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
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
          <CardTitle>Customer Management</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Customer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="font-semibold text-gray-900">{customers?.length || 0} customers</span>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Balance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">GST Number</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers?.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      {customer.address && (
                        <p className="text-sm text-gray-500">{customer.address}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.phone || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.email || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline"
                      className={
                        customer.priceType === "wholesale" 
                          ? "bg-purple-100 text-purple-800"
                          : customer.priceType === "counter"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {(customer.priceType || 'counter').replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    ₹0.00
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.gstNumber || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {customer.priceType !== "counter" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          disabled={deleteCustomerMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!customers?.length && (
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
