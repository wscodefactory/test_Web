import type { FavoriteRoute, RouteFavoriteInput } from "../../types/favorite";

const FAVORITES_STORAGE_KEY = "subway-route-favorites:v1";

const canUseLocalStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

export const createRouteFavoriteId = (input: RouteFavoriteInput) =>
  `route:${input.startLine}:${input.startStation}->${input.endLine}:${input.endStation}`;

const isFavoriteRoute = (value: unknown): value is FavoriteRoute => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const favorite = value as Partial<FavoriteRoute>;

  return (
    favorite.type === "route" &&
    typeof favorite.id === "string" &&
    typeof favorite.startLine === "string" &&
    typeof favorite.startStation === "string" &&
    typeof favorite.endLine === "string" &&
    typeof favorite.endStation === "string" &&
    typeof favorite.createdAt === "string"
  );
};

const writeFavorites = (favorites: FavoriteRoute[]) => {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

export const getFavorites = (): FavoriteRoute[] => {
  if (!canUseLocalStorage()) {
    return [];
  }

  const savedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!savedFavorites) {
    return [];
  }

  try {
    const parsedFavorites: unknown = JSON.parse(savedFavorites);

    if (!Array.isArray(parsedFavorites)) {
      return [];
    }

    return parsedFavorites.filter(isFavoriteRoute);
  } catch {
    return [];
  }
};

export const addRouteFavorite = (
  input: RouteFavoriteInput,
): FavoriteRoute[] => {
  const favoriteId = createRouteFavoriteId(input);
  const favorites = getFavorites();

  if (favorites.some((favorite) => favorite.id === favoriteId)) {
    return favorites;
  }

  const nextFavorites: FavoriteRoute[] = [
    {
      ...input,
      id: favoriteId,
      type: "route",
      createdAt: new Date().toISOString(),
    },
    ...favorites,
  ];

  writeFavorites(nextFavorites);
  return nextFavorites;
};

export const removeFavorite = (favoriteId: string): FavoriteRoute[] => {
  const nextFavorites = getFavorites().filter(
    (favorite) => favorite.id !== favoriteId,
  );

  writeFavorites(nextFavorites);
  return nextFavorites;
};

export const isRouteFavoriteSaved = (input: RouteFavoriteInput) => {
  const favoriteId = createRouteFavoriteId(input);

  return getFavorites().some((favorite) => favorite.id === favoriteId);
};

export const toggleRouteFavorite = (
  input: RouteFavoriteInput,
): { favorites: FavoriteRoute[]; isFavorite: boolean } => {
  if (isRouteFavoriteSaved(input)) {
    return {
      favorites: removeFavorite(createRouteFavoriteId(input)),
      isFavorite: false,
    };
  }

  return {
    favorites: addRouteFavorite(input),
    isFavorite: true,
  };
};
