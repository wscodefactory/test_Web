import FavoriteList from "../components/Favorites/FavoriteList";
import { useFavorites } from "../hooks/useFavorites";
import "../styles/Favorites.css";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <section className="favorites-page">
      <header className="favorites-page-header">
        <h1>즐겨찾기</h1>
        <p>저장한 경로를 빠르게 불러옵니다</p>
      </header>

      <FavoriteList favorites={favorites} onRemove={removeFavorite} />
    </section>
  );
}
