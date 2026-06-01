import { Navigate, Route, Routes } from "react-router-dom";
import BottomNav from "./components/Layout/BottomNav";
import FavoritesPage from "./pages/FavoritesPage";
import RealtimePage from "./pages/RealtimePage";
import RoutePage from "./pages/RoutePage";
import TimetablePage from "./pages/TimetablePage";

export default function App() {
  return (
    <div className="app">
      <main className="app-main">
        {/* 하단 탭에서 전환되는 주요 페이지 라우트를 정의합니다. */}
        <Routes>
          <Route path="/" element={<Navigate to="/realtime" replace />} />
          <Route path="/route" element={<RoutePage />} />
          <Route path="/realtime" element={<RealtimePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}
