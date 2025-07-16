import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Home, Users, Receipt, TrendingUp, Settings, LogOut, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  unreadNotifications: number;
}

export default function MobileNavigation({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen, 
  unreadNotifications 
}: MobileNavigationProps) {
  const { admin, logout } = useAuth();
  const isMobile = useIsMobile();

  const navigationItems = [
    { id: "money", label: "Money Flow", icon: TrendingUp },
    { id: "students", label: "Students", icon: Users },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Admin Portal</p>
                <p className="text-sm text-gray-500">Welcome, {admin?.username}</p>
              </div>
            </div>
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadNotifications}
              </Badge>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start text-left h-12 ${
                  activeTab === item.id 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t pt-4 space-y-2">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
            <div className="text-xs text-gray-500 text-center py-2">
              v1.0.0 | Mobile Optimized
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}