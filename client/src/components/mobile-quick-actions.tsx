import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, RotateCcw, Download, Upload, Bell } from "lucide-react";

interface MobileQuickActionsProps {
  onAddStudent: () => void;
  onSearch: () => void;
  onFilter: () => void;
  onRefresh: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onNotifications?: () => void;
  unreadCount?: number;
  stats: {
    totalStudents: number;
    paidStudents: number;
    pendingStudents: number;
    totalCollected: number;
  };
}

export default function MobileQuickActions({
  onAddStudent,
  onSearch,
  onFilter,
  onRefresh,
  onExport,
  onImport,
  onNotifications,
  unreadCount = 0,
  stats
}: MobileQuickActionsProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <div className="text-xs text-gray-500">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatAmount(stats.totalCollected)}</div>
              <div className="text-xs text-gray-500">Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.paidStudents}</div>
              <div className="text-xs text-gray-500">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.pendingStudents}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={onAddStudent}
              className="flex flex-col items-center justify-center h-16 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span className="text-xs">Add Student</span>
            </Button>
            
            <Button
              onClick={onSearch}
              variant="outline"
              className="flex flex-col items-center justify-center h-16"
            >
              <Search className="w-5 h-5 mb-1" />
              <span className="text-xs">Search</span>
            </Button>
            
            <Button
              onClick={onFilter}
              variant="outline"
              className="flex flex-col items-center justify-center h-16"
            >
              <Filter className="w-5 h-5 mb-1" />
              <span className="text-xs">Filter</span>
            </Button>
            
            <Button
              onClick={onRefresh}
              variant="outline"
              className="flex flex-col items-center justify-center h-16"
            >
              <RotateCcw className="w-5 h-5 mb-1" />
              <span className="text-xs">Refresh</span>
            </Button>
            
            {onNotifications && (
              <Button
                onClick={onNotifications}
                variant="outline"
                className="flex flex-col items-center justify-center h-16 relative"
              >
                <Bell className="w-5 h-5 mb-1" />
                <span className="text-xs">Alerts</span>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}
            
            {onExport && (
              <Button
                onClick={onExport}
                variant="outline"
                className="flex flex-col items-center justify-center h-16"
              >
                <Download className="w-5 h-5 mb-1" />
                <span className="text-xs">Export</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}