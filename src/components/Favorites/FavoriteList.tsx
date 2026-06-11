import { Link } from "react-router-dom";
import FavoriteItem from "./FavoriteItem";
import type { FavoriteRoute } from "../../types/favorite";

interface FavoriteListProps {
  favorites: FavoriteRoute[];
  onRemove: (favoriteId: string) => void;
}

export default function FavoriteList({
  favorites,
  onRemove,
}: FavoriteListProps) {
  if (favorites.length === 0) {
    return (
      <div className="favorite-empty">
        <strong>저장된 경로가 없습니다</strong>
        <Link className="favorite-empty-link" to="/route">
          최단경로로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="favorite-list">
      {favorites.map((favorite) => (
        <FavoriteItem
          key={favorite.id}
          favorite={favorite}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
