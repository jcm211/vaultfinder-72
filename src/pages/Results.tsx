
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";
import NavBar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchMap from "@/components/SearchMap";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List } from "lucide-react";

const Results = () => {
  const { search, query, setQuery } = useSearch();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q");
  const [activeTab, setActiveTab] = useState("results");

  useEffect(() => {
    if (queryParam && queryParam !== query) {
      setQuery(queryParam);
      search(queryParam);
    }
  }, [queryParam, search, query, setQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      
      <div className="border-b border-gray-100 py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SearchBar size="md" />
        </div>
      </div>
      
      <main className="flex-1 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-gray-50">
              <TabsTrigger value="results" className="data-[state=active]:bg-white flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Results</span>
              </TabsTrigger>
              <TabsTrigger value="maps" className="data-[state=active]:bg-white flex items-center gap-2">
                <Map className="h-4 w-4" />
                <span>Maps</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="mt-0">
              <SearchResults />
            </TabsContent>
            
            <TabsContent value="maps" className="mt-0">
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
