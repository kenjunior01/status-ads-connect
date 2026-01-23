import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FavoriteCreator {
  id: string;
  profile_id: string;
  display_name: string;
  niche: string | null;
  price_range: string | null;
  rating: number;
  is_verified: boolean;
  addedAt: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem('statusads_favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('statusads_favorites', JSON.stringify(favorites));
    }
  }, [favorites, loading]);

  const addFavorite = useCallback((profile: {
    id: string;
    profile_id?: string;
    display_name: string;
    niche: string | null;
    price_range: string | null;
    rating: number;
    is_verified: boolean;
  }) => {
    const exists = favorites.some(f => f.id === profile.id);
    if (exists) {
      toast({
        title: "Já está nos favoritos",
        description: `${profile.display_name} já está na sua lista de favoritos.`,
        variant: "default"
      });
      return false;
    }

    const newFavorite: FavoriteCreator = {
      id: profile.id,
      profile_id: profile.profile_id || profile.id,
      display_name: profile.display_name,
      niche: profile.niche,
      price_range: profile.price_range,
      rating: profile.rating,
      is_verified: profile.is_verified,
      addedAt: new Date().toISOString()
    };

    setFavorites(prev => [...prev, newFavorite]);
    
    toast({
      title: "Adicionado aos favoritos! ❤️",
      description: `${profile.display_name} foi adicionado à sua lista.`,
    });

    return true;
  }, [favorites, toast]);

  const removeFavorite = useCallback((profileId: string) => {
    const profile = favorites.find(f => f.id === profileId);
    setFavorites(prev => prev.filter(f => f.id !== profileId));
    
    if (profile) {
      toast({
        title: "Removido dos favoritos",
        description: `${profile.display_name} foi removido da sua lista.`,
      });
    }
  }, [favorites, toast]);

  const toggleFavorite = useCallback((profile: {
    id: string;
    profile_id?: string;
    display_name: string;
    niche: string | null;
    price_range: string | null;
    rating: number;
    is_verified: boolean;
  }) => {
    const isFavorited = favorites.some(f => f.id === profile.id);
    if (isFavorited) {
      removeFavorite(profile.id);
    } else {
      addFavorite(profile);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((profileId: string) => {
    return favorites.some(f => f.id === profileId);
  }, [favorites]);

  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteCount
  };
};
