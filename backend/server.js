require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./db/database');

app.use('/api/articles',   require('./routes/articles'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/videos',     require('./routes/videos'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'Suhbat Ahl al-Athar API' }));

app.use('/api/*', (req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`\n🕌 Suhbat Ahl al-Athar backend running on http://localhost:${PORT}\n`);
});
