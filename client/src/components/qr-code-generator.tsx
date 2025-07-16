import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeLib from "qrcode";

export default function QRCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { toast } = useToast();

  // Generate QR code using qrcode library
  const generateQRCode = async (text: string) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCodeLib.toCanvas(canvas, text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Generate QR code for student portal URL
    const studentPortalUrl = `${window.location.origin}/student`;
    generateQRCode(studentPortalUrl);
  }, []);

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = 'student-portal-qr-code.png';
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been saved to your downloads folder.",
    });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-32 h-32 border border-gray-200 rounded-lg mx-auto block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      
      <p className="text-sm text-gray-500 mt-4 mb-3">QR Code for Student Access</p>
      
      <div className="flex gap-2 justify-center">
        <Button
          onClick={downloadQRCode}
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={!qrCodeDataUrl}
        >
          <Download className="w-3 h-3 mr-1" />
          Download QR
        </Button>
        
        <Button
          onClick={() => {
            const studentPortalUrl = `${window.location.origin}/student`;
            generateQRCode(studentPortalUrl);
          }}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <QrCode className="w-3 h-3 mr-1" />
          Regenerate
        </Button>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        Points to: {window.location.origin}/student
      </p>
    </div>
  );
}