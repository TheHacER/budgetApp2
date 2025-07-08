const db = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class User {
  static async create(email, password) {
    const database = await db.openDb();
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const sql = `INSERT INTO users (email, password_hash) VALUES (?, ?)`;

    const result = await database.run(sql, [email, password_hash]);

    return { id: result.lastID, email };
  }

  static async findByEmail(email) {
    const database = await db.openDb();
    const sql = `SELECT * FROM users WHERE email = ?`;
    return await database.get(sql, [email]);
  }

  static async comparePasswords(plainTextPassword, hashedPassword) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}

module.exports = User;
