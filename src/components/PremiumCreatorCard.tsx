import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GamificationBadge } from "@/components/GamificationBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Star, Verified, Eye, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  display_name: string;
  niche: string | null;
  price_range: string | null;
  rating: number;
  total_reviews: number;
  total_campaigns: number;
  is_verified: boolean;
  badge_level: string;
  created_at: string;
}

interface PremiumCreatorCardProps {
  profile: Profile;
  className?: string;
  onSelect?: (profile: Profile) => void;
  variant?: "default" | "featured" | "compact";
  showFavoriteButton?: boolean;
}

const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-rose-600",
    "from-violet-500 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-600",
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
};

export const PremiumCreatorCard = ({ 
  profile, 
  className, 
  onSelect,
  variant = "default",
  showFavoriteButton = false
}: PremiumCreatorCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { format } = useLocalizationContext();
  const badge = badgeConfig[profile.badge_level as keyof typeof badgeConfig] || badgeConfig.bronze;
  const isNew = Date.now() - new Date(profile.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  const isTopRated = profile.rating >= 4.5 && profile.total_reviews >= 3;

  const getBasePrice = () => {
    if (!profile.price_range) return 50;
    const match = profile.price_range.match(/\d+/);
    return match ? parseInt(match[0]) : 50;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(profile);
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "glass border-border/40 hover:border-primary/30",
        "hover:shadow-glow hover:-translate-y-0.5",
        variant === "featured" && "ring-1 ring-primary/20",
        className
      )}
      onClick={() => onSelect?.(profile)}
    >
      {showFavoriteButton && (
        <div className="absolute top-2 left-2 z-20">
          <FavoriteButton isFavorite={isFavorite(profile.id)} onClick={handleFavoriteClick} size="sm" variant="overlay" />
        </div>
      )}

      {/* Badges top-right */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {isTopRated && (
          <Badge className="bg-warning text-warning-foreground text-[10px] px-1.5 py-0">
            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />Top
          </Badge>
        )}
        {isNew && (
          <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">Novo</Badge>
        )}
      </div>

      {/* Avatar - compact */}
      <div className="p-3 pb-0">
        <div className="relative">
          <div className={cn("w-full aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br", getAvatarGradient(profile.display_name))}>
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white drop-shadow-md">
                {profile.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          {profile.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-medium">
              <Verified className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>

      {/* Content - tighter */}
      <div className="p-3 pt-2 space-y-1.5">
        <div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {profile.display_name}
          </h3>
          {profile.niche && (
            <p className="text-xs text-muted-foreground line-clamp-1">{profile.niche}</p>
          )}
        </div>

        {profile.total_reviews > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-warning fill-warning" />
            <span className="text-xs font-semibold text-foreground">{profile.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({profile.total_reviews})</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Eye className="h-2.5 w-2.5" />
          <span>{profile.total_campaigns} campanhas</span>
        </div>

        <div className="border-t border-border pt-1.5" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">A partir de</p>
            <p className="font-bold text-sm text-foreground">{format(getBasePrice())}</p>
          </div>
          <GamificationBadge badgeLevel={profile.badge_level || 'bronze'} size="xs" />
        </div>

        {/* Hover CTA */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
          <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1.5 rounded-md flex items-center justify-center gap-1">
            <Zap className="h-3 w-3" />
            Ver Perfil
          </div>
        </div>
      </div>
    </Card>
  );
};
