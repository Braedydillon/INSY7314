import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import gigRoutes from './routes/gigRoutes.js';
import bookingsRoutes from './routes/bookingRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/finance', incomeRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
