import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyPassword, generateToken, getTokenFromHeader, verifyToken } from "./auth";
import { loginSchema } from "@shared/schema";
import { seedFirebaseData } from "./firebase-seed";
import { triggerMonthlyReset, checkMonthlyResetNeeded } from "./monthly-reset";

// Authentication middleware
interface AuthRequest extends Request {
  admin?: { id: string; username: string; role: string };
}

async function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const session = await storage.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ message: "Session not found or expired" });
  }

  const admin = await storage.getAdminById(session.adminId);
  if (!admin || !admin.isActive) {
    return res.status(401).json({ message: "Admin account not found or inactive" });
  }

  req.admin = { id: admin.id, username: admin.username, role: admin.role };
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes (public)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.issues 
        });
      }

      const { username, password } = validation.data;
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(admin.id);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      await storage.createSession(admin.id, token, expiresAt);
      await storage.updateAdminLastLogin(admin.id);

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const token = getTokenFromHeader(req.headers.authorization);
      if (token) {
        await storage.deleteSession(token);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateAdmin, (req: AuthRequest, res) => {
    res.json(req.admin);
  });
  // API route to seed Firebase with sample data
  app.post("/api/seed-data", async (req, res) => {
    try {
      const result = await seedFirebaseData();
      res.json(result);
    } catch (error) {
      console.error("Seed data error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Monthly reset route (protected - admin only)
  app.post("/api/admin/monthly-reset", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await triggerMonthlyReset();
      res.json(result);
    } catch (error) {
      console.error("Error triggering monthly reset:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to trigger monthly reset", 
        studentsReset: 0 
      });
    }
  });

  // Check if monthly reset is needed
  app.get("/api/admin/check-monthly-reset", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const resetNeeded = await checkMonthlyResetNeeded();
      const settings = await storage.getHostelSettings();
      res.json({ 
        resetNeeded,
        lastReset: settings?.lastMonthlyReset || null,
        currentDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error checking monthly reset:", error);
      res.status(500).json({ resetNeeded: false, lastReset: null, currentDate: new Date().toISOString() });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
