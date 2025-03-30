
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useSecurity } from "@/context/SecurityContext";

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
  date?: string;
  source?: "google" | "bing" | "duckduckgo";
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
  searchEngines: {
    google: boolean;
    bing: boolean;
    duckduckgo: boolean;
  };
  toggleSearchEngine: (engine: "google" | "bing" | "duckduckgo") => void;
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
  const [searchEngines, setSearchEngines] = useState({
    google: true,
    bing: true,
    duckduckgo: true
  });
  
  const { isContentSafe, isUrlSafe } = useSecurity();

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
      localStorage.setItem("firewallSettings", JSON.stringify(firewallSettings));
    }
    
    // Load saved search engine preferences
    const savedSearchEngines = localStorage.getItem("searchEngines");
    if (savedSearchEngines) {
      try {
        setSearchEngines(JSON.parse(savedSearchEngines));
      } catch (error) {
        console.error("Failed to parse search engines:", error);
      }
    } else {
      localStorage.setItem("searchEngines", JSON.stringify(searchEngines));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);
  
  useEffect(() => {
    localStorage.setItem("searchEngines", JSON.stringify(searchEngines));
  }, [searchEngines]);

  const toggleSearchEngine = useCallback((engine: "google" | "bing" | "duckduckgo") => {
    setSearchEngines(prev => {
      // Ensure at least one engine is enabled
      const wouldAllBeDisabled = Object.entries(prev)
        .filter(([key]) => key !== engine)
        .every(([_, value]) => !value);
      
      if (prev[engine] && wouldAllBeDisabled) {
        toast({
          title: "Action not allowed",
          description: "At least one search engine must remain enabled.",
          variant: "destructive"
        });
        return prev;
      }
      
      const newState = { ...prev, [engine]: !prev[engine] };
      localStorage.setItem("searchEngines", JSON.stringify(newState));
      return newState;
    });
  }, []);

  const generateResultsForPage = useCallback(async (searchQuery: string, page: number, sourceEngine: "google" | "bing" | "duckduckgo"): Promise<SearchResult[]> => {
    const isQuerySafe = await isContentSafe(searchQuery);
    
    if (!isQuerySafe) {
      toast({
        title: "Security Alert",
        description: "This search query was blocked by the malware protection system.",
        variant: "destructive"
      });
      return [];
    }
    
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
    
    // Different seed for each search engine to ensure variety
    let pageSeed = (searchQuery.length * 7 + page * 13) % 100;
    
    if (sourceEngine === "bing") pageSeed = (pageSeed + 33) % 100;
    if (sourceEngine === "duckduckgo") pageSeed = (pageSeed + 66) % 100;
    
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
    
    const pageResults: SearchResult[] = [];
    const pageOffset = (page - 1) * 10;
    
    for (let i = 0; i < 10; i++) {
      const resultId = pageOffset + i + 1;
      const domainIndex = (pageSeed + i) % domains.length;
      const domain = domains[domainIndex];
      
      const url = `https://www.${domain}/search/${searchQuery.toLowerCase().replace(/\s+/g, '-')}/${resultId}`;
      
      const isUrlSecure = await isUrlSafe(url);
      if (!isUrlSecure) continue;
      
      let titlePrefix = "";
      let descPrefix = "";
      
      // Different prefixes for different engines to make results distinguishable
      if (sourceEngine === "google") {
        titlePrefix = page > 1 ? "Google: " : "";
      } else if (sourceEngine === "bing") {
        titlePrefix = page > 1 ? "Bing: " : "";
      } else {
        titlePrefix = page > 1 ? "DuckDuckGo: " : "";
      }
      
      if (page > 1) {
        const prefixes = ["Advanced", "Detailed", "Complete", "Professional", "Expert"];
        titlePrefix += prefixes[(pageSeed + i) % prefixes.length] + " ";
        
        const descPrefixes = [
          "In-depth analysis of ",
          "Comprehensive guide to ",
          "Detailed explanation about ",
          "Expert insights on ",
          "Advanced information regarding "
        ];
        descPrefix = descPrefixes[(pageSeed + i + page) % descPrefixes.length];
      }
      
      const date = new Date();
      date.setDate(date.getDate() - ((pageSeed + resultId) % 30));
      const dateStr = date.toISOString().split('T')[0];
      
      pageResults.push({
        id: `${sourceEngine}-${page}-${resultId}`,
        title: `${titlePrefix}${searchQuery} - Result ${resultId} | ${domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)}`,
        url,
        description: `${descPrefix}${searchQuery}. This is result #${resultId} with specific information tailored to your search query. Learn more about ${searchQuery} and related topics.`,
        favicon: `https://www.${domain.split(".")[0]}.${domain.split(".")[1]}/favicon.ico`,
        date: dateStr,
        source: sourceEngine
      });
    }
    
    switch (firewallSettings.securityLevel) {
      case "high":
        return pageResults.filter(result => 
          firewallSettings.allowedDomains.some(domain => {
            const domainPattern = domain.replace("*.", "");
            return result.url.includes(domainPattern);
          })
        );
      case "medium":
        return pageResults.slice(0, 8);
      case "low":
        return pageResults;
      default:
        return pageResults;
    }
  }, [firewallSettings, isContentSafe, isUrlSafe]);

  const search = useCallback(async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setCurrentPage(1);
    
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev].slice(0, 20));
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const allResults: SearchResult[] = [];
      
      // Search with all enabled engines
      const searchPromises: Promise<SearchResult[]>[] = [];
      
      if (searchEngines.google) {
        searchPromises.push(generateResultsForPage(searchQuery, 1, "google"));
      }
      
      if (searchEngines.bing) {
        searchPromises.push(generateResultsForPage(searchQuery, 1, "bing"));
      }
      
      if (searchEngines.duckduckgo) {
        searchPromises.push(generateResultsForPage(searchQuery, 1, "duckduckgo"));
      }
      
      const resultsFromAllEngines = await Promise.all(searchPromises);
      
      // Combine and interleave results from all engines
      resultsFromAllEngines.forEach(engineResults => {
        allResults.push(...engineResults);
      });
      
      // Sort results - this can be customized based on preferences
      const sortedResults = allResults.sort((a, b) => {
        // First sort by "relevance" which we'll simulate by adding a small random factor
        const randomFactor = Math.random() * 0.2 - 0.1; // ±10% randomness
        return randomFactor;
      });
      
      setResults(sortedResults);
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
  }, [searchHistory, searchEngines, generateResultsForPage]);

  const infiniteSearch = useCallback(async (page: number): Promise<void> => {
    if (page <= currentPage || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allNewResults: SearchResult[] = [];
      const searchPromises: Promise<SearchResult[]>[] = [];
      
      // Get more results from all enabled engines
      if (searchEngines.google) {
        searchPromises.push(generateResultsForPage(query, page, "google"));
      }
      
      if (searchEngines.bing) {
        searchPromises.push(generateResultsForPage(query, page, "bing"));
      }
      
      if (searchEngines.duckduckgo) {
        searchPromises.push(generateResultsForPage(query, page, "duckduckgo"));
      }
      
      const resultsFromAllEngines = await Promise.all(searchPromises);
      
      resultsFromAllEngines.forEach(engineResults => {
        allNewResults.push(...engineResults);
      });
      
      if (page >= 5 || allNewResults.length === 0) {
        setHasMoreResults(false);
      }
      
      // Sort and add the new results
      const sortedNewResults = allNewResults.sort(() => Math.random() - 0.5);
      setResults(prev => [...prev, ...sortedNewResults]);
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
  }, [currentPage, isLoading, query, searchEngines, generateResultsForPage]);

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
        currentPage,
        searchEngines,
        toggleSearchEngine
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
