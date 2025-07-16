import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react";
import { studentService, hostelSettingsService, initializeFirebaseData } from "@/lib/firebase-service";

interface ConnectionTest {
  name: string;
  status: "testing" | "success" | "error";
  message: string;
}

export default function FirebaseTest() {
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: "Firebase Connection", status: "testing", message: "Connecting..." },
    { name: "Student Data", status: "testing", message: "Loading..." },
    { name: "Settings Data", status: "testing", message: "Loading..." },
    { name: "Real-time Sync", status: "testing", message: "Testing..." }
  ]);

  const updateTest = (name: string, status: "success" | "error", message: string) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    try {
      // Test 1: Firebase Connection
      await initializeFirebaseData();
      updateTest("Firebase Connection", "success", "Connected successfully");

      // Test 2: Student Data
      const students = await studentService.getAll();
      updateTest("Student Data", "success", `${students.length} students loaded`);

      // Test 3: Settings Data
      const settings = await hostelSettingsService.get();
      updateTest("Settings Data", "success", settings ? "Settings loaded" : "Settings created");

      // Test 4: Real-time Sync
      const unsubscribe = studentService.subscribe((updatedStudents) => {
        updateTest("Real-time Sync", "success", `Live updates working (${updatedStudents.length} students)`);
      });

      // Clean up subscription after test
      setTimeout(() => unsubscribe(), 2000);

    } catch (error) {
      console.error("Firebase test error:", error);
      updateTest("Firebase Connection", "error", `Error: ${error.message}`);
      updateTest("Student Data", "error", "Failed to load");
      updateTest("Settings Data", "error", "Failed to load");
      updateTest("Real-time Sync", "error", "Not working");
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "testing":
        return <Badge variant="secondary">Testing</Badge>;
      case "success":
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firebase Integration Test
        </CardTitle>
        <CardDescription>
          Testing Firebase connection and data synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test) => (
          <div
            key={test.name}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(test.status)}
              <div>
                <div className="font-medium">{test.name}</div>
                <div className="text-sm text-muted-foreground">{test.message}</div>
              </div>
            </div>
            {getStatusBadge(test.status)}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button 
            onClick={runTests} 
            className="w-full"
            disabled={tests.some(test => test.status === "testing")}
          >
            {tests.some(test => test.status === "testing") ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Tests Again"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}