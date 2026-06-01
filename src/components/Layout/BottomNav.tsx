//기획서 하단에 공통으로 
// 들어가는 4개의 탭(최단 경로, 실시간 정보, 시간표, 즐겨찾기) 
// 네비게이션 바입니다.

import { NavLink } from 'react-router-dom'; // 라우팅을 위한 NavLink 컴포넌트
import "../../styles/BottomNav.css"; // 스타일링을 위한 CSS 파일
import { Route, Train, Clock, Star, type LucideIcon } from 'lucide-react'; // 아이콘 라이브러리에서 필요한 아이콘과 타입을 가져옵니다.

type NavItem = {
  path: string;
  label: string;
  icon : LucideIcon; // 아이콘 경로 또는 컴포넌트
}

const navItems: NavItem[] = [
  {
    path: "/route",
    label: "경로",
    icon: Route
  },
  {
    path: "/realtime",
    label: "실시간 도착정보",
    icon: Train
  },
  {
    path: "/timetable",
    label: "시간표",
    icon: Clock
  },
  {
    path: "/favorites",
    label: "즐겨찾기",
    icon: Star
  }
];

export default function BottomNav(){
  return(
    <>
      <nav className="bottom-nav"> 
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} // 각 아이템의 고유한 경로를 키로 사용
              to={item.path}  // 라우팅 경로
              className={({ isActive }) => isActive ?
              "bottom-nav-item bottom-nav-item--active "
                : "bottom-nav-item"
              } // 활성화된 링크에 "active" 클래스 추가
          > 
            <Icon className="bottom-nav-icon"/> {/* 아이콘 표시 */}
            <span className="bottom-nav-label">{item.label}</span>  {/* 라벨 표시 */}
          </NavLink>
          );
          })}
      </nav>
    </>
  );
}