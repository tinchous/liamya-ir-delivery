import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Carga y parsea un archivo CSV en formato JSON.
 * @param {string} filename - Nombre del archivo CSV dentro de la carpeta /data.
 * @returns {Array<Object>} Registros del CSV.
 */
async function loadCSV(filename) {
  const filePath = path.join(process.cwd(), "data", filename);
  const fileContent = fs.readFileSync(filePath, "utf8");
  return parse(fileContent, { columns: true, skip_empty_lines: true });
}

async function main() {
  console.log("🚀 Iniciando carga de datos desde CSV...");

  /**
   * 1️⃣ CATEGORÍAS
   */
  const categorias = await loadCSV("categorias.csv");
  for (const c of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: c.nombre || "Sin nombre" },
      update: {},
      create: {
        nombre: c.nombre || "Sin nombre",
      },
    });
  }
  console.log(`✅ Categorías cargadas: ${categorias.length}`);

  /**
   * 2️⃣ PRODUCTOS
   */
  const productos = await loadCSV("productos.csv");
  for (const p of productos) {
    const categoria = await prisma.categoria.findFirst({
      where: { nombre: p.categoria },
    });

    const imagen =
      p.categoria?.toUpperCase() === "TABACO"
        ? "/images/products/tabaco.png"
        : `/images/products/${p.codigo_barra}.jpg`;

    await prisma.producto.upsert({
      where: { codigo_barra: String(p.codigo_barra) },
      update: {},
      create: {
        codigo_barra: String(p.codigo_barra),
        nombre: p.nombre,
        categoriaId: categoria ? categoria.id : 1,
        subcategoria: p.subcategoria || null,
        precio: Number(p.precio) || 0,
        descripcion: p.descripcion || null,
        imagen,
        oferta: (p.oferta || "").toLowerCase() === "si",
        nuevo: (p.nuevo || "").toLowerCase() === "si",
        mas_vendido: (p.mas_vendido || "").toLowerCase() === "si",
        marca: p.marca || null,
        unidad_medida: p.unidad_medida || null,
        stock: p.stock ? Number(p.stock) : null,
        estado: p.estado || null,
      },
    });
  }
  console.log(`✅ Productos cargados: ${productos.length}`);

  /**
   * 3️⃣ USUARIOS
   */
  const usuarios = await loadCSV("usuarios.csv");
  for (const u of usuarios) {
    if (!u.email) continue; // evitar registros vacíos
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre || "Sin nombre",
        email: u.email,
        telefono: u.telefono || null,
        direccion: u.direccion || null,
      },
    });
  }
  console.log(`✅ Usuarios cargados: ${usuarios.length}`);

  /**
   * 4️⃣ EMPLEADOS
   */
  const empleados = await loadCSV("empleados.csv");
  for (const e of empleados) {
    await prisma.empleado.upsert({
      where: { id: Number(e.id) || 0 },
      update: {},
      create: {
        nombre: e.nombre || "Sin nombre",
        rol: e.rol || "Empleado",
        usuario: e.usuario || null,
        password: e.password || null,
      },
    });
  }
  console.log(`✅ Empleados cargados: ${empleados.length}`);

  /**
   * 5️⃣ AUDITORÍAS
   */
  const auditorias = await loadCSV("auditoria.csv");
  for (const a of auditorias) {
    if (!a.empleadoId) continue;
    await prisma.auditoria.create({
      data: {
        empleadoId: Number(a.empleadoId),
        accion: a.accion || "Sin detalle",
        fecha: a.fecha ? new Date(a.fecha) : new Date(),
      },
    });
  }
  console.log(`✅ Auditorías cargadas: ${auditorias.length}`);

  /**
   * 6️⃣ // 6️⃣ PEDIDOS (con cliente y productos JSON)
   */

const pedidos = await loadCSV("pedidos.csv");
for (const p of pedidos) {
  try {
    const cliente = JSON.parse(p.cliente);
    const productos = JSON.parse(p.productos);

    await prisma.pedido.create({
      data: {
        // no tenemos usuarioId real, así que lo omitimos por ahora
        total: Number(p.total) || 0,
        estado: "registrado",
        fecha: new Date(p.fecha),
      },
    });

    console.log(
      `🧾 Pedido ${p.numero} cargado: ${productos.length} productos, cliente ${cliente.nombre}`
    );
  } catch (err) {
    console.warn(`⚠️ Error parseando pedido ${p.numero}:`, err.message);
  }
}
console.log(`✅ Pedidos cargados: ${pedidos.length}`);


  console.log("🎯 Seed finalizado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
