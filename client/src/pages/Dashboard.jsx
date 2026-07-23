import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await API.get('/dashboard/progress');
      setData(res.dashboard);
    } catch (err) {
      toast.error('Failed to load dashboard');
    }
    setLoading(false);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await API.patch(`/tasks/${taskId}/complete`);
      toast.success('Mission accomplished! 🎯');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const d = data || {};
  const loadClass = d.mentalLoad?.level || 'low';

  // Progress ring SVG
  const ringSize = 120;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = d.todayPercentage || 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="greeting">
        <h1 className="greeting-text">{d.greeting}, {d.userName} 👋</h1>
        <p className="greeting-sub">
          {d.streak > 0 && <span>🔥 {d.streak} day streak · </span>}
          {d.todayTotal > 0
            ? `${d.todayCompleted}/${d.todayTotal} tasks done today`
            : 'No tasks scheduled today — plan your missions!'}
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Top 3 Missions */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🎯 Today's Top 3 Missions</h2>
            </div>
            <div className="dashboard-missions">
              {d.topMissions && d.topMissions.length > 0 ? (
                d.topMissions.map((mission, i) => (
                  <div key={mission._id} className="mission-card" style={{ animationDelay: `${i * 100}ms` }}>
                    <button
                      className="mission-complete-btn"
                      onClick={(e) => { e.stopPropagation(); handleCompleteTask(mission._id); }}
                      title="Complete mission"
                    >
                      ✓
                    </button>
                    <div className="mission-number">{i + 1}</div>
                    <div className="mission-content">
                      <div className="mission-title">{mission.title}</div>
                      {mission.why && <div className="mission-why">"{mission.why}"</div>}
                      <div className="mission-meta">
                        <span className={`badge badge-${mission.priority}`}>{mission.priority}</span>
                        {mission.projectId && (
                          <span className="task-project-tag">
                            <span className="task-project-dot" style={{ background: mission.projectId.color }}></span>
                            {mission.projectId.name}
                          </span>
                        )}
                        {mission.dueDate && (
                          <span>📅 {new Date(mission.dueDate).toLocaleDateString()}</span>
                        )}
                        {mission.estimatedTime && (
                          <span>⏱ {mission.estimatedTime}m</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🎉</div>
                  <h3>All clear!</h3>
                  <p>No pending tasks. Add new tasks to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mental Load Meter */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <h2 className="card-title">🧠 Mental Load</h2>
              <span className={`load-label ${loadClass}`}>
                {d.mentalLoad?.level?.toUpperCase() || 'LOW'}
              </span>
            </div>
            <div className="mental-load-meter">
              <div className="load-bar">
                <div className={`load-fill ${loadClass}`}></div>
              </div>
              <p className="load-suggestion">{d.mentalLoad?.suggestion || 'Looking good!'}</p>
              <div className="task-meta" style={{ marginTop: 12 }}>
                <span>📋 {d.mentalLoad?.stats?.pendingCount || 0} pending</span>
                <span>🔴 {d.mentalLoad?.stats?.highPriorityCount || 0} high priority</span>
                <span>⚠️ {d.mentalLoad?.stats?.overdueCount || 0} overdue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div>
          {/* Today's Progress Ring */}
          <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="card-header">
              <h2 className="card-title">Today's Progress</h2>
            </div>
            <div className="progress-ring-container" style={{ margin: '10px auto' }}>
              <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-primary)" />
                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="progress-ring-text">{percentage}%</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              {d.todayCompleted}/{d.todayTotal} tasks completed
            </p>
          </div>

          {/* Quick Stats */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2 className="card-title">Quick Stats</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>⏱ Today's Work</span>
                <span style={{ fontWeight: 700 }}>{d.todayEstimatedHours || 0}h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📊 Overall</span>
                <span style={{ fontWeight: 700 }}>{d.overallPercentage || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🔥 Streak</span>
                <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{d.streak || 0} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🏆 Best Streak</span>
                <span style={{ fontWeight: 700 }}>{d.longestStreak || 0} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🧘 Deep Work</span>
                <span style={{ fontWeight: 700 }}>{d.deepWorkHours || 0}h</span>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          {d.streak > 0 && (
            <div className="streak-display">
              <span className="streak-fire">🔥</span>
              <span className="streak-count">{d.streak}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
