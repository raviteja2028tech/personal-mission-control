/**
 * Smart Priority Algorithm
 * Computes a priority score for each task and returns the top N tasks.
 * 
 * Score = (priorityWeight × 3) + (deadlineUrgency × 4) + (estimatedTimeWeight × 1)
 * 
 * priorityWeight: high=3, medium=2, low=1
 * deadlineUrgency: overdue=5, today=4, tomorrow=3, this_week=2, later=1, none=0
 * estimatedTimeWeight: <30min=3, 30-60min=2, >60min=1
 */

const getSmartPriority = (tasks, topN = 3) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const priorityWeights = { high: 3, medium: 2, low: 1 };

  const scored = tasks.map(task => {
    const pw = priorityWeights[task.priority] || 2;

    // Deadline urgency
    let du = 0;
    if (task.dueDate) {
      const due = new Date(task.dueDate);
      const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      if (dueDay < today) du = 5;          // overdue
      else if (dueDay.getTime() === today.getTime()) du = 4;  // today
      else if (dueDay.getTime() === tomorrow.getTime()) du = 3; // tomorrow
      else if (dueDay <= endOfWeek) du = 2; // this week
      else du = 1;                          // later
    }

    // Estimated time weight (shorter tasks score higher for quick wins)
    let etw = 2;
    if (task.estimatedTime) {
      if (task.estimatedTime < 30) etw = 3;
      else if (task.estimatedTime <= 60) etw = 2;
      else etw = 1;
    }

    const score = (pw * 3) + (du * 4) + (etw * 1);
    return { task, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(s => ({ ...s.task.toObject ? s.task.toObject() : s.task, _score: s.score }));
};

module.exports = getSmartPriority;
