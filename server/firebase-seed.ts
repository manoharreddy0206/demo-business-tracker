import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { Student, HostelSettings } from "@shared/schema";

// Firebase configuration (same as client)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "hostel-management-demo.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "hostel-management-demo",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "hostel-management-demo.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:demo-app-id"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function seedFirebaseData() {
  try {
    console.log("🌱 Starting Firebase data seeding...");

    // Sample hostel settings
    const hostelSettings: HostelSettings = {
      id: "hostel",
      monthlyFee: 5000,
      upiId: "hostel@paytm",
      hostelName: "Sunrise Hostel"
    };

    // Sample students data
    const sampleStudents: Student[] = [
      {
        id: "student1",
        name: "Rahul Sharma",
        mobile: "9876543210",
        room: "A101",
        joiningDate: "2024-01-15",
        feeStatus: "paid",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "student2",
        name: "Priya Patel",
        mobile: "9876543211",
        room: "B205",
        joiningDate: "2024-02-01",
        feeStatus: "pending",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "student3",
        name: "Amit Kumar",
        mobile: "9876543212",
        room: "C301",
        joiningDate: "2024-01-20",
        feeStatus: "overdue",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "student4",
        name: "Sneha Reddy",
        mobile: "9876543213",
        room: "D405",
        joiningDate: "2024-03-10",
        feeStatus: "paid",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "student5",
        name: "Vikash Singh",
        mobile: "9876543214",
        room: "A202",
        joiningDate: "2024-02-15",
        feeStatus: "pending",
        lastUpdated: new Date().toISOString()
      }
    ];

    // Create a batch to perform all writes atomically
    const batch = writeBatch(db);

    // Add hostel settings
    const settingsRef = doc(db, "settings", "hostel");
    batch.set(settingsRef, hostelSettings);
    console.log("📝 Added hostel settings");

    // Add all students
    for (const student of sampleStudents) {
      const studentRef = doc(db, "students", student.id);
      batch.set(studentRef, student);
    }
    console.log(`📝 Added ${sampleStudents.length} students`);

    // Commit the batch
    await batch.commit();
    console.log("✅ Firebase data seeding completed successfully!");

    return {
      success: true,
      message: `Seeded ${sampleStudents.length} students and hostel settings`,
      students: sampleStudents.length,
      settings: 1
    };

  } catch (error) {
    console.error("❌ Error seeding Firebase data:", error);
    throw error;
  }
}

// Export the database instance for use in routes
export { db };