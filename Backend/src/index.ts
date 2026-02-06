import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import config from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { cacheService } from './services';
import { registerAllJobs } from './jobs';
import { userRoutes, settingsRoutes, examRoutes, goalsRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware';

const app = express();

// Trust proxy for production environments
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Clerk authentication middleware
// This makes req.auth available on all routes
app.use(clerkMiddleware());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/goals', goalsRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    console.log('✓ PostgreSQL connected');

    // Initialize Redis (optional)
    if (config.redisUrl) {
      await cacheService.initializeRedis();
      console.log('✓ Redis connected');
    } else {
      console.log('○ Redis not configured (using L2 cache only)');
    }

    // Register background jobs (stubs)
    registerAllJobs();
    console.log('✓ Background jobs registered');

    // Start Express server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║           Chad-Tutor Backend Started              ║
╠═══════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(35)}║
║  Port: ${config.port.toString().padEnd(42)}║
║  Database: PostgreSQL                             ║
║  Cache: ${config.redisUrl ? 'Redis + PostgreSQL' : 'PostgreSQL (L2 only)'}${''.padEnd(config.redisUrl ? 21 : 12)}║
║  Frontend: ${config.frontendUrl.padEnd(38)}║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully...`);
  
  try {
    await cacheService.closeRedis();
    await disconnectDatabase();
    console.log('✓ All connections closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
