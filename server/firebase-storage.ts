import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { 
  Student, 
  InsertStudent, 
  HostelSettings, 
  InsertHostelSettings,
  Admin,
  InsertAdmin,
  AdminSession
} from "@shared/schema";
import type { IStorage } from "./storage";

// Initialize Firebase Admin (for server-side operations)
const serviceAccount: ServiceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk@${process.env.VITE_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ""
};

let adminApp;
try {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
} catch (error) {
  console.warn("Firebase Admin initialization failed, using client SDK:", error);
}

const adminDb = adminApp ? getFirestore(adminApp) : null;

// Collections
const COLLECTIONS = {
  STUDENTS: "students",
  HOSTEL_SETTINGS: "hostel_settings",
  ADMINS: "admins",
  ADMIN_SESSIONS: "admin_sessions"
} as const;

export class FirebaseStorage implements IStorage {
  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const doc = await adminDb.collection(COLLECTIONS.STUDENTS).doc(id).get();
    return doc.exists 
      ? { id: doc.id, ...doc.data() } as Student
      : undefined;
  }

  async getStudentByMobile(mobile: string): Promise<Student | undefined> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await adminDb
      .collection(COLLECTIONS.STUDENTS)
      .where("mobile", "==", mobile)
      .limit(1)
      .get();
    
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...doc.data() } as Student
      : undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const docRef = await adminDb.collection(COLLECTIONS.STUDENTS).add({
      ...student,
      lastUpdated: new Date().toISOString()
    });
    
    const newDoc = await docRef.get();
    return {
      id: newDoc.id,
      ...newDoc.data()
    } as Student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const docRef = adminDb.collection(COLLECTIONS.STUDENTS).doc(id);
    await docRef.update({
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Student;
  }

  // Hostel settings
  async getHostelSettings(): Promise<HostelSettings | undefined> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await adminDb.collection(COLLECTIONS.HOSTEL_SETTINGS).limit(1).get();
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...doc.data() } as HostelSettings
      : undefined;
  }

  async updateHostelSettings(settings: Partial<HostelSettings>): Promise<HostelSettings> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await adminDb.collection(COLLECTIONS.HOSTEL_SETTINGS).limit(1).get();
    
    if (snapshot.empty) {
      // Create new settings
      const docRef = await adminDb.collection(COLLECTIONS.HOSTEL_SETTINGS).add(settings);
      const newDoc = await docRef.get();
      return { id: newDoc.id, ...newDoc.data() } as HostelSettings;
    } else {
      // Update existing settings
      const doc = snapshot.docs[0];
      await doc.ref.update(settings);
      const updatedDoc = await doc.ref.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as HostelSettings;
    }
  }

  // Admin authentication
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const docRef = await adminDb.collection(COLLECTIONS.ADMINS).add({
      ...admin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const newDoc = await docRef.get();
    return {
      id: newDoc.id,
      ...newDoc.data()
    } as Admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await adminDb
      .collection(COLLECTIONS.ADMINS)
      .where("username", "==", username)
      .limit(1)
      .get();
    
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...doc.data() } as Admin
      : undefined;
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const doc = await adminDb.collection(COLLECTIONS.ADMINS).doc(id).get();
    return doc.exists 
      ? { id: doc.id, ...doc.data() } as Admin
      : undefined;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    await adminDb.collection(COLLECTIONS.ADMINS).doc(id).update({
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Session management
  async createSession(adminId: string, token: string, expiresAt: string): Promise<AdminSession> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const docRef = await adminDb.collection(COLLECTIONS.ADMIN_SESSIONS).add({
      adminId,
      token,
      expiresAt,
      createdAt: new Date().toISOString()
    });
    
    const newDoc = await docRef.get();
    return {
      id: newDoc.id,
      ...newDoc.data()
    } as AdminSession;
  }

  async getSessionByToken(token: string): Promise<AdminSession | undefined> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await adminDb
      .collection(COLLECTIONS.ADMIN_SESSIONS)
      .where("token", "==", token)
      .limit(1)
      .get();
    
    const doc = snapshot.docs[0];
    return doc 
      ? { id: doc.id, ...doc.data() } as AdminSession
      : undefined;
  }

  async deleteSession(token: string): Promise<void> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await adminDb
      .collection(COLLECTIONS.ADMIN_SESSIONS)
      .where("token", "==", token)
      .get();
    
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  async cleanExpiredSessions(): Promise<void> {
    if (!adminDb) throw new Error("Firebase Admin not initialized");
    
    const now = new Date().toISOString();
    const snapshot = await adminDb
      .collection(COLLECTIONS.ADMIN_SESSIONS)
      .where("expiresAt", "<", now)
      .get();
    
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
}

// Fallback to MemStorage if Firebase Admin is not available
export const createStorage = (): IStorage => {
  if (adminDb) {
    return new FirebaseStorage();
  } else {
    console.warn("Using MemStorage as Firebase Admin is not configured");
    // Import and return MemStorage as fallback
    const { MemStorage } = require('./storage');
    return new MemStorage();
  }
};