import { getDb } from './server/db.ts';
import { properties, propertyImages } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();
if (!db) {
  console.error('Database not available');
  process.exit(1);
}

// List all properties
const allProps = await db.select().from(properties);
console.log('All properties in database:');
allProps.forEach(p => {
  console.log(`  ID ${p.id}: ${p.title} (${p.location})`);
});

// Find test properties - match default properties from Home.tsx
const testPatterns = [
  'Residência Moderna Luxuosa',
  'Apartamento Contemporâneo',
  'Casa com Jardim Privativo',
  'Penthouse com Vista Panorâmica',
  'Residência com Cozinha Gourmet',
  'Apartamento Aconchegante',
  'Test Property',
  'Property 1',
  'Property 2',
  'Property 3',
];

const testProps = allProps.filter(p => 
  testPatterns.some(pattern => p.title.includes(pattern))
);

if (testProps.length === 0) {
  console.log('\nNo test properties found to delete.');
  process.exit(0);
}

console.log('\nTest properties to delete:');
testProps.forEach(p => {
  console.log(`  ID ${p.id}: ${p.title}`);
});

// Delete test properties (cascade delete handled by db.ts deleteProperty)
for (const prop of testProps) {
  // First delete all images for this property
  await db.delete(propertyImages).where(eq(propertyImages.propertyId, prop.id));
  // Then delete the property
  await db.delete(properties).where(eq(properties.id, prop.id));
  console.log(`✓ Deleted: ${prop.title}`);
}

console.log('\n✅ Cleanup complete! All test properties removed.');
process.exit(0);
