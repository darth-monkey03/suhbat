const { supabase } = require('../db/database');

const getArticles = async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('articles')
    .select(`id, title, slug, excerpt, author, created_at, categories(name, slug)`)
    .eq('published', 1)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data: articles, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  const mapped = (articles || []).map(a => ({
    ...a,
    category_name: a.categories?.name,
    category_slug: a.categories?.slug
  }));

  const { count: total } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('published', 1);

  res.json({
    articles: mapped,
    pagination: {
      total: total || 0,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil((total || 0) / limit)
    }
  });
};

const getArticleBySlug = async (req, res) => {
  const { data: article, error } = await supabase
    .from('articles')
    .select(`*, categories(name, slug)`)
    .eq('slug', req.params.slug)
    .eq('published', 1)
    .single();

  if (error || !article) return res.status(404).json({ error: 'Article not found' });

  res.json({
    ...article,
    category_name: article.categories?.name,
    category_slug: article.categories?.slug
  });
};

const createArticle = async (req, res) => {
  const { title, slug, excerpt, content, category_id, author } = req.body;
  if (!title || !content || !slug) return res.status(400).json({ error: 'title, slug, and content are required' });

  const { data, error } = await supabase
    .from('articles')
    .insert([{ title, slug, excerpt, content, category_id, author: author || 'Suhbat Ahl al-Athar' }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data[0].id, slug });
};

const updateArticle = async (req, res) => {
  const { title, slug, excerpt, content, category_id, author, published } = req.body;
  const { error } = await supabase
    .from('articles')
    .update({ title, slug, excerpt, content, category_id, author, published: published ?? 1, updated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};

const deleteArticle = async (req, res) => {
  const { error } = await supabase.from('articles').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};

module.exports = { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
