
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-light text-gray-400">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Page not found</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We couldn't find the page you're looking for.
        </p>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              Return to Home
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full">
              Try a New Search
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
