const { Pool } = require('pg');

const dbUrl = 'postgresql://postgres.ocqktsxaqubinnnxulcx:gta7273korea*@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  // 1. Check HAUGEN BJORN EGIL
  const haugen = await pool.query(`
    SELECT id, name, (SELECT COUNT(*) FROM applicationform b WHERE b.id <= a.id)::int AS seq_no, remark
    FROM applicationform a
    WHERE name ILIKE '%HAUGEN%'
  `);
  console.log('HAUGEN before:', haugen.rows);

  // 2. Clean literal \\r\\n, \\r, \\n in applicationform
  const cleanRes = await pool.query(`
    UPDATE applicationform
    SET remark = TRIM(REPLACE(REPLACE(REPLACE(remark, '\\r\\n', ' '), '\\n', ' '), '\\r', ' ')),
        address = TRIM(REPLACE(REPLACE(REPLACE(address, '\\r\\n', ' '), '\\n', ' '), '\\r', ' '))
    WHERE remark LIKE '%\\r%' OR remark LIKE '%\\n%' OR address LIKE '%\\r%' OR address LIKE '%\\n%'
  `);
  console.log('Cleaned rows in applicationform:', cleanRes.rowCount);

  // 3. Insert 5265 (JAMES DAVID RESIDE, seq_no 5214) and 5266 (BABAK SAHARNIA, seq_no 5215) if not exists
  // Timestamps in KST:
  // 2026-10-02 00:00:00 KST -> Math.floor(new Date('2026-10-02T00:00:00+09:00').getTime()/1000) = 1790866800
  // 2027-10-02 00:00:00 KST -> 1822402800
  // 2026-09-18 00:00:00 KST -> 1789657200
  // 2027-12-31 00:00:00 KST -> 1830178800
  await pool.query(`
    INSERT INTO applicationform (
      id, name, number, address, email, company, nationality, phon,
      date_from, date_to, married, age, spouse,
      money_01, money_02, money_03, money_04,
      name2, name3, date_end, family_txt, other_worked, remark
    ) VALUES
    (
      5265, 'JAMES DAVID RESIDE', 'P607572PE',
      '10, Magokjungang 12-ro, Gangseo-gu, Seoul, Republic of Korea, 07789',
      '-', 'CAE Korea', '', 'CAE(5214)',
      '1790866800', '1822402800', '1', '-', '2',
      '-', '-', '-', '-',
      'JAMES DAVID RESIDE', 'JAMES DAVID RESIDE', '1790866800', '||||||||||', 2, '근로자 DOB (630216-)'
    ),
    (
      5266, 'BABAK SAHARNIA', 'P547370FF',
      '10, Magokjungang 12-ro, Gangseo-gu, Seoul, Republic of Korea, 07789',
      '-', 'CAE Korea', '', 'CAE(5215)',
      '1789657200', '1830178800', '1', '-', '2',
      '-', '-', '-', '-',
      'BABAK SAHARNIA', 'BABAK SAHARNIA', '1790866800', '||||||||||', 2, '근로자 DOB (700725-)'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      number = EXCLUDED.number,
      phon = EXCLUDED.phon,
      date_from = EXCLUDED.date_from,
      date_to = EXCLUDED.date_to,
      remark = EXCLUDED.remark
  `);

  const haugenAfter = await pool.query(`
    SELECT id, name, (SELECT COUNT(*) FROM applicationform b WHERE b.id <= a.id)::int AS seq_no, remark
    FROM applicationform a
    WHERE name ILIKE '%HAUGEN%' OR name ILIKE '%BABAK%'
  `);
  console.log('HAUGEN & BABAK after:', haugenAfter.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
