import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function WeeklyReview() {
  const [reviews, setReviews] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ wins: '', failures: '', improvements: '' });
  const [expandedReview, setExpandedReview] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await API.get('/reviews');
      setReviews(data.reviews);
      setShowPrompt(data.showPrompt);
    } catch { toast.error('Failed to load reviews'); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.wins && !form.failures && !form.improvements) {
      toast.error('Please fill in at least one field');
      return;
    }
    try {
      await API.post('/reviews', form);
      toast.success('Weekly review saved! 📝');
      setShowForm(false);
      setForm({ wins: '', failures: '', improvements: '' });
      fetchReviews();
    } catch { toast.error('Failed to save review'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">📝 Weekly Review</h1>
          <p className="page-subtitle">Reflect, learn, improve</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Write Review
        </button>
      </div>

      {/* Sunday Prompt */}
      {showPrompt && (
        <div className="review-prompt">
          <h3>📋 Time for your weekly review!</h3>
          <p>It's Sunday — take a few minutes to reflect on your week</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Start Review</button>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="modal-title">📝 Weekly Review</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">🎉 What went well?</label>
                <textarea className="form-input" rows="3" value={form.wins} onChange={e => setForm({ ...form, wins: e.target.value })} placeholder="Wins, achievements, progress..." />
              </div>
              <div className="form-group">
                <label className="form-label">😓 What didn't go well?</label>
                <textarea className="form-input" rows="3" value={form.failures} onChange={e => setForm({ ...form, failures: e.target.value })} placeholder="Challenges, blockers, missed goals..." />
              </div>
              <div className="form-group">
                <label className="form-label">🚀 What should improve next week?</label>
                <textarea className="form-input" rows="3" value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} placeholder="Action items, new habits, focus areas..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review History */}
      <div>
        {reviews.map(review => (
          <div key={review._id} className="review-card" onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="review-week">📅 {review.week}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            {(expandedReview === review._id) && (
              <div style={{ marginTop: 12 }}>
                {review.wins && (
                  <div className="review-section">
                    <div className="review-section-title">🎉 What went well</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{review.wins}</p>
                  </div>
                )}
                {review.failures && (
                  <div className="review-section">
                    <div className="review-section-title">😓 What didn't go well</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{review.failures}</p>
                  </div>
                )}
                {review.improvements && (
                  <div className="review-section">
                    <div className="review-section-title">🚀 Improvements</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{review.improvements}</p>
                  </div>
                )}
              </div>
            )}
            {expandedReview !== review._id && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Click to expand</p>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No reviews yet</h3>
            <p>Write your first weekly review to start tracking your progress</p>
          </div>
        )}
      </div>
    </div>
  );
}
