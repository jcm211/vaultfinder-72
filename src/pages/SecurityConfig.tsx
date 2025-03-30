
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSecurity } from "@/context/SecurityContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  ChevronLeft,
  Save,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ListFilter,
  History,
  Eye,
  Lock,
  Activity
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

const SecurityConfig = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    security, 
    toggleMalwareProtection, 
    toggleIntrusionDetection,
    scanForThreats,
    clearSecurityLogs 
  } = useSecurity();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const intervalId = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 300);
    
    try {
      await scanForThreats();
    } finally {
      clearInterval(intervalId);
      setScanProgress(100);
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get security log entries by type
  const getLogEntriesByType = (type: "warning" | "blocked" | "info") => {
    return security.securityLog.filter(entry => entry.type === type);
  };

  // Get threat level color
  const getThreatLevelColor = () => {
    switch (security.threatLevel) {
      case "high": return "text-red-500";
      case "medium": return "text-amber-500";
      case "low": return "text-green-500";
      default: return "text-green-500";
    }
  };
  
  // If not authenticated, return null
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/admin")}
                className="mr-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold mb-2">Security Configuration</h1>
                <p className="text-gray-500">
                  Manage malware protection and security settings
                </p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>{isScanning ? "Scanning..." : "Scan System"}</span>
              </Button>
            </div>
          </div>
          
          {isScanning && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
                      <span>Scanning system for security threats...</span>
                    </div>
                    <span className="text-sm font-medium">{Math.round(scanProgress)}%</span>
                  </div>
                  <Progress value={scanProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Protection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Malware Protection</Label>
                    </div>
                    <Switch
                      checked={security.malwareProtectionEnabled}
                      onCheckedChange={toggleMalwareProtection}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Intrusion Detection</Label>
                    </div>
                    <Switch
                      checked={security.intrusionDetectionEnabled}
                      onCheckedChange={toggleIntrusionDetection}
                    />
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Threat Level</span>
                      <span className={`text-sm font-semibold uppercase ${getThreatLevelColor()}`}>
                        {security.threatLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Last Scan</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(security.lastScanTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Security Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Blocked Attempts</span>
                      <span className="text-sm font-semibold">
                        {security.blockedAttempts}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(security.blockedAttempts * 10, 100)} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Warnings</span>
                      <span className="text-sm font-semibold">
                        {getLogEntriesByType("warning").length}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(getLogEntriesByType("warning").length * 5, 100)} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 rounded-md p-3 text-center">
                        <div className="text-xl font-semibold">
                          {getLogEntriesByType("blocked").length}
                        </div>
                        <div className="text-xs text-gray-500">Blocked</div>
                      </div>
                      <div className="bg-gray-100 rounded-md p-3 text-center">
                        <div className="text-xl font-semibold">
                          {security.securityLog.length}
                        </div>
                        <div className="text-xs text-gray-500">Log Entries</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={handleScan}
                    disabled={isScanning}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Scan For Threats</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={clearSecurityLogs}
                  >
                    <ListFilter className="h-4 w-4 mr-2" />
                    <span>Clear Security Logs</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => navigate("/admin/firewall")}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    <span>Firewall Configuration</span>
                  </Button>
                  
                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-2">Protection Active For:</div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Search Queries</span>
                      <span className="text-green-500">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span>URL Access</span>
                      <span className="text-green-500">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span>Content Filtering</span>
                      <span className="text-green-500">✓</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="logs">Security Logs</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Security Event Log</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearSecurityLogs}
                      className="h-8"
                    >
                      Clear Log
                    </Button>
                  </div>
                  <CardDescription>
                    Review recent security events and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {security.securityLog.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No security events have been recorded yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {security.securityLog.slice(0, 10).map((entry, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {new Date(entry.timestamp).toLocaleTimeString()} 
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  entry.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                                  entry.type === "blocked" ? "bg-red-100 text-red-800" :
                                  "bg-blue-100 text-blue-800"
                                }`}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {entry.message}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Recommendations</CardTitle>
                  <CardDescription>
                    Suggested actions to improve system security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800">Scan System Regularly</h3>
                          <div className="mt-2 text-sm text-amber-700">
                            <p>
                              Schedule regular security scans to detect potential threats early.
                              We recommend scanning at least once per week.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Eye className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Review Firewall Settings</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Regularly update your firewall's blocked words list and allowed domains
                              to improve protection against emerging threats.
                            </p>
                          </div>
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate("/admin/firewall")}
                              className="text-xs h-7"
                            >
                              Configure Firewall
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Lock className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Current Protection Status</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              Your system is currently{' '}
                              {security.malwareProtectionEnabled && security.intrusionDetectionEnabled 
                                ? 'well protected with all security features enabled.'
                                : 'partially protected. Consider enabling all security features.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SecurityConfig;
