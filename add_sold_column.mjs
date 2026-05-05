import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.execute('DESCRIBE properties');
    const hasSold = rows.some(r => r.Field === 'sold');
    console.log('Has sold column:', hasSold);
    if (!hasSold) {
      await conn.execute('ALTER TABLE properties ADD COLUMN sold int NOT NULL DEFAULT 0');
      console.log('Column added successfully');
    } else {
      console.log('Column already exists');
    }
    await conn.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
