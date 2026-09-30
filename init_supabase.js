const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('./schema.sql', 'utf8');

async function main() {
  const connectionStrings = [
    'postgresql://postgres.ocqktsxaqubinnnxulcx:gta7273korea*@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.ocqktsxaqubinnnxulcx:gta7273korea*@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres'
  ];

  for (const connectionString of connectionStrings) {
    console.log('Testing Connection String:', connectionString);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('SUCCESSFULLY CONNECTED TO SUPABASE POSTGRESQL!');
      
      console.log('Executing schema.sql...');
      await client.query(sql);
      console.log('SCHEMA INITIALIZED SUCCESSFULLY!');

      const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
      console.log('Created Public Tables:', res.rows.map(r => r.table_name));

      await client.end();
      return;
    } catch (e) {
      console.error('Connection failed:', e.message);
      await client.end().catch(() => {});
    }
  }
}

main();
