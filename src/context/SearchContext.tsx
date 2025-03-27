
import React, { createContext, useContext, useState, useEffect } from "react";

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

  const mockSearchResults = (query: string): SearchResult[] => {
    // Filter out blocked words if firewall is enabled
    if (firewallSettings.enabled) {
      const isBlocked = firewallSettings.blockWords.some(word => 
        query.toLowerCase().includes(word.toLowerCase())
      );
      
      if (isBlocked) {
        return [];
      }
    }
    
    // Mock results based on query
    const baseResults = [
      {
        id: "1",
        title: `${query} - Official Website`,
        url: `https://www.${query.toLowerCase().replace(/\s+/g, '')}.com`,
        description: `The official website for ${query}. Find all the information about ${query} and related topics.`,
        favicon: "https://www.google.com/favicon.ico",
        date: "2023-10-05",
      },
      {
        id: "2",
        title: `${query} Encyclopedia - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${query.toLowerCase().replace(/\s+/g, '_')}`,
        description: `${query} is a term referring to various concepts across different fields. Learn more about the history and applications of ${query}.`,
        favicon: "https://en.wikipedia.org/favicon.ico",
        date: "2023-09-21",
      },
      {
        id: "3",
        title: `Latest News about ${query} - News Portal`,
        url: `https://news.example.com/topics/${query.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Stay updated with the latest news and developments related to ${query}. Our comprehensive coverage includes analysis and expert opinions.`,
        favicon: "https://news.example.com/favicon.ico",
        date: "2023-10-12",
      },
      {
        id: "4",
        title: `${query} Forum - Discuss and Share`,
        url: `https://forum.${query.toLowerCase().replace(/\s+/g, '')}.org`,
        description: `Join the community discussion about ${query}. Share your experiences, ask questions, and connect with experts and enthusiasts.`,
        favicon: "https://forum.example.org/favicon.ico",
        date: "2023-10-01",
      },
      {
        id: "5",
        title: `Buy ${query} Products Online`,
        url: `https://shop.example.com/products/${query.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Browse our selection of ${query} products. Find the best deals and exclusive offers on all ${query}-related items.`,
        favicon: "https://shop.example.com/favicon.ico",
        date: "2023-10-08",
      },
      {
        id: "6",
        title: `${query} Research Papers - Academic Database`,
        url: `https://academic.example.edu/research/${query.toLowerCase().replace(/\s+/g, '+')}`,
        description: `Access academic research papers and studies about ${query}. Our database includes peer-reviewed articles from reputable journals.`,
        favicon: "https://academic.example.edu/favicon.ico",
        date: "2023-09-15",
      },
      {
        id: "7",
        title: `Learn about ${query} - Educational Platform`,
        url: `https://learn.example.org/courses/${query.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Comprehensive courses and tutorials about ${query}. Perfect for beginners and advanced learners interested in mastering ${query}.`,
        favicon: "https://learn.example.org/favicon.ico",
        date: "2023-09-30",
      },
    ];
    
    // Apply security filtering based on security level
    if (firewallSettings.enabled) {
      switch (firewallSettings.securityLevel) {
        case "high":
          // Only return results from explicitly allowed domains
          return baseResults.filter(result => 
            firewallSettings.allowedDomains.some(domain => {
              const domainPattern = domain.replace("*.", "");
              return result.url.includes(domainPattern);
            })
          ).slice(0, 5);
        case "medium":
          // Return most results but limit potentially risky ones
          return baseResults.slice(0, 6);
        case "low":
          // Return all results
          return baseResults;
        default:
          return baseResults;
      }
    }
    
    return baseResults;
  };

  const search = async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    // Add to search history if not already present
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev].slice(0, 20));
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const searchResults = mockSearchResults(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

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
