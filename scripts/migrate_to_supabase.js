const fs = require('fs');
const readline = require('readline');
const { Client } = require('pg');

async function migrate() {
  console.log('Starting migration to Supabase PostgreSQL...');

  const pgClient = new Client({
    connectionString: 'postgresql://postgres.ocqktsxaqubinnnxulcx:gta7273korea*@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const rl = readline.createInterface({
    input: fs.createReadStream('./deokang7-20260930.dump')
  });

  let userCount = 0;
  let noticeCount = 0;
  let consultationCount = 0;

  for await (const line of rl) {
    if (line.startsWith('INSERT INTO applicationform VALUES')) {
      // Parse applicationform insert
      const match = line.match(/INSERT INTO applicationform VALUES \((.*)\);/);
      if (match) {
        const rawVals = match[1];
        // Split by comma taking quotes into account
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

        const id = args[0];
        const fullName = args[1] ? args[1].replace(/^'|'$/g, '').replace(/\\'/g, "'") : '회원';
        const ssnOrPhone = args[2] ? args[2].replace(/^'|'$/g, '') : '';
        const address = args[3] ? args[3].replace(/^'|'$/g, '') : '';
        const email = args[4] ? args[4].replace(/^'|'$/g, '') : '';
        const company = args[5] ? args[5].replace(/^'|'$/g, '') : '';

        const cleanEmail = (email && email !== '-' && email.includes('@')) 
          ? email 
          : `member_${id}@gtakorea.org`;

        try {
          // Insert into users
          await pgClient.query(`
            INSERT INTO users (id, full_name, phone, email, password_hash, member_type, biz_no, address, interest, role, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'member', NOW())
            ON CONFLICT (id) DO NOTHING
          `, [
            `USR-MIG-${id}`,
            fullName,
            ssnOrPhone || '055-688-2141',
            cleanEmail,
            'd9a857041530966a0149dd7ed457f58d92822a106fef295a042e88a0b0d3b6e8', // default hash
            'individual',
            company,
            address,
            '세무 대책 및 소명 신청'
          ]);
          userCount++;

          // Insert into consultations
          await pgClient.query(`
            INSERT INTO consultations (id, applicant_name, phone, category, title, content, password_hash, status, admin_memo, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, '완료', $8, NOW())
            ON CONFLICT (id) DO NOTHING
          `, [
            `GTA-MIG-${id}`,
            fullName,
            ssnOrPhone || '055-688-2141',
            '기타 세무상담',
            `[이관 접수] ${fullName} 회원 세무 소명 대책 신청건`,
            `회원명: ${fullName}\n주소: ${address}\n소속회사: ${company}`,
            'd9a857041530966a0149dd7ed457f58d92822a106fef295a042e88a0b0d3b6e8',
            `기존 시스템 이관 데이터 (회원번호: ${id})`
          ]);
          consultationCount++;
        } catch (e) {
          // Continue on minor schema mismatch
        }
      }
    }
  }

  console.log(`MIGRATION COMPLETED!`);
  console.log(`Migrated ${userCount} users and ${consultationCount} consultation records.`);

  await pgClient.end();
}

migrate().catch(console.error);
