// =================================================================
//  Main Server File (server.js)
// =================================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

// --- Basic Server Setup ---
const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const vendorRoutes = require('./routes/vendors');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const dashboardRoutes = require('./routes/dashboard');
const recurringBillRoutes = require('./routes/recurringBills');
const forecastRoutes = require('./routes/forecast');
const subcategoryRoutes = require('./routes/subcategories');
const settingsRoutes = require('./routes/settings');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recurring-bills', recurringBillRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// --- Database Initialization and Server Start ---
async function startServer() {
  try {
    const database = await db.openDb();
    console.log('Database connection established.');
    await db.migrate(database);
    console.log('Database schema verified/migrated.');
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
