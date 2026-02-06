import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    secretKey: process.env.CLERK_SECRET_KEY || '',
  },
  
  // PostgreSQL Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/chad_tutor',
  
  // Redis Cache (optional)
  redisUrl: process.env.REDIS_URL || '',
  
  // Cache settings
  cacheExpiryHours: parseInt(process.env.CACHE_EXPIRY_HOURS || '24', 10),
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5174',

  // External API Configuration
  examApiKey: process.env.EXAM_API_KEY || '',
  examApiEndpoint: process.env.EXAM_API_ENDPOINT || 'https://api.examdb.example.com',
  
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;

