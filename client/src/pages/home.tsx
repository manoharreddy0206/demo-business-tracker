import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Shield, QrCode, Users } from "lucide-react";
import { localDataManager } from "@/lib/local-data";
import QRCodeGenerator from "@/components/qr-code-generator";

export default function HomePage() {
  const { data: hostelSettings } = useQuery({
    queryKey: ["hostelSettings"],
    queryFn: () => localDataManager.getHostelSettings(),
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{hostelSettings?.hostelName || "Sunrise Hostel"}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern hostel fee management system with QR code access and real-time tracking
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Portal</h2>
              <p className="text-gray-600 mb-6">
                Access your student details and manage fee payments by scanning the QR code
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  QR code verification
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  View student details
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  UPI payment integration
                </div>
              </div>
              <Link href="/student">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                  Enter Student Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Manage student records, track fee payments, and monitor hostel operations
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Real-time student tracking
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Fee management system
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Analytics and reports
                </div>
              </div>
              <Link href="/admin">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 py-3">
                  Access Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="mt-16 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">For Students</h3>
            <p className="text-gray-600 mb-6">
              Scan the QR code posted on the hostel notice board to access your student portal directly
            </p>
            <QRCodeGenerator />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>© 2024 {hostelSettings?.hostelName || "Sunrise Hostel"} Management System</p>
        </div>
      </div>
    </div>
  );
}
