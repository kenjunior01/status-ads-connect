import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  LayoutDashboard, 
  Target, 
  Star,
  Menu,
  LogIn,
  UserPlus,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/LanguageSelector";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navigation = ({ onNavigate, currentPage }: NavigationProps) => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      title: t('navigation.home'),
      icon: Home,
      page: "index",
      description: t('navigation.home')
    },
    {
      title: t('navigation.explore'),
      icon: Search,
      page: "creators",
      description: t('navigation.explore')
    },
    {
      title: t('navigation.creators'),
      icon: Star,
      page: "creator-dashboard", 
      description: t('navigation.creators')
    },
    {
      title: t('navigation.advertisers'),
      icon: Target,
      page: "advertiser-dashboard",
      description: t('navigation.advertisers')
    }
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigation("index")}
          >
            <div className="bg-gradient-primary p-2 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                StatusAds
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Simplified */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <Button
                  key={item.page}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  onClick={() => handleNavigation(item.page)}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              );
            })}
          </div>

          {/* Auth Buttons & Language */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" size="sm" onClick={() => onNavigate('auth')}>
              <LogIn className="h-4 w-4 mr-2" />
              {t('navigation.login')}
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => onNavigate('auth')}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('navigation.register')}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col space-y-2 mt-8">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.page}
                        variant={currentPage === item.page ? "default" : "ghost"}
                        className="justify-start h-12"
                        onClick={() => handleNavigation(item.page)}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{item.title}</div>
                        </div>
                      </Button>
                    );
                  })}
                  
                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation('auth')}>
                      <LogIn className="h-4 w-4 mr-2" />
                      {t('navigation.login')}
                    </Button>
                    <Button className="w-full justify-start bg-gradient-primary" onClick={() => handleNavigation('auth')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('navigation.register')}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
