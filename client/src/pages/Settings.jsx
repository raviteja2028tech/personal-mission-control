import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'Space'], action: 'Quick Capture (Brain Dump)' },
  { keys: ['Ctrl', 'N'], action: 'New Task' },
  { keys: ['Ctrl', 'F'], action: 'Search Tasks' },
  { keys: ['Ctrl', 'D'], action: 'Toggle Dark Mode' },
];

export default function Settings() {
  const { user, updateUser, changePassword, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    avatar: user?.profile?.avatar || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Productivity / Pomodoro Settings
  const [timerForm, setTimerForm] = useState({
    pomodoroWork: user?.settings?.pomodoroWork || 25,
    pomodoroBreak: user?.settings?.pomodoroBreak || 5
  });
  const [savingTimer, setSavingTimer] = useState(false);

  // General State
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Keep state synced if user object changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || ''
      });
      setTimerForm({
        pomodoroWork: user.settings?.pomodoroWork || 25,
        pomodoroBreak: user.settings?.pomodoroBreak || 5
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      return toast.error('Display Name cannot be empty');
    }

    setSavingProfile(true);
    try {
      const { data } = await API.put('/users/me', {
        name: profileForm.name.trim(),
        profile: {
          bio: profileForm.bio.trim(),
          avatar: profileForm.avatar.trim()
        }
      });

      if (data.success) {
        updateUser(data.user);
        toast.success('Profile updated successfully! ✨');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = securityForm;

    if (!currentPassword || !newPassword) {
      return toast.error('Please enter your current and new password');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setUpdatingPassword(true);
    try {
      const data = await changePassword(currentPassword, newPassword);
      if (data.success) {
        toast.success('Password updated successfully! 🔒');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
    setUpdatingPassword(false);
  };

  // Handle Focus & Pomodoro Settings Update
  const handleTimerSubmit = async (e) => {
    e.preventDefault();
    const work = parseInt(timerForm.pomodoroWork, 10);
    const breakTime = parseInt(timerForm.pomodoroBreak, 10);

    if (isNaN(work) || work < 1 || isNaN(breakTime) || breakTime < 1) {
      return toast.error('Please enter valid duration values in minutes');
    }

    setSavingTimer(true);
    try {
      const { data } = await API.put('/users/me', {
        settings: {
          pomodoroWork: work,
          pomodoroBreak: breakTime
        }
      });

      if (data.success) {
        updateUser(data.user);
        toast.success('Focus & Pomodoro settings saved! ⏱️');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save focus settings');
    }
    setSavingTimer(false);
  };

  // Handle Data Export
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await API.get('/settings/export');
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pmc-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported! 📦');
    } catch {
      toast.error('Export failed');
    }
    setExporting(false);
  };

  // Handle Data Import
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('This will replace ALL your current data. Are you sure you want to proceed?')) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await API.post('/settings/import', { data: parsed.data });
      toast.success('Data imported successfully! 🎉');
      window.location.reload();
    } catch {
      toast.error('Import failed — check file format');
    }
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings & Account</h1>
        <p className="page-subtitle">Manage your profile, security, and productivity preferences</p>
      </div>

      {/* Profile & Account Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">👤 Profile & Account</h3>
        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--accent-primary-glow)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {profileForm.avatar ? (
                <img
                  src={profileForm.avatar}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : '👤'
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="form-label" htmlFor="settings-name">Display Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                placeholder="Enter display name"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="settings-bio">Bio / Mission Statement</label>
              <textarea
                id="settings-bio"
                className="form-input"
                rows="2"
                placeholder="What drives you? (e.g. Master full stack development & build impactful tools)"
                value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="settings-avatar">Avatar URL</label>
              <input
                id="settings-avatar"
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.png"
                value={profileForm.avatar}
                onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Authentication & Security Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">🔒 Authentication & Security</h3>

        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
              Account Status
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Email: {user?.email}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge ${user?.isVerified ? 'badge-high' : 'badge-medium'}`}>
              {user?.isVerified ? '✓ Verified Email' : '✉️ Unverified'}
            </span>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={logout}>
              Log Out
            </button>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
            Change Password
          </h4>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="form-label" htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={securityForm.currentPassword}
                onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={securityForm.newPassword}
                  onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  className="form-input"
                  placeholder="Repeat new password"
                  value={securityForm.confirmPassword}
                  onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-secondary" disabled={updatingPassword}>
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Focus & Productivity Timer Settings */}
      <div className="settings-section">
        <h3 className="settings-section-title">⏱️ Focus & Timer Preferences</h3>
        <form onSubmit={handleTimerSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label" htmlFor="pomodoro-work">Pomodoro Work Duration (minutes)</label>
              <input
                id="pomodoro-work"
                type="number"
                min="1"
                max="180"
                className="form-input"
                value={timerForm.pomodoroWork}
                onChange={e => setTimerForm({ ...timerForm, pomodoroWork: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="pomodoro-break">Short Break Duration (minutes)</label>
              <input
                id="pomodoro-break"
                type="number"
                min="1"
                max="60"
                className="form-input"
                value={timerForm.pomodoroBreak}
                onChange={e => setTimerForm({ ...timerForm, pomodoroBreak: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-secondary" disabled={savingTimer}>
              {savingTimer ? 'Saving Timer...' : 'Save Timer Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">🎨 Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Dark Mode</div>
            <div className="settings-desc">Toggle between calm dark mode and clean light theme</div>
          </div>
          <div className={`toggle ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme}></div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h3 className="settings-section-title">💾 Data Management</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Export Data</div>
            <div className="settings-desc">Download a JSON backup of all your tasks, projects, and history</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : '📥 Export Backup'}
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Import Data</div>
            <div className="settings-desc">Restore from a previous backup (replaces current data)</div>
          </div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            {importing ? 'Importing...' : '📤 Import Backup'}
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="settings-section-title" style={{ marginBottom: 0 }}>⌨️ Keyboard Shortcuts</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowShortcuts(!showShortcuts)}>
            {showShortcuts ? 'Hide Shortcuts' : 'Show Shortcuts'}
          </button>
        </div>
        {showShortcuts && (
          <div>
            {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
              <div key={i} className="shortcut-row">
                <span style={{ fontSize: '0.88rem' }}>{shortcut.action}</span>
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, j) => (
                    <span key={j}>
                      <kbd className="kbd">{key}</kbd>
                      {j < shortcut.keys.length - 1 && <span style={{ margin: '0 2px', color: 'var(--text-tertiary)' }}>+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* About */}
      <div className="settings-section">
        <h3 className="settings-section-title">ℹ️ About</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Personal Mission Control</div>
            <div className="settings-desc">Version 1.0.0 — Built to eliminate overwhelm and surface the right priority at the right time.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
