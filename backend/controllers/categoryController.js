const { getDb } = require('../db/database');

const getCategories = async (req, res) => {
  const db = await getDb();
  const categories = db.prepare(`
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id AND a.published = 1
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();
  res.json(categories);
};

const createCategory = async (req, res) => {
  const db = await getDb();
  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });
  try {
    const result = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getCategories, createCategory };
