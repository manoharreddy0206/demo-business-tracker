import { Student, HostelSettings, Expense, Notification, PaymentTracking } from "@shared/schema";
import { studentService, hostelSettingsService, expenseService, initializeFirebaseData } from "./firebase-service";

// Sample data for demo purposes
export const sampleHostelSettings: HostelSettings = {
  id: "1",
  monthlyFee: 5000,
  upiId: "hostel@paytm",
  hostelName: "Sunrise Hostel"
};

export const sampleStudents: Student[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    mobile: "9876543210",
    room: "A101",
    joiningDate: "2024-01-15",
    feeStatus: "pending",
    updatedBy: "admin",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "2",
    name: "Priya Patel",
    mobile: "9876543211",
    room: "B205",
    joiningDate: "2024-02-01",
    feeStatus: "pending",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "3",
    name: "Amit Kumar",
    mobile: "9876543212",
    room: "C301",
    joiningDate: "2024-01-20",
    feeStatus: "pending",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "4",
    name: "Sneha Reddy",
    mobile: "9876543213",
    room: "D405",
    joiningDate: "2024-03-10",
    feeStatus: "paid",
    paymentMode: "cash",
    updatedBy: "admin",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "5",
    name: "Vikash Singh",
    mobile: "9876543214",
    room: "A202",
    joiningDate: "2024-02-15",
    feeStatus: "pending",
    lastUpdated: new Date().toISOString()
  }
];

export const sampleExpenses: Expense[] = [
  {
    id: "1",
    category: "maintenance",
    description: "AC repair in common area",
    amount: 3500,
    date: "2025-01-10",
    paymentMethod: "cash",
    recipientName: "Kumar Electronics",
    notes: "Emergency repair for hall AC unit",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    category: "salary",
    description: "Security guard monthly salary",
    amount: 15000,
    date: "2025-01-01",
    paymentMethod: "bank_transfer",
    recipientName: "Rajesh Kumar",
    notes: "January 2025 salary",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    category: "rent",
    description: "Monthly building rent",
    amount: 50000,
    date: "2025-01-01",
    paymentMethod: "bank_transfer",
    recipientName: "Sharma Properties",
    notes: "January 2025 rent payment",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    category: "utility",
    description: "Electricity bill",
    amount: 8500,
    date: "2025-01-05",
    paymentMethod: "upi",
    recipientName: "State Electricity Board",
    notes: "December 2024 electricity consumption",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    category: "utility",
    description: "Water bill",
    amount: 2500,
    date: "2025-01-08",
    paymentMethod: "cash",
    recipientName: "Municipal Corporation",
    notes: "Quarterly water charges",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "6",
    category: "grocery",
    description: "Monthly groceries and vegetables",
    amount: 12000,
    date: "2025-01-12",
    paymentMethod: "cash",
    recipientName: "Fresh Mart Grocery",
    notes: "Rice, dal, vegetables, fruits, and kitchen essentials",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "7",
    category: "wifi",
    description: "Internet and WiFi charges",
    amount: 1500,
    date: "2025-01-06",
    paymentMethod: "upi",
    recipientName: "Jio Fiber",
    notes: "Monthly high-speed internet connection",
    createdBy: "admin",
    createdAt: new Date().toISOString()
  }
];

// Event emitter for real-time updates
type DataChangeListener = () => void;
type NotificationListener = (notification: Notification) => void;

// Local storage simulation with reactive updates
class LocalDataManager {
  private students: Student[] = [];
  private settings: HostelSettings | null = null;
  private expenses: Expense[] = [];
  private notifications: Notification[] = [];
  private paymentTrackings: PaymentTracking[] = [];
  private listeners: DataChangeListener[] = [];
  private notificationListeners: NotificationListener[] = [];
  private currentExpenseId: number = 1;
  private currentNotificationId: number = 1;
  private currentPaymentId: number = 1;
  private firebaseInitialized: boolean = false;

  constructor() {
    this.loadFromLocalStorage();
  }

