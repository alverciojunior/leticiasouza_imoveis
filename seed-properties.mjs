import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const properties = [
  {
    title: "Residência Moderna Luxuosa",
    location: "Bady Bassitt - SP",
    price: "R$ 2.500.000",
    beds: 4,
    baths: 3,
    area: 350,
    description: "Residência moderna de luxo com acabamentos premium, localizada em área privilegiada de Bady Bassitt. Possui amplos espaços, piscina e jardim paisagístico.",
    latitude: -20.5105,
    longitude: -48.7789,
    featured: true,
  },
  {
    title: "Apartamento Contemporâneo",
    location: "Centro - Bady Bassitt, SP",
    price: "R$ 1.800.000",
    beds: 3,
    baths: 2,
    area: 280,
    description: "Apartamento contemporâneo no coração do centro, com acabamentos sofisticados e localização estratégica próximo a comércios e serviços.",
    latitude: -20.5120,
    longitude: -48.7805,
    featured: true,
  },
  {
    title: "Casa com Jardim Privativo",
    location: "Zona Residencial - Bady Bassitt, SP",
    price: "R$ 1.200.000",
    beds: 3,
    baths: 2,
    area: 250,
    description: "Casa aconchegante com jardim privativo, ideal para famílias que buscam conforto e tranquilidade em zona residencial consolidada.",
    latitude: -20.5090,
    longitude: -48.7750,
    featured: false,
  },
  {
    title: "Penthouse com Vista Panorâmica",
    location: "Bady Bassitt - SP",
    price: "R$ 3.200.000",
    beds: 4,
    baths: 4,
    area: 420,
    description: "Penthouse exclusivo com vista panorâmica da cidade, acabamentos de luxo e todas as comodidades para um estilo de vida sofisticado.",
    latitude: -20.5135,
    longitude: -48.7820,
    featured: true,
  },
  {
    title: "Residência com Cozinha Gourmet",
    location: "Zona Norte - Bady Bassitt, SP",
    price: "R$ 950.000",
    beds: 3,
    baths: 2,
    area: 220,
    description: "Residência com cozinha gourmet equipada, perfeita para quem aprecia culinária e deseja espaço amplo para refeições e convivência.",
    latitude: -20.5070,
    longitude: -48.7770,
    featured: false,
  },
  {
    title: "Apartamento Aconchegante",
    location: "Zona Leste - Bady Bassitt, SP",
    price: "R$ 680.000",
    beds: 2,
    baths: 1,
    area: 150,
    description: "Apartamento aconchegante e bem localizado, ideal para casais ou pequenas famílias que buscam imóvel com bom custo-benefício.",
    latitude: -20.5110,
    longitude: -48.7700,
    featured: false,
  },
];

async function seedProperties() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("Iniciando seed de imóveis de exemplo...");

    for (const property of properties) {
      const query = `
        INSERT INTO properties (title, location, price, beds, baths, area, description, latitude, longitude, featured, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        property.title,
        property.location,
        property.price,
        property.beds,
        property.baths,
        property.area,
        property.description,
        property.latitude,
        property.longitude,
        property.featured ? 1 : 0,
      ];

      await connection.execute(query, values);
      console.log(`✓ Inserido: ${property.title}`);
    }

    console.log("\n✅ Seed de imóveis concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
  } finally {
    await connection.end();
  }
}

seedProperties();
