import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function readCsv(relativePath) {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    console.warn(`⚠️  Avertissements en parsant ${relativePath} :`, parsed.errors.slice(0, 5));
  }
  return parsed.data;
}

async function migrateCategories() {
  const rows = readCsv('assets/csv/categories.csv');
  const records = rows.map(r => ({
    name: r.NAME,
    alt: r.ALT,
    url: r.URL,
  }));

  const { error } = await supabase.from('categories').insert(records);
  if (error) throw error;
  console.log(`✅ ${records.length} catégories importées.`);
}

async function migrateItems() {
  const rows = readCsv('assets/csv/items.csv');
  const records = rows.map(r => ({
    platform: r.PLATFORM,
    name: r.NAME,
    price: r.PRICE,
    alt: r.ALT,
    url: r.URL,
    date: r.DATE || null,
  }));

  const { error } = await supabase.from('items').insert(records);
  if (error) throw error;
  console.log(`✅ ${records.length} articles importés.`);
}

async function main() {
  console.log('⚠️  Ce script insère des lignes. Si tu le relances, tu auras des doublons.');
  console.log('   Vide les tables dans Supabase avant de relancer si besoin.\n');
  await migrateCategories();
  await migrateItems();
  console.log('\n🎉 Migration terminée.');
}

main().catch(err => {
  console.error('❌ Erreur pendant la migration :', err);
  process.exit(1);
});