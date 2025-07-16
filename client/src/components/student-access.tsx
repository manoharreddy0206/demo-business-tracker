import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, ShieldCheck } from "lucide-react";

export default function StudentAccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Users className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Student Portal</CardTitle>
          <CardDescription>
            Access your hostel fee details using QR code or mobile verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center p-8 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-sm text-green-700 font-medium">
                Scan QR Code or Enter Mobile Number
              </p>
              <p className="text-xs text-green-600 mt-2">
                Use the verification form below to access your details
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Secure Access</p>
                <p className="text-xs text-amber-700 mt-1">
                  Only verified students can access their fee information and payment status
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              For admin access, please use the admin login portal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}