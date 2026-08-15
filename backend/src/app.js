const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const storeRoutes = require('./routes/store.routes');
const adminRoutes = require('./routes/admin.routes');
const storeOwnerRoutes = require('./routes/storeOwner.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or any origin from Vercel / localhost
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ success: true, message: 'RateSphere API is running', env: env.nodeEnv });
});

// Support both /api/* and /* paths for flexible deployment configuration
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/stores', storeRoutes);
app.use('/stores', storeRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/store-owner', storeOwnerRoutes);
app.use('/store-owner', storeOwnerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
