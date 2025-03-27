
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Save,
  ChevronLeft,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FirewallSettings {
  enabled: boolean;
  blockUnauthorizedIps: boolean;
  allowedDomains: string[];
  blockWords: string[];
  securityLevel: "low" | "medium" | "high";
}

const FirewallConfig = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<FirewallSettings>({
    enabled: true,
    blockUnauthorizedIps: true,
    allowedDomains: ["*.google.com", "*.bing.com", "*.duckduckgo.com"],
    blockWords: ["malware", "phishing", "exploit"],
    securityLevel: "medium",
  });
  
  const [newDomain, setNewDomain] = useState("");
  const [newBlockWord, setNewBlockWord] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/login");
    return null;
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("firewallSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse firewall settings:", error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        localStorage.setItem("firewallSettings", JSON.stringify(settings));
        
        toast({
          title: "Settings Saved",
          description: "Firewall configuration has been updated successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  const addDomain = () => {
    if (!newDomain) return;
    
    if (!settings.allowedDomains.includes(newDomain)) {
      setSettings({
        ...settings,
        allowedDomains: [...settings.allowedDomains, newDomain],
      });
    }
    
    setNewDomain("");
  };

  const removeDomain = (domain: string) => {
    setSettings({
      ...settings,
      allowedDomains: settings.allowedDomains.filter(d => d !== domain),
    });
  };

  const addBlockWord = () => {
    if (!newBlockWord) return;
    
    if (!settings.blockWords.includes(newBlockWord)) {
      setSettings({
        ...settings,
        blockWords: [...settings.blockWords, newBlockWord],
      });
    }
    
    setNewBlockWord("");
  };

  const removeBlockWord = (word: string) => {
    setSettings({
      ...settings,
      blockWords: settings.blockWords.filter(w => w !== word),
    });
  };

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
                <h1 className="text-2xl font-bold mb-2">Firewall Configuration</h1>
                <p className="text-gray-500">
                  Manage security settings to protect your search engine
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
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="filter">Content Filter</TabsTrigger>
              <TabsTrigger value="domains">Allowed Domains</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="animate-fade-in">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Firewall Status
                  </CardTitle>
                  <CardDescription>Enable or disable the firewall protection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="firewall-status" className="text-base">Firewall Protection</Label>
                      <p className="text-sm text-gray-500">
                        Enable comprehensive protection for your search engine
                      </p>
                    </div>
                    <Switch
                      id="firewall-status"
                      checked={settings.enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="block-ips" className="text-base">Block Unauthorized IPs</Label>
                      <p className="text-sm text-gray-500">
                        Restrict access based on IP address
                      </p>
                    </div>
                    <Switch
                      id="block-ips"
                      checked={settings.blockUnauthorizedIps}
                      onCheckedChange={(checked) => setSettings({ ...settings, blockUnauthorizedIps: checked })}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Label htmlFor="security-level" className="text-base mb-2 block">Security Level</Label>
                    <Select
                      value={settings.securityLevel}
                      onValueChange={(value: "low" | "medium" | "high") => 
                        setSettings({ ...settings, securityLevel: value })
                      }
                      disabled={!settings.enabled}
                    >
                      <SelectTrigger id="security-level" className="w-full">
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Basic Protection</SelectItem>
                        <SelectItem value="medium">Medium - Standard Protection</SelectItem>
                        <SelectItem value="high">High - Maximum Protection</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-2">
                      {settings.securityLevel === "low" && 
                        "Basic protection with minimal filtering. Suitable for trusted environments."}
                      {settings.securityLevel === "medium" && 
                        "Standard protection with balanced filtering. Recommended for most users."}
                      {settings.securityLevel === "high" && 
                        "Maximum protection with strict filtering. May block some legitimate content."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Protection Status</CardTitle>
                  <CardDescription>Current security configuration overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">Active Protections</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-green-200 flex items-center justify-center mr-2">
                            <svg className="h-2 w-2 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800">Content filtering: {settings.blockWords.length} blocked terms</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-green-200 flex items-center justify-center mr-2">
                            <svg className="h-2 w-2 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800">Allowed domains: {settings.allowedDomains.length} whitelisted</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-green-200 flex items-center justify-center mr-2">
                            <svg className="h-2 w-2 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800">Security level: {settings.securityLevel}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-1">Security Recommendations</h3>
                      <p className="text-sm text-blue-600">
                        {settings.securityLevel === "low" ? 
                          "Consider increasing your security level for better protection." : 
                          "Your security configuration is at a good level."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="filter" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Filtering</CardTitle>
                  <CardDescription>
                    Block searches containing specific keywords or phrases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="blocked-words" className="text-base mb-2 block">Blocked Keywords</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Searches containing these words will be blocked from displaying results
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {settings.blockWords.map((word) => (
                        <div 
                          key={word}
                          className="flex items-center bg-gray-100 rounded-full pl-3 pr-2 py-1"
                        >
                          <span className="text-sm text-gray-700 mr-1">{word}</span>
                          <button
                            type="button"
                            onClick={() => removeBlockWord(word)}
                            className="h-5 w-5 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {settings.blockWords.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No blocked words added yet</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        id="blocked-words"
                        placeholder="Enter keyword to block"
                        value={newBlockWord}
                        onChange={(e) => setNewBlockWord(e.target.value)}
                        className="flex-1"
                        disabled={!settings.enabled}
                      />
                      <Button 
                        onClick={addBlockWord}
                        disabled={!newBlockWord || !settings.enabled}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-1">Content Filtering Tips</h3>
                    <p className="text-sm text-amber-700">
                      Add specific words that should trigger content blocking. For best results, use exact 
                      keywords related to harmful or unwanted content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="domains" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allowed Domains</CardTitle>
                  <CardDescription>
                    Manage domains that are allowed to appear in search results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="allowed-domains" className="text-base mb-2 block">Whitelisted Domains</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Only these domains will be allowed in search results when security level is set to high
                    </p>
                    
                    <div className="rounded-lg border overflow-hidden mb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Domain Pattern
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {settings.allowedDomains.map((domain) => (
                            <tr key={domain} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-gray-900">
                                  {domain}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeDomain(domain)}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          
                          {settings.allowedDomains.length === 0 && (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-sm text-gray-500 italic">
                                No domains added yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        id="allowed-domains"
                        placeholder="Enter domain (e.g., *.example.com)"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="flex-1"
                        disabled={!settings.enabled}
                      />
                      <Button 
                        onClick={addDomain}
                        disabled={!newDomain || !settings.enabled}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-1">Domain Pattern Tips</h3>
                    <p className="text-sm text-blue-600">
                      Use wildcards for subdomains. For example, <code className="bg-blue-100 px-1 rounded">*.example.com</code> will 
                      match any subdomain of example.com.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Domains are enforced when security level is set to "High"
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FirewallConfig;
