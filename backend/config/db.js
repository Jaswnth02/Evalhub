const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbClient = null;
let dbType = 'unknown';

// Initialize Database Connection
async function initDatabase() {
  const preferredClient = process.env.DB_CLIENT || 'mysql';
  const autoFallback = process.env.DB_AUTO_FALLBACK !== 'false';

  if (preferredClient === 'mysql') {
    try {
      const mysql = require('mysql2/promise');
      const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'evalhub_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000
      });

      // Test connection
      const connection = await pool.getConnection();
      connection.release();
      dbClient = pool;
      dbType = 'mysql';
      console.log('✅ Connected to MySQL database successfully.');
      return { client: pool, type: 'mysql' };
    } catch (err) {
      console.warn(`⚠️  MySQL connection failed (${err.message}).`);
      if (!autoFallback) {
        throw err;
      }
      console.log('🔄 Falling back to zero-configuration SQLite for local resilience...');
    }
  }

  // SQLite Fallback
  try {
    const Database = require('better-sqlite3');
    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'evalhub.sqlite');
    const sqlite = new Database(dbPath);
    sqlite.pragma('foreign_keys = ON');
    dbClient = sqlite;
    dbType = 'sqlite';
    console.log(`✅ Connected to SQLite database at: ${dbPath}`);
    return { client: sqlite, type: 'sqlite' };
  } catch (sqliteErr) {
    console.error('❌ Failed to initialize SQLite database:', sqliteErr);
    throw sqliteErr;
  }
}

// Unified Query Execution Wrapper
async function query(sql, params = []) {
  if (!dbClient) {
    await initDatabase();
  }

  if (dbType === 'mysql') {
    const [results] = await dbClient.query(sql, params);
    return results;
  } else if (dbType === 'sqlite') {
    const trimmed = sql.trim();
    const isSelect = /^(SELECT|PRAGMA|SHOW)/i.test(trimmed);

    // Convert MySQL AUTO_INCREMENT or TIMESTAMP if any dynamic raw query
    let sanitizedSql = sql;

    if (isSelect) {
      const stmt = dbClient.prepare(sanitizedSql);
      return stmt.all(params);
    } else {
      const stmt = dbClient.prepare(sanitizedSql);
      const result = stmt.run(params);
      return {
        insertId: Number(result.lastInsertRowid),
        affectedRows: result.changes
      };
    }
  }
}

// Helper: Run transactional operations
async function transaction(callback) {
  if (!dbClient) {
    await initDatabase();
  }

  if (dbType === 'mysql') {
    const connection = await dbClient.getConnection();
    await connection.beginTransaction();
    try {
      const txQuery = async (sql, params = []) => {
        const [results] = await connection.query(sql, params);
        return results;
      };
      const result = await callback(txQuery);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } else {
    // SQLite transaction
    const runTransaction = dbClient.transaction(() => {
      const txQuery = (sql, params = []) => {
        const trimmed = sql.trim();
        const isSelect = /^(SELECT|PRAGMA)/i.test(trimmed);
        if (isSelect) {
          return dbClient.prepare(sql).all(params);
        } else {
          const res = dbClient.prepare(sql).run(params);
          return { insertId: Number(res.lastInsertRowid), affectedRows: res.changes };
        }
      };
      return callback(txQuery);
    });
    return runTransaction();
  }
}

// Direct multi-statement script execution
async function exec(sqlScript) {
  if (!dbClient) {
    await initDatabase();
  }
  if (dbType === 'mysql') {
    const connection = await dbClient.getConnection();
    try {
      const statements = sqlScript
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      for (const stmt of statements) {
        await connection.query(stmt);
      }
    } finally {
      connection.release();
    }
  } else if (dbType === 'sqlite') {
    dbClient.exec(sqlScript);
  }
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDatabase,
  query,
  execute: query,
  exec,
  transaction,
  getDbType
};
