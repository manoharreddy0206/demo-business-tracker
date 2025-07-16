import React from 'react';
import { Student } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Phone, MapPin, Calendar, CreditCard, Clock, CheckCircle, MoreVertical, Edit, Trash2, Smartphone, MessageSquare } from "lucide-react";

interface MobileStudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onMarkAsPaid: (studentId: string, paymentMode: "upi" | "cash") => void;
  onToggleStatus: (studentId: string) => void;
  onCall?: (mobile: string) => void;
  onMessage?: (mobile: string) => void;
}

export default function MobileStudentCard({
  student,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onToggleStatus,
  onCall,
  onMessage
}: MobileStudentCardProps) {
  const handleCall = () => {
    if (onCall) {
      onCall(student.mobile);
    } else {
      window.open(`tel:${student.mobile}`, '_self');
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(student.mobile);
    } else {
      window.open(`sms:${student.mobile}`, '_self');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{student.name}</h3>
              <p className="text-xs text-gray-500">Room {student.room}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(student)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCall}>
                <Phone className="mr-2 h-4 w-4" />
                Call Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMessage}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(student.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Student Details */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center space-x-1 text-gray-600">
            <Smartphone className="w-3 h-3" />
            <span>{student.mobile}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{new Date(student.joiningDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Fee Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(student.feeStatus)} text-xs px-2 py-1`}>
              {getStatusIcon(student.feeStatus)}
              <span className="ml-1 capitalize">{student.feeStatus}</span>
            </Badge>
            {student.feeStatus === "paid" && student.paymentMode && (
              <Badge variant="outline" className="text-xs">
                {student.paymentMode.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {student.updatedBy && (
              <span>by {student.updatedBy}</span>
            )}
          </div>
        </div>

        {/* Last Updated */}
        {student.lastUpdated && (
          <div className="text-xs text-gray-400 mb-3">
            Updated: {new Date(student.lastUpdated).toLocaleString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {student.feeStatus === "pending" ? (
            <>
              <Button
                size="sm"
                onClick={() => onMarkAsPaid(student.id, "upi")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Mark UPI
              </Button>
              <Button
                size="sm"
                onClick={() => onMarkAsPaid(student.id, "cash")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
              >
                💰 Mark Cash
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => onToggleStatus(student.id)}
              variant="outline"
              className="flex-1 text-xs"
            >
              Mark as Pending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}