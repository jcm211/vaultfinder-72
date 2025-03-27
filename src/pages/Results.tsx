
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";
import NavBar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import Footer from "@/components/Footer";

const Results = () => {
  const { search, query, setQuery } = useSearch();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q");

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
          <SearchResults />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
