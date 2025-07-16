import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
  type DocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import type { 
  Student, 
  InsertStudent, 
  HostelSettings, 
  InsertHostelSettings,
  Admin,
  InsertAdmin,
  AdminSession,
  Expense,
  InsertExpense,
  Notification
} from "@shared/schema";

// Collections
const COLLECTIONS = {
  STUDENTS: "students",
  HOSTEL_SETTINGS: "hostel_settings",
  ADMINS: "admins", 
  ADMIN_SESSIONS: "admin_sessions",
  EXPENSES: "expenses",
  NOTIFICATIONS: "notifications"
} as const;

// Helper functions
const convertTimestamp = (data: DocumentData) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate().toISOString();
    }
  });
  return converted;
};

// Sanitize data before sending to Firebase (remove undefined values)
const sanitizeData = (data: Record<string, any>) => {
  const sanitized: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

// Student operations
export const studentService = {
  async getAll(): Promise<Student[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.STUDENTS), orderBy("name"))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data())
    })) as Student[];
  },

  async getById(id: string): Promise<Student | null> {
    const docRef = doc(db, COLLECTIONS.STUDENTS, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() 
      ? { id: snapshot.id, ...convertTimestamp(snapshot.data()) } as Student
      : null;
  },

  async getByMobile(mobile: string): Promise<Student | null> {
    const q = query(
      collection(db, COLLECTIONS.STUDENTS), 
      where("mobile", "==", mobile)
    );
    const snapshot = await getDocs(q);
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...convertTimestamp(doc.data()) } as Student
      : null;
  },

  async create(student: InsertStudent): Promise<Student> {
    console.log("Creating student in Firebase:", student);
    
    // Add longer timeout for slow connections
    const timeoutMs = 20000; // 20 seconds for slow networks
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Firebase operation timed out")), timeoutMs);
    });
    
    try {
      const studentData = {
        ...student,
        lastUpdated: Timestamp.now()
      };
      
      console.log("Attempting Firebase create with timeout...");
      const docRef = await Promise.race([
        addDoc(collection(db, COLLECTIONS.STUDENTS), studentData),
        timeoutPromise
      ]) as any;
      
      console.log("Firebase create successful, getting document...");
      const newDoc = await Promise.race([
        getDoc(docRef),
        timeoutPromise
      ]) as any;
      
      const result = {
        id: newDoc.id,
        ...convertTimestamp(newDoc.data()!)
      } as Student;
      
      console.log("Student created successfully in Firebase:", result);
      return result;
    } catch (error) {
      console.error("Firebase create operation failed:", error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    try {
      console.log("Firebase update called with:", { id, updates });
      
      const docRef = doc(db, COLLECTIONS.STUDENTS, id);
      
      // Sanitize the updates to remove undefined values
      const sanitizedUpdates = sanitizeData({
        ...updates,
        lastUpdated: Timestamp.now()
      });
      
      console.log("Sanitized updates for Firebase:", sanitizedUpdates);
      
      await updateDoc(docRef, sanitizedUpdates);
      
      const updatedDoc = await getDoc(docRef);
      const result = {
        id: updatedDoc.id,
        ...convertTimestamp(updatedDoc.data()!)
      } as Student;
      
      console.log("Firebase update successful:", result);
      return result;
    } catch (error) {
      console.error("Firebase update failed:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
  },

  subscribe(callback: (students: Student[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.STUDENTS), orderBy("name"));
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamp(doc.data())
      })) as Student[];
      callback(students);
    });
  }
};

// Hostel settings operations
export const hostelSettingsService = {
  async get(): Promise<HostelSettings | null> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.HOSTEL_SETTINGS));
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...convertTimestamp(doc.data()) } as HostelSettings
      : null;
  },

  async update(settings: Partial<HostelSettings>): Promise<HostelSettings> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.HOSTEL_SETTINGS));
    
    if (snapshot.docs.length === 0) {
      // Create new settings document
      const docRef = await addDoc(collection(db, COLLECTIONS.HOSTEL_SETTINGS), settings);
      const newDoc = await getDoc(docRef);
      return {
        id: newDoc.id,
        ...convertTimestamp(newDoc.data()!)
      } as HostelSettings;
    } else {
      // Update existing settings
      const docRef = doc(db, COLLECTIONS.HOSTEL_SETTINGS, snapshot.docs[0].id);
      await updateDoc(docRef, settings);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...convertTimestamp(updatedDoc.data()!)
      } as HostelSettings;
    }
  }
};

