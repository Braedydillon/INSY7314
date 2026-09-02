import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { notFound } from "./middleware/notFound.js"
import { errorHandler } from "./middleware/errorHandler.js"

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use("/api/auth", authRoutes);
app.use(notFound)
app.use(errorHandler)

export default app;