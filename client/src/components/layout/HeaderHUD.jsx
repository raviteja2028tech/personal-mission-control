import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function HeaderHUD() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  const openBrainDump = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', ctrlKey: true }));
  };

  return (
    <header className="executive-header">
      <div className="executive-header-left">
        <div className="live-status-pill">
          <span className="live-dot"></span>
          <span className="live-text">ONLINE</span>
        </div>
        <div className="header-time-group">
          <span className="header-time">{timeStr}</span>
          <span className="header-date">{dateStr}</span>
        </div>
      </div>

      <div className="executive-header-center">
        <button className="command-bar-btn" onClick={openCommandPalette} title="Command Palette (Ctrl+K)">
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">Type a command or search tasks...</span>
          <kbd className="key-badge">Ctrl K</kbd>
        </button>
      </div>

      <div className="executive-header-right">
        <button className="quick-dump-chip" onClick={openBrainDump} title="Quick Brain Dump (Ctrl+Space)">
          <span>💡 Brain Dump</span>
        </button>

        <button className="icon-btn-theme" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="user-profile-badge" title={`Commander ${user?.name || ''}`}>
          <div className="avatar-circle">
            {user?.name ? user.name[0].toUpperCase() : 'C'}
          </div>
        </div>
      </div>
    </header>
  );
}
