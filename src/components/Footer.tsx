
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-8 px-6 bg-white/80 backdrop-blur-lg border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-800">
              Lumina Search
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/admin" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Admin
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Terms
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Lumina Search. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
