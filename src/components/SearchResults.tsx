
import { useEffect, useRef, useCallback } from "react";
import { useSearch, SearchResult } from "@/context/SearchContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchResults = () => {
  const { results, isLoading, query, infiniteSearch, hasMoreResults, currentPage } = useSearch();
  const resultsRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef<HTMLDivElement>(null);

  // Handle infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoading && hasMoreResults) {
      infiniteSearch(currentPage + 1);
    }
  }, [infiniteSearch, currentPage, isLoading, hasMoreResults]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    });
    
    if (loadingMoreRef.current) {
      observer.observe(loadingMoreRef.current);
    }
    
    return () => {
      if (loadingMoreRef.current) {
        observer.unobserve(loadingMoreRef.current);
      }
    };
  }, [handleObserver, results.length]);

  useEffect(() => {
    // Scroll to top when new search is performed
    if (resultsRef.current && results.length === 0) {
      resultsRef.current.scrollTop = 0;
    }
  }, [query]);

  // Loading state for initial search
  if (isLoading && results.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto py-4 animate-fade-in">
        <div className="mb-6">
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-7 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-7 w-4/5 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8 text-center animate-fade-in">
        <div className="rounded-full bg-gray-100 h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <Globe className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-500">
          We couldn't find any results for "{query}". Please try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div ref={resultsRef} className="w-full max-w-3xl mx-auto">
      <p className="text-sm text-gray-500 mb-4">
        {results.length} results for "{query}"
      </p>
      
      <div className="space-y-6">
        {results.map((result) => (
          <ResultItem key={result.id} result={result} />
        ))}
      </div>
      
      {/* Load more section */}
      {results.length > 0 && (
        <div 
          ref={loadingMoreRef} 
          className="py-8 text-center"
        >
          {isLoading && (
            <div className="flex flex-col items-center">
              <Skeleton className="h-10 w-32 rounded-full mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          )}
          
          {!isLoading && hasMoreResults && (
            <Button 
              variant="outline" 
              onClick={() => infiniteSearch(currentPage + 1)}
              className="flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              <span>Load more results</span>
            </Button>
          )}
          
          {!isLoading && !hasMoreResults && results.length > 0 && (
            <p className="text-sm text-gray-500">
              End of results for "{query}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ResultItem = ({ result }: { result: SearchResult }) => {
  return (
    <div className="group animate-fade-in">
      <div className="flex items-start">
        {result.favicon ? (
          <img 
            src={result.favicon} 
            alt="Favicon" 
            className="h-5 w-5 mr-3 mt-1"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='2' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3E%3C/path%3E%3C/svg%3E";
            }}
          />
        ) : (
          <Globe className="h-5 w-5 mr-3 mt-1 text-gray-400" />
        )}
        
        <div className="flex-1">
          <a 
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-lg font-medium text-primary group-hover:underline mb-1">
              {result.title}
            </h3>
            
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <span className="truncate">{result.url}</span>
              {result.date && (
                <>
                  <span className="mx-2">•</span>
                  <span>{result.date}</span>
                </>
              )}
            </div>
            
            <p className="text-gray-700 text-sm">
              {result.description}
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
