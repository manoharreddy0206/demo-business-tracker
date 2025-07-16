import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Key, Phone } from "lucide-react";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [step, setStep] = useState<"contact" | "otp" | "reset">("contact");
  const [contactMethod, setContactMethod] = useState<"email" | "mobile">("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const { toast } = useToast();

  // Load admin profile to get real email/mobile
  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        // Try to get profile from Firebase first
        if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
          const { adminService } = await import('@/lib/firebase-service');
          const admin = await adminService.getByUsername('admin');
          if (admin) {
            setAdminProfile(admin);
            return;
          }
        }
      } catch (error) {
        console.log("Firebase failed, checking localStorage:", error);
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem('adminProfile');
      if (stored) {
        setAdminProfile(JSON.parse(stored));
      }
    };
    loadAdminProfile();
  }, []);

  const sendOTP = async () => {
    setIsLoading(true);
    
    // Validate against stored profile data
    const profileEmail = adminProfile?.email;
    const profileMobile = adminProfile?.mobile;
    
    if (contactMethod === "email") {
      if (!profileEmail) {
        toast({
          title: "No Email on File",
          description: "No email address found in your profile. Please update your profile first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (email !== profileEmail) {
        toast({
          title: "Email Mismatch",
          description: "The email you entered doesn't match your profile email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    
    if (contactMethod === "mobile") {
      if (!profileMobile) {
        toast({
          title: "No Mobile on File",
          description: "No mobile number found in your profile. Please update your profile first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (mobile !== profileMobile) {
        toast({
          title: "Mobile Mismatch", 
          description: "The mobile number you entered doesn't match your profile mobile.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    
    // Simulate OTP sending delay
    setTimeout(() => {
      setIsLoading(false);
      const contactInfo = contactMethod === "email" ? email : mobile;
      toast({
        title: "OTP Sent",
        description: `A 6-digit code has been sent to ${contactInfo}`,
      });
      setStep("otp");
    }, 1500);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification (in real app, verify with backend)
    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") { // Demo OTP for testing
        toast({
          title: "OTP Verified",
          description: "Please set your new password",
        });
        setStep("reset");
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Demo OTP is 123456",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Try Firebase first if available
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const bcrypt = await import('bcryptjs');
        const { adminService } = await import('@/lib/firebase-service');
        
        // Find admin by email
        const admin = await adminService.getByUsername('admin'); // For demo, use default admin
        if (admin) {
          // Hash new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          
          // Update password in Firebase
          await adminService.updatePassword(admin.id, hashedPassword);
          
          toast({
            title: "Password Reset Successfully",
            description: "Your password has been updated in Firebase. You can now login with your new password.",
          });
          
          setTimeout(() => {
            onBackToLogin();
          }, 2000);
          return;
        }
      }
    } catch (error) {
      console.log("Firebase failed, using local storage:", error);
    }

    // Fallback to local storage
    setTimeout(() => {
      setIsLoading(false);
      
      // Update stored credentials
      const updatedCredentials = {
        username: 'admin',
        password: newPassword
      };
      localStorage.setItem('adminCredentials', JSON.stringify(updatedCredentials));
      
      toast({
        title: "Password Reset Successfully",
        description: "Your password has been updated. You can now login with your new password.",
      });
      
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === "contact" && "Reset Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "New Password"}
          </CardTitle>
          <CardDescription>
            {step === "contact" && "Choose how to receive your reset code"}
            {step === "otp" && `Enter the 6-digit code sent to your ${contactMethod}`}
            {step === "reset" && "Create a new secure password"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === "contact" && (
            <>
              {/* Contact Method Selection */}
              <div className="space-y-3">
                <Label>Choose verification method</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={contactMethod === "email" ? "default" : "outline"}
                    onClick={() => setContactMethod("email")}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={contactMethod === "mobile" ? "default" : "outline"}
                    onClick={() => setContactMethod("mobile")}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Mobile
                  </Button>
                </div>
              </div>

              {/* Email Input */}
              {contactMethod === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={adminProfile?.email || "Enter your registered email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {adminProfile?.email && (
                    <p className="text-xs text-gray-500">
                      Enter the email from your profile: {adminProfile.email}
                    </p>
                  )}
                </div>
              )}

              {/* Mobile Input */}
              {contactMethod === "mobile" && (
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder={adminProfile?.mobile || "Enter your registered mobile"}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-10"
                      maxLength={10}
                      required
                    />
                  </div>
                  {adminProfile?.mobile && (
                    <p className="text-xs text-gray-500">
                      Enter the mobile from your profile: {adminProfile.mobile}
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                onClick={sendOTP}
                disabled={(contactMethod === "email" && !email) || (contactMethod === "mobile" && mobile.length !== 10) || isLoading}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-gray-500">
                  Demo OTP: <strong>123456</strong>
                </p>
              </div>
              
              <Button 
                onClick={verifyOTP}
                disabled={otp.length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setStep("contact")}
                className="w-full"
              >
                Back to Contact Info
              </Button>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                onClick={resetPassword}
                disabled={!newPassword || !confirmPassword || isLoading}
                className="w-full"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </>
          )}

          <Button 
            variant="ghost" 
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}