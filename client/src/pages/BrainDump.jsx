import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function BrainDump() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [text, setText] = useState('');
  const [projects, setProjects] = useState([]);

  // Convert to task modal
  const [convertingNote, setConvertingNote] = useState(null);
  const [convertForm, setConvertForm] = useState({ title: '', priority: 'medium', dueDate: '', projectId: '' });

  useEffect(() => { fetchData(); }, []);

  // Global keyboard shortcut: Ctrl+Space
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      setShowQuickCapture(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const fetchData = async () => {
    try {
      const [notesRes, projectsRes] = await Promise.all([
        API.get('/braindump'),
        API.get('/projects')
      ]);
      setNotes(notesRes.data.notes);
      setProjects(projectsRes.data.projects);
    } catch { toast.error('Failed to load notes'); }
    setLoading(false);
  };

  const handleQuickCapture = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await API.post('/braindump', { text });
      toast.success('Captured! 💡');
      setText('');
      setShowQuickCapture(false);
      fetchData();
    } catch { toast.error('Failed to capture'); }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/braindump/${id}`); toast.success('Note deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const openConvert = (note) => {
    setConvertingNote(note);
    setConvertForm({ title: note.text.substring(0, 200), priority: 'medium', dueDate: '', projectId: '' });
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/braindump/${convertingNote._id}/convert`, convertForm);
      toast.success('Converted to task! ✅');
      setConvertingNote(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to convert'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">💡 Brain Dump</h1>
          <p className="page-subtitle">Quick capture your thoughts · <kbd className="kbd" style={{ fontSize: '0.7rem' }}>Ctrl</kbd> + <kbd className="kbd" style={{ fontSize: '0.7rem' }}>Space</kbd></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowQuickCapture(true)}>
          + Quick Capture
        </button>
      </div>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notes.map(note => (
          <div key={note._id} className={`note-card ${note.converted ? 'converted' : ''}`}>
            <div style={{ flex: 1 }}>
              <div className="note-text">{note.text}</div>
              <div className="note-date">
                {new Date(note.createdAt).toLocaleString()}
                {note.converted && <span style={{ color: 'var(--success)', marginLeft: 8 }}>✓ Converted to task</span>}
              </div>
            </div>
            <div className="note-actions">
              {!note.converted && (
                <button className="btn btn-ghost btn-sm" onClick={() => openConvert(note)} title="Convert to task">
                  📋 Convert
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(note._id)} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💭</div>
            <h3>Your mind is clear</h3>
            <p>Press Ctrl+Space anytime to quickly capture a thought</p>
          </div>
        )}
      </div>

      {/* FAB for quick capture */}
      <button className="fab" onClick={() => setShowQuickCapture(true)} title="Quick Capture (Ctrl+Space)">+</button>

      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <div className="modal-overlay" onClick={() => setShowQuickCapture(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">💡 Quick Capture</h2>
              <button className="modal-close" onClick={() => setShowQuickCapture(false)}>✕</button>
            </div>
            <form onSubmit={handleQuickCapture}>
              <textarea
                className="form-input"
                rows="4"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What's on your mind? Just dump it here..."
                autoFocus
                style={{ fontSize: '1rem', resize: 'vertical' }}
              />
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickCapture(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Capture 💡</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Task Modal */}
      {convertingNote && (
        <div className="modal-overlay" onClick={() => setConvertingNote(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Convert to Task</h2>
              <button className="modal-close" onClick={() => setConvertingNote(null)}>✕</button>
            </div>
            <form onSubmit={handleConvert}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input className="form-input" value={convertForm.title} onChange={e => setConvertForm({ ...convertForm, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={convertForm.priority} onChange={e => setConvertForm({ ...convertForm, priority: e.target.value })}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={convertForm.dueDate} onChange={e => setConvertForm({ ...convertForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-input" value={convertForm.projectId} onChange={e => setConvertForm({ ...convertForm, projectId: e.target.value })}>
                  <option value="">No Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setConvertingNote(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task ✅</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
