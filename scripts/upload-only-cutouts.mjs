import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dirPath = path.join(__dirname, '../next-app/public/assets/product-cutouts');
const cutouts = fs.readdirSync(dirPath).filter(file => file.endsWith('.png'));

async function run() {
  const dirPath = path.join(__dirname, '../next-app/public/assets/product-cutouts');
  for (const file of cutouts) {
    const fullPath = path.join(dirPath, file);
    const relativePath = `assets/product-cutouts/${file}`;
    if (!fs.existsSync(fullPath)) {
      console.error(`File ${fullPath} does not exist!`);
      continue;
    }
    const fileBuffer = fs.readFileSync(fullPath);
    console.log(`Uploading ${relativePath}...`);
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(relativePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading ${relativePath}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${relativePath}`);
    }
  }
}

run().catch(console.error);
