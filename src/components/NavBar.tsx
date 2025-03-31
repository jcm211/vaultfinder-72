
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, LogOut, Settings, User, ChevronDown } from "lucide-react";

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine if we should show the admin login button
  // Only show login button if not authenticated (public users)
  const showLoginButton = !isAuthenticated;

  return (
    <header className="w-full py-4 px-6 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Shield className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
            Lumina Search
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-sm">
                    {user?.username}
                    {user?.role === "ceo" && " (CEO)"}
                    {user?.role === "admin" && " (Admin)"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 py-2 animate-scale-in">
                {(user?.role === "admin" || user?.role === "ceo") && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/admin/firewall");
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Firewall Config
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : showLoginButton ? (
            <Button 
              variant="ghost" 
              className="rounded-full px-4 py-2 text-primary hover:bg-primary/5"
              onClick={() => navigate("/login")}
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