// Admin operations
export const adminService = {
  async getByUsername(username: string): Promise<Admin | null> {
    const q = query(
      collection(db, COLLECTIONS.ADMINS), 
      where("username", "==", username)
    );
    const snapshot = await getDocs(q);
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...convertTimestamp(doc.data()) } as Admin
      : null;
  },

  async getById(id: string): Promise<Admin | null> {
    const docRef = doc(db, COLLECTIONS.ADMINS, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() 
      ? { id: snapshot.id, ...convertTimestamp(snapshot.data()) } as Admin
      : null;
  },

  async create(admin: InsertAdmin): Promise<Admin> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ADMINS), {
      ...admin,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    const newDoc = await getDoc(docRef);
    return {
      id: newDoc.id,
      ...convertTimestamp(newDoc.data()!)
    } as Admin;
  },

  async updateLastLogin(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADMINS, id);
    await updateDoc(docRef, {
      lastLogin: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  },

  async updatePassword(adminId: string, hashedPassword: string): Promise<void> {
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
    await updateDoc(adminRef, { 
      passwordHash: hashedPassword,
      updatedAt: Timestamp.now()
    });
  },

  async updateProfile(adminId: string, updates: { username?: string; email?: string }): Promise<void> {
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
    await updateDoc(adminRef, { 
      ...updates,
      updatedAt: Timestamp.now()
    });
  }
};

// Admin session operations
export const sessionService = {
  async create(adminId: string, token: string, expiresAt: string): Promise<AdminSession> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ADMIN_SESSIONS), {
      adminId,
      token,
      expiresAt,
      createdAt: Timestamp.now()
    });
    const newDoc = await getDoc(docRef);
    return {
      id: newDoc.id,
      ...convertTimestamp(newDoc.data()!)
    } as AdminSession;
  },

  async getByToken(token: string): Promise<AdminSession | null> {
    const q = query(
      collection(db, COLLECTIONS.ADMIN_SESSIONS), 
      where("token", "==", token)
    );
    const snapshot = await getDocs(q);
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...convertTimestamp(doc.data()) } as AdminSession
      : null;
  },

  async delete(token: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.ADMIN_SESSIONS), 
      where("token", "==", token)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(async (sessionDoc) => {
      await deleteDoc(sessionDoc.ref);
    });
  },

  async cleanExpired(): Promise<void> {
    const now = new Date().toISOString();
    const q = query(
      collection(db, COLLECTIONS.ADMIN_SESSIONS), 
      where("expiresAt", "<", now)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(async (sessionDoc) => {
      await deleteDoc(sessionDoc.ref);
    });
  }
};

// Expense operations
export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.EXPENSES), orderBy("date", "desc"))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data())
    })) as Expense[];
  },

  async create(expense: InsertExpense): Promise<Expense> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), {
      ...expense,
      createdAt: Timestamp.now()
    });
    const newDoc = await getDoc(docRef);
    return {
      id: newDoc.id,
      ...convertTimestamp(newDoc.data()!)
    } as Expense;
  },

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    const docRef = doc(db, COLLECTIONS.EXPENSES, id);
    await updateDoc(docRef, updates);
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...convertTimestamp(updatedDoc.data()!)
    } as Expense;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
  },

  async deleteAll(): Promise<void> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.EXPENSES));
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
};

// Initialize with sample data
export const initializeFirebaseData = async () => {
  try {
    // Check if data already exists
    const studentsSnapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    const settingsSnapshot = await getDocs(collection(db, COLLECTIONS.HOSTEL_SETTINGS));
    
    if (studentsSnapshot.empty) {
      // Add sample students
      const sampleStudents = [
        {
          name: "Rahul Kumar",
          mobile: "9876543210",
          room: "101",
          joiningDate: "2024-01-15",
          feeStatus: "paid" as const,
          paymentMode: "upi" as const,
          updatedBy: "admin" as const
        },
        {
          name: "Priya Sharma", 
          mobile: "8765432109",
          room: "102",
          joiningDate: "2024-01-20",
          feeStatus: "pending" as const,
          updatedBy: "student" as const
        }
      ];

      for (const student of sampleStudents) {
        await studentService.create(student);
      }
    }

    if (settingsSnapshot.empty) {
      // Add hostel settings
      await hostelSettingsService.update({
        monthlyFee: 5000,
        upiId: "hostel@paytm",
        hostelName: "Sunrise Hostel"
      });
    }

    console.log("Firebase data initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase data:", error);
  }
};