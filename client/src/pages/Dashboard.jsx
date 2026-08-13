import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      toast.success('Mission completed! 🎯');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    }
  };

  if (loading) return (
    <div className="loading-page">
      <div className="clean-spinner"></div>
    </div>
  );

  const d = data || {};
  const loadLevel = d.mentalLoad?.level || 'low';
  const percentage = d.todayPercentage || 0;

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).toUpperCase();

  return (
    <div className="clean-dashboard fade-in">
      {/* Handsome Header */}
      <div className="clean-header">
        <div className="header-meta">
          <span className="date-chip">{todayDate}</span>
          <h1 className="clean-title">{d.greeting}, <span className="name-highlight">{d.userName}</span></h1>
          <p className="clean-subtitle">
            {d.todayTotal > 0
              ? `You've completed ${d.todayCompleted} of ${d.todayTotal} top focus missions today.`
              : 'No missions scheduled for today. Create tasks or schedule your day in the planner.'}
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-clean-primary" onClick={() => navigate('/focus')}>
            🎯 Focus Mode
          </button>
          <button className="btn-clean-secondary" onClick={() => navigate('/planner')}>
            📅 Time Planner
          </button>
        </div>
      </div>

      {/* Clean Metric Cards Row */}
      <div className="clean-metrics-row">
        <div className="clean-metric-card">
          <div className="metric-header">
            <span className="metric-icon-wrap cyan">🎯</span>
            <span className="metric-sub">TODAY'S MISSIONS</span>
          </div>
          <div className="metric-main">
            <span className="metric-big-num">{d.todayCompleted || 0}</span>
            <span className="metric-divider">/</span>
            <span className="metric-small-num">{d.todayTotal || 0}</span>
          </div>
          <div className="metric-progress-track">
            <div className="metric-progress-fill" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>

        <div className="clean-metric-card">
          <div className="metric-header">
            <span className="metric-icon-wrap purple">🧠</span>
            <span className="metric-sub">COGNITIVE CAPACITY</span>
          </div>
          <div className="metric-main">
            <span className={`capacity-pill ${loadLevel}`}>
              {loadLevel === 'high' ? '⚠️ High Load' : loadLevel === 'medium' ? '⚡ Moderate' : '🟢 Optimal'}
            </span>
          </div>
          <p className="metric-caption">{d.mentalLoad?.suggestion || 'Mental capacity is optimal for deep work.'}</p>
        </div>

        <div className="clean-metric-card">
          <div className="metric-header">
            <span className="metric-icon-wrap amber">🔥</span>
            <span className="metric-sub">STREAK RECORD</span>
          </div>
          <div className="metric-main">
            <span className="metric-big-num amber-text">{d.streak || 0}</span>
            <span className="metric-unit">DAYS</span>
          </div>
          <p className="metric-caption">Longest streak: {d.longestStreak || 0} days</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="clean-dashboard-grid">
        {/* Left Column: Top 3 Missions */}
        <div className="clean-main-column">
          <div className="clean-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Top Focus Missions</h2>
                <p className="panel-sub">Surfaced by priority & impact</p>
              </div>
              <button className="text-btn" onClick={() => navigate('/tasks')}>
                View all tasks →
              </button>
            </div>

            <div className="clean-missions-list">
              {d.topMissions && d.topMissions.length > 0 ? (
                d.topMissions.map((mission, i) => (
                  <div key={mission._id} className="clean-mission-item">
                    <button
                      className="clean-check-btn"
                      onClick={() => handleCompleteTask(mission._id)}
                      title="Mark as completed"
                    >
                      ✓
                    </button>
                    
                    <div className="clean-mission-content">
                      <div className="mission-title-row">
                        <span className="clean-mission-title">{mission.title}</span>
                        <span className={`priority-tag ${mission.priority}`}>{mission.priority}</span>
                      </div>
                      
                      {mission.why && (
                        <p className="clean-mission-why">"{mission.why}"</p>
                      )}

                      <div className="clean-mission-meta">
                        {mission.projectId && (
                          <span className="project-chip">
                            <span className="dot" style={{ background: mission.projectId.color || '#6366f1' }}></span>
                            {mission.projectId.name}
                          </span>
                        )}
                        {mission.estimatedTime && (
                          <span className="meta-chip">⏱️ {mission.estimatedTime}m</span>
                        )}
                        {mission.dueDate && (
                          <span className="meta-chip">📅 {new Date(mission.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="clean-empty-state">
                  <span className="empty-icon">✨</span>
                  <h3>All clear for today</h3>
                  <p>You've completed all high priority focus items. Add new tasks to keep momentum going.</p>
                  <button className="btn-clean-primary mt-3" onClick={() => navigate('/tasks')}>
                    + Add New Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Work Overview */}
        <div className="clean-side-column">
          <div className="clean-panel">
            <h2 className="panel-title mb-3">Today's Summary</h2>
            
            <div className="summary-list">
              <div className="summary-row">
                <span className="summary-label">📋 Pending Tasks</span>
                <span className="summary-val">{d.mentalLoad?.stats?.pendingCount || 0}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">🔴 High Priority</span>
                <span className="summary-val danger-text">{d.mentalLoad?.stats?.highPriorityCount || 0}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">⚠️ Overdue Items</span>
                <span className="summary-val warning-text">{d.mentalLoad?.stats?.overdueCount || 0}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">🧘 Deep Work Logged</span>
                <span className="summary-val">{d.deepWorkHours || 0}h</span>
              </div>
            </div>
          </div>

          <div className="clean-panel mt-4">
            <h2 className="panel-title mb-3">Quick Navigation</h2>
            <div className="quick-nav-grid">
              <button className="nav-tile" onClick={() => navigate('/braindump')}>
                <span className="tile-icon">💡</span>
                <span className="tile-name">Brain Dump</span>
              </button>
              <button className="nav-tile" onClick={() => navigate('/review')}>
                <span className="tile-icon">📝</span>
                <span className="tile-name">Weekly Review</span>
              </button>
              <button className="nav-tile" onClick={() => navigate('/analytics')}>
                <span className="tile-icon">📊</span>
                <span className="tile-name">Analytics</span>
              </button>
              <button className="nav-tile" onClick={() => navigate('/achievements')}>
                <span className="tile-icon">🏆</span>
                <span className="tile-name">Badges</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
