import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { localDataManager } from "@/lib/local-data";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Wallet,
  Receipt,
  PiggyBank,
  Eye
} from "lucide-react";

export default function CashFlowDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => localDataManager.getAllStudents(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => localDataManager.getAllExpenses(),
  });

  const { data: hostelSettings } = useQuery({
    queryKey: ["hostelSettings"],
    queryFn: () => localDataManager.getHostelSettings(),
  });

  // Calculate money coming in (student fees)
  const paidStudents = students.filter(s => s.feeStatus === "paid");
  const totalIncome = paidStudents.length * (hostelSettings?.monthlyFee || 5000);
  
  // Calculate money going out (expenses)
  const monthlyExpenses = localDataManager.getMonthlyExpenseTotal(selectedYear, selectedMonth);
  
  // Calculate net profit/loss
  const netCashFlow = totalIncome - monthlyExpenses;
  const isProfit = netCashFlow > 0;

  // Format money in simple Indian format
  const formatMoney = (amount: number): string => {
    if (amount >= 10000000) { 
      return `₹${(amount / 10000000).toFixed(1)} Crore`;
    } else if (amount >= 100000) { 
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get month name
  const getMonthName = (monthIndex: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIndex];
  };

  // Category wise expenses for breakdown
  const categoryTotals = localDataManager.getTotalExpensesByCategory();
  
  // Category names for display
  const categoryDisplayNames = {
    maintenance: "🔧 Repairs & Maintenance",
    salary: "👥 Staff Salaries", 
    rent: "🏠 Rent & Property",
    utility: "⚡ Electricity & Water",
    grocery: "🥬 Groceries & Food",
    wifi: "📶 Internet & WiFi",
    other: "📋 Other Expenses"
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header with simple language */}
      <div className="text-center">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">💰 Business Money Flow</h1>
        <p className="text-sm sm:text-base text-gray-600">See how much money is coming in and going out</p>
        
        {/* Month/Year selector */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {getMonthName(i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-20 sm:w-24 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Cash Flow Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-6">
        {/* Money Coming In */}
        <Card className="border-2 border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6" onClick={() => setShowIncomeDetails(true)}>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <ArrowUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Money Coming In</h3>
                  <p className="text-xs sm:text-sm text-gray-600">From student fees</p>
                </div>
              </div>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="text-xl sm:text-3xl font-bold text-green-600">
                {formatMoney(totalIncome)}
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{paidStudents.length} students paid fees</span>
              </div>
              
              <div className="text-xs text-gray-500">
                Fee per student: {formatMoney(hostelSettings?.monthlyFee || 5000)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Money Going Out */}
        <Card className="border-2 border-red-200 bg-red-50 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6" onClick={() => setShowExpenseDetails(true)}>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                  <ArrowDown className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Money Going Out</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Business expenses</p>
                </div>
              </div>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="text-xl sm:text-3xl font-bold text-red-600">
                {formatMoney(monthlyExpenses)}
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{getMonthName(selectedMonth)} {selectedYear}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                Total business costs
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit/Loss */}
        <Card className={`border-2 ${isProfit ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 rounded-full ${isProfit ? 'bg-blue-100' : 'bg-orange-100'}`}>
                  {isProfit ? (
                    <PiggyBank className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                    {isProfit ? "Profit Made" : "Loss Incurred"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {isProfit ? "Money saved this month" : "Need to improve income"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className={`text-xl sm:text-3xl font-bold ${isProfit ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatMoney(Math.abs(netCashFlow))}
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                {isProfit ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                )}
                <span>{isProfit ? "Business is profitable" : "Expenses are high"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            Where Your Money Goes
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {Object.entries(categoryTotals).map(([category, amount]) => {
              const percentage = monthlyExpenses > 0 ? (amount / monthlyExpenses * 100) : 0;
              const categoryNames = {
                maintenance: "🔧 Repairs",
                salary: "👥 Salaries", 
                rent: "🏠 Rent",
                utility: "⚡ Utility",
                grocery: "🥬 Groceries",
                wifi: "📶 Internet",
                other: "📋 Other"
              };
              
              return (
                <div key={category} className="bg-gray-50 p-2 sm:p-4 rounded-lg">
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {categoryNames[category as keyof typeof categoryNames] || category}
                  </div>
                  <div className="text-sm sm:text-xl font-bold text-gray-900 mb-1">
                    {formatMoney(amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Simple Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-3 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            💡 Business Tips
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">📈 Increase Income:</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Get students to pay on time</li>
                <li>• Follow up with pending payments</li>
                <li>• Consider fee increases if needed</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">📉 Reduce Expenses:</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Track all expenses carefully</li>
                <li>• Save on utilities and maintenance</li>
                <li>• Plan work efficiently</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Details Dialog - Fixed for Mobile */}
      <Dialog open={showIncomeDetails} onOpenChange={setShowIncomeDetails}>
        <DialogContent className="max-w-xs sm:max-w-md max-h-[85vh] overflow-y-auto" aria-describedby="income-details-description">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">💰 Income Details</DialogTitle>
          </DialogHeader>
          <div id="income-details-description" className="sr-only">
            Detailed breakdown of income from student fees and payments
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm sm:text-base font-medium text-green-800 mb-2">Total Income</h4>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatMoney(totalIncome)}</p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-800">Fee Collection Details:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-gray-50 p-2 sm:p-3 rounded">
                  <p className="text-xs sm:text-sm text-gray-600">Students Paid</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{paidStudents.length}</p>
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded">
                  <p className="text-xs sm:text-sm text-gray-600">Fee per Student</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{formatMoney(hostelSettings?.monthlyFee || 5000)}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 sm:p-3 rounded">
                <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Details Dialog - Fixed for Mobile */}
      <Dialog open={showExpenseDetails} onOpenChange={setShowExpenseDetails}>
        <DialogContent className="max-w-xs sm:max-w-md max-h-[85vh] overflow-y-auto" aria-describedby="expense-details-description">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">💸 Expense Details</DialogTitle>
          </DialogHeader>
          <div id="expense-details-description" className="sr-only">
            Detailed breakdown of business expenses by category with percentages
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm sm:text-base font-medium text-red-800 mb-2">Total Expenses</h4>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{formatMoney(monthlyExpenses)}</p>
              <p className="text-xs sm:text-sm text-red-600">{getMonthName(selectedMonth)} {selectedYear}</p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-800">Category Breakdown:</h4>
              <div className="space-y-2">
                {Object.entries(categoryTotals).map(([category, amount]) => {
                  const percentage = monthlyExpenses > 0 ? (amount / monthlyExpenses * 100) : 0;
                  const categoryNames = {
                    maintenance: "🔧 Repairs",
                    salary: "👥 Salaries", 
                    rent: "🏠 Rent",
                    utility: "⚡ Utility",
                    grocery: "🥬 Groceries",
                    wifi: "📶 Internet",
                    other: "📋 Other"
                  };
                  
                  return (
                    <div key={category} className="bg-gray-50 p-2 sm:p-3 rounded flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {categoryNames[category as keyof typeof categoryNames]}
                        </p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatMoney(amount)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}