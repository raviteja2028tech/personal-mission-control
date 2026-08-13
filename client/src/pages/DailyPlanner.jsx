import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

const CATEGORIES = [
  { id: 'deepwork', name: 'Deep Work', icon: '🎯', color: '#6366f1' },
  { id: 'meeting', name: 'Meeting / Sync', icon: '🤝', color: '#06b6d4' },
  { id: 'planning', name: 'Planning & Admin', icon: '🧠', color: '#a855f7' },
  { id: 'break', name: 'Rest & Recharge', icon: '⚡', color: '#10b981' },
];

export default function DailyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBlock, setNewBlock] = useState({ title: '', category: 'deepwork', timeSlot: '09:00 AM', duration: '60' });
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    fetchTasks();
    const storedSchedule = localStorage.getItem('pmc_daily_schedule');
    if (storedSchedule) {
      try { setSchedule(JSON.parse(storedSchedule)); } catch { /* ignore */ }
    } else {
      // Default initial structure
      setSchedule({
        '09:00 AM': { title: 'Deep Focus Sprint: Top Mission', category: 'deepwork', completed: false },
        '11:00 AM': { title: 'Team Sync & Communications', category: 'meeting', completed: false },
        '02:00 PM': { title: 'Admin, Emails & Task Processing', category: 'planning', completed: false },
        '04:00 PM': { title: 'Deep Work: Project Execution', category: 'deepwork', completed: false },
      });
    }

    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  const saveSchedule = (newSched) => {
    setSchedule(newSched);
    localStorage.setItem('pmc_daily_schedule', JSON.stringify(newSched));
  };

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.tasks.filter(t => t.status !== 'done'));
    } catch {
      toast.error('Failed to load tasks');
    }
    setLoading(false);
  };

  const handleAddBlock = (e) => {
    e.preventDefault();
    if (!newBlock.title) {
      toast.error('Please enter a time block title');
      return;
    }
    const updated = {
      ...schedule,
      [newBlock.timeSlot]: {
        title: newBlock.title,
        category: newBlock.category,
        duration: newBlock.duration,
        completed: false
      }
    };
    saveSchedule(updated);
    toast.success(`Time block added to ${newBlock.timeSlot}`);
    setShowAddModal(false);
    setNewBlock({ title: '', category: 'deepwork', timeSlot: '09:00 AM', duration: '60' });
  };

  const toggleBlockCompleted = (slot) => {
    if (!schedule[slot]) return;
    const updated = {
      ...schedule,
      [slot]: {
        ...schedule[slot],
        completed: !schedule[slot].completed
      }
    };
    saveSchedule(updated);
    toast.success(updated[slot].completed ? 'Time block completed! 🎉' : 'Time block reset');
  };

  const removeBlock = (slot) => {
    const updated = { ...schedule };
    delete updated[slot];
    saveSchedule(updated);
    toast.success('Time block removed');
  };

  const assignTaskToSlot = (task, slot) => {
    const updated = {
      ...schedule,
      [slot]: {
        title: task.title,
        taskId: task._id,
        category: 'deepwork',
        completed: false
      }
    };
    saveSchedule(updated);
    toast.success(`Scheduled "${task.title}" at ${slot}`);
  };

  const autoScheduleToday = () => {
    const availableSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    const otherTasks = tasks.filter(t => t.priority !== 'high');
    const combined = [...highPriorityTasks, ...otherTasks];

    if (combined.length === 0) {
      toast.error('No pending tasks available to schedule');
      return;
    }

    const newSched = { ...schedule };
    let assignedCount = 0;

    availableSlots.forEach((slot, index) => {
      if (combined[index]) {
        newSched[slot] = {
          title: combined[index].title,
          taskId: combined[index]._id,
          category: combined[index].priority === 'high' ? 'deepwork' : 'planning',
          completed: false
        };
        assignedCount++;
      }
    });

    saveSchedule(newSched);
    toast.success(`Auto-scheduled ${assignedCount} tasks into optimal focus blocks! 🚀`);
  };

  if (loading) return <div className="loading-page"><div className="clean-spinner"></div></div>;

  const scheduledCount = Object.keys(schedule).length;
  const completedCount = Object.values(schedule).filter(b => b.completed).length;

  return (
    <div className="planner-container fade-in">
      {/* Header */}
      <div className="planner-header">
        <div>
          <div className="planner-badge">REAL-LIFE TIME BLOCKING</div>
          <h1 className="planner-title">📅 Daily Schedule Planner</h1>
          <p className="planner-subtitle">
            Map out your hours with intentional deep work blocks, rest breaks, and meeting slots.
          </p>
        </div>

        <div className="planner-actions">
          <button className="btn-clean-secondary" onClick={autoScheduleToday}>
            ⚡ Auto-Schedule Today
          </button>
          <button className="btn-clean-primary" onClick={() => setShowAddModal(true)}>
            + Add Time Block
          </button>
        </div>
      </div>

      {/* Energy Curve Bar */}
      <div className="energy-curve-card">
        <div className="energy-header">
          <span className="energy-title">⚡ Real-Life Daily Energy Flow</span>
          <span className="current-time-tag">LIVE TIME: {currentTimeStr}</span>
        </div>
        <div className="energy-zones">
          <div className="energy-zone peak">
            <span className="zone-icon">🌅</span>
            <div className="zone-info">
              <span className="zone-name">Morning Focus Peak</span>
              <span className="zone-hours">08:00 AM - 12:00 PM · High Energy</span>
            </div>
          </div>
          <div className="energy-zone dip">
            <span className="zone-icon">☕</span>
            <div className="zone-info">
              <span className="zone-name">Afternoon Reset</span>
              <span className="zone-hours">01:00 PM - 03:00 PM · Admin & Syncs</span>
            </div>
          </div>
          <div className="energy-zone sprint">
            <span className="zone-icon">🌇</span>
            <div className="zone-info">
              <span className="zone-name">Evening Execution</span>
              <span className="zone-hours">04:00 PM - 07:00 PM · Wrap-up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planner Grid Layout */}
      <div className="planner-grid">
        {/* Timeline Column */}
        <div className="timeline-panel">
          <div className="panel-header-row">
            <h3>Timeline (15 Hours)</h3>
            <span className="schedule-meta">{completedCount}/{scheduledCount} Blocks Completed</span>
          </div>

          <div className="time-slots-list">
            {TIME_SLOTS.map((slot) => {
              const block = schedule[slot];
              const categoryObj = CATEGORIES.find(c => c.id === (block?.category || 'deepwork'));

              return (
                <div key={slot} className={`timeline-slot-row ${block ? 'has-block' : ''}`}>
                  <div className="slot-time-col">
                    <span className="slot-time-text">{slot}</span>
                  </div>

                  <div className="slot-content-col">
                    {block ? (
                      <div className={`time-block-card ${block.completed ? 'completed' : ''}`}>
                        <button
                          className="block-check-btn"
                          onClick={() => toggleBlockCompleted(slot)}
                          title="Toggle Completion"
                        >
                          {block.completed ? '✓' : ''}
                        </button>

                        <div className="block-details">
                          <div className="block-title-line">
                            <span className="block-title">{block.title}</span>
                            <span className="block-cat-badge" style={{ background: `${categoryObj?.color}22`, color: categoryObj?.color }}>
                              {categoryObj?.icon} {categoryObj?.name}
                            </span>
                          </div>
                        </div>

                        <button className="block-remove-btn" onClick={() => removeBlock(slot)} title="Remove Block">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="empty-slot-drop" onClick={() => { setNewBlock({ ...newBlock, timeSlot: slot }); setShowAddModal(true); }}>
                        <span className="empty-slot-text">+ Click to schedule a focus block at {slot}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Queue Column */}
        <div className="queue-panel">
          <div className="panel-header-row">
            <h3>Pending Missions</h3>
            <span className="queue-count">{tasks.length} Unscheduled</span>
          </div>

          <p className="queue-subtext">Click any mission to assign it to an available time slot.</p>

          <div className="queue-list">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task._id} className="queue-item">
                  <div className="queue-item-main">
                    <span className="queue-title">{task.title}</span>
                    <div className="queue-meta">
                      <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                      {task.estimatedTime && <span className="meta-chip">⏱️ {task.estimatedTime}m</span>}
                    </div>
                  </div>

                  <div className="queue-slot-picker">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignTaskToSlot(task, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Assign to hour...</option>
                      {TIME_SLOTS.map(s => (
                        <option key={s} value={s}>{s} {schedule[s] ? '(Busy)' : '(Free)'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="clean-empty-state">
                <span className="empty-icon">🎉</span>
                <h4>No pending missions</h4>
                <p>Add new tasks in the Tasks tab to schedule them here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Time Block Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="clean-modal fade-in-up">
            <div className="modal-header">
              <h3>+ Schedule New Time Block</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddBlock} className="modal-form">
              <div className="form-group">
                <label>Block Title</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Work: Refactor Authentication Module"
                  value={newBlock.title}
                  onChange={e => setNewBlock({ ...newBlock, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Hour</label>
                  <select
                    value={newBlock.timeSlot}
                    onChange={e => setNewBlock({ ...newBlock, timeSlot: e.target.value })}
                  >
                    {TIME_SLOTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newBlock.category}
                    onChange={e => setNewBlock({ ...newBlock, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-clean-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-clean-primary">
                  Save Time Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
