const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = path.join(__dirname, '../data/violations.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const createReportsTable = `
      CREATE TABLE IF NOT EXISTS reports (
        report_id TEXT PRIMARY KEY,
        drone_id TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(drone_id, date)
      )
    `;

    const createViolationsTable = `
      CREATE TABLE IF NOT EXISTS violations (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        drone_id TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        image_url TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports (report_id)
      )
    `;

    this.db.serialize(() => {
      this.db.run(createReportsTable, (err) => {
        if (err) {
          console.error('Error creating reports table:', err.message);
        } else {
          console.log('Reports table ready');
        }
      });

      this.db.run(createViolationsTable, (err) => {
        if (err) {
          console.error('Error creating violations table:', err.message);
        } else {
          console.log('Violations table ready');
        }
      });
    });
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}


const database = new Database();

module.exports = database; 