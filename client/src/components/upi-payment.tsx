import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ExternalLink, Copy, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Student, HostelSettings } from "@shared/schema";

interface UPIPaymentProps {
  student: Student;
  settings: HostelSettings;
  onPaymentComplete: (paymentId: string) => void;
}

export default function UPIPayment({ student, settings, onPaymentComplete }: UPIPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState(settings.monthlyFee.toString());
  const { toast } = useToast();

  // Generate UPI payment URL
  const generateUPIUrl = () => {
    const upiId = settings.upiId || "hostel@paytm";
    const payerName = student.name;
    const note = `Hostel Fee - ${student.name} - Room ${student.room}`;
    
    // UPI URL format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&mc=MERCHANT_CODE&tid=TXN_ID&tr=TXN_REF&tn=TXN_NOTE&am=AMOUNT&cu=INR&url=CALLBACK_URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(settings.hostelName || 'Hostel')}&tn=${encodeURIComponent(note)}&am=${amount}&cu=INR`;
    
    return upiUrl;
  };

  // Generate QR code URL (using a QR code service)
  const generateQRCode = () => {
    const upiUrl = generateUPIUrl();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(settings.upiId || "hostel@paytm");
    toast({
      title: "UPI ID Copied",
      description: "UPI ID has been copied to clipboard",
    });
  };

  const openUPIApp = () => {
    const upiUrl = generateUPIUrl();
    window.open(upiUrl, '_blank');
    setPaymentStatus("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      const mockPaymentId = `PAY_${Date.now()}`;
      setPaymentId(mockPaymentId);
      setPaymentStatus("success");
      onPaymentComplete(mockPaymentId);
      
      toast({
        title: "Payment Successful",
        description: `Payment of ₹${amount} completed successfully`,
      });
    }, 3000);
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case "processing":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "success":
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            UPI Payment
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Pay hostel fee using UPI apps like PhonePe, Google Pay, Paytm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student Name</Label>
              <Input value={student.name} disabled />
            </div>
            <div>
              <Label>Room Number</Label>
              <Input value={student.room} disabled />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                disabled={paymentStatus !== "idle"}
              />
            </div>
            <div>
              <Label>UPI ID</Label>
              <div className="flex gap-2">
                <Input value={settings.upiId || "hostel@paytm"} disabled />
                <Button variant="outline" size="sm" onClick={copyUPIId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {paymentStatus === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">Payment Successful</span>
              </div>
              <p className="text-sm text-green-700">
                Payment ID: {paymentId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <CardDescription>
            Scan this QR code with any UPI app to make payment
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="mx-auto w-fit p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img 
              src={generateQRCode()} 
              alt="UPI QR Code" 
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan with PhonePe, Google Pay, Paytm, or any UPI app
          </p>
        </CardContent>
      </Card>

      {/* Payment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>
            Choose your preferred payment method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={openUPIApp} 
            className="w-full"
            disabled={paymentStatus !== "idle"}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open UPI App
          </Button>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="text-xs p-2">
              PhonePe
            </Button>
            <Button variant="outline" className="text-xs p-2">
              Google Pay
            </Button>
            <Button variant="outline" className="text-xs p-2">
              Paytm
            </Button>
          </div>

          {paymentStatus === "processing" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                <span className="font-medium text-blue-800">Processing Payment</span>
              </div>
              <p className="text-sm text-blue-700">
                Complete the payment in your UPI app
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}