module.exports = {
  providers: {
    openai: {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY
    },
    gemini: {
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      apiKey: process.env.GEMINI_API_KEY
    },
    anthropic: {
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  },
  fallbackOrder: ['openai', 'gemini', 'anthropic'],
  rateLimits: {
    maxRequestsPerMinute: 20,
    maxTokensPerDay: 50000
  }
};
