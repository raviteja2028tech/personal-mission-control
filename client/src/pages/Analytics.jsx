import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [deepWork, setDeepWork] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [w, m, dw, h, t] = await Promise.all([
        API.get('/analytics/weekly'),
        API.get('/analytics/monthly'),
        API.get('/analytics/deep-work'),
        API.get('/dashboard/heatmap'),
        API.get('/tasks'),
      ]);
      setWeekly(w.data.report);
      setMonthly(m.data.report);
      setDeepWork(dw.data.report);
      setHeatmap(h.data.heatmap);
      setTasks(t.data.tasks);
    } catch { toast.error('Failed to load analytics'); }
    setLoading(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const completed = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.filter(t => t.status !== 'done').length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgDaily = weekly ? weekly.avgDaily : 0;

  // Chart theme colors
  const chartColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#06b6d4',
    text: '#94a3b8',
    grid: 'rgba(148, 163, 184, 0.1)',
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartColors.text, font: { family: 'Inter' } } },
    },
    scales: {
      x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
      y: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
    },
  };

  // Line chart: weekly trend
  const lineData = {
    labels: weekly?.days?.map(d => d.dayName) || [],
    datasets: [{
      label: 'Tasks Completed',
      data: weekly?.days?.map(d => d.completed) || [],
      borderColor: chartColors.primary,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.primary,
    }],
  };

  // Bar chart: weekly created vs completed
  const barData = {
    labels: weekly?.days?.map(d => d.dayName) || [],
    datasets: [
      { label: 'Completed', data: weekly?.days?.map(d => d.completed) || [], backgroundColor: chartColors.success, borderRadius: 6 },
      { label: 'Created', data: weekly?.days?.map(d => d.created) || [], backgroundColor: chartColors.info, borderRadius: 6 },
    ],
  };

  // Pie chart: tasks by priority
  const priorityCounts = { high: 0, medium: 0, low: 0 };
  tasks.forEach(t => { priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1; });
  const pieData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
      backgroundColor: [chartColors.danger, chartColors.warning, chartColors.info],
      borderWidth: 0,
    }],
  };

  // Heatmap
  const getHeatmapLevel = (count) => {
    if (!count || count === 0) return '';
    if (count <= 2) return 'level-1';
    if (count <= 4) return 'level-2';
    if (count <= 6) return 'level-3';
    return 'level-4';
  };

  const generateHeatmapGrid = () => {
    const cells = [];
    const today = new Date();
    const heatmapMap = {};
    heatmap.forEach(h => { heatmapMap[h.date] = h.count; });

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = heatmapMap[dateStr] || 0;
      cells.push(
        <div
          key={dateStr}
          className={`heatmap-cell ${getHeatmapLevel(count)}`}
          title={`${dateStr}: ${count} tasks`}
        />
      );
    }
    return cells;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">📈 Analytics</h1>
        <p className="page-subtitle">Your productivity insights</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pct}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgDaily}</div>
          <div className="stat-label">Avg Daily</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{deepWork?.totalHours || 0}h</div>
          <div className="stat-label">Deep Work</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{deepWork?.totalSessions || 0}</div>
          <div className="stat-label">Focus Sessions</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-container" style={{ height: 300 }}>
          <h3 className="chart-title">📈 Weekly Completion Trend</h3>
          <div style={{ height: 240 }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-container" style={{ height: 300 }}>
          <h3 className="chart-title">📊 Created vs Completed</h3>
          <div style={{ height: 240 }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-container" style={{ height: 300 }}>
          <h3 className="chart-title">🎯 Tasks by Priority</h3>
          <div style={{ height: 240, display: 'flex', justifyContent: 'center' }}>
            <Pie data={pieData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>

        {/* Project Health */}
        <div className="chart-container">
          <h3 className="chart-title">🏥 Project Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monthly?.projectHealth?.map(p => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }}></span>
                    {p.name}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.progress}%</span>
                </div>
                <div className="project-progress-bar">
                  <div className="project-progress-fill" style={{ width: `${p.progress}%`, background: p.color }}></div>
                </div>
                {p.overdue > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>⚠️ {p.overdue} overdue</span>}
              </div>
            )) || <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No project data yet</p>}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="chart-container" style={{ marginBottom: 24 }}>
        <h3 className="chart-title">🗓️ Productivity Heatmap</h3>
        <div className="heatmap-grid">
          {generateHeatmapGrid()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          <span>Less</span>
          <div className="heatmap-cell" style={{ width: 12, height: 12 }}></div>
          <div className="heatmap-cell level-1" style={{ width: 12, height: 12 }}></div>
          <div className="heatmap-cell level-2" style={{ width: 12, height: 12 }}></div>
          <div className="heatmap-cell level-3" style={{ width: 12, height: 12 }}></div>
          <div className="heatmap-cell level-4" style={{ width: 12, height: 12 }}></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
