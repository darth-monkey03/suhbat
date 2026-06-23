const { getDb } = require('../db/database');

const getVideos = async (req, res) => {
  const db = await getDb();
  const { page = 1, limit = 12, search } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM videos WHERE published = 1`;
  const params = [];

  if (search) {
    query += ` AND (title LIKE ? OR description LIKE ?)`;
    const t = `%${search}%`;
    params.push(t, t);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const videos = db.prepare(query).all(...params);

  let countQ = `SELECT COUNT(*) as total FROM videos WHERE published = 1`;
  const countP = [];
  if (search) {
    countQ += ` AND (title LIKE ? OR description LIKE ?)`;
    const t = `%${search}%`;
    countP.push(t, t);
  }
  const countRow = db.prepare(countQ).get(...countP);
  const total = countRow ? countRow.total : 0;

  res.json({ videos, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
};

const getVideo = async (req, res) => {
  const db = await getDb();
  const video = db.prepare('SELECT * FROM videos WHERE id = ? AND published = 1').get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Not found' });
  res.json(video);
};

const createVideo = async (req, res) => {
  const db = await getDb();
  const { title, youtube_url, description, author } = req.body;
  if (!title || !youtube_url) return res.status(400).json({ error: 'title and youtube_url required' });
  try {
    const result = db.prepare(`INSERT INTO videos (title, youtube_url, description, author) VALUES (?, ?, ?, ?)`)
      .run(title, youtube_url, description, author || 'Suhbat Ahl al-Athar');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateVideo = async (req, res) => {
  const db = await getDb();
  const { title, youtube_url, description, author, published } = req.body;
  db.prepare(`UPDATE videos SET title=?, youtube_url=?, description=?, author=?, published=? WHERE id=?`)
    .run(title, youtube_url, description, author, published ?? 1, req.params.id);
  res.json({ success: true });
};

const deleteVideo = async (req, res) => {
  const db = await getDb();
  db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
};

module.exports = { getVideos, getVideo, createVideo, updateVideo, deleteVideo };
