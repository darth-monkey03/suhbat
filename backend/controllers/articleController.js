const { getDb } = require('../db/database');

const getArticles = async (req, res) => {
  const db = await getDb();
  const { category, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT a.id, a.title, a.slug, a.excerpt, a.author, a.created_at,
           c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.published = 1
  `;
  const params = [];

  if (category) { query += ` AND c.slug = ?`; params.push(category); }
  if (search) {
    query += ` AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)`;
    const t = `%${search}%`; params.push(t, t, t);
  }
  query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const articles = db.prepare(query).all(...params);

  let countQuery = `SELECT COUNT(*) as total FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.published = 1`;
  const countParams = [];
  if (category) { countQuery += ` AND c.slug = ?`; countParams.push(category); }
  if (search) {
    countQuery += ` AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)`;
    const t = `%${search}%`; countParams.push(t, t, t);
  }
  const countRow = db.prepare(countQuery).get(...countParams);
  const total = countRow ? countRow.total : 0;

  res.json({ articles, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
};

const getArticleBySlug = async (req, res) => {
  const db = await getDb();
  const article = db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.slug = ? AND a.published = 1
  `).get(req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
};

const createArticle = async (req, res) => {
  const db = await getDb();
  const { title, slug, excerpt, content, category_id, author } = req.body;
  if (!title || !content || !slug) return res.status(400).json({ error: 'title, slug, and content are required' });
  try {
    const result = db.prepare(`INSERT INTO articles (title, slug, excerpt, content, category_id, author) VALUES (?, ?, ?, ?, ?, ?)`).run(title, slug, excerpt, content, category_id, author || 'Suhbat Ahl al-Athar');
    res.status(201).json({ id: result.lastInsertRowid, slug });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const updateArticle = async (req, res) => {
  const db = await getDb();
  const { title, slug, excerpt, content, category_id, author, published } = req.body;
  try {
    db.prepare(`UPDATE articles SET title=?, slug=?, excerpt=?, content=?, category_id=?, author=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(title, slug, excerpt, content, category_id, author, published ?? 1, req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const deleteArticle = async (req, res) => {
  const db = await getDb();
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
};

module.exports = { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
