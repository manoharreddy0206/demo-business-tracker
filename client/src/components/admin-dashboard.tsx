import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localDataManager } from "@/lib/local-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, Search, Users, CheckCircle, Clock, DollarSign, Settings, LogOut, Menu, X, AlertTriangle, RotateCcw, ChevronDown, Receipt, Home, TrendingUp, Bell, User, List, Grid } from "lucide-react";
import ExpenseManagement from "@/components/expense-management";
import CashFlowDashboard from "@/components/cash-flow-dashboard";
import NotificationCenter from "@/components/notification-center";
import HostelSettingsForm from "@/components/hostel-settings-form";
import AdminProfile from "@/components/admin-profile";
import MobileStudentCard from "@/components/mobile-student-card";
import MobileSearchBar from "@/components/mobile-search-bar";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, Student } from "@shared/schema";
import { z } from "zod";

const studentFormSchema = insertStudentSchema.omit({ 
  lastUpdated: true, 
  updatedBy: true 
}).extend({
  joiningDate: z.string().min(1, "Joining date is required"),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"students" | "expenses" | "money" | "profile" | "settings">("students");
  const [showDemoInfo, setShowDemoInfo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "paid" | "pending">("all");
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [listType, setListType] = useState<"table" | "cards">("table");

  const [sortBy, setSortBy] = useState<"name" | "date" | "room">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { admin, logout } = useAuth();
  const isMobile = useIsMobile();

  // Helper function to format amounts in Indian currency
  const formatAmount = (amount: number) => {
    if (amount >= 10000000) { // 1 crore or more
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh or more
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) { // 1 thousand or more
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount}`;
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = localDataManager.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["hostelSettings"] });
    });
    return unsubscribe;
  }, [queryClient]);

  // Get user initials function
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      room: "",
      joiningDate: "",
      feeStatus: "pending",
      paymentMode: undefined,
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      console.log("Loading students from local storage");
      return await localDataManager.getAllStudents();
    },
  });

  const { data: hostelSettings } = useQuery({
    queryKey: ["hostelSettings"],
    queryFn: () => localDataManager.getHostelSettings(),
  });

  // Filter and sort students based on search term, selected filter, and sort options
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile.includes(searchTerm) ||
      student.room.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && student.feeStatus === selectedFilter;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "date":
        comparison = new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
        break;
      case "room":
        comparison = a.room.localeCompare(b.room);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate stats
  const stats = {
    totalStudents: students.length,
    paidStudents: students.filter(s => s.feeStatus === "paid").length,
    pendingStudents: students.filter(s => s.feeStatus === "pending").length,
    totalCollected: students
      .filter(s => s.feeStatus === "paid")
      .reduce((sum, s) => sum + (hostelSettings?.monthlyFee || 0), 0),
  };

  // Mutations
  const addStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      console.log("Adding student with data:", data);
      const studentData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin",
      };
      return await localDataManager.addStudent(studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Student Added",
        description: "New student has been added successfully.",
      });
      form.reset();
    },
    onError: (error) => {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (updates: Partial<Student> & { id: string }) => {
      return await localDataManager.updateStudent(updates.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      return await localDataManager.deleteStudent(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student Deleted",
        description: "Student has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ studentId, paymentMode }: { studentId: string; paymentMode: "upi" | "cash" }) => {
      return await localDataManager.updateStudent(studentId, {
        feeStatus: "paid",
        paymentMode,
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Payment Recorded",
        description: "Student fee has been marked as paid.",
      });
    },
    onError: (error) => {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentFormData) => {
    console.log("Form submission triggered with data:", data);
    addStudentMutation.mutate(data);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
    form.reset({
      name: student.name,
      mobile: student.mobile,
      room: student.room,
      joiningDate: student.joiningDate,
      feeStatus: student.feeStatus,
    });
  };

  const handleMarkAsPaid = (studentId: string, paymentMode: "upi" | "cash") => {
    markAsPaidMutation.mutate({ studentId, paymentMode });
  };

  const handleToggleStatus = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const newStatus = student.feeStatus === "paid" ? "pending" : "paid";
      updateStudentMutation.mutate({
        id: studentId,
        feeStatus: newStatus,
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin",
      });
    }
  };

  // Fee status display component
  const FeeStatusDisplay = ({ student }: { student: Student }) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
    };

    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <div className="flex flex-col">
        <Badge className={`${statusColors[student.feeStatus]} w-fit mb-1`}>
          {student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1)}
        </Badge>
        <span className="text-xs text-gray-400">
          {student.feeStatus === "paid" 
            ? formatDateTime(student.lastUpdated)
            : `Updated ${formatDateTime(student.lastUpdated)}`
          }
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">💼</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hostel Business Manager</h1>
                {admin && (
                  <p className="text-sm text-gray-500">Welcome back, {admin.username}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant={activeTab === "students" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("students")}
                className="px-4 py-2"
              >
                <Users className="w-4 h-4 mr-2" />
                Students
              </Button>
              <Button
                variant={activeTab === "expenses" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("expenses")}
                className="px-4 py-2"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Expenses
              </Button>
              <Button
                variant={activeTab === "money" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("money")}
                className="px-4 py-2"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Money Flow
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative"
              >
                <Bell className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {getInitials(admin?.username || "Admin")}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-14 fixed top-0 left-0 right-0 z-50">
          <div className="px-4 h-full flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <h1 className="text-lg font-bold text-gray-900">Business Manager</h1>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationCenterOpen(true)}
              className="p-2"
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">💼</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Business Manager</h2>
                      {admin && (
                        <p className="text-sm text-gray-500">Welcome, {admin.username}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <Button
                  variant={activeTab === "students" ? "default" : "ghost"}
                  className="w-full justify-start h-12 text-left"
                  onClick={() => {
                    setActiveTab("students");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Students
                </Button>
                <Button
                  variant={activeTab === "expenses" ? "default" : "ghost"}
                  className="w-full justify-start h-12 text-left"
                  onClick={() => {
                    setActiveTab("expenses");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Receipt className="w-5 h-5 mr-3" />
                  Expenses
                </Button>
                <Button
                  variant={activeTab === "money" ? "default" : "ghost"}
                  className="w-full justify-start h-12 text-left"
                  onClick={() => {
                    setActiveTab("money");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Money Flow
                </Button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setActiveTab("settings");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setActiveTab("profile");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-red-600 hover:text-red-800"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Credentials Banner */}
      {showDemoInfo && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Demo Version - Use these credentials:</p>
              <p className="text-sm opacity-90">Username: <span className="font-mono bg-white/20 px-2 py-1 rounded">admin</span> | Password: <span className="font-mono bg-white/20 px-2 py-1 rounded">admin123</span></p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDemoInfo(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Content Area */}
      {activeTab === "money" ? (
        <div className={`${isMobile ? "pt-16" : ""}`}>
          <CashFlowDashboard />
        </div>
      ) : activeTab === "expenses" ? (
        <div className={`${isMobile ? "pt-16" : ""}`}>
          <ExpenseManagement />
        </div>
      ) : activeTab === "profile" ? (
        <AdminProfile />
      ) : activeTab === "settings" ? (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6">Hostel Settings</h2>
          <HostelSettingsForm 
            settings={hostelSettings} 
            onSave={async (updatedSettings) => {
              try {
                await localDataManager.updateHostelSettings(updatedSettings);
                queryClient.setQueryData(["hostelSettings"], (oldData: any) => ({
                  ...oldData,
                  ...updatedSettings
                }));
                queryClient.invalidateQueries({ queryKey: ["hostelSettings"] });
                toast({
                  title: "Settings Saved",
                  description: "Hostel settings updated successfully.",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to save settings. Please try again.",
                  variant: "destructive",
                });
              }
            }}
          />
        </div>
      ) : (
        <div className={`${isMobile ? "pt-14" : ""} max-w-7xl mx-auto p-6`}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Management</h1>
            <p className="text-gray-600">Manage hostel student records and fee payments</p>
          </div>

          {/* Stats Cards */}
          <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4 mb-6`}>
            <Card 
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedFilter === "all" ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedFilter("all")}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedFilter === "paid" ? "ring-2 ring-green-500" : ""}`}
              onClick={() => setSelectedFilter("paid")}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Fees Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.paidStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedFilter === "pending" ? "ring-2 ring-amber-500" : ""}`}
              onClick={() => setSelectedFilter("pending")}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Fees Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Collected</p>
                    <p className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-gray-900`}>{formatAmount(stats.totalCollected)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Search Bar and Controls */}
          {isMobile ? (
            <>
              <MobileSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                resultCount={filteredStudents.length}
                onClear={() => setSearchTerm("")}
              />
              
              {/* Mobile Add Student Button */}
              <div className="mb-4">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-sm mx-auto sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input placeholder="10-digit mobile number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., A101" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="joiningDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Joining Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="feeStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fee Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fee status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.watch("feeStatus") === "paid" && (
                          <FormField
                            control={form.control}
                            name="paymentMode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addStudentMutation.isPending}>
                            {addStudentMutation.isPending ? "Adding..." : "Add Student"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={listType === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setListType("table")}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Table
                  </Button>
                  <Button
                    variant={listType === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setListType("cards")}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Cards
                  </Button>
                </div>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-sm mx-auto sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="10-digit mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="room"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., A101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="joiningDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Joining Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="feeStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fee Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fee status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("feeStatus") === "paid" && (
                        <FormField
                          control={form.control}
                          name="paymentMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Mode</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="upi">UPI</SelectItem>
                                  <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addStudentMutation.isPending}>
                          {addStudentMutation.isPending ? "Adding..." : "Add Student"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Student List */}
          {isMobile ? (
            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <MobileStudentCard
                    key={student.id}
                    student={student}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteStudentMutation.mutate(id)}
                    onMarkAsPaid={handleMarkAsPaid}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              )}
            </div>
          ) : listType === "table" ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Contact & Room</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">Joined: {new Date(student.joiningDate).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{student.mobile}</div>
                            <div className="text-sm text-gray-500">Room {student.room}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <FeeStatusDisplay student={student} />
                        </TableCell>
                        <TableCell>
                          {student.feeStatus === "paid" && student.paymentMode && (
                            <Badge variant="outline" className="text-xs">
                              {student.paymentMode.toUpperCase()}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">{student.updatedBy}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs px-2 py-1"
                                >
                                  {student.feeStatus === "paid" ? "Paid" : "Mark Paid"}
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {student.feeStatus === "pending" ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsPaid(student.id, "upi")}>
                                      Mark Paid - UPI
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkAsPaid(student.id, "cash")}>
                                      Mark Paid - Cash
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsPaid(student.id, "upi")}>
                                      Change to UPI
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkAsPaid(student.id, "cash")}>
                                      Change to Cash
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(student.id)}>
                                      Mark as Pending
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(student)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteStudentMutation.mutate(student.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <Badge variant={student.feeStatus === "paid" ? "default" : "secondary"}>
                          {student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{student.mobile}</p>
                        <p className="text-sm text-gray-600">Room {student.room}</p>
                        <p className="text-sm text-gray-500">Joined: {new Date(student.joiningDate).toLocaleDateString()}</p>
                        {student.feeStatus === "paid" && student.paymentMode && (
                          <Badge variant="outline" className="text-xs">
                            {student.paymentMode.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-500">By {student.updatedBy}</span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteStudentMutation.mutate(student.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Edit Student Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
              </DialogHeader>
              {editingStudent && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => {
                      updateStudentMutation.mutate({
                        id: editingStudent.id,
                        ...data,
                        lastUpdated: new Date().toISOString(),
                        updatedBy: "admin",
                      });
                    })}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit mobile number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., A101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="joiningDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Joining Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateStudentMutation.isPending}>
                        {updateStudentMutation.isPending ? "Updating..." : "Update Student"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />
    </div>
  );
}