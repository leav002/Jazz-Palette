import { NavLink } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-meta">
          <span>Jazz Palette</span>
          <span>Chord Reference &amp; Practice</span>
        </div>
        <div className="header-title-row">
          <NavLink to="/" className="header-logo">
            Jazz <span className="logo-amp">&amp;</span> Palette
          </NavLink>
        </div>
        <div className="header-nav-bar">
          <nav className="header-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              홈
            </NavLink>
            <NavLink to="/variation" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              변형
            </NavLink>
            <NavLink to="/library" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              보관함
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              설정
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
