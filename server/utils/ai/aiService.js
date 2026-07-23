const aiConfig = require('../../config/aiConfig');

class AIService {
  constructor() {
    this.fallbackOrder = aiConfig.fallbackOrder;
    this.cache = new Map();
  }

  async generateStructuredOutput(prompt, jsonSchema, options = {}) {
    const cacheKey = `${prompt}_${JSON.stringify(jsonSchema)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    for (const provider of this.fallbackOrder) {
      try {
        const result = await this.callProvider(provider, prompt, jsonSchema, options);
        this.cache.set(cacheKey, result);
        return result;
      } catch (err) {
        console.warn(`[AI Failover] Provider '${provider}' failed: ${err.message}. Retrying next...`);
      }
    }

    // Fallback: If no provider API key is present or all call attempts fail, return a structured fallback response
    return this.getMockFallback(prompt);
  }

  async callProvider(provider, prompt, schema, options) {
    const config = aiConfig.providers[provider];
    if (!config || !config.apiKey) {
      throw new Error(`Provider ${provider} is disabled or missing API key.`);
    }

    if (provider === 'gemini') {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });
      const response = await model.generateContent(`${prompt}\nRespond strictly in JSON matching schema: ${JSON.stringify(schema)}`);
      const text = response.response.text();
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'system', content: 'You are an executive AI assistant.' }, { role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });
      const data = await response.json();
      if (!data.choices || !data.choices[0]) throw new Error('Invalid OpenAI response');
      return JSON.parse(data.choices[0].message.content);
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  getMockFallback(prompt) {
    if (prompt.includes('priorities')) {
      return {
        priorities: ["Complete backend API tasks", "Review placement material", "Update daily planner"],
        timeBlocks: [
          { time: "09:00 - 11:00", activity: "Deep Work: Core Development" },
          { time: "11:15 - 12:30", activity: "High Priority Review" },
          { time: "14:00 - 16:00", activity: "Secondary Missions" }
        ],
        riskAnalysis: "Potential bottleneck: Context switching between multiple unassigned tasks.",
        estimatedCompletionTime: "4.5 hours"
      };
    }

    if (prompt.includes('goal')) {
      return {
        milestones: ["Master core fundamentals", "Build 2 full-stack projects", "Prepare portfolio & interview prep"],
        weeklyRoadmap: ["Week 1: Foundations", "Week 2-3: Core Project", "Week 4: Review"],
        difficulty: 7,
        estimatedWeeks: 4
      };
    }

    return {
      status: "fallback",
      recommendation: "Focus on your top mission first. Take short breaks to maintain peak energy."
    };
  }
}

module.exports = new AIService();
