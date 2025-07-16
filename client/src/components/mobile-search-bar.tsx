import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MobileSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilter: "all" | "paid" | "pending";
  onFilterChange: (filter: "all" | "paid" | "pending") => void;
  sortBy?: "name" | "date" | "room";
  onSortChange?: (sort: "name" | "date" | "room") => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  resultCount?: number;
  onClear?: () => void;
}

export default function MobileSearchBar({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  sortBy = "name",
  onSortChange,
  sortOrder = "asc",
  onSortOrderChange,
  resultCount,
  onClear
}: MobileSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleClear = () => {
    onSearchChange("");
    onFilterChange("all");
    onClear?.();
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students, rooms, or mobile..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => onSearchChange("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 ${showFilters ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex space-x-2">
              <Select value={selectedFilter} onValueChange={onFilterChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                </SelectContent>
              </Select>
              
              {onSortChange && (
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {onSortOrderChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-gray-500"
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-blue-600"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {(searchTerm || selectedFilter !== "all") && resultCount !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {resultCount} result{resultCount !== 1 ? 's' : ''}
              </Badge>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  "{searchTerm}"
                </Badge>
              )}
              {selectedFilter !== "all" && (
                <Badge variant="outline" className="text-xs">
                  {selectedFilter}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-gray-500"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}