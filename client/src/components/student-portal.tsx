import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Student, HostelSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { localDataManager } from "@/lib/local-data";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import QRVerification from "./qr-verification";
import StudentDetails from "./student-details";

export default function StudentPortal() {
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Subscribe to data changes for real-time updates
  useEffect(() => {
    const unsubscribe = localDataManager.subscribe(async () => {
      // If we have a verified student, refresh their data
      if (verifiedStudent) {
        const updatedStudent = await localDataManager.getStudentByMobile(verifiedStudent.mobile);
        if (updatedStudent) {
          setVerifiedStudent(updatedStudent);
        }
      }
    });

    return unsubscribe;
  }, [verifiedStudent]);

  // Fetch hostel settings
  const { data: hostelSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["hostelSettings"],
    queryFn: async (): Promise<HostelSettings> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return localDataManager.getHostelSettings();
    },
  });

  // Verify student by mobile number
  const verifyStudent = async (mobile: string): Promise<Student> => {
    console.log("Verifying student with mobile:", mobile);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const student = await localDataManager.getStudentByMobile(mobile);
    console.log("Student found:", student);
    
    if (!student) {
      throw new Error("Student not found. Please check your mobile number.");
    }
    
    return student;
  };

  const handleVerification = async (mobile: string) => {
    setIsVerifying(true);
    try {
      const student = await verifyStudent(mobile);
      setVerifiedStudent(student);
      toast({
        title: "Verification Successful",
        description: `Welcome ${student.name}!`,
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      if (!verifiedStudent) throw new Error("No verified student");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedStudent = localDataManager.updateStudentFeeStatus(verifiedStudent.id, "paid", undefined, "student");
      if (!updatedStudent) {
        throw new Error("Failed to update student record");
      }
      return updatedStudent;
    },
    onSuccess: (updatedStudent) => {
      setVerifiedStudent(updatedStudent);
      toast({
        title: "Payment Status Updated",
        description: "Your fee has been marked as paid successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsPaid = () => {
    markAsPaidMutation.mutate();
  };

  const handlePayNow = () => {
    if (!hostelSettings || !verifiedStudent) return;
    
    // This will now use the automatic UPI payment tracking from StudentDetails component
    // The StudentDetails component handles the UPI simulation
    toast({
      title: "UPI Payment",
      description: "This will be handled by the UPI payment system",
    });
  };

  if (!verifiedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Demo Credentials Banner */}
        {showDemoInfo && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Demo Version - Test with these numbers:</p>
                <p className="text-sm opacity-90">Try: <span className="font-mono bg-white/20 px-2 py-1 rounded">9876543210</span> or <span className="font-mono bg-white/20 px-2 py-1 rounded">1234567890</span></p>
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
        
        <div className="container mx-auto px-4 py-8">
          <div className={`mx-auto ${isMobile ? 'max-w-sm px-2' : 'max-w-md'}`}>
            <QRVerification 
              onVerify={handleVerification} 
              isLoading={isVerifying} 
            />
          </div>
        </div>
      </div>
    );
  }

  if (settingsLoading || !hostelSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className={`mx-auto ${isMobile ? 'max-w-sm px-2' : 'max-w-md'}`}>
          <StudentDetails
            student={verifiedStudent}
            hostelSettings={hostelSettings}
            onMarkAsPaid={handleMarkAsPaid}
            onPayNow={handlePayNow}
            isLoading={markAsPaidMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
