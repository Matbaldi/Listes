import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, alt, url')
    .order('id', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(data);
}