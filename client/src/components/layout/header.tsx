import { useOfflineSync } from "@/hooks/use-local-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Cloud, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { isOnline, lastSyncTime } = useOfflineSync();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">
            Today - {formatDate(new Date())}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant={isOnline ? "default" : "destructive"} 
            className={cn(
              "flex items-center space-x-2",
              isOnline 
                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                : "bg-red-100 text-red-800 hover:bg-red-100"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-sm font-medium">
              {isOnline ? "Online" : "Offline"}
            </span>
          </Badge>
          
          <Badge variant="outline" className="flex items-center space-x-2 bg-blue-100 text-blue-800">
            {isOnline ? (
              <Cloud className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="text-sm font-medium">
              {lastSyncTime 
                ? `Synced ${lastSyncTime.toLocaleTimeString()}`
                : "Never synced"
              }
            </span>
          </Badge>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
