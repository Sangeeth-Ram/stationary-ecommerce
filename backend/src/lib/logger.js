// Simple console-based logger
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
};

// Simple HTTP logger middleware
const httpLogger = (req, res, next) => {
  // Skip health check endpoints
  if (req.url === '/api/v1/health') {
    return next();
  }

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

export { logger, httpLogger };
