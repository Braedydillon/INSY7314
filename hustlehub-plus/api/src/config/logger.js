import pino from 'pino';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const targets = [
  isProduction
    ? { target: 'pino/file', options: { destination: 1 } }
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } },
];

if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
  targets.push({
    target: '@axiomhq/pino',
    options: {
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
      ...(process.env.AXIOM_EDGE && { edge: process.env.AXIOM_EDGE }),
    },
  });
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'hustlehub-api', env: process.env.NODE_ENV || 'development' },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        '*.password',
        'token',
        '*.token',
      ],
      censor: '[REDACTED]',
    },
  },
  pino.transport({ targets })
);
