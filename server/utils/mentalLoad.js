/**
 * Mental Load Meter
 * Calculates cognitive load from pending tasks, priority, deadlines, and time estimates.
 * 
 * Factors:
 * - Number of pending high-priority tasks (weight: 3 each)
 * - Number of overdue tasks (weight: 4 each)
 * - Total estimated hours remaining today (weight: 2 per hour)
 * - Number of medium priority tasks (weight: 1 each)
 * 
 * Thresholds:
 * - Low:    score 0-15
 * - Medium: score 16-35
 * - High:   score 36+
 */

const calculateMentalLoad = (tasks) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const pending = tasks.filter(t => t.status !== 'done');
  const highPriority = pending.filter(t => t.priority === 'high');
  const mediumPriority = pending.filter(t => t.priority === 'medium');
  const overdue = pending.filter(t => {
    if (!t.dueDate) return false;
    const dueDay = new Date(t.dueDate);
    return new Date(dueDay.getFullYear(), dueDay.getMonth(), dueDay.getDate()) < today;
  });

  const todayTasks = pending.filter(t => {
    if (!t.dueDate) return false;
    const dueDay = new Date(t.dueDate);
    return new Date(dueDay.getFullYear(), dueDay.getMonth(), dueDay.getDate()).getTime() === today.getTime();
  });

  const totalEstimatedMinutes = todayTasks.reduce((sum, t) => sum + (t.estimatedTime || 30), 0);
  const totalEstimatedHours = totalEstimatedMinutes / 60;

  const score = 
    (highPriority.length * 3) +
    (overdue.length * 4) +
    (totalEstimatedHours * 2) +
    (mediumPriority.length * 1);

  let level, suggestion;
  if (score <= 15) {
    level = 'low';
    suggestion = 'You\'re in great shape! Consider tackling a stretch goal today.';
  } else if (score <= 35) {
    level = 'medium';
    suggestion = `You have ${pending.length} pending tasks. Focus on your Top 3 Missions first.`;
  } else {
    level = 'high';
    const moveable = Math.min(3, pending.filter(t => t.priority !== 'high').length);
    suggestion = `Your load is high with ${overdue.length} overdue tasks. Consider moving ${moveable} lower-priority tasks to tomorrow.`;
  }

  return {
    level,
    score: Math.round(score),
    suggestion,
    stats: {
      pendingCount: pending.length,
      highPriorityCount: highPriority.length,
      overdueCount: overdue.length,
      todayEstimatedHours: Math.round(totalEstimatedHours * 10) / 10
    }
  };
};

module.exports = calculateMentalLoad;
