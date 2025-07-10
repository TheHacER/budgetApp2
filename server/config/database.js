const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'sqlite', 'budget.db');

async function openDb() { return open({ filename: DB_PATH, driver: sqlite3.Database }); }

async function migrate(db) {
  const schema = `
    CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
    CREATE TABLE IF NOT EXISTS categories ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
    CREATE TABLE IF NOT EXISTS subcategories ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE, UNIQUE(name, category_id) );
    CREATE TABLE IF NOT EXISTS vendors ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
    CREATE TABLE IF NOT EXISTS transactions ( id INTEGER PRIMARY KEY AUTOINCREMENT, transaction_date DATE NOT NULL, description_original TEXT NOT NULL, amount REAL NOT NULL, is_debit BOOLEAN NOT NULL, vendor_id INTEGER, subcategory_id INTEGER, is_recurring BOOLEAN DEFAULT 0, is_split BOOLEAN DEFAULT 0, is_savings_transfer BOOLEAN DEFAULT 0, notes TEXT, source_account TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE SET NULL, FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE SET NULL );
    CREATE TABLE IF NOT EXISTS split_transactions ( id INTEGER PRIMARY KEY AUTOINCREMENT, transaction_id INTEGER NOT NULL, subcategory_id INTEGER NOT NULL, amount REAL NOT NULL, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE, FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE );
    CREATE TABLE IF NOT EXISTS recurring_bills ( id INTEGER PRIMARY KEY AUTOINCREMENT, vendor_id INTEGER NOT NULL, subcategory_id INTEGER NOT NULL, amount REAL NOT NULL, day_of_month INTEGER NOT NULL, is_active BOOLEAN DEFAULT 1, start_date DATE NOT NULL, end_date DATE, end_date_is_indefinite BOOLEAN DEFAULT 0, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vendor_id) REFERENCES vendors (id), FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) );
    CREATE TABLE IF NOT EXISTS budgets ( id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, month INTEGER NOT NULL, year INTEGER NOT NULL, amount REAL NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(category_id, month, year), FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE );
    CREATE TABLE IF NOT EXISTS audit_log ( id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, action TEXT NOT NULL, table_name TEXT NOT NULL, record_id INTEGER NOT NULL, before_value TEXT, after_value TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id) );
    CREATE TABLE IF NOT EXISTS categorization_rules ( id INTEGER PRIMARY KEY AUTOINCREMENT, vendor_id INTEGER NOT NULL UNIQUE, subcategory_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE, FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE );
    CREATE TABLE IF NOT EXISTS app_settings ( id INTEGER PRIMARY KEY CHECK (id = 1), fiscal_day_start INTEGER NOT NULL, jurisdiction TEXT NOT NULL, setup_complete BOOLEAN DEFAULT 0 );
    CREATE TABLE IF NOT EXISTS public_holidays ( id INTEGER PRIMARY KEY AUTOINCREMENT, holiday_date DATE NOT NULL UNIQUE, name TEXT NOT NULL );
    CREATE TABLE IF NOT EXISTS savings_accounts ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, institution TEXT, account_number TEXT, current_balance REAL NOT NULL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
    CREATE TABLE IF NOT EXISTS savings_goals ( id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL, title TEXT NOT NULL, target_amount REAL NOT NULL, starting_balance REAL NOT NULL DEFAULT 0, current_amount REAL NOT NULL DEFAULT 0, target_date DATE, priority TEXT CHECK(priority IN ('high', 'medium', 'low')) NOT NULL DEFAULT 'medium', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (account_id) REFERENCES savings_accounts (id) ON DELETE CASCADE );

    CREATE TABLE IF NOT EXISTS ignored_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_date DATE NOT NULL,
        description_original TEXT NOT NULL,
        amount REAL NOT NULL,
        is_debit BOOLEAN NOT NULL,
        source_account TEXT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.exec(schema);
}

module.exports = { openDb, migrate };