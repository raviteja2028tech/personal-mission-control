import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function FocusMode() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [inFocus, setInFocus] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pomodoro state
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration] = useState(25);
  const [breakDuration] = useState(5);
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data.projects);
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  };

  const startFocus = async (project) => {
    setSelectedProject(project);
    try {
      const { data } = await API.get(`/tasks/filter?project=${project._id}&status=todo`);
      const inProgress = await API.get(`/tasks/filter?project=${project._id}&status=in-progress`);
      setTasks([...inProgress.data.tasks, ...data.data?.tasks || data.tasks || []]);
    } catch {
      // Fallback: fetch all tasks and filter
      const { data } = await API.get('/tasks');
      setTasks(data.tasks.filter(t => (t.projectId?._id || t.projectId) === project._id && t.status !== 'done'));
    }
    setInFocus(true);
    setPomodoroTime(workDuration * 60);
  };

  const exitFocus = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Log deep work if timer was running
    if (sessionStartRef.current) {
      const elapsed = (Date.now() - sessionStartRef.current) / 1000 / 3600;
      if (elapsed > 0.01) {
        try { await API.patch('/settings/deep-work', { hours: Math.round(elapsed * 100) / 100 }); } catch {}
      }
      sessionStartRef.current = null;
    }
    setInFocus(false);
    setSelectedProject(null);
    setPomodoroActive(false);
    setIsBreak(false);
  };

  const startPomodoro = () => {
    setPomodoroActive(true);
    sessionStartRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // Play notification sound
          try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(100)).play(); } catch {}
          if (!isBreak) {
            toast.success('Work session complete! Take a break 🧘');
            setIsBreak(true);
            setPomodoroTime(breakDuration * 60);
            // Auto-start break
            intervalRef.current = setInterval(() => {
              setPomodoroTime(p => {
                if (p <= 1) {
                  clearInterval(intervalRef.current);
                  setPomodoroActive(false);
                  setIsBreak(false);
                  toast.success('Break over! Ready for another round? 💪');
                  return workDuration * 60;
                }
                return p - 1;
              });
            }, 1000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pausePomodoro = () => {
    clearInterval(intervalRef.current);
    setPomodoroActive(false);
  };

  const resetPomodoro = () => {
    clearInterval(intervalRef.current);
    setPomodoroActive(false);
    setIsBreak(false);
    setPomodoroTime(workDuration * 60);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await API.patch(`/tasks/${taskId}/complete`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task completed! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  if (inFocus) {
    return (
      <div className="focus-mode">
        <div className="focus-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="project-color-dot" style={{ background: selectedProject?.color, width: 16, height: 16 }}></div>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selectedProject?.name}</h2>
            <span className="badge badge-low">{tasks.length} tasks remaining</span>
          </div>
          <button className="btn btn-secondary" onClick={exitFocus}>✕ Exit Focus</button>
        </div>

        <div className="focus-content">
          {/* Pomodoro Timer */}
          <div className="pomodoro">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isBreak ? '☕ Break Time' : '🎯 Focus Session'}
            </div>
            <div className="pomodoro-time">{formatTime(pomodoroTime)}</div>
            <div className="pomodoro-controls">
              {!pomodoroActive ? (
                <button className="btn btn-primary" onClick={startPomodoro}>▶ Start</button>
              ) : (
                <button className="btn btn-secondary" onClick={pausePomodoro}>⏸ Pause</button>
              )}
              <button className="btn btn-ghost" onClick={resetPomodoro}>↻ Reset</button>
            </div>
          </div>

          {/* Focus Tasks */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
              Tasks to Complete
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(task => (
                <div key={task._id} className="task-card">
                  <button className="task-checkbox" onClick={() => handleCompleteTask(task._id)}>✓</button>
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    {task.why && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>💡 {task.why}</div>}
                    <div className="task-meta">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.estimatedTime && <span>⏱ {task.estimatedTime}m</span>}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🎉</div>
                  <h3>All tasks completed!</h3>
                  <p>Amazing work! Exit focus mode to continue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">🎯 Focus Mode</h1>
        <p className="page-subtitle">Select a project to enter distraction-free focus</p>
      </div>

      <div className="grid-3">
        {projects.filter(p => p.pendingTasks > 0 || p.totalTasks === 0).map(project => (
          <div key={project._id} className="project-card" onClick={() => startFocus(project)}>
            <div className="project-header">
              <div className="project-color-dot" style={{ background: project.color }}></div>
              <h3 className="project-name">{project.name}</h3>
            </div>
            <div className="project-progress-bar">
              <div className="project-progress-fill" style={{ width: `${project.progress}%`, background: project.color }}></div>
            </div>
            <div className="project-stats">
              <span>{project.pendingTasks || 0} pending</span>
              <span>{project.progress}%</span>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 14 }}>
              Enter Focus →
            </button>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Create a project first, then use Focus Mode.</p>
          </div>
        )}
      </div>
    </div>
  );
}
