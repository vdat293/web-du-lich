import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { wishlistService } from '../api/services';
import { removeStoredValue } from '../storage';
import { useAuth } from './AuthContext';

type FavoritesContextValue = {
  favoriteIds: number[];
  toggleFavorite: (id: number) => Promise<void>;
  isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    void removeStoredValue('aoklevart_favorites');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setFavoriteIds([]);
      return;
    }

    let active = true;
    void wishlistService.listIds()
      .then((ids) => {
        if (active) setFavoriteIds(ids);
      })
      .catch(() => {
        if (active) setFavoriteIds([]);
      });

    return () => {
      active = false;
    };
  }, [authLoading, token]);

  const toggleFavorite = useCallback(async (id: number) => {
    if (!token) return;

    const wasFavorite = favoriteIds.includes(id);
    setFavoriteIds((current) => (
      wasFavorite ? current.filter((item) => item !== id) : [...current, id]
    ));

    try {
      if (wasFavorite) await wishlistService.remove(id);
      else await wishlistService.add(id);
    } catch {
      setFavoriteIds((current) => (
        wasFavorite
          ? (current.includes(id) ? current : [...current, id])
          : current.filter((item) => item !== id)
      ));
    }
  }, [favoriteIds, token]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite,
    }),
    [favoriteIds, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider');
  return value;
}
