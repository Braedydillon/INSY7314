import config from './config/env.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import gigRoutes from './routes/gigRoutes.js';
import bookingsRoutes from './routes/bookingRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'http://localhost:5173', 'ws://localhost:5173'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: null,
      },
    },
  })
);


app.use(cors({
  origin: [config.CLIENT_ORIGIN],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/finance', incomeRoutes);
app.use('/api/admin', adminRoutes);

// Serve the React production build
app.use(express.static(clientDistPath));

// React Router fallback for frontend pages
app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
    if (path.extname(req.path)) {
        return next();
    }

    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
