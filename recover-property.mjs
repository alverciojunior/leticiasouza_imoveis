import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não está configurada');
  process.exit(1);
}

async function recoverProperty() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Conectado ao banco de dados');

    // Dados do anúncio a recuperar
    const propertyData = {
      title: '3 DORMITÓRIOS COM SUÍTE E CLOSET',
      location: 'Bady Bassitt - SP',
      price: '785000',
      type: 'Apartamentos',
      beds: 3,
      baths: 2,
      area: 140,
      description: 'Imóvel com 3 dormitórios, sendo 1 com suíte e closet. 2 banheiros. Área total de 140m².',
      latitude: '-20.6596',
      longitude: '-48.7669',
      sold: 0,
      featured: 0,
      createdAt: new Date(),
    };

    // Inserir a propriedade
    const [result] = await connection.execute(
      `INSERT INTO properties (
        title, location, price, type, beds, baths, area, description, 
        latitude, longitude, sold, featured, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        propertyData.title,
        propertyData.location,
        propertyData.price,
        propertyData.type,
        propertyData.beds,
        propertyData.baths,
        propertyData.area,
        propertyData.description,
        propertyData.latitude,
        propertyData.longitude,
        propertyData.sold,
        propertyData.featured,
        propertyData.createdAt,
      ]
    );

    const propertyId = result.insertId;
    console.log(`✅ Anúncio recuperado com sucesso!`);
    console.log(`   ID: ${propertyId}`);
    console.log(`   Título: ${propertyData.title}`);
    console.log(`   Localização: ${propertyData.location}`);
      console.log(`   Preço: R$${propertyData.price}`);
      console.log(`   Tipo: ${propertyData.type}`);
      console.log(`   Quartos: ${propertyData.beds} | Banheiros: ${propertyData.baths} | Área: ${propertyData.area}m²`);

    // Nota: As imagens precisarão ser re-adicionadas manualmente através da interface
    console.log('\n⚠️  IMPORTANTE: As imagens do anúncio precisarão ser re-adicionadas através da interface de edição.');

  } catch (error) {
    console.error('❌ Erro ao recuperar anúncio:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

recoverProperty();
