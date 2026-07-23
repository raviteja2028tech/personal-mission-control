import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ priority: '', status: '', project: '' });
  const [sortBy, setSortBy] = useState('createdAt');

  const emptyForm = { title: '', description: '', priority: 'medium', dueDate: '', estimatedTime: 30, projectId: '', why: '', notes: '', subtasks: [] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects')
      ]);
      setTasks(tasksRes.data.tasks);
      setProjects(projectsRes.data.projects);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      const payload = { ...form };
      if (!payload.projectId) delete payload.projectId;
      if (!payload.dueDate) delete payload.dueDate;

      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated');
      } else {
        await API.post('/tasks', payload);
        toast.success('Task created! 🎯');
      }
      setShowModal(false);
      setEditingTask(null);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      estimatedTime: task.estimatedTime || 30,
      projectId: task.projectId?._id || task.projectId || '',
      why: task.why || '',
      notes: task.notes || '',
      subtasks: task.subtasks || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await API.patch(`/tasks/${id}/complete`);
      toast.success('Task completed! ✅');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    }
  };

  const addSubtask = () => {
    setForm({ ...form, subtasks: [...form.subtasks, { title: '', completed: false }] });
  };

  const updateSubtask = (index, value) => {
    const updated = [...form.subtasks];
    updated[index].title = value;
    setForm({ ...form, subtasks: updated });
  };

  const removeSubtask = (index) => {
    setForm({ ...form, subtasks: form.subtasks.filter((_, i) => i !== index) });
  };

  // Filter and sort tasks
  let displayed = [...tasks];
  if (search) {
    const q = search.toLowerCase();
    displayed = displayed.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.why?.toLowerCase().includes(q)
    );
  }
  if (filters.priority) displayed = displayed.filter(t => t.priority === filters.priority);
  if (filters.status) displayed = displayed.filter(t => t.status === filters.status);
  if (filters.project) displayed = displayed.filter(t => (t.projectId?._id || t.projectId) === filters.project);

  displayed.sort((a, b) => {
    if (sortBy === 'dueDate') return new Date(a.dueDate || '2099-01-01') - new Date(b.dueDate || '2099-01-01');
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] || 1) - (order[b.priority] || 1);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} total · {tasks.filter(t => t.status === 'done').length} completed</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setForm(emptyForm); setShowModal(true); }}>
          + New Task
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: '1 1 200px' }}
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-input" style={{ width: 'auto' }} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
          <option value="overdue">Overdue</option>
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={filters.project} onChange={e => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayed.length > 0 ? displayed.map(task => (
          <div key={task._id} className={`task-card ${task.status === 'done' ? 'completed' : ''}`}>
            <button
              className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
              onClick={() => task.status !== 'done' && handleComplete(task._id)}
              disabled={task.status === 'done'}
            >
              {task.status === 'done' ? '✓' : ''}
            </button>
            <div className="task-body" onClick={() => handleEdit(task)} style={{ cursor: 'pointer' }}>
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                {task.projectId && (
                  <span className="task-project-tag">
                    <span className="task-project-dot" style={{ background: task.projectId.color || 'var(--accent-primary)' }}></span>
                    {task.projectId.name || 'Project'}
                  </span>
                )}
                {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                {task.estimatedTime && <span>⏱ {task.estimatedTime}m</span>}
                {task.subtasks?.length > 0 && (
                  <span>📋 {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                )}
              </div>
              {task.why && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 4 }}>💡 {task.why}</div>}
            </div>
            <div className="task-actions">
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(task)} title="Edit">✏️</button>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(task._id)} title="Delete">🗑️</button>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No tasks found</h3>
            <p>{search || filters.priority || filters.status || filters.project ? 'Try adjusting your filters' : 'Create your first task to get started!'}</p>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Why am I doing this?</label>
                <input className="form-input" value={form.why} onChange={e => setForm({ ...form, why: e.target.value })} placeholder="e.g. Placement prep for Amazon interview" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Time Estimate (min)</label>
                  <input className="form-input" type="number" min="5" max="480" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: parseInt(e.target.value) || 30 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select className="form-input" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                    <option value="">No Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Additional details..." />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Personal notes..." />
              </div>

              {/* Subtasks */}
              <div className="form-group">
                <label className="form-label">Subtasks</label>
                {form.subtasks.map((st, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input className="form-input" style={{ flex: 1 }} value={st.title} onChange={e => updateSubtask(i, e.target.value)} placeholder="Subtask..." />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSubtask(i)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addSubtask}>+ Add Subtask</button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
