import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { id: 'dash', label: 'Go to Dashboard', icon: '📊', path: '/' },
  { id: 'tasks', label: 'View Tasks', icon: '✅', path: '/tasks' },
  { id: 'projects', label: 'View Projects', icon: '📁', path: '/projects' },
  { id: 'planner', label: 'Open Daily Planner', icon: '📅', path: '/planner' },
  { id: 'focus', label: 'Enter Focus Mode', icon: '🎯', path: '/focus' },
  { id: 'braindump', label: 'Brain Dump (Ctrl+Space)', icon: '💡', path: '/braindump' },
  { id: 'analytics', label: 'Open Analytics', icon: '📈', path: '/analytics' },
  { id: 'review', label: 'Weekly Review', icon: '📝', path: '/review' },
  { id: 'achievements', label: 'View Achievements', icon: '🏆', path: '/achievements' },
  { id: 'settings', label: 'Open Settings', icon: '⚙️', path: '/settings' }
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (path) => {
    setOpen(false);
    setSearch('');
    navigate(path);
  };

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
          <span>🔍</span>
          <input
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none' }}
            placeholder="Type a command or search... (Ctrl+K)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <kbd className="kbd" style={{ fontSize: '0.65rem' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {filtered.map((cmd) => (
            <div
              key={cmd.id}
              onClick={() => handleSelect(cmd.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{cmd.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{cmd.label}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Jump to</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No commands matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
