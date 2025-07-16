import { storage } from "./storage";

/**
 * Manual trigger for monthly fee reset
 * This can be called from admin dashboard or scheduled
 */
export async function triggerMonthlyReset(): Promise<{ success: boolean; message: string; studentsReset: number }> {
  try {
    const settings = await storage.getHostelSettings();
    if (!settings) {
      return { success: false, message: "Hostel settings not found", studentsReset: 0 };
    }

    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    console.log(`🔄 Manual monthly reset triggered for ${monthName} fee collection period`);
    console.log(`   Fee collection period: 1st-10th of ${monthName}`);
    
    // Get all students and reset them
    const allStudents = (storage as any).getAllStudents ? (storage as any).getAllStudents() : [];
    let resetCount = 0;
    
    console.log(`Found ${allStudents.length} students to reset`);
    
    for (const student of allStudents) {
      try {
        await storage.updateStudent(student.id, {
          feeStatus: "pending",
          paymentMode: undefined,
          updatedBy: "admin",
          lastUpdated: now.toISOString(),
        });
        resetCount++;
        console.log(`Reset student ${student.name} (${student.id}) to pending`);
      } catch (error) {
        console.error(`Failed to reset student ${student.id}:`, error);
      }
    }
    
    // Update settings with reset date
    await storage.updateHostelSettings({
      lastMonthlyReset: now.toISOString(),
    });
    
    const message = `✅ Monthly reset complete: ${resetCount} students set to pending for ${monthName} collection (1st-10th)`;
    console.log(message);
    
    return { success: true, message, studentsReset: resetCount };
  } catch (error) {
    console.error("❌ Monthly reset failed:", error);
    return { success: false, message: "Reset failed: " + (error as Error).message, studentsReset: 0 };
  }
}

/**
 * Check if monthly reset is needed (for automatic scheduling)
 * Fee collection period is 1st-10th of each month
 */
export async function checkMonthlyResetNeeded(): Promise<boolean> {
  const settings = await storage.getHostelSettings();
  if (!settings) return false;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastReset = settings.lastMonthlyReset ? new Date(settings.lastMonthlyReset) : null;
  
  // If no reset has ever happened, we need one
  if (!lastReset) return true;
  
  const lastResetMonth = lastReset.getMonth();
  const lastResetYear = lastReset.getFullYear();
  
  // Need reset if we're in a new month and haven't reset for this month yet
  // This ensures that when July ends and August begins, all fees reset to pending for August collection
  return lastResetMonth !== currentMonth || lastResetYear !== currentYear;
}