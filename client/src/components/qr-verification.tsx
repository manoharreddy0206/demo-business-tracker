import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verificationSchema } from "@shared/schema";
import { localDataManager } from "@/lib/local-data";

interface QRVerificationProps {
  onVerify: (mobile: string) => void;
  isLoading: boolean;
}

export default function QRVerification({ onVerify, isLoading }: QRVerificationProps) {
  const { data: hostelSettings } = useQuery({
    queryKey: ["hostelSettings"],
    queryFn: () => localDataManager.getHostelSettings(),
  });
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = verificationSchema.safeParse({ mobile });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    onVerify(mobile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 sm:p-8">
          {/* Hostel Logo/Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{hostelSettings?.hostelName || "Sunrise Hostel"}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Student Portal</p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your mobile number to continue
              </Label>
              <Input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                disabled={isLoading}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Scanned QR code from hostel notice board
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
