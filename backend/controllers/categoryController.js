const { supabase } = require('../db/database');

const getCategories = async (req, res) => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(categories);
};

const createCategory = async (req, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug, description }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data[0].id });
};

module.exports = { getCategories, createCategory };
