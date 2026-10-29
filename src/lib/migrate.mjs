import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

async function migrate() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const directMatch = envContent.match(/DATABASE_URL_UNPOOLED="([^"]+)"/);
  const poolMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
  const connString = directMatch ? directMatch[1] : poolMatch[1];

  console.log('Connecting to database...');
  const sql = neon(connString);

  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      transaction_date TEXT NOT NULL,
      account TEXT,
      payment_method TEXT DEFAULT 'Bank Transfer',
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account TEXT;
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Bank Transfer';
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS remarks TEXT;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      time TEXT NOT NULL,
      unread BOOLEAN NOT NULL DEFAULT true,
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('Tables created.');

  // Check if initial seeding is needed
  const existingTx = await sql`SELECT count(*) as count FROM transactions`;
  if (parseInt(existingTx[0].count) === 0) {
    console.log('Seeding initial data from data/db.json...');
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf8');
    const data = JSON.parse(rawData);

    // Seed transactions
    if (Array.isArray(data.transactions)) {
      for (const tx of data.transactions) {
        await sql`
          INSERT INTO transactions (id, name, category, amount, date, payment_method)
          VALUES (${tx.id}, ${tx.name}, ${tx.category}, ${tx.amount}, ${tx.date}, ${tx.paymentMethod || null})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed notifications
    if (Array.isArray(data.notifications)) {
      for (const n of data.notifications) {
        await sql`
          INSERT INTO notifications (id, title, time, unread, type, text)
          VALUES (${n.id}, ${n.title}, ${n.time}, ${n.unread}, ${n.type}, ${n.text})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    console.log('Seeding complete.');
  } else {
    console.log('Database already populated.');
  }
}

migrate()
  .then(() => {
    console.log('Migration finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
