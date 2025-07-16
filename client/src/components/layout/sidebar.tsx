import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  CreditCard, 
  Cake, 
  Users, 
  Package, 
  FileText, 
  Settings,
  Store,
  LogOut,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "POS Terminal", href: "/pos", icon: CreditCard },
  { name: "Products", href: "/products", icon: Cake },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SecureCloudPOS</h1>
            <p className="text-sm text-gray-500">Bakery System</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-600" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              )}>
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          onClick={logout}
          variant="outline" 
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
