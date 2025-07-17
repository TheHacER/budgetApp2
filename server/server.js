const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8080;

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
const savingsGoalsRoutes = require('./routes/savingsGoals');
const plannedIncomeRoutes = require('./routes/plannedIncome');
const importProfileRoutes = require('./routes/importProfiles');
const backupRoutes = require('./routes/backup'); // <-- NEW

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
app.use('/api/savings', savingsGoalsRoutes);
app.use('/api/planned-income', plannedIncomeRoutes);
app.use('/api/import-profiles', importProfileRoutes);
app.use('/api/backup', backupRoutes); // <-- NEW

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function startServer() {
  try {
    const database = await db.openDb();
    console.log('Database connection established.');
    await db.migrate(database);
    console.log('Database schema verified/migrated.');
    app.listen(PORT, () => console.log(`Server is listening on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();