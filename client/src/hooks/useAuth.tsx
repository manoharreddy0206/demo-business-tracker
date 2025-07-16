import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  username: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('adminToken')
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize authentication state on app start
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedAdminData = localStorage.getItem('adminData');
      
      if (storedToken && storedAdminData) {
        // Check if it's a Firebase token and validate expiration
        if (storedToken !== 'demo-token') {
          try {
            const [adminId, timestamp] = atob(storedToken).split(':');
            const tokenAge = Date.now() - parseInt(timestamp);
            
            // Token expires after 7 days (like a typical app session)
            if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
              console.log("Session expired, clearing stored data");
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminData');
              setIsInitialized(true);
              return;
            }
          } catch (error) {
            console.log("Invalid token format, clearing session");
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            setIsInitialized(true);
            return;
          }
        }
        
        setToken(storedToken);
        console.log("Restored authentication session - welcome back!");
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // Fetch current admin (with Firebase support)
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async (): Promise<Admin> => {
      if (!token) throw new Error('No token');
      
      // For Firebase production, try to get fresh admin data
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID && token !== 'demo-token') {
        try {
          const { adminService } = await import('@/lib/firebase-service');
          
          // Extract admin ID from token
          const adminId = atob(token).split(':')[0];
          const firebaseAdmin = await adminService.getById(adminId);
          if (firebaseAdmin) {
            // Update local storage with latest data
            localStorage.setItem('adminData', JSON.stringify(firebaseAdmin));
            return firebaseAdmin;
          }
        } catch (error) {
          console.log("Firebase admin fetch failed, using stored data:", error);
        }
      }
      
      // Check if we have stored admin data
      const storedAdminData = localStorage.getItem('adminData');
      if (storedAdminData) {
        return JSON.parse(storedAdminData) as Admin;
      }
      
      // For demo token
      if (token === 'demo-token') {
        return {
          id: 'demo-admin',
          username: 'admin',
          email: 'admin@hostel.com',
          role: 'admin'
        };
      }
      
      throw new Error('No admin data found');
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds to get updates
  });

  // Clear token on auth error
  useEffect(() => {
    if (error && token) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setToken(null);
    }
  }, [error, token]);

  // Login mutation with Firebase
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      // Try Firebase first if available
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const bcrypt = await import('bcryptjs');
        const { adminService } = await import('@/lib/firebase-service');
        
        // Find admin by username
        const admin = await adminService.getByUsername(username);
        if (!admin) {
          throw new Error('Invalid username or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
          throw new Error('Invalid username or password');
        }

        // Update last login
        await adminService.updateLastLogin(admin.id);
        
        // Create session token
        const token = btoa(`${admin.id}:${Date.now()}`);
        
        return {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
          }
        };
      }
      
      // Check stored credentials first
      const storedCredentials = localStorage.getItem('adminCredentials');
      if (storedCredentials) {
        const { username: storedUsername, password: storedPassword } = JSON.parse(storedCredentials);
        if (username === storedUsername && password === storedPassword) {
          // Get updated admin data
          const storedAdminData = localStorage.getItem('adminData');
          const adminData = storedAdminData ? JSON.parse(storedAdminData) : {
            id: 'demo-admin',
            username: storedUsername,
            email: 'admin@hostel.com',
            role: 'admin'
          };
          
          return {
            token: 'demo-token',
            admin: adminData
          };
        }
      }
      
      // Fallback to default credentials
      if (username === 'admin' && password === 'admin123') {
        // Store default credentials
        localStorage.setItem('adminCredentials', JSON.stringify({ username: 'admin', password: 'admin123' }));
        
        return {
          token: 'demo-token',
          admin: {
            id: 'demo-admin',
            username: 'admin',
            email: 'admin@hostel.com',
            role: 'admin'
          }
        };
      }
      
      throw new Error('Invalid username or password');
    },
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      localStorage.setItem('loginTimestamp', Date.now().toString());
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast({
        title: "Login Successful", 
        description: `Welcome back, ${data.admin.username}! Your session will persist until you logout.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Clean up local storage completely
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('adminCredentials');
      return Promise.resolve();
    },
    onSettled: () => {
      setToken(null);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully. You'll need to login again next time.",
      });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    admin: admin || null,
    isLoading: (!isInitialized || isLoading || loginMutation.isPending),
    isAuthenticated: !!admin && !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};