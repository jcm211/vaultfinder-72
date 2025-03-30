
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface SecurityState {
  malwareProtectionEnabled: boolean;
  intrusionDetectionEnabled: boolean;
  lastScanTime: string | null;
  threatLevel: "low" | "medium" | "high";
  securityLog: SecurityLogEntry[];
  blockedAttempts: number;
}

interface SecurityLogEntry {
  timestamp: string;
  type: "warning" | "blocked" | "info";
  message: string;
}

interface SecurityContextType {
  security: SecurityState;
  toggleMalwareProtection: () => void;
  toggleIntrusionDetection: () => void;
  scanForThreats: () => Promise<boolean>;
  clearSecurityLogs: () => void;
  isUrlSafe: (url: string) => Promise<boolean>;
  isContentSafe: (content: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [security, setSecurity] = useState<SecurityState>({
    malwareProtectionEnabled: true,
    intrusionDetectionEnabled: true,
    lastScanTime: null,
    threatLevel: "low",
    securityLog: [],
    blockedAttempts: 0,
  });

  useEffect(() => {
    // Load security settings from localStorage on initialization
    const savedSecurity = localStorage.getItem("securitySettings");
    if (savedSecurity) {
      try {
        setSecurity(JSON.parse(savedSecurity));
      } catch (error) {
        console.error("Failed to parse security settings:", error);
      }
    }
  }, []);

  // Save security settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("securitySettings", JSON.stringify(security));
  }, [security]);

  // Toggle malware protection
  const toggleMalwareProtection = useCallback(() => {
    setSecurity(prev => {
      const updated = { 
        ...prev, 
        malwareProtectionEnabled: !prev.malwareProtectionEnabled 
      };
      
      // Log the action
      addSecurityLog(
        updated.malwareProtectionEnabled ? 
          "Malware protection enabled" : 
          "Malware protection disabled",
        "info"
      );
      
      return updated;
    });
  }, []);

  // Toggle intrusion detection
  const toggleIntrusionDetection = useCallback(() => {
    setSecurity(prev => {
      const updated = { 
        ...prev, 
        intrusionDetectionEnabled: !prev.intrusionDetectionEnabled 
      };
      
      // Log the action
      addSecurityLog(
        updated.intrusionDetectionEnabled ? 
          "Intrusion detection enabled" : 
          "Intrusion detection disabled",
        "info"
      );
      
      return updated;
    });
  }, []);

  // Add an entry to security log
  const addSecurityLog = useCallback((message: string, type: "warning" | "blocked" | "info") => {
    setSecurity(prev => ({
      ...prev,
      securityLog: [
        {
          timestamp: new Date().toISOString(),
          type,
          message
        },
        ...prev.securityLog
      ].slice(0, 100) // Keep only the last 100 entries
    }));
  }, []);

  // Scan for threats
  const scanForThreats = useCallback(async (): Promise<boolean> => {
    // Simulate a security scan
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate finding potential threats (randomly)
    const randomThreatLevel = Math.random();
    let threatLevel: "low" | "medium" | "high" = "low";
    let foundThreats = false;
    
    if (randomThreatLevel > 0.9) {
      threatLevel = "high";
      foundThreats = true;
      addSecurityLog("Critical security vulnerabilities detected!", "warning");
    } else if (randomThreatLevel > 0.7) {
      threatLevel = "medium";
      foundThreats = true;
      addSecurityLog("Potential security risks identified", "warning");
    } else {
      addSecurityLog("No security threats detected", "info");
    }
    
    setSecurity(prev => ({
      ...prev,
      lastScanTime: new Date().toISOString(),
      threatLevel
    }));
    
    if (foundThreats) {
      toast({
        title: "Security Alert",
        description: `Security scan complete. Threat level: ${threatLevel.toUpperCase()}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Scan Complete",
        description: "No security threats were detected in this scan."
      });
    }
    
    return !foundThreats;
  }, []);

  // Check if a URL is safe
  const isUrlSafe = useCallback(async (url: string): Promise<boolean> => {
    if (!security.malwareProtectionEnabled) return true;
    
    // Check for common malicious patterns in URLs
    const maliciousPatterns = [
      "malware", "phishing", "exploit", "hack", "crack", "warez",
      "backdoor", "trojan", "virus", "ransomware", "spyware"
    ];
    
    const hasMatch = maliciousPatterns.some(pattern => 
      url.toLowerCase().includes(pattern)
    );
    
    if (hasMatch) {
      addSecurityLog(`Blocked access to potentially malicious URL: ${url}`, "blocked");
      setSecurity(prev => ({
        ...prev,
        blockedAttempts: prev.blockedAttempts + 1
      }));
      return false;
    }
    
    return true;
  }, [security.malwareProtectionEnabled]);

  // Check if content is safe
  const isContentSafe = useCallback(async (content: string): Promise<boolean> => {
    if (!security.malwareProtectionEnabled) return true;
    
    // Check for potential script injections or malicious code patterns
    const maliciousPatterns = [
      "<script>", "javascript:", "onerror=", "onload=", "eval(", 
      "document.cookie", "localStorage", "sessionStorage",
      "exec(", "system(", "cmd.exe", "/bin/sh", "chmod +x"
    ];
    
    const hasMatch = maliciousPatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    );
    
    if (hasMatch) {
      addSecurityLog("Blocked potentially malicious content", "blocked");
      setSecurity(prev => ({
        ...prev,
        blockedAttempts: prev.blockedAttempts + 1
      }));
      return false;
    }
    
    return true;
  }, [security.malwareProtectionEnabled]);

  // Clear security logs
  const clearSecurityLogs = useCallback(() => {
    setSecurity(prev => ({
      ...prev,
      securityLog: []
    }));
    
    toast({
      title: "Logs Cleared",
      description: "Security logs have been cleared successfully."
    });
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        security,
        toggleMalwareProtection,
        toggleIntrusionDetection,
        scanForThreats,
        clearSecurityLogs,
        isUrlSafe,
        isContentSafe
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
