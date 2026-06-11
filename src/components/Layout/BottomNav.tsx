import { Clock, Route, Star, Train, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import "../../styles/BottomNav.css";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

// 하단 탭에서 사용할 라우트, 라벨, 아이콘 정보를 한곳에서 관리합니다.
const navItems: NavItem[] = [
  {
    path: "/route",
    label: "최단경로",
    icon: Route,
  },
  {
    path: "/realtime",
    label: "실시간 도착정보",
    icon: Train,
  },
  {
    path: "/timetable",
    label: "시간표",
    icon: Clock,
  },
  {
    path: "/favorites",
    label: "즐겨찾기",
    icon: Star,
  },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "bottom-nav-item bottom-nav-item--active"
                : "bottom-nav-item"
            }
          >
            {/* 각 탭의 아이콘과 라벨을 함께 보여줍니다. */}
            <Icon className="bottom-nav-icon" aria-hidden="true" />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
