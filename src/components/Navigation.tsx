import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Menu,
  LogIn,
  UserPlus,
  LogOut,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
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
      if (session?.user) fetchUserRole(session.user.id);
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

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigation("index")}
          >
            <div className="bg-gradient-primary p-1.5 rounded-lg">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              StatusAds
            </span>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <ThemeToggle />
            {user ? (
              <>
                <Button 
                  variant={currentPage.includes('dashboard') ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleNavigation(getDashboardPage())}
                  className="gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                  {t('navigation.logout') || 'Sair'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleNavigation('auth')} className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  {t('navigation.login')}
                </Button>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90 gap-1.5" onClick={() => handleNavigation('auth')}>
                  <UserPlus className="h-4 w-4" />
                  {t('navigation.register')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[260px]">
                <div className="flex flex-col space-y-2 mt-8">
                  <div className="pb-4 border-b space-y-2">
                    {user ? (
                      <>
                        <Button variant="default" className="w-full justify-start" onClick={() => handleNavigation(getDashboardPage())}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('navigation.logout') || 'Sair'}
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
