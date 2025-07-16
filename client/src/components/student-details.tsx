import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Check, CreditCard, Smartphone, QrCode, Clock } from "lucide-react";
import { Student, HostelSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { localDataManager } from "@/lib/local-data";
import UPIPayment from "./upi-payment";
import { useState } from "react";

interface StudentDetailsProps {
  student: Student;
  hostelSettings: HostelSettings;
  onMarkAsPaid: () => void;
  onPayNow: () => void;
  isLoading: boolean;
}

export default function StudentDetails({ 
  student, 
  hostelSettings, 
  onMarkAsPaid, 
  onPayNow, 
  isLoading 
}: StudentDetailsProps) {
  const { toast } = useToast();
  const [isProcessingUPI, setIsProcessingUPI] = useState(false);

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getFeeStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "overdue":
        return "Overdue";
      default:
        return "Pending";
    }
  };

  const handleAlreadyPaid = () => {
    toast({
      title: "Payment Marked",
      description: "Your payment status has been updated. Admin will verify soon.",
    });
    onMarkAsPaid();
  };

  const handleUPIPayment = () => {
    setIsProcessingUPI(true);
    
    // Simulate UPI payment initiation
    const payment = localDataManager.initiatePayment(
      student.id,
      hostelSettings.monthlyFee,
      "upi"
    );
    
    toast({
      title: "🔄 Processing UPI Payment",
      description: "Connecting to UPI gateway...",
    });
    
    // Start automatic verification
    localDataManager.simulateUPIPaymentVerification(payment.id);
    
    // Reset processing state after verification completes
    setTimeout(() => {
      setIsProcessingUPI(false);
      toast({
        title: "🎉 Payment Successful",
        description: "Your fee has been paid and verified automatically!",
      });
    }, 5500); // Slightly longer than the verification process
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
      <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-600 text-sm sm:text-base">Room {student.room}</p>
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Student Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">Mobile Number:</span>
                <span className="font-medium text-sm sm:text-base">+91 {student.mobile}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">Joining Date:</span>
                <span className="font-medium text-sm sm:text-base">{new Date(student.joiningDate).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">Fee Status:</span>
                <Badge className={getFeeStatusColor(student.feeStatus)}>
                  {getFeeStatusText(student.feeStatus)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">Monthly Fee:</span>
                <span className="font-medium text-base sm:text-lg">₹{hostelSettings.monthlyFee.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Actions */}
        <div className="space-y-3 sm:space-y-4">
          <Button 
            onClick={handleAlreadyPaid}
            disabled={isLoading || student.feeStatus === "paid"}
            className="w-full bg-green-600 hover:bg-green-700 py-3 sm:py-4 h-auto text-sm sm:text-base"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {student.feeStatus === "paid" ? "Already Paid" : "I Have Already Paid"}
          </Button>

          {/* Only show Pay Now button if enabled in settings */}
          {hostelSettings.enablePayNow && (
            <Button 
              onClick={handleUPIPayment}
              disabled={isLoading || student.feeStatus === "paid" || isProcessingUPI}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 sm:py-4 h-auto text-sm sm:text-base"
            >
              {isProcessingUPI ? (
                <>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {student.feeStatus === "paid" ? "Payment Complete" : "Pay Now via UPI"}
                </>
              )}
            </Button>
          )}

          {/* UPI Payment Info - only show if Pay Now is enabled */}
          {student.feeStatus === "pending" && hostelSettings.enablePayNow && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4" />
                <span className="font-medium">Quick UPI Payment</span>
              </div>
              <p className="text-xs">
                Click "Pay Now via UPI" for instant payment and automatic verification. 
                No need to wait for admin approval!
              </p>
            </div>
          )}

          {/* Message when Pay Now is disabled */}
          {!hostelSettings.enablePayNow && student.feeStatus === "pending" && (
            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Payment Information</span>
              </div>
              <p className="text-xs">
                Online payments are currently disabled. Please contact the hostel administration for payment instructions.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Having issues? Contact hostel administration
          </p>
        </div>
      </div>
    </div>
  );
}
