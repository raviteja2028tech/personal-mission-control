import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/tasks', icon: '✅', label: 'Tasks' },
  { path: '/projects', icon: '📁', label: 'Projects' },
  { path: '/planner', icon: '📅', label: 'Planner' },
  { path: '/focus', icon: '🎯', label: 'Focus Mode' },
  { path: '/braindump', icon: '💡', label: 'Brain Dump' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/review', icon: '📝', label: 'Weekly Review' },
  { path: '/achievements', icon: '🏆', label: 'Achievements' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

const mobileNavItems = [
  { path: '/', icon: '📊', label: 'Home' },
  { path: '/tasks', icon: '✅', label: 'Tasks' },
  { path: '/planner', icon: '📅', label: 'Plan' },
  { path: '/focus', icon: '🎯', label: 'Focus' },
  { path: '/settings', icon: '⚙️', label: 'More' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🚀</div>
          <span className="sidebar-title">Mission Control</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" id="mobile-nav">
        {mobileNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
