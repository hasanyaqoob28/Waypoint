#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'travelway_new',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('[v0] Running Better Auth schema migration...');
    
    const sqlPath = path.join(__dirname, '002-add-better-auth-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement + ';');
          console.log('[v0] ✓ Executed:', statement.trim().substring(0, 50) + '...');
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log('[v0] ✓ Already exists:', statement.trim().substring(0, 50) + '...');
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log('[v0] ✓ Better Auth schema migration complete!');
  } catch (error) {
    console.error('[v0] ✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
