import { adminProcedure, router } from '../trpc';

const HEALTH_SNAPSHOT = {
  timestamp: new Date().toISOString(),
  services: {
    database: { status: 'healthy', latency: '12ms', connections: 45, maxConnections: 100 },
    redis: { status: 'healthy', latency: '2ms', memoryUsed: '256MB', memoryTotal: '1GB' },
    api: { status: 'healthy', uptime: '14d 6h 32m', requestsPerMinute: 850, errorRate: 0.02 },
    socket: { status: 'healthy', connectedClients: 124, messagesPerMinute: 450 },
    payments: { status: 'healthy', successRate: 99.7, avgProcessingTime: '1.2s' },
  },
  errors: {
    last24h: 12,
    lastWeek: 45,
    byType: [
      { type: 'ValidationError', count: 18, pct: 40 },
      { type: 'AuthError', count: 15, pct: 33 },
      { type: 'PaymentError', count: 8, pct: 18 },
      { type: 'TimeoutError', count: 4, pct: 9 },
    ],
  },
  performance: {
    avgResponseTime: '85ms',
    p95ResponseTime: '250ms',
    p99ResponseTime: '500ms',
    slowestEndpoints: [
      { endpoint: 'bookings.create', avgMs: 320 },
      { endpoint: 'payments.authorize', avgMs: 450 },
      { endpoint: 'skinAnalysis.analyze', avgMs: 2800 },
    ],
  },
  activity: {
    today: { bookings: 47, logins: 520, searches: 1200, payments: 38 },
    chart: [35, 42, 38, 45, 52, 48, 47],
  },
};

export const monitoringRouter = router({
  health: adminProcedure.query(() => HEALTH_SNAPSHOT),
  quickStatus: adminProcedure.query(() => ({
    allHealthy: true,
    database: '🟢',
    redis: '🟢',
    api: '🟢',
    socket: '🟢',
    payments: '🟢',
    lastIncident: null,
    uptime: '99.98%',
    version: '2.2.0',
  })),
  errorsFeed: adminProcedure.query(() => ({
    recent: [
      { id: 1, message: 'Payment timeout on booking #45231', level: 'warning', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 2, message: 'Redis connection pool exhausted', level: 'error', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, message: 'Failed login attempt spike detected', level: 'warning', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ],
  })),
});
