
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

// Define the possible user roles
type UserRole = "admin" | "user" | "ceo";

interface User {
  username: string;
  role: UserRole;
  faceId?: string; // Store face recognition data
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; requiresSecondFactor?: boolean }>;
  logout: () => void;
  resetSystem: () => Promise<boolean>;
  verifyFace: (faceData: string) => Promise<boolean>;
  hasPendingVerification: boolean;
  pendingUser: User | null;
}

const defaultAdminCredentials = {
  username: "MWTINC",
  password: "JC222@Vemous$24",
};

const defaultCeoCredentials = {
  username: "CEO",
  password: "SystemReset@2024!",
};

// Mock user database with face recognition data
const userDatabase = [
  { 
    username: defaultAdminCredentials.username, 
    password: defaultAdminCredentials.password, 
    role: "admin" as UserRole,
    faceId: "admin-face-recognition-hash" 
  },
  { 
    username: defaultCeoCredentials.username, 
    password: defaultCeoCredentials.password, 
    role: "ceo" as UserRole,
    faceId: "ceo-face-recognition-hash" 
  },
  { 
    username: "user1", 
    password: "password123", 
    role: "user" as UserRole,
    faceId: "user1-face-recognition-hash" 
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPendingVerification, setHasPendingVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; requiresSecondFactor?: boolean }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find user in our mock database
    const foundUser = userDatabase.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // For 2FA, we don't complete the authentication process yet
      const userInfo = { 
        username: foundUser.username, 
        role: foundUser.role
      };
      
      setPendingUser(userInfo);
      setHasPendingVerification(true);
      
      toast({
        title: "First factor verified",
        description: "Please complete face verification to continue."
      });
      
      return { success: true, requiresSecondFactor: true };
    }

    toast({
      title: "Login failed",
      description: "Invalid username or password. Please try again.",
      variant: "destructive"
    });
    return { success: false };
  }, []);
  
  const verifyFace = useCallback(async (faceData: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    if (!pendingUser) {
      toast({
        title: "Verification error",
        description: "No pending user authentication found.",
        variant: "destructive"
      });
      return false;
    }
    
    // In a real app, we would compare the faceData with the stored faceId
    // For this demo, we'll simulate a successful verification
    const foundUser = userDatabase.find(u => u.username === pendingUser.username);
    
    if (foundUser) {
      const user = { 
        username: foundUser.username, 
        role: foundUser.role 
      };
      
      setUser(user);
      setIsAuthenticated(true);
      setHasPendingVerification(false);
      setPendingUser(null);
      
      localStorage.setItem("user", JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.role === "ceo" ? "CEO" : user.role === "admin" ? "administrator" : "user"}.`
      });
      
      return true;
    }
    
    toast({
      title: "Face verification failed",
      description: "We couldn't verify your identity. Please try again.",
      variant: "destructive"
    });
    
    return false;
  }, [pendingUser]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setHasPendingVerification(false);
    setPendingUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  }, []);

  const resetSystem = useCallback(async (): Promise<boolean> => {
    // Only CEO can reset the system
    if (!user || user.role !== "ceo") {
      toast({
        title: "Access Denied",
        description: "Only the CEO can reset the system.",
        variant: "destructive"
      });
      return false;
    }
    
    // Simulate system reset
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    try {
      // Backup mapbox token if it exists
      const mapboxToken = localStorage.getItem("mapbox_token");
      
      // Clear stored settings
      localStorage.removeItem("firewallSettings");
      localStorage.removeItem("searchSettings");
      localStorage.removeItem("searchHistory");
      localStorage.removeItem("securitySettings");
      
      // Restore mapbox token if it existed
      if (mapboxToken) {
        localStorage.setItem("mapbox_token", mapboxToken);
      }
      
      // Re-initialize with defaults
      const defaultFirewallSettings = {
        enabled: true,
        blockUnauthorizedIps: true,
        allowedDomains: ["*.google.com", "*.bing.com", "*.duckduckgo.com"],
        blockWords: ["malware", "phishing", "exploit"],
        securityLevel: "medium",
      };
      
      const defaultSecuritySettings = {
        malwareProtectionEnabled: true,
        intrusionDetectionEnabled: true,
        lastScanTime: null,
        threatLevel: "low",
        securityLog: [],
        blockedAttempts: 0,
      };
      
      localStorage.setItem("firewallSettings", JSON.stringify(defaultFirewallSettings));
      localStorage.setItem("securitySettings", JSON.stringify(defaultSecuritySettings));
      
      toast({
        title: "System reset successful",
        description: "All settings have been reset to their default values."
      });
      
      return true;
    } catch (error) {
      console.error("Reset failed:", error);
      toast({
        title: "System reset failed",
        description: "There was an error resetting the system. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        resetSystem,
        verifyFace,
        hasPendingVerification,
        pendingUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
