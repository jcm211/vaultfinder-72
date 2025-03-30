
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";
import NavBar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchMap from "@/components/SearchMap";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Results = () => {
  const { search, query, setQuery } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q");
  const tabParam = searchParams.get("tab") || "results";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (queryParam && queryParam !== query) {
      setQuery(queryParam);
      search(queryParam);
    }
  }, [queryParam, search, query, setQuery]);

  // Update the URL when tab changes
  useEffect(() => {
    if (activeTab !== tabParam) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", activeTab);
        return newParams;
      });
    }
  }, [activeTab, setSearchParams, tabParam]);

  // Handle back button navigation
  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      
      <div className="border-b border-gray-100 py-4 px-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToHome}
            className="hidden md:flex"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <SearchBar size="md" />
          </div>
        </div>
      </div>
      
      <main className="flex-1 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-gray-50">
                <TabsTrigger value="results" className="data-[state=active]:bg-white flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>Results</span>
                </TabsTrigger>
                <TabsTrigger value="maps" className="data-[state=active]:bg-white flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  <span>Maps</span>
                </TabsTrigger>
              </TabsList>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">Filter Results</span>
              </Button>
            </div>
            
            <TabsContent value="results" className="mt-0 animate-in fade-in-50 duration-300">
              <SearchResults />
            </TabsContent>
            
            <TabsContent value="maps" className="mt-0 animate-in fade-in-50 duration-300">
              <SearchMap query={query} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
