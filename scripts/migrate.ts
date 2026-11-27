import { readFileSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL_WRITE;
if (!url) throw new Error('Set DATABASE_URL_WRITE (owner role) in the environment first.');

const pool = new Pool({ connectionString: url });
try {
  await pool.query(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
  console.log('schema applied');
} finally {
  await pool.end();
}
