import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@shared/schema";
import { localDataManager } from "@/lib/local-data";
import { useToast } from "@/hooks/use-toast";
import { clearAllExpenses } from "@/lib/clear-expenses";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Wrench, 
  Users, 
  Home, 
  Zap,
  Calendar,
  Filter,
  Search,
  Download,
  TrendingUp,
  ShoppingCart,
  Wifi
} from "lucide-react";

// Category icons mapping
const categoryIcons = {
  maintenance: Wrench,
  salary: Users,
  rent: Home,
  utility: Zap,
  grocery: ShoppingCart,
  wifi: Wifi,
  other: DollarSign
};

// Category colors mapping
const categoryColors = {
  maintenance: "bg-orange-100 text-orange-800",
  salary: "bg-blue-100 text-blue-800", 
  rent: "bg-purple-100 text-purple-800",
  utility: "bg-green-100 text-green-800",
  grocery: "bg-emerald-100 text-emerald-800",
  wifi: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800"
};

// Payment method colors
const paymentMethodColors = {
  cash: "bg-green-100 text-green-800",
  upi: "bg-blue-100 text-blue-800",
  bank_transfer: "bg-purple-100 text-purple-800",
  cheque: "bg-yellow-100 text-yellow-800"
};

interface ExpenseFormData {
  category: Expense['category'];
  description: string;
  amount: number;
  date: string;
  paymentMethod: Expense['paymentMethod'];
  recipientName?: string;
  notes?: string;
  createdBy: string;
}

