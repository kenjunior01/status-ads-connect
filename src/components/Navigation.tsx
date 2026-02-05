import { useState, useEffect } from "react";
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
import { RegionCurrencySelector } from "@/components/RegionCurrencySelector";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navigation = ({ onNavigate, currentPage }: NavigationProps) => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserRole(session.user.id), 0);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase.rpc('get_user_role', { _user_id: userId });
      setUserRole(data);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('index');
  };

  const getDashboardPage = () => {
    if (userRole === 'admin') return 'admin-dashboard';
    if (userRole === 'advertiser') return 'advertiser-dashboard';
    return 'creator-dashboard';
  };

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
            <RegionCurrencySelector />
            <LanguageSelector />
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => onNavigate(getDashboardPage())}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('auth')}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('navigation.login')}
                </Button>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => onNavigate('auth')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('navigation.register')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <RegionCurrencySelector />
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
                    {user ? (
                      <>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation(getDashboardPage())}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                        <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Sair
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation('auth')}>
                          <LogIn className="h-4 w-4 mr-2" />
                          {t('navigation.login')}
                        </Button>
                        <Button className="w-full justify-start bg-gradient-primary" onClick={() => handleNavigation('auth')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t('navigation.register')}
                        </Button>
                      </>
                    )}
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
