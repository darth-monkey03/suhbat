const { supabase } = require('../db/database');

const getVideos = async (req, res) => {
  const { page = 1, limit = 12, search, category } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('videos')
    .select(`*, categories(name, slug)`)
    .eq('published', 1)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: videos, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const { count: total } = await supabase
    .from('videos')
    .select('id', { count: 'exact', head: true })
    .eq('published', 1);

  res.json({
    videos: videos || [],
    pagination: {
      total: total || 0,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil((total || 0) / limit)
    }
  });
};

const getVideo = async (req, res) => {
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', req.params.id)
    .eq('published', 1)
    .single();

  if (error || !video) return res.status(404).json({ error: 'Not found' });
  res.json(video);
};

const createVideo = async (req, res) => {
  const { title, youtube_url, description, category_id, author } = req.body;
  if (!title || !youtube_url) return res.status(400).json({ error: 'title and youtube_url required' });

  const { data, error } = await supabase
    .from('videos')
    .insert([{ title, youtube_url, description, category_id, author: author || 'Suhbat Ahl al-Athar' }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data[0].id });
};

const updateVideo = async (req, res) => {
  const { title, youtube_url, description, category_id, author, published } = req.body;
  const { error } = await supabase
    .from('videos')
    .update({ title, youtube_url, description, category_id, author, published: published ?? 1 })
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};

const deleteVideo = async (req, res) => {
  const { error } = await supabase.from('videos').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};

module.exports = { getVideos, getVideo, createVideo, updateVideo, deleteVideo };
