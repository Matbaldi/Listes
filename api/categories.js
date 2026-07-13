import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../../lib/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'POST') {
    const { name, alt, url } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Le nom est requis.' });

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, alt: alt || null, url: url || null })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id, name, alt, url } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id est requis.' });
    if (!name) return res.status(400).json({ error: 'Le nom est requis.' });

    const { data, error } = await supabase
      .from('categories')
      .update({ name, alt: alt || null, url: url || null })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id est requis.' });

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Méthode non autorisée.' });
}