import { drizzle } from 'drizzle-orm/mysql2';
import { adminUsers } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

async function seedAdmins() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const db = drizzle(DATABASE_URL);

  const password = 'Livialaraleticia@0602';
  const passwordHash = hashPassword(password);

  const admins = [
    {
      email: 'leticia.frodrigues.souza@gmail.com',
      name: 'Leticia Souza',
      passwordHash,
    },
    {
      email: 'alvercio.junior@gmail.com',
      name: 'Alvercio Junior',
      passwordHash,
    },
  ];

  try {
    // Delete existing users first
    for (const admin of admins) {
      await db.delete(adminUsers).where(eq(adminUsers.email, admin.email));
    }

    // Insert new users
    for (const admin of admins) {
      await db.insert(adminUsers).values(admin);
      console.log(`✓ Created admin: ${admin.email}`);
    }

    console.log('✓ Admin users seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admins:', error);
    process.exit(1);
  }
}

seedAdmins();
