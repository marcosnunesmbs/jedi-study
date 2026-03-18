export default () => ({
  port: parseInt(process.env.API_PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  agents: {
    baseUrl: process.env.AGENTS_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AGENTS_TIMEOUT_MS || '120000', 10),
  },
  gemini: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    costInput1M: parseFloat(process.env.GEMINI_COST_INPUT_1M || '3.50'),
    costOutput1M: parseFloat(process.env.GEMINI_COST_OUTPUT_1M || '10.50'),
  },
});
