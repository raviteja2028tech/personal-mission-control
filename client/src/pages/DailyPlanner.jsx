import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function DailyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    setLoading(false);
  };

  const handleComplete = async (id) => {
    try {
      await API.patch(`/tasks/${id}/complete`);
      toast.success('Completed! ✅');
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

  const getTaskDate = (t) => t.dueDate ? new Date(new Date(t.dueDate).getFullYear(), new Date(t.dueDate).getMonth(), new Date(t.dueDate).getDate()) : null;

  const groups = {
    today: tasks.filter(t => { const d = getTaskDate(t); return d && d.getTime() === today.getTime() && t.status !== 'done'; }),
    tomorrow: tasks.filter(t => { const d = getTaskDate(t); return d && d.getTime() === tomorrow.getTime() && t.status !== 'done'; }),
    upcoming: tasks.filter(t => { const d = getTaskDate(t); return d && d > tomorrow && d <= nextWeek && t.status !== 'done'; }),
    overdue: tasks.filter(t => { const d = getTaskDate(t); return d && d < today && t.status !== 'done'; }),
  };

  const tabs = [
    { key: 'today', label: 'Today', count: groups.today.length },
    { key: 'tomorrow', label: 'Tomorrow', count: groups.tomorrow.length },
    { key: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
    { key: 'overdue', label: 'Overdue', count: groups.overdue.length },
  ];

  const activeList = groups[activeTab] || [];
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  activeList.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">📅 Daily Planner</h1>
        <p className="page-subtitle">
          {groups.overdue.length > 0 && <span style={{ color: 'var(--danger)' }}>⚠️ {groups.overdue.length} overdue · </span>}
          {groups.today.length} tasks today
        </p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label} {tab.count > 0 && <span style={{ marginLeft: 4, opacity: 0.7 }}>({tab.count})</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeList.map(task => (
          <div key={task._id} className="task-card">
            <button className="task-checkbox" onClick={() => handleComplete(task._id)}>✓</button>
            <div className="task-body">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                {task.projectId && (
                  <span className="task-project-tag">
                    <span className="task-project-dot" style={{ background: task.projectId.color || 'var(--accent-primary)' }}></span>
                    {task.projectId.name}
                  </span>
                )}
                {task.estimatedTime && <span>⏱ {task.estimatedTime}m</span>}
                {task.dueDate && activeTab === 'overdue' && (
                  <span style={{ color: 'var(--danger)' }}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
              {task.why && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 4 }}>💡 {task.why}</div>}
            </div>
          </div>
        ))}
        {activeList.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">{activeTab === 'overdue' ? '🎉' : '📋'}</div>
            <h3>{activeTab === 'overdue' ? 'No overdue tasks!' : `No tasks for ${activeTab}`}</h3>
            <p>{activeTab === 'overdue' ? 'You\'re on track!' : 'Add tasks with a due date to see them here'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
