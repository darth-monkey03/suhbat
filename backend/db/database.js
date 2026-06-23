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
    author TEXT DEFAULT 'Suhbat Ahl al-Athar',
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const catCount = db.exec('SELECT COUNT(*) as count FROM categories')[0];
  if (catCount.values[0][0] === 0) {
    db.run(`INSERT INTO categories (name, slug, description) VALUES ('Fatawa', 'fatawa', 'Islamic legal rulings and verdicts')`);
    db.run(`INSERT INTO categories (name, slug, description) VALUES ('Lectures', 'lectures', 'Full lecture transcripts and summaries')`);
    db.run(`INSERT INTO categories (name, slug, description) VALUES ('Reminders', 'reminders', 'Short daily reminders and reflections')`);
    db.run(`INSERT INTO categories (name, slug, description) VALUES ('Aqeedah', 'aqeedah', 'Matters of Islamic creed and belief')`);
    db.run(`INSERT INTO categories (name, slug, description) VALUES ('Seerah', 'seerah', 'The life of the Prophet')`);

    db.run(`INSERT INTO articles (title, slug, excerpt, content, category_id, author) VALUES (
      'The Ruling on Praying Behind an Imam Who Makes Mistakes in Recitation',
      'ruling-praying-behind-imam-mistakes-recitation',
      'A common question regarding the validity of prayer when the Imam makes errors during recitation.',
      '<p><strong>Question:</strong> What is the ruling on praying behind an imam who makes mistakes in his recitation of al-Fatihah?</p><h2>Type One: Mistakes That Change the Meaning</h2><p>If the error changes the meaning to something that contradicts the religion, the prayer behind him is invalid if done deliberately.</p><h2>Type Two: Mistakes That Do Not Change the Meaning</h2><p>Minor errors that do not alter the meaning do not affect the validity of the prayer.</p><p><em>And Allah knows best.</em></p>',
      1,
      'Suhbat Ahl al-Athar'
    )`);
  }

  const vidCount = db.exec('SELECT COUNT(*) as count FROM videos')[0];
  if (vidCount.values[0][0] === 0) {
    db.run(`INSERT INTO videos (title, youtube_url, description, author) VALUES (
      'Introduction to Suhbat Ahl al-Athar',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'A brief introduction to our channel and methodology.',
      'Suhbat Ahl al-Athar'
    )`);
  }

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
