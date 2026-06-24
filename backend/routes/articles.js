const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

router.get('/', getArticles);
router.get('/id/:id', getArticleById);
router.get('/:slug', getArticleBySlug);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

module.exports = router;
