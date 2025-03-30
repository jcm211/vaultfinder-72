
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
  date?: string;
}

interface SearchContextType {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  searchHistory: string[];
  clearHistory: () => void;
  infiniteSearch: (page: number) => Promise<void>;
  hasMoreResults: boolean;
  currentPage: number;
}

interface FirewallSettings {
  enabled: boolean;
  blockUnauthorizedIps: boolean;
  allowedDomains: string[];
  blockWords: string[];
  securityLevel: "low" | "medium" | "high";
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [firewallSettings, setFirewallSettings] = useState<FirewallSettings>({
    enabled: true,
    blockUnauthorizedIps: true,
    allowedDomains: ["*.google.com", "*.bing.com", "*.duckduckgo.com"],
    blockWords: ["malware", "phishing", "exploit"],
    securityLevel: "medium",
  });
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse search history:", error);
      }
    }

    const savedFirewallSettings = localStorage.getItem("firewallSettings");
    if (savedFirewallSettings) {
      try {
        setFirewallSettings(JSON.parse(savedFirewallSettings));
      } catch (error) {
        console.error("Failed to parse firewall settings:", error);
      }
    } else {
      // Store default settings
      localStorage.setItem("firewallSettings", JSON.stringify(firewallSettings));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Generate different result sets for infinite scrolling based on page number
  const generateResultsForPage = useCallback((searchQuery: string, page: number): SearchResult[] => {
    // Filter out blocked words if firewall is enabled
    if (firewallSettings.enabled) {
      const isBlocked = firewallSettings.blockWords.some(word => 
        searchQuery.toLowerCase().includes(word.toLowerCase())
      );
      
      if (isBlocked) {
        toast({
          title: "Content blocked",
          description: "This search has been blocked by the firewall settings.",
          variant: "destructive"
        });
        return [];
      }
    }
    
    // Generate a page-specific seed for consistent results
    const pageSeed = (searchQuery.length * 7 + page * 13) % 100;
    
    // Define base domains and paths for result variations
    const domains = [
      "example.com", 
      "wikipedia.org", 
      "docs.info", 
      "research.edu", 
      "blog.net", 
      "news.org",
      "resources.dev",
      "info.co",
      "journal.io",
      "data.tech"
    ];
    
    // Generate page-specific results (10 results per page)
    const pageResults: SearchResult[] = [];
    const pageOffset = (page - 1) * 10;
    
    for (let i = 0; i < 10; i++) {
      const resultId = pageOffset + i + 1;
      const domainIndex = (pageSeed + i) % domains.length;
      const domain = domains[domainIndex];
      
      // Generate more varied titles and descriptions based on page number
      let titlePrefix = "";
      let descPrefix = "";
      
      if (page > 1) {
        // Add variety for subsequent pages
        const prefixes = ["Advanced", "Detailed", "Complete", "Professional", "Expert"];
        titlePrefix = prefixes[(pageSeed + i) % prefixes.length] + " ";
        
        const descPrefixes = [
          "In-depth analysis of ",
          "Comprehensive guide to ",
          "Detailed explanation about ",
          "Expert insights on ",
          "Advanced information regarding "
        ];
        descPrefix = descPrefixes[(pageSeed + i + page) % descPrefixes.length];
      }
      
      // Create date with slight variations based on page number
      const date = new Date();
      date.setDate(date.getDate() - ((pageSeed + resultId) % 30));
      const dateStr = date.toISOString().split('T')[0];
      
      pageResults.push({
        id: `${page}-${resultId}`,
        title: `${titlePrefix}${searchQuery} - Result ${resultId} | ${domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)}`,
        url: `https://www.${domain}/search/${searchQuery.toLowerCase().replace(/\s+/g, '-')}/${resultId}`,
        description: `${descPrefix}${searchQuery}. This is result #${resultId} with specific information tailored to your search query. Learn more about ${searchQuery} and related topics.`,
        favicon: `https://www.${domain.split(".")[0]}.${domain.split(".")[1]}/favicon.ico`,
        date: dateStr
      });
    }
    
    // Apply security filtering based on security level if firewall is enabled
    if (firewallSettings.enabled) {
      switch (firewallSettings.securityLevel) {
        case "high":
          // Only return results from explicitly allowed domains
          return pageResults.filter(result => 
            firewallSettings.allowedDomains.some(domain => {
              const domainPattern = domain.replace("*.", "");
              return result.url.includes(domainPattern);
            })
          );
        case "medium":
          // Return most results but limit potentially risky ones
          return pageResults.slice(0, 8);
        case "low":
          // Return all results
          return pageResults;
        default:
          return pageResults;
      }
    }
    
    return pageResults;
  }, [firewallSettings]);

  const search = useCallback(async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setCurrentPage(1);
    
    // Add to search history if not already present
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev].slice(0, 20));
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const searchResults = generateResultsForPage(searchQuery, 1);
      setResults(searchResults);
      setHasMoreResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setHasMoreResults(false);
      toast({
        title: "Search failed",
        description: "There was an error processing your search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory, generateResultsForPage]);

  // Function for infinite scrolling / pagination
  const infiniteSearch = useCallback(async (page: number): Promise<void> => {
    if (page <= currentPage || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay (shorter for subsequent pages)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newResults = generateResultsForPage(query, page);
      
      // Check if we've reached the end (for demo purposes, let's say max 5 pages)
      if (page >= 5 || newResults.length === 0) {
        setHasMoreResults(false);
      }
      
      setResults(prev => [...prev, ...newResults]);
      setCurrentPage(page);
    } catch (error) {
      console.error("Infinite search failed:", error);
      toast({
        title: "Error loading more results",
        description: "Failed to load additional search results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLoading, query, generateResultsForPage]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
    toast({
      title: "Search history cleared",
      description: "Your search history has been cleared successfully."
    });
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        results,
        isLoading,
        setQuery,
        search,
        searchHistory,
        clearHistory,
        infiniteSearch,
        hasMoreResults,
        currentPage
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
