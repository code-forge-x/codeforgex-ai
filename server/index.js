import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/api/auth.js';
import userRoutes from './routes/api/users.js';
import chatRoutes from './routes/api/chat.js';
import promptManagementRoutes from './routes/api/promptManagement.js';
import componentRoutes from './routes/api/components.js';
import templateImportRoutes from './routes/api/templateImport.js';
import projectsRoutes from './routes/api/projects.js';
import aiRoutes from './routes/api/ai.js';

// Load environment variables
dotenv.config();

// Debug: Check if API key is loaded
if (!process.env.CLAUDE_API_KEY) {
  console.error('Warning: CLAUDE_API_KEY is not set in environment variables');
} else {
  console.log('CLAUDE_API_KEY is loaded (first 5 chars):', process.env.CLAUDE_API_KEY.substring(0, 5) + '...');
}

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prompts', promptManagementRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/template-import', templateImportRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));