// netlify/functions/get-products.js
import { Client } from 'pg';

export async function handler(event, context) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      SELECT
        id,
        codigo_barra,
        nombre,
        precio,
        descripcion,
        imagen,
        marca,
        oferta,
        nuevo,
        mas_vendido
      FROM "Producto"
      WHERE estado IS NULL OR estado = 'activo'
      ORDER BY nombre ASC;
    `;
    const { rows } = await client.query(query);
    await client.end();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error('❌ Error en get-products:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error al obtener productos',
        detail: err.message,
      }),
    };
  }
}
