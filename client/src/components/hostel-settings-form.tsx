import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { HostelSettings } from "@shared/schema";
import { Save, CheckCircle, RefreshCw, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const settingsFormSchema = z.object({
  monthlyFee: z.number().min(100, "Monthly fee must be at least ₹100"),
  upiId: z.string().min(1, "UPI Payment ID is required"),
  hostelName: z.string().min(1, "Hostel name is required"),
  enablePayNow: z.boolean().default(true),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

interface HostelSettingsFormProps {
  settings?: HostelSettings;
  onSave: (settings: Partial<HostelSettings>) => void;
  onClose?: () => void;
}

export default function HostelSettingsForm({ settings, onSave, onClose }: HostelSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      monthlyFee: settings?.monthlyFee || 5000,
      upiId: settings?.upiId || "hostel@paytm",
      hostelName: settings?.hostelName || "Sunrise Hostel",
      enablePayNow: settings?.enablePayNow ?? true,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate saving
      onSave(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // Reset saved state
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthlyReset = async () => {
    setIsResetting(true);
    try {
      console.log("Starting monthly reset...");
      const response = await apiRequest("POST", "/api/admin/monthly-reset");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Monthly reset result:", result);
      
      if (result.success) {
        toast({
          title: "Monthly Reset Complete",
          description: `${result.studentsReset} students reset to pending for new collection period`,
        });
      } else {
        toast({
          title: "Reset Failed",
          description: result.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Monthly reset error:", error);
      toast({
        title: "Reset Failed",
        description: `Failed to reset monthly fees: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="monthlyFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Fee Amount (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="Enter monthly fee amount"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPI Payment ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., hostel@paytm"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hostelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hostel Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter hostel name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enablePayNow"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable "Pay Now" Button</FormLabel>
                <FormDescription>
                  Allow students to access payment options in their portal
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Monthly Reset Section */}
        <div className="border-t pt-4 mt-6">
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm text-gray-900">Monthly Fee Reset</span>
            </div>
            <p className="text-xs text-gray-600">
              Reset all student fees to "pending" for new collection period (1st-10th of month)
            </p>
          </div>
          
          <Button 
            type="button"
            variant="outline"
            onClick={handleMonthlyReset}
            disabled={isResetting || isLoading}
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Resetting All Fees...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All Fees to Pending
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {onClose && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading || isResetting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading || isResetting}
            className={saved ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLoading ? (
              "Saving..."
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}