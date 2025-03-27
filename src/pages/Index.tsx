
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";
import SearchBar from "@/components/SearchBar";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

const Index = () => {
  const { search } = useSearch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      search(query);
      navigate(`/results?q=${encodeURIComponent(query)}`);
    }
  }, [query, search, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <div className="animate-fade-in flex flex-col items-center max-w-2xl mx-auto text-center">
          <div className="mb-8 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-lg flex items-center justify-center animate-float">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-2 right-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">λ</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">
            Lumina Search
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12">
            Elegant, secure, and minimalist search experience
          </p>
          
          <div className="w-full max-w-2xl animate-slide-up">
            <SearchBar size="lg" autoFocus={true} />
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-center">
            <div className="w-full md:w-48 p-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Secure Search</h3>
              <p className="text-xs text-gray-500">Protected by advanced firewall technology</p>
            </div>
            
            <div className="w-full md:w-48 p-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1">Privacy Focused</h3>
              <p className="text-xs text-gray-500">Your searches remain private and secure</p>
            </div>
            
            <div className="w-full md:w-48 p-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1">Lightning Fast</h3>
              <p className="text-xs text-gray-500">Optimized for speed and efficiency</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
