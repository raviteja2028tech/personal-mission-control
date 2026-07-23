const PROMPTS = {
  DAILY_PLANNER: {
    version: '1.2',
    template: (data) => `
You are a Principal Productivity Architect.
Analyze the following user profile and workload:
- User Working Hours: ${data.workingHours || '9am-5pm'}
- Current Energy Level: ${data.energyLevel || 'High'}
- Pending Tasks: ${JSON.stringify(data.tasks)}
- Daily Streak: ${data.streak || 0}

Generate an optimal schedule containing:
1. Today's Top Priorities (max 3)
2. Time-blocked focus sessions with break allocations
3. Risk analysis (potential bottlenecks)

Return strictly valid JSON with keys: 'priorities', 'timeBlocks', 'riskAnalysis', 'estimatedCompletionTime'.
`
  },

  GOAL_BREAKDOWN: {
    version: '2.0',
    template: (goal) => `
You are a High-Performance Execution Strategist.
Deconstruct this high-level goal into an actionable roadmap:
Goal: "${goal}"

Create a breakdown containing:
- Key Milestones
- Sub-Projects
- Weekly Roadmap
- Estimated Difficulty (1-10)

Return strictly valid JSON with keys: 'milestones', 'weeklyRoadmap', 'difficulty', 'estimatedWeeks'.
`
  },

  AI_COACH: {
    version: '1.0',
    template: (context, query) => `
You are an executive productivity coach.
User Context: ${JSON.stringify(context)}
User Question: "${query}"

Provide a concise, direct, high-impact answer. Be empathetic yet realistic.
`
  },

  SMART_PRIORITY: {
    version: '1.1',
    template: (tasks) => `
Analyze these pending tasks and prioritize them:
Tasks: ${JSON.stringify(tasks)}

Categorize them into four buckets: 'urgent', 'important', 'later', 'delegate'.
Return strictly valid JSON.
`
  }
};

class PromptManager {
  getPrompt(name, data, arg2) {
    const promptDef = PROMPTS[name];
    if (!promptDef) throw new Error(`Prompt '${name}' not defined in PromptManager`);
    return {
      version: promptDef.version,
      content: promptDef.template(data, arg2)
    };
  }
}

module.exports = new PromptManager();
