
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetSystem: () => Promise<boolean>;
}

const defaultAdminCredentials = {
  username: "MWTINC",
  password: "JC222@Vemous$24",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (username === defaultAdminCredentials.username && password === defaultAdminCredentials.password) {
      const user = { username, role: "admin" as const };
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  const resetSystem = async (): Promise<boolean> => {
    // Simulate system reset
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Clear stored settings
    localStorage.removeItem("firewallSettings");
    localStorage.removeItem("searchSettings");
    localStorage.removeItem("searchHistory");
    localStorage.removeItem("mapbox_token");
    
    // Re-initialize with defaults
    const defaultFirewallSettings = {
      enabled: true,
      blockUnauthorizedIps: true,
      allowedDomains: ["*.google.com", "*.bing.com", "*.duckduckgo.com"],
      blockWords: ["malware", "phishing", "exploit"],
      securityLevel: "medium",
    };
    
    localStorage.setItem("firewallSettings", JSON.stringify(defaultFirewallSettings));
    
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        resetSystem,
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
