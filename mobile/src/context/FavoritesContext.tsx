import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getStoredValue, setStoredValue } from '../storage';

type FavoritesContextValue = {
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    void getStoredValue('aoklevart_favorites').then((stored) => {
      if (stored) setFavoriteIds(JSON.parse(stored) as number[]);
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite: (id) => {
        setFavoriteIds((current) => {
          const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id];
          void setStoredValue('aoklevart_favorites', JSON.stringify(next));
          return next;
        });
      },
    }),
    [favoriteIds],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider');
  return value;
}