  // Subscribe to data changes
  subscribe(listener: DataChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Subscribe to notifications
  subscribeToNotifications(listener: NotificationListener): () => void {
    this.notificationListeners.push(listener);
    
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of data changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Save data to localStorage for persistence
  private saveToLocalStorage() {
    try {
      localStorage.setItem('hostel-students', JSON.stringify(this.students));
      localStorage.setItem('hostel-expenses', JSON.stringify(this.expenses));
      localStorage.setItem('hostel-settings', JSON.stringify(this.settings));
      localStorage.setItem('hostel-notifications', JSON.stringify(this.notifications));
      localStorage.setItem('hostel-current-expense-id', this.currentExpenseId.toString());
      localStorage.setItem('hostel-current-notification-id', this.currentNotificationId.toString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Load data from localStorage
  private loadFromLocalStorage() {
    try {
      const savedStudents = localStorage.getItem('hostel-students');
      const savedExpenses = localStorage.getItem('hostel-expenses');
      const savedSettings = localStorage.getItem('hostel-settings');
      const savedNotifications = localStorage.getItem('hostel-notifications');
      const savedExpenseId = localStorage.getItem('hostel-current-expense-id');
      const savedNotificationId = localStorage.getItem('hostel-current-notification-id');

      if (savedStudents) {
        this.students = JSON.parse(savedStudents);
      } else {
        this.students = [...sampleStudents];
      }

      if (savedExpenses) {
        this.expenses = JSON.parse(savedExpenses);
      }
      // No longer auto-loading sample expenses - start with empty array

      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      } else {
        this.settings = sampleHostelSettings;
      }

      if (savedNotifications) {
        this.notifications = JSON.parse(savedNotifications);
      }

      if (savedExpenseId) {
        this.currentExpenseId = parseInt(savedExpenseId);
      }

      if (savedNotificationId) {
        this.currentNotificationId = parseInt(savedNotificationId);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // Fallback to sample data only for students and settings
      this.students = [...sampleStudents];
      this.settings = sampleHostelSettings;
    }
  }

  private async initializeFirebase() {
    if (!this.firebaseInitialized) {
      try {
        await initializeFirebaseData();
        await this.loadDataFromFirebase();
        this.setupFirebaseListeners();
        this.firebaseInitialized = true;
      } catch (error) {
        console.error("Firebase initialization failed:", error);
      }
    }
  }

  private async loadDataFromFirebase() {
    try {
      // Load students
      this.students = await studentService.getAll();
      
      // Load settings
      const settings = await hostelSettingsService.get();
      this.settings = settings || sampleHostelSettings;
      
      // Load expenses
      this.expenses = await expenseService.getAll();
      // Note: No longer auto-loading sample expenses - users create their own data
    } catch (error) {
      console.error("Error loading data from Firebase:", error);
    }
  }

  private setupFirebaseListeners() {
    // Listen to student changes
    studentService.subscribe((students) => {
      this.students = students;
      this.notifyListeners();
    });
  }

  // Create and broadcast notification
  private createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): Notification {
    const notification: Notification = {
      id: this.currentNotificationId.toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: "medium",
      ...options
    };
    
    this.notifications.unshift(notification); // Add to beginning for newest first
    this.currentNotificationId++;
    
    // Broadcast to all notification listeners
    this.notificationListeners.forEach(listener => listener(notification));
    this.notifyListeners();
    
    return notification;
  }

  async getStudentByMobile(mobile: string): Promise<Student | undefined> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const { studentService } = await import("./firebase-service");
        const student = await studentService.getByMobile(mobile);
        if (student) {
          console.log("Student found in Firebase:", student);
          return student;
        }
      }
    } catch (error) {
      console.error("Firebase failed for mobile lookup, using local data:", error);
    }
    
    // Fallback to local data
    if (this.students.length === 0) {
      this.students = [...sampleStudents];
      this.saveToLocalStorage();
    }
    return this.students.find(student => student.mobile === mobile);
  }

  async updateStudentFeeStatus(
    studentId: string, 
    feeStatus: "paid" | "pending",
    paymentMode?: "upi" | "cash",
    updatedBy?: "student" | "admin"
  ): Promise<Student | undefined> {
    await this.initializeFirebase();
    
    console.log("LocalDataManager: updateStudentFeeStatus called with:", {
      studentId, feeStatus, paymentMode, updatedBy
    });
    
    try {
      // Create clean update object, filtering out undefined values
      const updateData: Partial<Student> = {
        feeStatus,
        lastUpdated: new Date().toISOString()
      };
      
      // Only add optional fields if they have values
      if (paymentMode) {
        updateData.paymentMode = paymentMode;
      }
      if (updatedBy) {
        updateData.updatedBy = updatedBy;
      }
      
      console.log("Calling Firebase update with clean data:", updateData);
      
      const updatedStudent = await studentService.update(studentId, updateData);
      
      // Update local cache
      const localIndex = this.students.findIndex(s => s.id === studentId);
      if (localIndex !== -1) {
        this.students[localIndex] = updatedStudent;
      }
      
      this.notifyListeners();
      return updatedStudent;
    } catch (error) {
      console.error("Firebase update failed, falling back to local update:", error);
      // Fallback to local update
      const studentIndex = this.students.findIndex(student => student.id === studentId);
    if (studentIndex !== -1) {
      const oldStatus = this.students[studentIndex].feeStatus;
      const studentName = this.students[studentIndex].name;
      
      this.students[studentIndex] = {
        ...this.students[studentIndex],
        feeStatus,
        ...(paymentMode && { paymentMode }),
        ...(updatedBy && { updatedBy }),
        lastUpdated: new Date().toISOString()
      };
      
      // Create notification when student claims payment
      if (feeStatus === "paid" && oldStatus === "pending" && updatedBy === "student") {
        this.createNotification(
          "payment_claimed",
          "💰 Student Payment Claim",
          `${studentName} claims to have paid their monthly fee (${paymentMode || 'method not specified'})`,
          {
            studentId,
            studentName,
            amount: this.settings.monthlyFee,
            paymentMethod: paymentMode,
            priority: "high"
          }
        );
      }
      
      // Create notification when admin marks payment
      if (feeStatus === "paid" && updatedBy === "admin") {
        this.createNotification(
          "payment_received",
          "✅ Payment Confirmed",
          `Payment confirmed for ${studentName} via ${paymentMode}`,
          {
            studentId,
            studentName,
            amount: this.settings.monthlyFee,
            paymentMethod: paymentMode,
            priority: "medium"
          }
        );
      }
      
      // Save and notify all subscribers of the change
      this.saveToLocalStorage();
      this.notifyListeners();
      
      return this.students[studentIndex];
    }
    return undefined;
    }
  }

  async getAllStudents(): Promise<Student[]> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const { studentService } = await import("./firebase-service");
        const firebaseStudents = await studentService.getAll();
        this.students = firebaseStudents;
        this.saveToLocalStorage();
        console.log("Students loaded from Firebase:", firebaseStudents.length);
        return [...this.students];
      }
    } catch (error) {
      console.error("Firebase failed, using local data:", error);
    }
    
    // Fallback to local data
    if (this.students.length === 0) {
      this.students = [...sampleStudents];
      this.saveToLocalStorage();
    }
    return [...this.students];
  }

  getFilteredStudents(filter: "all" | "paid" | "pending"): Student[] {
    if (filter === "all") return [...this.students];
    return this.students.filter(student => student.feeStatus === filter);
  }

  async getHostelSettings(): Promise<HostelSettings> {
    // Always try to load from Firebase first in production
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const { hostelSettingsService } = await import("./firebase-service");
        const firebaseSettings = await hostelSettingsService.get();
        if (firebaseSettings) {
          this.settings = firebaseSettings;
          return firebaseSettings;
        }
      }
    } catch (error) {
      console.log("Firebase failed for settings, using local:", error);
    }
    
    return this.settings || sampleHostelSettings;
  }

  async updateHostelSettings(updates: Partial<HostelSettings>): Promise<HostelSettings> {
    // Update in Firebase first, then local
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const { hostelSettingsService } = await import("./firebase-service");
        const updatedSettings = await hostelSettingsService.update(updates);
        this.settings = updatedSettings;
        this.notifyListeners();
        return updatedSettings;
      }
    } catch (error) {
      console.log("Firebase failed for settings update, using local:", error);
    }
    
    // Fallback to local update
    this.settings = { ...this.settings, ...updates };
    this.notifyListeners();
    return this.settings;
  }

  async addStudent(studentData: Omit<Student, "id" | "lastUpdated">): Promise<Student> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        console.log("Attempting to add student to Firebase:", studentData);
        const { studentService } = await import("./firebase-service");
        const newStudent = await studentService.create({
          ...studentData,
          lastUpdated: new Date().toISOString()
        });
        
        // Update local cache
        this.students.push(newStudent);
        this.saveToLocalStorage();
        this.notifyListeners();
        console.log("Student successfully added to Firebase:", newStudent);
        return newStudent;
      }
    } catch (error) {
      console.error("Firebase failed, using local storage fallback:", error);
    }
    
    // Fallback to local storage only if Firebase fails
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    
    this.students.push(newStudent);
    this.saveToLocalStorage();
    this.notifyListeners();
    console.log("Student added to local storage:", newStudent);
    return newStudent;
  }

  async updateStudent(studentId: string, updates: Partial<Student>): Promise<Student | undefined> {
    await this.initializeFirebase();
    
    console.log("LocalDataManager: updateStudent called with:", {
      studentId, updates
    });
    
    try {
      // Create clean update object, filtering out undefined values
      const updateData: Partial<Student> = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof Student] === undefined) {
          delete updateData[key as keyof Student];
        }
      });
      
      console.log("Calling Firebase update with clean data:", updateData);
      
      const updatedStudent = await studentService.update(studentId, updateData);
      
      // Update local cache
      const localIndex = this.students.findIndex(s => s.id === studentId);
      if (localIndex !== -1) {
        this.students[localIndex] = updatedStudent;
      }
      
      this.notifyListeners();
      return updatedStudent;
    } catch (error) {
      console.error("Firebase update failed, falling back to local update:", error);
      // Fallback to local update
      const studentIndex = this.students.findIndex(student => student.id === studentId);
      if (studentIndex !== -1) {
        this.students[studentIndex] = {
          ...this.students[studentIndex],
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        this.saveToLocalStorage();
        this.notifyListeners();
        return this.students[studentIndex];
      }
      return undefined;
    }
  }

  // Legacy sync method for backward compatibility
  updateStudentSync(studentId: string, updates: Partial<Student>): Student | undefined {
    console.log("LocalDataManager.updateStudent called with:", studentId, updates);
    const studentIndex = this.students.findIndex(s => s.id === studentId);
    console.log("Student index found:", studentIndex);
    
    if (studentIndex === -1) {
      console.log("Student not found with ID:", studentId);
      return undefined;
    }

    const originalStudent = this.students[studentIndex];
    console.log("Original student:", originalStudent);

    this.students[studentIndex] = {
      ...this.students[studentIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    console.log("Updated student:", this.students[studentIndex]);
    this.saveToLocalStorage();
    this.notifyListeners();
    return this.students[studentIndex];
  }

  async deleteStudent(studentId: string): Promise<boolean> {
    await this.initializeFirebase();
    
    console.log("LocalDataManager: deleteStudent called with:", { studentId });
    
    try {
      // Try Firebase first
      await studentService.delete(studentId);
      
      // Update local cache
      const initialLength = this.students.length;
      this.students = this.students.filter(s => s.id !== studentId);
      this.notifyListeners();
      
      console.log("Student deleted from Firebase successfully");
      return this.students.length < initialLength;
    } catch (error) {
      console.error("Firebase delete failed, falling back to local delete:", error);
      // Fallback to local delete
      const initialLength = this.students.length;
      this.students = this.students.filter(s => s.id !== studentId);
      this.notifyListeners();
      return this.students.length < initialLength;
    }
  }

  // Expense management methods
  async getAllExpenses(): Promise<Expense[]> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const { expenseService } = await import("./firebase-service");
        const firebaseExpenses = await expenseService.getAll();
        this.expenses = firebaseExpenses;
        this.saveToLocalStorage();
        console.log("Expenses loaded from Firebase:", firebaseExpenses.length);
        return [...this.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (error) {
      console.error("Firebase failed for expenses, using local data:", error);
    }
    
    // Fallback to local data
    return [...this.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  clearAllExpenses(): void {
    this.expenses = [];
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  getExpensesByCategory(category: Expense['category']): Expense[] {
    return this.expenses.filter(expense => expense.category === category);
  }

  getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
    return this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
  }

  async addExpense(expenseData: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        console.log("Attempting to add expense to Firebase:", expenseData);
        const { expenseService } = await import("./firebase-service");
        const newExpense = await expenseService.create({
          ...expenseData,
          createdAt: new Date().toISOString()
        });
        
        // Update local cache
        this.expenses.push(newExpense);
        this.saveToLocalStorage();
        this.notifyListeners();
        console.log("Expense successfully added to Firebase:", newExpense);
        return newExpense;
      }
    } catch (error) {
      console.error("Firebase failed for expense, using local storage fallback:", error);
    }
    
    // Fallback to local storage
    const newExpense: Expense = {
      ...expenseData,
      id: this.currentExpenseId.toString(),
      createdAt: new Date().toISOString()
    };
    
    this.expenses.push(newExpense);
    this.currentExpenseId++;
    this.saveToLocalStorage();
    this.notifyListeners();
    return newExpense;
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense | undefined> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        console.log("Attempting to update expense in Firebase:", expenseId, updates);
        const { expenseService } = await import("./firebase-service");
        const updatedExpense = await expenseService.update(expenseId, updates);
        
        // Update local cache
        const localIndex = this.expenses.findIndex(e => e.id === expenseId);
        if (localIndex !== -1) {
          this.expenses[localIndex] = updatedExpense;
        }
        
        this.saveToLocalStorage();
        this.notifyListeners();
        console.log("Expense successfully updated in Firebase:", updatedExpense);
        return updatedExpense;
      }
    } catch (error) {
      console.error("Firebase failed for expense update, using local fallback:", error);
    }
    
    // Fallback to local storage
    const expenseIndex = this.expenses.findIndex(expense => expense.id === expenseId);
    if (expenseIndex === -1) return undefined;

    this.expenses[expenseIndex] = { ...this.expenses[expenseIndex], ...updates };
    this.saveToLocalStorage();
    this.notifyListeners();
    return this.expenses[expenseIndex];
  }

  async deleteExpense(expenseId: string): Promise<boolean> {
    await this.initializeFirebase();
    
    // Always try Firebase first if configured
    try {
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        console.log("Attempting to delete expense from Firebase:", expenseId);
        const { expenseService } = await import("./firebase-service");
        await expenseService.delete(expenseId);
        
        // Update local cache
        const initialLength = this.expenses.length;
        this.expenses = this.expenses.filter(e => e.id !== expenseId);
        
        this.saveToLocalStorage();
        this.notifyListeners();
        console.log("Expense successfully deleted from Firebase");
        return this.expenses.length < initialLength;
      }
    } catch (error) {
      console.error("Firebase failed for expense delete, using local fallback:", error);
    }
    
    // Fallback to local storage
    const expenseIndex = this.expenses.findIndex(expense => expense.id === expenseId);
    if (expenseIndex === -1) return false;

    this.expenses.splice(expenseIndex, 1);
    this.saveToLocalStorage();
    this.notifyListeners();
    return true;
  }

  // Business analytics methods
  getTotalExpensesByCategory(): Record<string, number> {
    const totals: Record<string, number> = {};
    this.expenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }

  getMonthlyExpenseTotal(year: number, month: number): number {
    return this.expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  // Notification management methods
  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  // Payment tracking methods
  initiatePayment(
    studentId: string,
    amount: number,
    paymentMethod: "upi" | "cash" | "bank_transfer"
  ): PaymentTracking {
    const student = this.students.find(s => s.id === studentId);
    const payment: PaymentTracking = {
      id: this.currentPaymentId.toString(),
      studentId,
      amount,
      status: "pending",
      paymentMethod,
      initiatedAt: new Date().toISOString(),
    };

    this.paymentTrackings.push(payment);
    this.currentPaymentId++;

    // Create notification for payment initiation
    if (student) {
      this.createNotification(
        "payment_received",
        "🔄 Payment Processing",
        `Payment initiated for ${student.name} - ${paymentMethod.toUpperCase()}`,
        {
          studentId,
          studentName: student.name,
          amount,
          paymentMethod,
          priority: "medium"
        }
      );
    }

    this.notifyListeners();
    return payment;
  }

  // Simulate UPI payment verification (in real app, this would connect to UPI gateway)
  simulateUPIPaymentVerification(paymentId: string): void {
    const payment = this.paymentTrackings.find(p => p.id === paymentId);
    if (payment && payment.status === "pending") {
      // Simulate processing time
      setTimeout(() => {
        payment.status = "processing";
        this.notifyListeners();
        
        // Simulate completion
        setTimeout(() => {
          payment.status = "completed";
          payment.completedAt = new Date().toISOString();
          payment.transactionId = `UPI${Date.now()}`;
          
          // Auto-update student fee status
          const student = this.students.find(s => s.id === payment.studentId);
          if (student) {
            this.updateStudentFeeStatus(payment.studentId, "paid", "upi", "admin");
            
            this.createNotification(
              "payment_received",
              "🎉 Payment Verified",
              `UPI payment automatically verified for ${student.name}`,
              {
                studentId: payment.studentId,
                studentName: student.name,
                amount: payment.amount,
                paymentMethod: "upi",
                priority: "high"
              }
            );
          }
          
          this.notifyListeners();
        }, 3000); // 3 seconds for completion
      }, 2000); // 2 seconds for processing
    }
  }

  getPaymentHistory(): PaymentTracking[] {
    return [...this.paymentTrackings].sort((a, b) => 
      new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()
    );
  }
}

export const localDataManager = new LocalDataManager();