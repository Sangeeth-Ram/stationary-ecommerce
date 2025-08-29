import serverless from 'serverless-http';
import { app } from './app.js';
import { logger } from './lib/logger.js';

// This is the Lambda handler
export const handler = serverless(app, {
  // Configure the base path for API Gateway
  basePath: process.env.API_BASE_PATH || '/api/v1',
  
  // Request/response transformation
  request: (request, event, context) => {
    // Add request ID to the request object for better tracing
    request.requestId = 
      request.headers['x-request-id'] || 
      event.requestContext?.requestId ||
      context.awsRequestId;
    
    // Log the incoming request
    logger.info({
      message: 'Incoming request',
      method: request.method,
      path: request.path,
      query: request.query,
      headers: request.headers,
      requestId: request.requestId,
    });
    
    return request;
  },
  
  response: (response, request) => {
    // Add security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'same-origin');
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Log the response
    logger.info({
      message: 'Outgoing response',
      statusCode: response.statusCode,
      path: request.path,
      requestId: request.requestId,
    });
    
    return response;
  },
});

// Export the app for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}
