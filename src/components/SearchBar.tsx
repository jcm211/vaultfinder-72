
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, History, ArrowRight } from "lucide-react";

interface SearchBarProps {
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  showHistory?: boolean;
}

const SearchBar = ({ size = "lg", autoFocus = false, showHistory = true }: SearchBarProps) => {
  const { query, setQuery, search, searchHistory } = useSearch();
  const [inputValue, setInputValue] = useState(query);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Set up autofocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Handle clicks outside of history dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current && 
        !historyRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setQuery(inputValue);
    search(inputValue);
    setIsHistoryOpen(false);
    
    // Navigate to results page if we're on the home page
    if (window.location.pathname === "/") {
      navigate(`/results?q=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleHistoryItemClick = (item: string) => {
    setInputValue(item);
    setQuery(item);
    search(item);
    setIsHistoryOpen(false);
    
    // Navigate to results page if we're on the home page
    if (window.location.pathname === "/") {
      navigate(`/results?q=${encodeURIComponent(item)}`);
    }
  };

  const clearInput = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: "max-w-md h-10",
    md: "max-w-xl h-12", 
    lg: "max-w-2xl h-14"
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className={`relative w-full ${sizeClasses[size]}`}>
        <div className={`
          relative flex items-center w-full rounded-full 
          bg-white border border-gray-200 shadow-sm overflow-hidden
          transition-all duration-300 ease-in-out
          ${isFocused ? "ring-2 ring-primary/30" : ""}
        `}>
          <div className="pl-4">
            <Search 
              className={`
                h-5 w-5 text-gray-400 transition-colors duration-300
                ${isFocused ? "text-primary" : ""}
              `}
            />
          </div>
          
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search the web..."
            className={`
              flex-1 py-2 px-4 bg-transparent border-none focus:outline-none focus:ring-0
              text-gray-900 placeholder:text-gray-400
              transition-all duration-300 ease-in-out
              ${size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-sm"}
            `}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (showHistory && searchHistory.length > 0) {
                setIsHistoryOpen(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
          />
          
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="flex items-center justify-center h-8 w-8 mr-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          <Button 
            type="submit" 
            className={`
              m-1 rounded-full bg-primary text-white hover:bg-primary/90
              transition-all duration-200 ease-in-out transform active:scale-95
              ${size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-8 w-8"}
            `}
          >
            <ArrowRight className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
          </Button>
        </div>
      </form>

      {/* Search history dropdown */}
      {showHistory && isHistoryOpen && searchHistory.length > 0 && (
        <div 
          ref={historyRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden animate-fade-in"
        >
          <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <History className="h-4 w-4 mr-2" />
              Search History
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsHistoryOpen(false)}
              className="h-7 w-7 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {searchHistory.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleHistoryItemClick(item)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 flex items-center"
                >
                  <History className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="truncate">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
