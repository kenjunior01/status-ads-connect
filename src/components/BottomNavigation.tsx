import { useTranslation } from "react-i18next";
import { Home, LayoutGrid, MessageCircle, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface BottomNavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const navItems = [
  { key: "index", icon: Home, labelKey: "navigation.home" },
  { key: "dashboard", icon: LayoutGrid, labelKey: "navigation.dashboard" },
  { key: "messages", icon: MessageCircle, labelKey: "navigation.messages" },
  { key: "profile", icon: CircleUser, labelKey: "navigation.profile" },
];

export const BottomNavigation = ({ onNavigate, currentPage }: BottomNavigationProps) => {
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.rpc('get_user_role', { _user_id: session.user.id }).then(({ data }) => setUserRole(data));
      }
    });
  }, []);

  const getDashboardPage = () => {
    if (userRole === 'admin') return 'admin-dashboard';
    if (userRole === 'advertiser') return 'advertiser-dashboard';
    return 'creator-dashboard';
  };

  const resolveNavPage = (key: string) => {
    if (key === 'dashboard') return user ? getDashboardPage() : 'auth';
    if (key === 'messages') return user ? getDashboardPage() : 'auth';
    if (key === 'profile') return user ? getDashboardPage() : 'auth';
    return key;
  };

  const isActive = (key: string) => {
    if (key === 'index') return currentPage === 'index';
    if (key === 'dashboard') return currentPage.includes('dashboard');
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/30 bg-background/95 backdrop-blur-lg">
      <div className="flex items-center justify-around h-14 px-1 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.key);
          const label = t(item.labelKey) || item.key;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(resolveNavPage(item.key))}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -inset-2 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10", active && "text-primary")} strokeWidth={active ? 2.5 : 1.5} />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-tight",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
