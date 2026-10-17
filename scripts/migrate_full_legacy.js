const fs = require('fs');
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres.ocqktsxaqubinnnxulcx:gta7273korea*@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

function parseSqlValues(rawVals) {
  const args = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < rawVals.length; i++) {
    const char = rawVals[i];
    if (char === "'" && rawVals[i - 1] !== '\\') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      args.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  args.push(cur.trim());
  return args.map(val => {
    if (val === 'NULL' || val === 'null') return null;
    if (val.startsWith("'") && val.endsWith("'")) {
      return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return val;
  });
}

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  // Create applicationform and receipt tables
  await client.query(`
    CREATE TABLE IF NOT EXISTS applicationform (
      id INT PRIMARY KEY,
      name TEXT,
      number TEXT,
      address TEXT,
      email TEXT,
      company TEXT,
      nationality TEXT,
      phon TEXT,
      date_from TEXT,
      date_to TEXT,
      married TEXT,
      age TEXT,
      spouse TEXT,
      money_01 TEXT,
      money_02 TEXT,
      money_03 TEXT,
      money_04 TEXT,
      name2 TEXT,
      name3 TEXT,
      date_end TEXT,
      family_txt TEXT,
      other_worked INT DEFAULT 0,
      remark TEXT DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_appform_name ON applicationform(name);
    CREATE INDEX IF NOT EXISTS idx_appform_number ON applicationform(number);
    CREATE INDEX IF NOT EXISTS idx_appform_company ON applicationform(company);

    CREATE TABLE IF NOT EXISTS receipt (
      id INT PRIMARY KEY,
      member_num TEXT,
      management_no TEXT,
      license_no TEXT,
      association_name TEXT,
      chairman_name TEXT,
      resident_no1 TEXT,
      address1 TEXT,
      name TEXT,
      resident_no2 TEXT,
      address2 TEXT,
      taxation_period TEXT,
      local_name TEXT,
      local_basicsalary TEXT,
      local_bonus TEXT,
      local_income TEXT,
      local_totalsalary TEXT,
      overseas_name TEXT,
      overseas_basicsalary TEXT,
      overseas_bonus TEXT,
      overseas_income TEXT,
      overseas_totalsalary TEXT,
      total_basicsalary TEXT,
      total_bonus TEXT,
      total_income TEXT,
      total_totalsalary TEXT,
      total_salary TEXT,
      computed_tax TEXT,
      deduction_overseas TEXT,
      deduction_deduction TEXT,
      payable_income TEXT,
      payable_resident TEXT,
      payable_special TEXT,
      reg_date TEXT,
      reg_name TEXT,
      non_taxable_salary TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_receipt_member_num ON receipt(member_num);
    CREATE INDEX IF NOT EXISTS idx_receipt_name ON receipt(name);
    CREATE INDEX IF NOT EXISTS idx_receipt_resident_no2 ON receipt(resident_no2);
  `);
  console.log('Tables applicationform and receipt verified/created.');

  // Read dump file with EUC-KR decoding
  console.log('Reading deokang7-20260930.dump with EUC-KR decoder...');
  const rawBuffer = fs.readFileSync('d:/GTA_HOME/deokang7-20260930.dump');
  const decoder = new TextDecoder('euc-kr');
  const text = decoder.decode(rawBuffer);
  const lines = text.split(/\r?\n/);
  console.log(`Decoded ${lines.length} lines.`);

  const appRows = [];
  const recRows = [];

  for (const line of lines) {
    if (line.startsWith('INSERT INTO applicationform VALUES (')) {
      const inner = line.slice('INSERT INTO applicationform VALUES ('.length, line.lastIndexOf(');'));
      const vals = parseSqlValues(inner);
      if (vals.length >= 23) {
        appRows.push([
          parseInt(vals[0], 10),
          vals[1] || '',
          vals[2] || '',
          vals[3] || '',
          vals[4] || '',
          vals[5] || '',
          vals[6] || '',
          vals[7] || '',
          vals[8] || '',
          vals[9] || '',
          vals[10] || '',
          vals[11] || '',
          vals[12] || '',
          vals[13] || '',
          vals[14] || '',
          vals[15] || '',
          vals[16] || '',
          vals[17] || '',
          vals[18] || '',
          vals[19] || '',
          vals[20] || '',
          parseInt(vals[21] || '0', 10) || 0,
          vals[22] || ''
        ]);
      }
    } else if (line.startsWith('INSERT INTO receipt VALUES (')) {
      const inner = line.slice('INSERT INTO receipt VALUES ('.length, line.lastIndexOf(');'));
      const vals = parseSqlValues(inner);
      if (vals.length >= 36) {
        recRows.push([
          parseInt(vals[0], 10),
          vals[1] || '',
          vals[2] || '',
          vals[3] || '',
          vals[4] || '',
          vals[5] || '',
          vals[6] || '',
          vals[7] || '',
          vals[8] || '',
          vals[9] || '',
          vals[10] || '',
          vals[11] || '',
          vals[12] || '',
          vals[13] || '',
          vals[14] || '',
          vals[15] || '',
          vals[16] || '',
          vals[17] || '',
          vals[18] || '',
          vals[19] || '',
          vals[20] || '',
          vals[21] || '',
          vals[22] || '',
          vals[23] || '',
          vals[24] || '',
          vals[25] || '',
          vals[26] || '',
          vals[27] || '',
          vals[28] || '',
          vals[29] || '',
          vals[30] || '',
          vals[31] || '',
          vals[32] || '',
          vals[33] || '',
          vals[34] || '',
          vals[35] || ''
        ]);
      }
    }
  }

  console.log(`Parsed ${appRows.length} applicationform rows and ${recRows.length} receipt rows.`);

  // Batch insert applicationform
  const APP_BATCH = 500;
  for (let i = 0; i < appRows.length; i += APP_BATCH) {
    const chunk = appRows.slice(i, i + APP_BATCH);
    const params = [];
    const placeholders = chunk.map((row, rIdx) => {
      const base = rIdx * 23;
      params.push(...row);
      return `(${Array.from({ length: 23 }, (_, cIdx) => `$${base + cIdx + 1}`).join(',')})`;
    }).join(',');

    await client.query(`
      INSERT INTO applicationform (
        id, name, number, address, email, company, nationality, phon,
        date_from, date_to, married, age, spouse,
        money_01, money_02, money_03, money_04,
        name2, name3, date_end, family_txt, other_worked, remark
      ) VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        number = EXCLUDED.number,
        address = EXCLUDED.address,
        email = EXCLUDED.email,
        company = EXCLUDED.company,
        nationality = EXCLUDED.nationality,
        phon = EXCLUDED.phon,
        remark = EXCLUDED.remark
    `, params);
    console.log(`Inserted applicationform ${Math.min(i + APP_BATCH, appRows.length)} / ${appRows.length}`);
  }

  // Check current receipt count in DB to resume or insert missing
  const existingRecCountRes = await client.query('SELECT COUNT(*) FROM receipt');
  const existingRecCount = parseInt(existingRecCountRes.rows[0].count, 10);
  console.log(`Existing receipt rows in DB: ${existingRecCount}`);

  if (existingRecCount < recRows.length) {
    const REC_BATCH = 1000;
    for (let i = 0; i < recRows.length; i += REC_BATCH) {
      const chunk = recRows.slice(i, i + REC_BATCH);
      const params = [];
      const placeholders = chunk.map((row, rIdx) => {
        const base = rIdx * 36;
        params.push(...row);
        return `(${Array.from({ length: 36 }, (_, cIdx) => `$${base + cIdx + 1}`).join(',')})`;
      }).join(',');

      await client.query(`
        INSERT INTO receipt (
          id, member_num, management_no, license_no, association_name, chairman_name,
          resident_no1, address1, name, resident_no2, address2, taxation_period,
          local_name, local_basicsalary, local_bonus, local_income, local_totalsalary,
          overseas_name, overseas_basicsalary, overseas_bonus, overseas_income, overseas_totalsalary,
          total_basicsalary, total_bonus, total_income, total_totalsalary, total_salary,
          computed_tax, deduction_overseas, deduction_deduction,
          payable_income, payable_resident, payable_special,
          reg_date, reg_name, non_taxable_salary
        ) VALUES ${placeholders}
        ON CONFLICT (id) DO NOTHING
      `, params);

      if ((i / REC_BATCH) % 10 === 0 || i + REC_BATCH >= recRows.length) {
        console.log(`Inserted receipt ${Math.min(i + REC_BATCH, recRows.length)} / ${recRows.length}`);
      }
    }
  }

  const finalApp = await client.query('SELECT COUNT(*) FROM applicationform');
  const finalRec = await client.query('SELECT COUNT(*) FROM receipt');
  console.log(`FINAL COUNTS -> applicationform: ${finalApp.rows[0].count}, receipt: ${finalRec.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
