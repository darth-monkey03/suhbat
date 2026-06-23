const initSqlJs = require('sql.js/dist/sql-asm.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'suhbat.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  function save() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    category_id INTEGER,
    author TEXT DEFAULT 'Suhbat Ahl al-Athar',
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    author TEXT DEFAULT 'Suhbat Ahl al-Athar',
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  const cats = [
    ['Fatawa',    'fatawa',    'Islamic legal rulings'],
    ['Aqeedah',   'aqeedah',   'Islamic creed and belief'],
    ['Tafseer',   'tafseer',   'Quran exegesis'],
    ['Hadith',    'hadith',    'Prophetic narrations'],
    ['Fiqh',      'fiqh',      'Islamic jurisprudence'],
    ['Lectures',  'lectures',  'Full lectures'],
    ['Reminders', 'reminders', 'Short reminders'],
  ];
  cats.forEach(([name, slug, desc]) => {
    try { db.run(`INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)`, [name, slug, desc]); } catch(e) {}
  });

  save();

  db.prepare = (sql) => ({
    all: (...params) => {
      try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      } catch (e) { return []; }
    },
    get: (...params) => {
      try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      } catch (e) { return undefined; }
    },
    run: (...params) => {
      try {
        db.run(sql, params);
        const lastId = db.exec('SELECT last_insert_rowid() as id')[0];
        save();
        return { lastInsertRowid: lastId ? lastId.values[0][0] : null };
      } catch (e) { throw e; }
    }
  });

  return db;
}

module.exports = { getDb };
