import { useState } from "react";
import {
  addRouteFavorite as addRouteFavoriteToStorage,
  createRouteFavoriteId,
  getFavorites,
  removeFavorite as removeFavoriteFromStorage,
  toggleRouteFavorite as toggleRouteFavoriteInStorage,
} from "../services/localStorage/favoritesService";
import type { RouteFavoriteInput } from "../types/favorite";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(getFavorites);

  const addRouteFavorite = (input: RouteFavoriteInput) => {
    setFavorites(addRouteFavoriteToStorage(input));
  };

  const removeFavorite = (favoriteId: string) => {
    setFavorites(removeFavoriteFromStorage(favoriteId));
  };

  const toggleRouteFavorite = (input: RouteFavoriteInput) => {
    const toggleResult = toggleRouteFavoriteInStorage(input);
    setFavorites(toggleResult.favorites);

    return toggleResult.isFavorite;
  };

  const isRouteFavorite = (input: RouteFavoriteInput) => {
    const favoriteId = createRouteFavoriteId(input);

    return favorites.some((favorite) => favorite.id === favoriteId);
  };

  return {
    addRouteFavorite,
    favorites,
    isRouteFavorite,
    removeFavorite,
    toggleRouteFavorite,
  };
};
