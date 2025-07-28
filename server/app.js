// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import engineerRoutes from './routes/engineer.routes.js';
import managerRoutes from './routes/manager.routes.js';
import itRoutes from './routes/it.routes.js';
import aiRoutes from './routes/ai.routes.js';
import diseaseRoutes from './routes/disease.routes.js';
import { testConnection, syncDatabase } from './db.js';
import db from './models/index.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// Attach db to req BEFORE routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ✅ Database initialization
const initializeDatabase = async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    await syncDatabase(false); // Don't force sync in production
  }
};

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/farmer', farmerRoutes);
app.use('/engineer', engineerRoutes);
app.use('/manager', managerRoutes);
app.use('/it', itRoutes);
app.use('/ai', aiRoutes);
app.use('/diseases', diseaseRoutes);

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ✅ Start Server
app.listen(port, async () => {
  console.log(`🚀 Server is running on port ${port}`);
  await initializeDatabase();
});
