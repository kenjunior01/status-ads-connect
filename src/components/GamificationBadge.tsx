import { cn } from "@/lib/utils";
import { getRankFromXP, calculateXP, RANKS, type CreatorRank } from "@/lib/gamification";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GamificationBadgeProps {
  badgeLevel?: string;
  xp?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "text-[9px] px-1 py-0 gap-0.5",
  sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
  md: "text-xs px-2 py-1 gap-1",
  lg: "text-sm px-3 py-1.5 gap-1.5",
};

const iconSizeMap = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const rankStyleMap: Record<CreatorRank, string> = {
  bronze: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  silver: "bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30",
  gold: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  platinum: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  diamond: "bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/30",
};

export const GamificationBadge = ({
  badgeLevel,
  xp,
  size = "sm",
  showLabel = true,
  showIcon = true,
  className,
}: GamificationBadgeProps) => {
  // Determine rank from badge_level or XP
  const rank = badgeLevel 
    ? RANKS.find(r => r.rank === badgeLevel) || RANKS[0]
    : xp !== undefined 
      ? getRankFromXP(xp) 
      : RANKS[0];

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        sizeMap[size],
        rankStyleMap[rank.rank],
        className
      )}
    >
      {showIcon && <span className={iconSizeMap[size]}>{rank.icon}</span>}
      {showLabel && <span>{rank.label}</span>}
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="font-semibold">{rank.icon} Nível {rank.label}</p>
        <p className="text-xs text-muted-foreground">Comissão: {rank.commissionRate}%</p>
      </TooltipContent>
    </Tooltip>
  );
};
