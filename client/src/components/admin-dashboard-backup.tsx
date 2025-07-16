import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localDataManager } from "@/lib/local-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, Search, Users, CheckCircle, Clock, DollarSign, Settings, LogOut, Menu, X, AlertTriangle, RotateCcw, ChevronDown, Receipt, Home, TrendingUp, Bell, User } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "paid" | "pending">("all");
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

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





  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate stats
  const stats = {
    totalStudents: students.length,
    paidStudents: students.filter(s => s.feeStatus === "paid").length,
    pendingStudents: students.filter(s => s.feeStatus === "pending").length,
    totalCollected: students.filter(s => s.feeStatus === "paid").length * (hostelSettings?.monthlyFee || 5000),
  };

  // Form for adding/editing students
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      room: "",
      joiningDate: "",
      feeStatus: "pending",
    },
  });

  // Mutations
  const addStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      console.log("Adding student with data:", data);
      
      // Create student with proper data structure
      const studentData = {
        ...data,
        updatedBy: "admin" as const,
        lastUpdated: new Date().toISOString()
      };
      
      // Create student locally first for immediate UI update
      const localStudent = await localDataManager.addStudent(studentData);
      console.log("Student created locally for immediate UI:", localStudent);
      
      return localStudent;
    },
    onSuccess: () => {
      toast({ title: "Student added successfully" });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Failed to add student:", error);
      toast({ title: "Failed to add student", variant: "destructive" });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
      console.log("Updating student with data:", data);
      
      // If updating fee status, handle payment mode properly
      if (data.feeStatus) {
        const updatedData = {
          ...data,
          paymentMode: data.feeStatus === "paid" ? (data.paymentMode || "cash") : undefined,
          updatedBy: "admin" as const,
          lastUpdated: new Date().toISOString()
        };
        console.log("Processed update data:", updatedData);
        const updatedStudent = await localDataManager.updateStudent(id, updatedData);
        return updatedStudent;
      }
      
      const updatedStudent = await localDataManager.updateStudent(id, data);
      return updatedStudent;
    },
    onSuccess: (updatedStudent) => {
      toast({ title: "Student updated successfully" });
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      form.reset();
      
      // Force update the query cache with the new data
      queryClient.setQueryData(["students"], (oldData: Student[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(student => 
          student.id === updatedStudent?.id ? updatedStudent : student
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Update student error:", error);
      toast({ title: "Failed to update student", variant: "destructive" });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      console.log("Deleting student:", studentId);
      const success = await localDataManager.deleteStudent(studentId);
      return success;
    },
    onSuccess: () => {
      toast({ title: "Student deleted successfully" });
      
      // Force refresh the query cache
      queryClient.refetchQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Delete student error:", error);
      toast({ title: "Failed to delete student", variant: "destructive" });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ studentId, paymentMode, updatedBy = "admin" }: { studentId: string; paymentMode: "upi" | "cash"; updatedBy?: "admin" | "student" }) => {
      console.log("Marking student as paid:", studentId, paymentMode);
      const updatedStudent = await localDataManager.updateStudentFeeStatus(studentId, "paid", paymentMode, updatedBy);
      console.log("Mark as paid result:", updatedStudent);
      return updatedStudent;
    },
    onSuccess: (updatedStudent) => {
      toast({ title: "Payment marked as paid" });
      
      // Force update the query cache with the new data
      queryClient.setQueryData(["students"], (oldData: Student[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(student => 
          student.id === updatedStudent?.id ? updatedStudent : student
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Mark as paid error:", error);
      toast({ title: "Failed to mark payment", variant: "destructive" });
    },
  });

  const toggleFeeStatusMutation = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) => {
      console.log("Toggle fee status for student:", studentId);
      const students = await localDataManager.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (!student) return Promise.reject("Student not found");
      
      console.log("Current student:", student);
      
      // Always set to pending when toggling from paid
      const updatedStudent = await localDataManager.updateStudentFeeStatus(
        studentId, 
        "pending",
        undefined, // Remove payment mode for pending
        "admin"
      );
      console.log("Updated student:", updatedStudent);
      return updatedStudent;
    },
    onSuccess: (updatedStudent) => {
      toast({ title: "Fee status updated to pending" });
      
      // Force update the query cache with the new data
      queryClient.setQueryData(["students"], (oldData: Student[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(student => 
          student.id === updatedStudent?.id ? updatedStudent : student
        );
      });
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Toggle fee status error:", error);
      toast({ title: "Failed to update fee status", variant: "destructive" });
    },
  });

  const onSubmit = (data: StudentFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    // Add auto-generated fields for new students
    const studentData = {
      ...data,
      updatedBy: "admin" as const
      // lastUpdated will be handled by Firebase service
    };
    
    if (editingStudent) {
      updateStudentMutation.mutate({ id: editingStudent.id, data: studentData });
    } else {
      addStudentMutation.mutate(studentData);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      name: student.name,
      mobile: student.mobile,
      room: student.room,
      joiningDate: student.joiningDate,
      feeStatus: student.feeStatus,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const handleMarkAsPaid = (studentId: string, paymentMode: "upi" | "cash") => {
    markAsPaidMutation.mutate({ studentId, paymentMode });
  };

  const handleToggleStatus = (studentId: string) => {
    toggleFeeStatusMutation.mutate({ studentId });
  };

  const getFeeStatusDisplay = (student: Student) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-amber-100 text-amber-800",
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
        {/* Desktop Header */}
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
            
            {/* Navigation Tabs */}
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

            {/* Desktop Actions */}
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

      {/* Mobile Layout with Sidebar */}
      <div className="md:hidden">
        {/* Mobile Header */}
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

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
              {/* Sidebar Header */}
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

              {/* Main Navigation */}
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

              {/* Stats Cards in Sidebar */}
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                    <div className="text-xs text-gray-600">Total Students</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-600">{stats.paidStudents}</div>
                    <div className="text-xs text-gray-600">Fees Paid</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-amber-600">{stats.pendingStudents}</div>
                    <div className="text-xs text-gray-600">Fees Pending</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <div className="text-sm font-bold text-emerald-600">{formatAmount(stats.totalCollected)}</div>
                    <div className="text-xs text-gray-600">Money Collected</div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
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

      {/* Content Area */}
      <div className="md:block">
        {/* Desktop Content */}
        <div className="hidden md:block">
          {activeTab === "money" ? (
            <CashFlowDashboard />
          ) : activeTab === "expenses" ? (
            <ExpenseManagement />
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
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card 
            className={`border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === "all" ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => setSelectedFilter("all")}
          >
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">👥 Total Students</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === "paid" ? "ring-2 ring-green-500 bg-green-50" : ""
            }`}
            onClick={() => setSelectedFilter("paid")}
          >
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">✅ Fees Paid</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.paidStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === "pending" ? "ring-2 ring-amber-500 bg-amber-50" : ""
            }`}
            onClick={() => setSelectedFilter("pending")}
          >
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">⏳ Fees Pending</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pendingStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">💰 Money Collected</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatAmount(stats.totalCollected)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">👥 Students & Fee Collection</h1>
            {selectedFilter !== "all" && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-sm text-gray-500 mr-2">Showing:</span>
                <Badge className={`${
                  selectedFilter === "paid" ? "bg-green-100 text-green-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} ({filteredStudents.length})
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFilter("all")}
                  className="ml-2 text-xs"
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  onClick={() => {
                    console.log("Add Student dialog trigger clicked");
                    setIsAddDialogOpen(true);
                    form.reset({
                      name: "",
                      mobile: "",
                      room: "",
                      joiningDate: "",
                      feeStatus: "pending",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addStudentMutation.isPending}
                        onClick={(e) => {
                          console.log("Add Student button clicked");
                          console.log("Form state:", form.formState);
                          console.log("Form values:", form.getValues());
                          console.log("Form errors:", form.formState.errors);
                          
                          // Manual validation check
                          const values = form.getValues();
                          if (!values.name || !values.mobile || !values.room || !values.joiningDate) {
                            console.log("Missing required fields");
                            return;
                          }
                          
                          // Force form submission if validation passes
                          form.handleSubmit(onSubmit)(e);
                        }}
                      >
                        {addStudentMutation.isPending ? "Adding..." : "Add Student"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-600">{stats.totalStudents}</div>
                <div className="text-xs text-gray-600">Total Students</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-600">{formatAmount(stats.totalCollected)}</div>
                <div className="text-xs text-gray-600">Collected</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-600">{stats.paidStudents}</div>
                <div className="text-xs text-gray-600">Paid</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-amber-600">{stats.pendingStudents}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Add Student Button */}
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            
            {/* Students List */}
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <MobileStudentCard
                  key={student.id}
                  student={student}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkAsPaid={handleMarkAsPaid}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Students Table - Desktop */}
        <Card className="border border-gray-200 hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {getInitials(student.name)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.room}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">+91 {student.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(student.joiningDate).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getFeeStatusDisplay(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.paymentMode ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.paymentMode === 'upi' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {student.paymentMode}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.updatedBy ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.updatedBy === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {student.updatedBy}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-6"
                              disabled={markAsPaidMutation.isPending || toggleFeeStatusMutation.isPending}
                            >
                              {student.feeStatus === "paid" ? "Paid" : "Mark Paid"} <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {student.feeStatus !== "paid" ? (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "upi" })}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  Mark as UPI Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "cash" })}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  Mark as Cash Paid
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "upi" })}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  Change to UPI
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "cash" })}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  Change to Cash
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => toggleFeeStatusMutation.mutate({ studentId: student.id })}
                                  disabled={toggleFeeStatusMutation.isPending}
                                >
                                  Mark as Pending
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="p-1 h-7 w-7"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="p-1 h-7 w-7 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No students found matching your search.</p>
            </div>
          )}
        </Card>

        {/* Students Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {getInitials(student.name)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">Room {student.room}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getFeeStatusDisplay(student)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-gray-500">Mobile:</span>
                    <div className="font-medium">+91 {student.mobile}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <div className="font-medium">
                      {new Date(student.joiningDate).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  {student.paymentMode && (
                    <div>
                      <span className="text-gray-500">Payment:</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.paymentMode === 'upi' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {student.paymentMode}
                        </span>
                      </div>
                    </div>
                  )}
                  {student.updatedBy && (
                    <div>
                      <span className="text-gray-500">Updated by:</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.updatedBy === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {student.updatedBy}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        disabled={markAsPaidMutation.isPending || toggleFeeStatusMutation.isPending}
                      >
                        {student.feeStatus === "paid" ? "Paid" : "Mark as Paid"} <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {student.feeStatus !== "paid" ? (
                        <>
                          <DropdownMenuItem 
                            onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "upi" })}
                            disabled={markAsPaidMutation.isPending}
                          >
                            Mark as UPI Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "cash" })}
                            disabled={markAsPaidMutation.isPending}
                          >
                            Mark as Cash Paid
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem 
                            onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "upi" })}
                            disabled={markAsPaidMutation.isPending}
                          >
                            Change to UPI
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => markAsPaidMutation.mutate({ studentId: student.id, paymentMode: "cash" })}
                            disabled={markAsPaidMutation.isPending}
                          >
                            Change to Cash
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleFeeStatusMutation.mutate({ studentId: student.id })}
                            disabled={toggleFeeStatusMutation.isPending}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="flex space-x-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(student)}
                      className="p-2 h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      className="p-2 h-8 w-8 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredStudents.length === 0 && (
            <Card className="border border-gray-200">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No students found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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
          </DialogContent>
        </Dialog>
        </div>
      )}
            </div>
          )}
        </div>

        {/* Mobile Content */}
        <div className="md:hidden pt-14">
          {activeTab === "money" ? (
            <CashFlowDashboard />
          ) : activeTab === "expenses" ? (
            <ExpenseManagement />
          ) : activeTab === "profile" ? (
            <AdminProfile />
          ) : activeTab === "settings" ? (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
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
            <div className="p-4 space-y-4">
              {/* Mobile Students Content */}
              <MobileSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                resultCount={filteredStudents.length}
              />
              
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
                      onMarkAsPaid={(id, paymentMode) => 
                        updateStudentMutation.mutate({
                          id,
                          feeStatus: "paid",
                          paymentMode,
                          lastUpdated: new Date().toISOString(),
                          updatedBy: "admin",
                        })
                      }
                      onToggleStatus={(id) => {
                        const student = filteredStudents.find(s => s.id === id);
                        if (student) {
                          const newStatus = student.feeStatus === "paid" ? "pending" : "paid";
                          updateStudentMutation.mutate({
                            id,
                            feeStatus: newStatus,
                            paymentMode: newStatus === "paid" ? "upi" : undefined,
                            lastUpdated: new Date().toISOString(),
                            updatedBy: "admin",
                          });
                        }
                      }}
                    />
                  ))
                )}
              </div>

              {/* Add Student Button */}
              <div className="fixed bottom-4 right-4">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 rounded-full w-14 h-14 shadow-lg"
                      onClick={() => {
                        setIsAddDialogOpen(true);
                        form.reset({
                          name: "",
                          mobile: "",
                          room: "",
                          joiningDate: "",
                          feeStatus: "pending",
                        });
                      }}
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 max-h-[90vh] overflow-y-auto">
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
            </div>
          )}
        </div>
      </div>

      {/* Notification Center - Rendered at Root Level */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />
    </div>
  );
}