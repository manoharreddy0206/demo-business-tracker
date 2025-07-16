import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Receipt, User, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadNotifications?: number;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  unreadNotifications = 0
}: MobileBottomNavProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const tabs = [
    { id: "money", label: "Money", icon: TrendingUp },
    { id: "students", label: "Students", icon: Users },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center h-12 space-y-1 relative ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{tab.label}</span>
            
            {tab.id === "profile" && unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-500">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}