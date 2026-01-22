import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

interface HeroSearchProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
}

const popularCategories = [
  { label: "Lifestyle", icon: Sparkles },
  { label: "Fitness", icon: TrendingUp },
  { label: "Tech", icon: Zap },
  { label: "Beleza", icon: Users },
];

export const HeroSearch = ({ onSearch, onCategorySelect }: HeroSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-strong overflow-hidden border-2 border-transparent focus-within:border-primary transition-colors">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Encontre o criador ideal para sua campanha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 pl-12 pr-4 py-6 text-lg bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
          </div>
          <Button 
            onClick={handleSearch}
            size="lg"
            className="m-2 px-8 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
          >
            <Search className="h-5 w-5 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm text-muted-foreground">Populares:</span>
        {popularCategories.map((category) => (
          <Badge
            key={category.label}
            variant="secondary"
            className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
            onClick={() => onCategorySelect?.(category.label)}
          >
            <category.icon className="h-3 w-3" />
            {category.label}
          </Badge>
        ))}
      </div>

      {/* Stats Pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm font-medium">2.5k+ criadores online</span>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Resposta em menos de 1h</span>
        </div>
      </div>
    </div>
  );
};
