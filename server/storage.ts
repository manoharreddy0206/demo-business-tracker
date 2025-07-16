import { type Student, type InsertStudent, type HostelSettings, type InsertHostelSettings, type Admin, type InsertAdmin, type AdminSession } from "@shared/schema";
import { hashPassword, verifyPassword, generateToken } from "./auth";

// Storage interface for hostel management system
// Note: Currently using Firebase Firestore directly in components
// This interface is kept for potential future use with other storage backends

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByMobile(mobile: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
  
  // Hostel settings
  getHostelSettings(): Promise<HostelSettings | undefined>;
  updateHostelSettings(settings: Partial<HostelSettings>): Promise<HostelSettings>;
  
  // Admin authentication
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAdminById(id: string): Promise<Admin | undefined>;
  updateAdminLastLogin(id: string): Promise<void>;
  
  // Session management
  createSession(adminId: string, token: string, expiresAt: string): Promise<AdminSession>;
  getSessionByToken(token: string): Promise<AdminSession | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private settings: HostelSettings | undefined;
  private admins: Map<string, Admin>;
  private sessions: Map<string, AdminSession>;
  private currentId: number;

  constructor() {
    this.students = new Map();
    this.admins = new Map();
    this.sessions = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private async initSampleData() {
    // Sample hostel settings
    this.settings = {
      id: "1",
      monthlyFee: 5000,
      upiId: "hostel@paytm",
      hostelName: "Sunrise Hostel",
      enablePayNow: true,
      lastMonthlyReset: undefined
    };

    // Sample students
    const sampleStudents: Student[] = [
      {
        id: "1",
        name: "Rahul Sharma",
        mobile: "9876543210",
        room: "A101",
        joiningDate: "2024-01-15",
        feeStatus: "pending",
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
      }
    ];

    sampleStudents.forEach(student => {
      this.students.set(student.id, student);
    });

    // Create default admin account (password: admin123)
    const hashedPassword = await hashPassword("admin123");
    const defaultAdmin: Admin = {
      id: "1",
      username: "admin",
      password: hashedPassword,
      email: "admin@hostel.com",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  getAllStudents(): Student[] {
    return Array.from(this.students.values());
  }

  async getStudentByMobile(mobile: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.mobile === mobile,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = (this.currentId++).toString();
    const student: Student = { 
      ...insertStudent, 
      id,
      lastUpdated: new Date().toISOString()
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const student = this.students.get(id);
    if (!student) {
      throw new Error(`Student with id ${id} not found`);
    }

    const updatedStudent = { 
      ...student, 
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async getHostelSettings(): Promise<HostelSettings | undefined> {
    return this.settings;
  }

  async updateHostelSettings(settingsUpdate: Partial<HostelSettings>): Promise<HostelSettings> {
    if (!this.settings) {
      throw new Error("Hostel settings not found");
    }

    this.settings = { ...this.settings, ...settingsUpdate };
    
    // Check if we need to reset all student fees for the month
    await this.checkAndResetMonthlyFees();
    
    return this.settings;
  }

  private async checkAndResetMonthlyFees(): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();
    
    // Fee collection period: 1st to 10th of each month
    // Reset should happen on 1st of each month for that month's collection
    if (today === 1) {
      const lastReset = this.settings?.lastMonthlyReset ? new Date(this.settings.lastMonthlyReset) : null;
      const lastResetMonth = lastReset ? lastReset.getMonth() : -1;
      const lastResetYear = lastReset ? lastReset.getFullYear() : -1;
      
      // If we haven't reset this month yet, reset all student fees
      if (!lastReset || lastResetMonth !== currentMonth || lastResetYear !== currentYear) {
        console.log(`🔄 Monthly fee reset: Starting ${now.toLocaleDateString()} fee collection period (1st-10th)`);
        console.log(`   Resetting all student fees to pending for ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} collection`);
        
        // Reset all students to pending for the new month
        for (const [id, student] of this.students.entries()) {
          const updatedStudent = {
            ...student,
            feeStatus: "pending" as const,
            paymentMode: undefined,
            updatedBy: "admin" as const,
            lastUpdated: now.toISOString(),
          };
          this.students.set(id, updatedStudent);
        }
        
        // Update the last reset date to current month
        this.settings = {
          ...this.settings!,
          lastMonthlyReset: now.toISOString(),
        };
        
        console.log(`✅ Monthly reset complete: ${this.students.size} students set to pending for new collection period`);
      }
    }
    
    // Additional check: If we're in a new month and no reset has happened yet, force reset
    // This handles cases where the system wasn't running on the 1st
    if (this.settings?.lastMonthlyReset) {
      const lastReset = new Date(this.settings.lastMonthlyReset);
      const lastResetMonth = lastReset.getMonth();
      const lastResetYear = lastReset.getFullYear();
      
      // If last reset was in a different month, we need to reset for current month
      if (lastResetMonth !== currentMonth || lastResetYear !== currentYear) {
        console.log(`📅 Detected new month: Initiating late reset for ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
        
        // Reset all students to pending for the current month
        for (const [id, student] of this.students.entries()) {
          const updatedStudent = {
            ...student,
            feeStatus: "pending" as const,
            paymentMode: undefined,
            updatedBy: "admin" as const,
            lastUpdated: now.toISOString(),
          };
          this.students.set(id, updatedStudent);
        }
        
        // Update the last reset date
        this.settings = {
          ...this.settings!,
          lastMonthlyReset: now.toISOString(),
        };
        
        console.log(`✅ Late monthly reset complete: ${this.students.size} students reset for current month collection`);
      }
    }
  }

  // Admin authentication methods
  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const id = (this.currentId++).toString();
    const hashedPassword = await hashPassword(adminData.password);
    const admin: Admin = {
      ...adminData,
      id,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.admins.set(id, admin);
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    const admin = this.admins.get(id);
    if (admin) {
      admin.lastLogin = new Date().toISOString();
      admin.updatedAt = new Date().toISOString();
      this.admins.set(id, admin);
    }
  }

  // Session management methods
  async createSession(adminId: string, token: string, expiresAt: string): Promise<AdminSession> {
    const sessionId = (this.currentId++).toString();
    const session: AdminSession = {
      id: sessionId,
      adminId,
      token,
      expiresAt,
      createdAt: new Date().toISOString()
    };
    this.sessions.set(token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<AdminSession | undefined> {
    const session = this.sessions.get(token);
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(token); // Clean expired session
    }
    return undefined;
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredTokens: string[] = [];
    this.sessions.forEach((session, token) => {
      if (new Date(session.expiresAt) <= now) {
        expiredTokens.push(token);
      }
    });
    expiredTokens.forEach(token => this.sessions.delete(token));
  }
}

export const storage = new MemStorage();
