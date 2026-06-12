import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    case '.ico': return 'image/x-icon';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

async function uploadDirectory(bucketName, dirPath, prefix = '') {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(prefix, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadDirectory(bucketName, fullPath, relativePath);
    } else {
      if (file.startsWith('.')) continue;

      const fileBuffer = fs.readFileSync(fullPath);
      const mimeType = getMimeType(fullPath);

      console.log(`Uploading ${relativePath}...`);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(relativePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error(`Error uploading ${relativePath}:`, error.message);
      } else {
        console.log(`Successfully uploaded ${relativePath}`);
      }
    }
  }
}

async function run() {
  const publicDir = path.join(__dirname, '../next-app/public');
  
  await uploadDirectory('assets', path.join(publicDir, 'assets'), 'assets');
  await uploadDirectory('assets', path.join(publicDir, 'pdf-assets'), 'pdf-assets');
}

run().catch(console.error);
