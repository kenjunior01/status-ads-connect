import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Filter,
  X,
  Star,
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  Clock,
  RotateCcw,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  priceRange: number[];
  niches: string[];
  minRating: number;
  minCampaigns: number;
  minResponseRate: number;
  onlineOnly: boolean;
  verifiedOnly: boolean;
  badgeLevels: string[];
}

interface AdvancedFiltersSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  className?: string;
  isMobile?: boolean;
}

const niches = [
  { value: "lifestyle", label: "Lifestyle", icon: "✨" },
  { value: "fitness", label: "Fitness & Saúde", icon: "💪" },
  { value: "tech", label: "Tecnologia", icon: "📱" },
  { value: "beauty", label: "Beleza & Moda", icon: "💄" },
  { value: "food", label: "Culinária", icon: "🍳" },
  { value: "travel", label: "Viagem", icon: "✈️" },
  { value: "gaming", label: "Games", icon: "🎮" },
  { value: "education", label: "Educação", icon: "📚" },
  { value: "business", label: "Negócios", icon: "💼" },
  { value: "design", label: "Arte & Design", icon: "🎨" },
];

const badgeLevels = [
  { value: "bronze", label: "Novo Talento", color: "bg-amber-600" },
  { value: "silver", label: "Em Crescimento", color: "bg-slate-400" },
  { value: "gold", label: "Top Performer", color: "bg-amber-400" },
  { value: "platinum", label: "Elite", color: "bg-purple-500" },
];

const FilterContent = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: Omit<AdvancedFiltersSidebarProps, 'className' | 'isMobile'>) => {
  const activeFiltersCount = 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ? 1 : 0) +
    filters.niches.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minCampaigns > 0 ? 1 : 0) +
    (filters.minResponseRate > 0 ? 1 : 0) +
    (filters.onlineOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    filters.badgeLevels.length;

  const toggleNiche = (niche: string) => {
    const newNiches = filters.niches.includes(niche)
      ? filters.niches.filter(n => n !== niche)
      : [...filters.niches, niche];
    onFiltersChange({ ...filters, niches: newNiches });
  };

  const toggleBadgeLevel = (level: string) => {
    const newLevels = filters.badgeLevels.includes(level)
      ? filters.badgeLevels.filter(l => l !== level)
      : [...filters.badgeLevels, level];
    onFiltersChange({ ...filters, badgeLevels: newLevels });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Filters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Filtros Rápidos
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm">Online agora</span>
                </Label>
                <Switch
                  id="online"
                  checked={filters.onlineOnly}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, onlineOnly: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="verified" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Apenas verificados</span>
                </Label>
                <Switch
                  id="verified"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, verifiedOnly: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Faixa de Preço
            </h4>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, priceRange: value })
                }
                max={500}
                min={0}
                step={10}
                className="mb-3"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">R$ {filters.priceRange[0]}</span>
                <span className="text-muted-foreground">R$ {filters.priceRange[1]}+</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Niches */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Nichos
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {niches.map((niche) => (
                <button
                  key={niche.value}
                  onClick={() => toggleNiche(niche.value)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all",
                    "border hover:border-primary/50",
                    filters.niches.includes(niche.value)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border text-muted-foreground"
                  )}
                >
                  <span>{niche.icon}</span>
                  <span className="truncate">{niche.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Rating */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              Avaliação Mínima
            </h4>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFiltersChange({ ...filters, minRating: rating })}
                  className={cn(
                    "flex-1 p-2 rounded-lg text-sm font-medium transition-all border",
                    filters.minRating === rating
                      ? "bg-warning/10 border-warning text-warning"
                      : "bg-card border-border text-muted-foreground hover:border-warning/50"
                  )}
                >
                  {rating === 0 ? "Todas" : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Engagement Metrics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Métricas de Engajamento
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Campanhas Concluídas
                  </Label>
                  <span className="text-sm font-medium text-foreground">
                    {filters.minCampaigns}+
                  </span>
                </div>
                <Slider
                  value={[filters.minCampaigns]}
                  onValueChange={([value]) => 
                    onFiltersChange({ ...filters, minCampaigns: value })
                  }
                  max={50}
                  min={0}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Taxa de Resposta
                  </Label>
                  <span className="text-sm font-medium text-foreground">
                    {filters.minResponseRate}%+
                  </span>
                </div>
                <Slider
                  value={[filters.minResponseRate]}
                  onValueChange={([value]) => 
                    onFiltersChange({ ...filters, minResponseRate: value })
                  }
                  max={100}
                  min={0}
                  step={10}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Badge Level */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Nível do Criador
            </h4>
            <div className="space-y-2">
              {badgeLevels.map((level) => (
                <div
                  key={level.value}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={level.value}
                    checked={filters.badgeLevels.includes(level.value)}
                    onCheckedChange={() => toggleBadgeLevel(level.value)}
                  />
                  <Label
                    htmlFor={level.value}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <div className={cn("w-3 h-3 rounded-full", level.color)} />
                    {level.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button 
          className="w-full gap-2" 
          onClick={() => {}}
        >
          <Filter className="h-4 w-4" />
          Aplicar Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary-foreground/20">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};

// Desktop Sidebar
export const AdvancedFiltersSidebar = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}: AdvancedFiltersSidebarProps) => {
  return (
    <div className={cn(
      "hidden lg:block w-72 bg-card rounded-xl border border-border h-fit sticky top-24",
      className
    )}>
      <FilterContent 
        filters={filters} 
        onFiltersChange={onFiltersChange} 
        onClearFilters={onClearFilters}
      />
    </div>
  );
};

// Mobile Sheet
export const MobileFiltersSheet = ({
  filters,
  onFiltersChange,
  onClearFilters,
  children
}: AdvancedFiltersSidebarProps & { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  
  const activeFiltersCount = 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ? 1 : 0) +
    filters.niches.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minCampaigns > 0 ? 1 : 0) +
    (filters.minResponseRate > 0 ? 1 : 0) +
    (filters.onlineOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    filters.badgeLevels.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <FilterContent 
          filters={filters} 
          onFiltersChange={onFiltersChange} 
          onClearFilters={onClearFilters}
        />
      </SheetContent>
    </Sheet>
  );
};
