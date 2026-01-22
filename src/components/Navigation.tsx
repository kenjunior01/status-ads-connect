import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  Home, 
  LayoutDashboard, 
  Target, 
  Users, 
  Star,
  Menu,
  X,
  LogIn,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navigation = ({ onNavigate, currentPage }: NavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      title: "Início",
      icon: Home,
      page: "index",
      description: "Página inicial da plataforma"
    },
    {
      title: "Sou Criador",
      icon: Star,
      page: "creator-dashboard", 
      description: "Monetize seus status"
    },
    {
      title: "Sou Anunciante",
      icon: Target,
      page: "advertiser-dashboard",
      description: "Anuncie com criadores"
    },
    {
      title: "Explorar",
      icon: Users,
      page: "creators",
      description: "Descubra talentos"
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
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                StatusAds
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Conectando marcas e criadores
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavigationMenuItem key={item.page}>
                      <NavigationMenuTrigger
                        className={cn(
                          "bg-transparent hover:bg-accent data-[state=open]:bg-accent",
                          currentPage === item.page && "bg-accent"
                        )}
                        onClick={() => handleNavigation(item.page)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="p-4 w-64">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">{item.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('auth')}>
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90" onClick={() => onNavigate('auth')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
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
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
                
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation('auth')}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                  <Button className="w-full justify-start bg-gradient-primary" onClick={() => handleNavigation('auth')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};