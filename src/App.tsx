import { Navigate, Routes, Route } from 'react-router-dom'; // 라우터 관련 컴포넌트
import RoutePage from './pages/RoutePage'; // 최단 경로 페이지 컴포넌트
import RealtimePage from './pages/RealtimePage'; // 실시간 도착정보 페이지 컴포넌트
import FavoritesPage from './pages/FavoritesPage'; // 즐겨찾기 페이지 컴포넌트
import TimetablePage from './pages/TimetablePage'; // 시간표 페이지 컴포넌트
import BottomNav from './components/Layout/BottomNav'; // 하단 네비게이션 바 컴포넌트
import './styles/App.css';

export default function App(){
return(
  <>
    <div className="app">
      <main className="app-main">
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
  </>
);
}
