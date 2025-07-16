import { expenseService } from "./firebase-service";
import { localDataManager } from "./local-data";

export const clearAllExpenses = async () => {
  try {
    console.log("Clearing all expense data...");
    
    // Clear Firebase expenses
    await expenseService.deleteAll();
    
    // Clear local data
    localDataManager.clearAllExpenses();
    
    console.log("All expense data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing expenses:", error);
    return false;
  }
};