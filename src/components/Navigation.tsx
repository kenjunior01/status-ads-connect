import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Menu,
  LogIn,
  UserPlus,
  LogOut,
  CircleDot
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
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigation("index")}
          >
            <CircleDot className="h-5 w-5" />
            <span className="font-bold text-base tracking-tight">
              StatusAds
            </span>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            {user ? (
              <>
                <Button 
                  variant="ghost"
                  size="sm" 
                  onClick={() => handleNavigation(getDashboardPage())}
                  className="gap-1.5 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="gap-1.5 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  {t('navigation.logout') || 'Sair'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleNavigation('auth')} 
                  className="gap-1.5 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogIn className="h-4 w-4" />
                  {t('navigation.login')}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground gap-1.5 border-0" 
                  onClick={() => handleNavigation('auth')}
                >
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
                <Button variant="ghost" size="sm" className="px-2 text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px]">
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
                        <Button className="w-full justify-start" onClick={() => handleNavigation('auth')}>
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
