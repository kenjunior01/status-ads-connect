import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Dumbbell, 
  Laptop, 
  Heart,
  Utensils,
  Plane,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    featured?: number;
    recent?: number;
    trending?: number;
  };
}

const mainTabs = [
  { id: "featured", label: "Em Destaque", icon: Star, color: "text-warning" },
  { id: "recent", label: "Recentes", icon: Clock, color: "text-success" },
  { id: "trending", label: "Em Alta", icon: TrendingUp, color: "text-primary" },
];

const nicheTabs = [
  { id: "lifestyle", label: "Lifestyle", icon: Sparkles },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "tech", label: "Tech", icon: Laptop },
  { id: "beauty", label: "Beleza", icon: Heart },
  { id: "food", label: "Culinária", icon: Utensils },
  { id: "travel", label: "Viagem", icon: Plane },
  { id: "gaming", label: "Games", icon: Gamepad2 },
  { id: "education", label: "Educação", icon: GraduationCap },
  { id: "business", label: "Negócios", icon: Briefcase },
  { id: "design", label: "Design", icon: Palette },
];

export const CategoryTabs = ({ activeTab, onTabChange, counts }: CategoryTabsProps) => {
  return (
    <div className="space-y-4">
      {/* Main Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts?.[tab.id as keyof typeof counts];
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="lg"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                isActive && "shadow-medium"
              )}
            >
              <Icon className={cn("h-4 w-4", !isActive && tab.color)} />
              {tab.label}
              {count !== undefined && count > 0 && (
                <Badge 
                  variant={isActive ? "secondary" : "outline"} 
                  className="ml-1 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Niche Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Nichos:</span>
        {nicheTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Badge
              key={tab.id}
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "cursor-pointer px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
