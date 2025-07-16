import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Phone, Search, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileFabProps {
  onAddStudent: () => void;
  onQuickCall?: () => void;
  onQuickMessage?: () => void;
  onQuickSearch?: () => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export default function MobileFab({
  onAddStudent,
  onQuickCall,
  onQuickMessage,
  onQuickSearch,
  expanded = false,
  onToggleExpanded
}: MobileFabProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Actions */}
      {expanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-5">
          {onQuickSearch && (
            <Button
              onClick={onQuickSearch}
              size="sm"
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {onQuickCall && (
            <Button
              onClick={onQuickCall}
              size="sm"
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
            >
              <Phone className="w-5 h-5" />
            </Button>
          )}
          
          {onQuickMessage && (
            <Button
              onClick={onQuickMessage}
              size="sm"
              className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={onToggleExpanded ? onToggleExpanded : onAddStudent}
        size="lg"
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform hover:scale-105"
      >
        <Plus className={`w-6 h-6 transition-transform ${expanded ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  );
}