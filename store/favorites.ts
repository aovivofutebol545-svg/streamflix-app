import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Favorite {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path: string;
}

interface FavoritesStore {
  favorites: Favorite[];
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],

  addFavorite: async (favorite: Favorite) => {
    const { favorites } = get();
    const updated = [...favorites, favorite];
    set({ favorites: updated });
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
    }
  },

  removeFavorite: async (id: number) => {
    const { favorites } = get();
    const updated = favorites.filter((f) => f.id !== id);
    set({ favorites: updated });
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  },

  isFavorite: (id: number) => {
    return get().favorites.some((f) => f.id === id);
  },

  loadFavorites: async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      if (data) {
        set({ favorites: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  },
}));
