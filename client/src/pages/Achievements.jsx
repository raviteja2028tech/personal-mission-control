import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [achRes, dashRes] = await Promise.all([
        API.get('/achievements'),
        API.get('/dashboard/progress')
      ]);
      setAchievements(achRes.data.achievements);
      setStats(dashRes.data.dashboard);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const unlocked = achievements.filter(a => a.unlocked).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">🏆 Achievements</h1>
        <p className="page-subtitle">{unlocked}/{achievements.length} unlocked</p>
      </div>

      {/* Streak Display */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div className="streak-display">
            <span className="streak-fire">🔥</span>
            <div>
              <div className="streak-count">{stats.streak || 0}</div>
              <div className="streak-label">Current Streak</div>
            </div>
          </div>
          <div className="streak-display" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <span className="streak-fire">🏅</span>
            <div>
              <div className="streak-count" style={{ color: 'var(--accent-primary)' }}>{stats.longestStreak || 0}</div>
              <div className="streak-label">Longest Streak</div>
            </div>
          </div>
          <div className="streak-display" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <span className="streak-fire">✅</span>
            <div>
              <div className="streak-count" style={{ color: 'var(--success)' }}>{stats.completedTasks || 0}</div>
              <div className="streak-label">Total Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid-3">
        {achievements.map(achievement => (
          <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">{achievement.icon}</div>
            <h3 className="achievement-name">{achievement.name}</h3>
            <p className="achievement-desc">{achievement.description}</p>
            {achievement.unlocked && (
              <p className="achievement-date">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
            {!achievement.unlocked && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>🔒 Locked</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