function ExpenseForm({ expense, onSubmit, onCancel }: {
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: expense?.category || "maintenance",
    description: expense?.description || "",
    amount: expense?.amount || 0,
    date: expense?.date || new Date().toISOString().split('T')[0],
    paymentMethod: expense?.paymentMethod || "cash",
    recipientName: expense?.recipientName || "",
    notes: expense?.notes || "",
    createdBy: "admin"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {expense ? "Edit Expense" : "Add New Expense"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as Expense['category']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="maintenance">🔧 Repairs & Maintenance</option>
              <option value="salary">👥 Staff Salaries</option>
              <option value="rent">🏠 Rent & Property</option>
              <option value="utility">⚡ Electricity & Water</option>
              <option value="grocery">🥬 Groceries & Food</option>
              <option value="wifi">📶 Internet & WiFi</option>
              <option value="other">📋 Other Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of expense"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData, 
                  amount: value === "" ? 0 : parseFloat(value) || 0
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select 
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as Expense['paymentMethod']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="cash">💵 Cash Payment</option>
              <option value="upi">📱 UPI/PhonePe</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
              <option value="cheque">📝 Cheque Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name (Optional)</label>
            <input
              type="text"
              value={formData.recipientName || ""}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name of recipient/vendor (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or details"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {expense ? "Update" : "Add"} Expense
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpenseManagement() {
  const [activeTab, setActiveTab] = useState<"overview" | "expenses">("overview");
  const [selectedCategory, setSelectedCategory] = useState<"all" | Expense['category']>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<string | null>(null);

  // Simple formatting for money that anyone can understand
  const formatSimpleMoney = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Simple category names with emojis that anyone can understand
  const simpleCategoryNames = {
    maintenance: "🔧 Repairs & Maintenance",
    salary: "👥 Staff Salaries", 
    rent: "🏠 Rent & Property",
    utility: "⚡ Electricity & Water",
    grocery: "🥬 Groceries & Food",
    wifi: "📶 Internet & WiFi",
    other: "📋 Other Expenses"
  };

  // Simple payment method names
  const simplePaymentNames = {
    cash: "💵 Cash Payment",
    upi: "📱 UPI/PhonePe",
    bank_transfer: "🏦 Bank Transfer",
    cheque: "📝 Cheque Payment"
  };
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => localDataManager.getAllExpenses(),
  });

  // Filter expenses based on search and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.recipientName && expense.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals by category
  const categoryTotals = localDataManager.getTotalExpensesByCategory();
  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  const monthlyTotal = localDataManager.getMonthlyExpenseTotal(selectedYear, selectedMonth);

  // Clear all expenses mutation
  const clearAllExpensesMutation = useMutation({
    mutationFn: () => clearAllExpenses(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "All expense records have been cleared",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear expenses. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutations
  const addExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => localDataManager.addExpense(data),
    onSuccess: () => {
      toast({ title: "Expense added successfully" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: () => {
      toast({ title: "Failed to add expense", variant: "destructive" });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) => 
      localDataManager.updateExpense(id, data),
    onSuccess: () => {
      toast({ title: "Expense updated successfully" });
      setEditingExpense(null);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: () => {
      toast({ title: "Failed to update expense", variant: "destructive" });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => localDataManager.deleteExpense(expenseId),
    onSuccess: () => {
      toast({ title: "Expense deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: () => {
      toast({ title: "Failed to delete expense", variant: "destructive" });
    },
  });

  const handleSubmitForm = (data: ExpenseFormData) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      addExpenseMutation.mutate(data);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  // Format currency in Indian style
  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  // Get month name helper
  const getMonthName = (monthIndex: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIndex];
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">💸 Business Expense Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track maintenance, salaries, rent, and utility expenses</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setShowForm(true);
          }}
          className="mt-3 sm:mt-0 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4 sm:mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors ${
            activeTab === "expenses"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Expenses
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Category Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6">
            {Object.entries(categoryTotals).map(([category, total]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || DollarSign;
              const colorClass = categoryColors[category as keyof typeof categoryColors];
              
              return (
                <div 
                  key={category} 
                  className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedCategory(category as Expense['category']);
                    setActiveTab("expenses");
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('-800', '-100')} mb-2 sm:mb-0`}>
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <div className="sm:ml-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 capitalize">
                        {simpleCategoryNames[category as keyof typeof simpleCategoryNames] || category}
                      </h3>
                      <p className="text-sm sm:text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Monthly Summary</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">{getMonthName(selectedMonth)} {selectedYear}</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900">{formatCurrency(monthlyTotal)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-green-600 font-medium">All Time Total</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-purple-600 font-medium">Total Records</p>
                    <p className="text-2xl font-bold text-purple-900">{expenses.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as "all" | Expense['category'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="salary">Salary</option>
                  <option value="rent">Rent</option>
                  <option value="utility">Utility</option>
                  <option value="grocery">Grocery & Food</option>
                  <option value="wifi">Internet & WiFi</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expenses List - Mobile Cards & Desktop Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading expenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No expenses found matching your criteria.</p>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="block sm:hidden p-4 space-y-4">
                  {filteredExpenses.map((expense) => {
                    const Icon = categoryIcons[expense.category] || DollarSign;
                    return (
                      <div key={expense.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${categoryColors[expense.category]?.replace('text-', 'bg-').replace('-800', '-100')}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${categoryColors[expense.category]}`}>
                                {simpleCategoryNames[expense.category] || expense.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs">Date</div>
                            <div className="text-gray-900 font-medium">
                              {new Date(expense.date).toLocaleDateString('en-GB')}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Payment</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${paymentMethodColors[expense.paymentMethod]}`}>
                              {simplePaymentNames[expense.paymentMethod] || expense.paymentMethod.replace('_', ' ')}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Recipient</div>
                            <div className="text-gray-900">{expense.recipientName || "Not specified"}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Added By</div>
                            <div className="text-gray-900">{expense.createdBy}</div>
                          </div>
                        </div>

                        {/* Notes */}
                        {expense.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-gray-500 text-xs">Notes</div>
                            <div className="text-gray-900 text-sm">{expense.notes}</div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-3 py-1 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category & Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredExpenses.map((expense) => {
                        const Icon = categoryIcons[expense.category] || DollarSign;
                        return (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${categoryColors[expense.category]?.replace('text-', 'bg-').replace('-800', '-100')}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${categoryColors[expense.category]}`}>
                                    {expense.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(expense.date).toLocaleDateString('en-GB')}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${paymentMethodColors[expense.paymentMethod]}`}>
                                {expense.paymentMethod.replace('_', ' ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{expense.recipientName || "Not specified"}</div>
                              {expense.notes && (
                                <div className="text-xs text-gray-500 truncate max-w-xs" title={expense.notes}>
                                  {expense.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Edit expense"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense || undefined}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}