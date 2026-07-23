import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1' });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data.projects);
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name required'); return; }
    try {
      if (editingProject) {
        await API.put(`/projects/${editingProject._id}`, form);
        toast.success('Project updated');
      } else {
        await API.post('/projects', form);
        toast.success('Project created! 📁');
      }
      setShowModal(false);
      setEditingProject(null);
      setForm({ name: '', color: '#6366f1' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? Tasks will be unassigned.')) return;
    try { await API.delete(`/projects/${id}`); toast.success('Project deleted'); fetchProjects(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingProject(null); setForm({ name: '', color: '#6366f1' }); setShowModal(true); }}>
          + New Project
        </button>
      </div>

      <div className="grid-3">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-header">
              <div className="project-color-dot" style={{ background: project.color }}></div>
              <h3 className="project-name">{project.name}</h3>
              {!project.isDefault && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingProject(project); setForm({ name: project.name, color: project.color }); setShowModal(true); }}>✏️</button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(project._id)}>🗑️</button>
                </div>
              )}
            </div>
            <div className="project-progress-bar">
              <div className="project-progress-fill" style={{ width: `${project.progress}%`, background: `linear-gradient(90deg, ${project.color}, ${project.color}dd)` }}></div>
            </div>
            <div className="project-stats">
              <span>{project.progress}% complete</span>
              <span>{project.completedTasks}/{project.totalTasks} tasks</span>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {project.pendingTasks} pending
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name..." autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {colors.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }} />
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProject ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
