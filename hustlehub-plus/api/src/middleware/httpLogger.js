import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';
import { logger } from '../config/logger.js';

export const httpLogger = pinoHttp({
  logger,

  genReqId(req, res) {
    const id = randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },

  autoLogging: { ignore: (req) => req.url === '/api/health' },

  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl} ${res.statusCode}`,
  customErrorMessage: (req, res) => `${req.method} ${req.originalUrl} ${res.statusCode}`,

  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url, ip: req.raw?.ip }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
