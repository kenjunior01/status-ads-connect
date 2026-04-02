// Gamification System - Levels, XP, and Progression

export type CreatorRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface RankConfig {
  rank: CreatorRank;
  label: string;
  labelEn: string;
  labelEs: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  bgGradient: string;
  glowColor: string;
  perks: string[];
  commissionRate: number; // Platform fee percentage
}

export const RANKS: RankConfig[] = [
  {
    rank: 'bronze',
    label: 'Bronze',
    labelEn: 'Bronze',
    labelEs: 'Bronce',
    minXP: 0,
    maxXP: 500,
    icon: '🥉',
    color: 'hsl(30, 60%, 50%)',
    bgGradient: 'from-amber-700/20 to-amber-900/10',
    glowColor: 'shadow-[0_0_15px_hsl(30,60%,50%,0.3)]',
    perks: ['Acesso básico', 'Até 5 campanhas/mês'],
    commissionRate: 20,
  },
  {
    rank: 'silver',
    label: 'Prata',
    labelEn: 'Silver',
    labelEs: 'Plata',
    minXP: 500,
    maxXP: 2000,
    icon: '🥈',
    color: 'hsl(210, 15%, 65%)',
    bgGradient: 'from-slate-400/20 to-slate-600/10',
    glowColor: 'shadow-[0_0_15px_hsl(210,15%,65%,0.3)]',
    perks: ['Badge Prata no perfil', 'Até 15 campanhas/mês', 'Destaque em buscas'],
    commissionRate: 15,
  },
  {
    rank: 'gold',
    label: 'Ouro',
    labelEn: 'Gold',
    labelEs: 'Oro',
    minXP: 2000,
    maxXP: 5000,
    icon: '🥇',
    color: 'hsl(45, 90%, 55%)',
    bgGradient: 'from-yellow-500/20 to-amber-600/10',
    glowColor: 'shadow-[0_0_20px_hsl(45,90%,55%,0.4)]',
    perks: ['Badge Ouro no perfil', 'Campanhas ilimitadas', 'Prioridade no matchmaking', 'Suporte prioritário'],
    commissionRate: 12,
  },
  {
    rank: 'platinum',
    label: 'Platina',
    labelEn: 'Platinum',
    labelEs: 'Platino',
    minXP: 5000,
    maxXP: 15000,
    icon: '💎',
    color: 'hsl(270, 60%, 65%)',
    bgGradient: 'from-purple-500/20 to-violet-700/10',
    glowColor: 'shadow-[0_0_25px_hsl(270,60%,65%,0.4)]',
    perks: ['Badge Platina exclusivo', 'Campanhas premium', 'Analytics avançado', 'Selo de elite', 'Menor comissão'],
    commissionRate: 8,
  },
  {
    rank: 'diamond',
    label: 'Diamante',
    labelEn: 'Diamond',
    labelEs: 'Diamante',
    minXP: 15000,
    maxXP: Infinity,
    icon: '👑',
    color: 'hsl(195, 80%, 60%)',
    bgGradient: 'from-cyan-400/20 to-blue-600/10',
    glowColor: 'shadow-[0_0_30px_hsl(195,80%,60%,0.5)]',
    perks: ['Badge Diamante lendário', 'Acesso VIP total', 'Comissão mínima', 'Convites exclusivos', 'Mentoria de novos criadores'],
    commissionRate: 5,
  },
];

// XP calculation from real profile data
export function calculateXP(profile: {
  total_campaigns?: number;
  total_reviews?: number;
  rating?: number;
  is_verified?: boolean;
  follower_count?: number;
  engagement_rate?: number;
}): number {
  let xp = 0;
  
  // Campaigns completed: 100 XP each
  xp += (profile.total_campaigns || 0) * 100;
  
  // Reviews received: 50 XP each
  xp += (profile.total_reviews || 0) * 50;
  
  // High rating bonus: up to 500 XP
  if ((profile.rating || 0) >= 4.5) xp += 500;
  else if ((profile.rating || 0) >= 4.0) xp += 250;
  else if ((profile.rating || 0) >= 3.5) xp += 100;
  
  // Verification bonus: 200 XP
  if (profile.is_verified) xp += 200;
  
  // Follower bonus
  const followers = profile.follower_count || 0;
  if (followers >= 10000) xp += 1000;
  else if (followers >= 5000) xp += 500;
  else if (followers >= 1000) xp += 200;
  
  // Engagement rate bonus
  const engagement = profile.engagement_rate || 0;
  if (engagement >= 10) xp += 800;
  else if (engagement >= 5) xp += 400;
  else if (engagement >= 2) xp += 150;
  
  return xp;
}

export function getRankFromXP(xp: number): RankConfig {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

export function getProgressToNextRank(xp: number): { current: RankConfig; next: RankConfig | null; progress: number; xpNeeded: number } {
  const current = getRankFromXP(xp);
  const currentIndex = RANKS.findIndex(r => r.rank === current.rank);
  const next = currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;
  
  if (!next) return { current, next: null, progress: 100, xpNeeded: 0 };
  
  const xpInCurrentLevel = xp - current.minXP;
  const xpForLevel = next.minXP - current.minXP;
  const progress = Math.min(100, (xpInCurrentLevel / xpForLevel) * 100);
  const xpNeeded = next.minXP - xp;
  
  return { current, next, progress, xpNeeded };
}
