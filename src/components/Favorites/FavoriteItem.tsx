import { ArrowRight, Route as RouteIcon, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { LINE_COLOR_BY_LINE } from "../../data/stations";
import type { FavoriteRoute } from "../../types/favorite";

interface FavoriteItemProps {
  favorite: FavoriteRoute;
  onRemove: (favoriteId: string) => void;
}

const getRouteLink = (favorite: FavoriteRoute) => {
  const searchParams = new URLSearchParams({
    startLine: favorite.startLine,
    startStation: favorite.startStation,
    endLine: favorite.endLine,
    endStation: favorite.endStation,
  });

  return `/route?${searchParams.toString()}`;
};

const formatSavedDate = (createdAt: string) => {
  const savedDate = new Date(createdAt);

  if (Number.isNaN(savedDate.getTime())) {
    return "";
  }

  return savedDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
};

export default function FavoriteItem({
  favorite,
  onRemove,
}: FavoriteItemProps) {
  const savedDate = formatSavedDate(favorite.createdAt);

  return (
    <article className="favorite-item">
      <div className="favorite-route">
        <div className="favorite-station">
          <span
            className="favorite-station-dot"
            style={{ backgroundColor: LINE_COLOR_BY_LINE[favorite.startLine] }}
          />
          <span>
            {favorite.startLine} {favorite.startStation}역
          </span>
        </div>

        <ArrowRight className="favorite-route-arrow" aria-hidden="true" />

        <div className="favorite-station">
          <span
            className="favorite-station-dot"
            style={{ backgroundColor: LINE_COLOR_BY_LINE[favorite.endLine] }}
          />
          <span>
            {favorite.endLine} {favorite.endStation}역
          </span>
        </div>
      </div>

      {savedDate && <p className="favorite-saved-date">{savedDate} 저장</p>}

      <div className="favorite-actions">
        <Link className="favorite-load-link" to={getRouteLink(favorite)}>
          <RouteIcon aria-hidden="true" size={18} />
          경로 불러오기
        </Link>
        <button
          className="favorite-remove-button"
          type="button"
          aria-label={`${favorite.startStation}역에서 ${favorite.endStation}역 경로 삭제`}
          onClick={() => onRemove(favorite.id)}
        >
          <Trash2 aria-hidden="true" size={18} />
        </button>
      </div>
    </article>
  );
}
