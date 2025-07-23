import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  MessageCircle, 
  User,
  Menu,
  X,
  Settings,
  Bot,
  LogOut,
  Trophy,
  Heart,
  Award
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    }
  };

  const navItems = [
    { label: "Athletes", path: "/browse", icon: Search },
    { label: "Training", path: "/clubs", icon: Trophy },
    { label: "Challenges", path: "/branded-challenges", icon: Award },
    { label: "Messages", path: "/messages", icon: MessageCircle },
    { label: "Performance", path: "/progress", icon: Trophy },
    { label: "Profile", path: "/profile/setup", icon: User },
  ];

  return (
    <header className="glass-nav sticky top-0 z-50 animate-fade-in border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover-scale transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary hover:shadow-lg transition-all duration-300">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Stride Together
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover-lift min-h-[44px]",
                    isActive 
                      ? 'bg-gradient-primary text-white shadow-primary glass-light' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 glass-button'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/chatbot">
              <Button variant="ghost" size="icon" title="AI Assistant" className="glass-button hover-scale">
                <Bot className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="glass-button hover-scale">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs glass-light border-primary/20 text-primary">
              Beta
            </Badge>
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="glass-button hover-scale">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="glass-button">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm" className="hover-scale">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden glass-button hover-scale"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-white/10 pt-6 animate-slide-down">
            {/* Mobile menu backdrop */}
            <div className="absolute inset-x-0 top-full bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl rounded-b-2xl shadow-2xl" />
            
            <nav className="space-y-3 relative z-10">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover-lift min-h-[52px]",
                      isActive 
                        ? 'bg-gradient-primary text-white shadow-primary glass-light' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5 glass-button',
                      "active-scale"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-white/10 relative z-10">
              <Link to="/chatbot" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start glass-button hover-scale min-h-[44px]">
                  <Bot className="h-4 w-4 mr-3" />
                  AI Assistant
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start glass-button hover-scale min-h-[44px]">
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
              </Link>
              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start glass-button hover-scale min-h-[44px]"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full glass-button min-h-[44px]">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full hover-scale min-h-[44px]">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation glow effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </header>
  );
};

export default Navigation;