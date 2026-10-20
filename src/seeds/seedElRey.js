const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const User = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// precioVenta es VENTA AL PÚBLICO (pesos argentinos).
// precioCompra queda en 0 para actualizar desde el panel.
const grupos = [
  {
    categoria: { nombre: 'Alimentos Perro', color: '#f97316', icono: 'package' },
    tipo: 'alimento',
    productos: [
      { nombre: 'Excellent Adulto 15kg', kilos: 15, precioVenta: 85000 },
      { nombre: 'Dog Chow Adulto 20kg', kilos: 20, precioVenta: 58000 },
      { nombre: 'Pedigree Adulto 21kg', kilos: 21, precioVenta: 55000 },
      { nombre: 'Eukanuba Adulto 15kg', kilos: 15, precioVenta: 72000 },
      { nombre: 'Royal Canin Adulto 15kg', kilos: 15, precioVenta: 120000 },
      { nombre: 'Pro Plan Adulto 15kg', kilos: 15, precioVenta: 95000 },
      { nombre: 'Sieger Adulto 20kg', kilos: 20, precioVenta: 78000 },
      { nombre: 'Old Prince Adulto 15kg', kilos: 15, precioVenta: 70000 },
      { nombre: 'Vital Can Balanced Adulto 20kg', kilos: 20, precioVenta: 60000 },
      { nombre: 'Nutribon Adulto 20kg', kilos: 20, precioVenta: 30000 },
      { nombre: 'Raza Adulto 20kg', kilos: 20, precioVenta: 38000 },
      { nombre: 'Agility Adulto 20kg', kilos: 20, precioVenta: 62000 },
      { nombre: 'Excellent Maintenance 22kg', kilos: 22, precioVenta: 35000 },
      { nombre: 'Dog Selection Adulto 21kg', kilos: 21, precioVenta: 52000 },
      { nombre: 'Sabrositos Adulto 20kg', kilos: 20, precioVenta: 34000 },
    ],
  },
  {
    categoria: { nombre: 'Alimentos Gato', color: '#eab308', icono: 'package' },
    tipo: 'alimento',
    productos: [
      { nombre: 'Excellent Gato Adulto 15kg', kilos: 15, precioVenta: 110000 },
      { nombre: 'Cat Chow Adulto 15kg', kilos: 15, precioVenta: 78000 },
      { nombre: 'Whiskas Adulto 20kg', kilos: 20, precioVenta: 85000 },
      { nombre: 'Felix Gato Adulto 15kg', kilos: 15, precioVenta: 70000 },
      { nombre: 'Royal Canin Gato Adulto 15kg', kilos: 15, precioVenta: 140000 },
      { nombre: 'Pro Plan Gato Adulto 7.5kg', kilos: 7.5, precioVenta: 72000 },
      { nombre: 'Eukanuba Gato Adulto 15kg', kilos: 15, precioVenta: 80000 },
      { nombre: 'Gati Adulto 15kg', kilos: 15, precioVenta: 48000 },
      { nombre: 'Vital Can Balanced Gato 15kg', kilos: 15, precioVenta: 68000 },
      { nombre: 'Nutribon Gato Adulto 20kg', kilos: 20, precioVenta: 38000 },
      { nombre: 'Raza Gato Adulto 15kg', kilos: 15, precioVenta: 42000 },
      { nombre: 'Agility Gato Adulto 10kg', kilos: 10, precioVenta: 68000 },
      { nombre: 'Old Prince Gato Adulto 10kg', kilos: 10, precioVenta: 60000 },
      { nombre: 'Cat Selection Adulto 10kg', kilos: 10, precioVenta: 55000 },
      { nombre: 'Kongo Gato Adulto 15kg', kilos: 15, precioVenta: 45000 },
    ],
  },
  {
    categoria: { nombre: 'Accesorios', color: '#10b981', icono: 'tag' },
    tipo: 'unidad',
    productos: [
      { nombre: 'Collar de cuero con hebilla', precioVenta: 8500 },
      { nombre: 'Correa de paseo reforzada', precioVenta: 9500 },
      { nombre: 'Plato doble de acero inoxidable', precioVenta: 12000 },
      { nombre: 'Bebedero automático 2L', precioVenta: 18000 },
      { nombre: 'Juguete Kong mordillo', precioVenta: 15000 },
      { nombre: 'Pelotas de tenis para perro x3', precioVenta: 4500 },
      { nombre: 'Cepillo quita pelo', precioVenta: 7500 },
      { nombre: 'Rascador para gatos con plataforma', precioVenta: 22000 },
      { nombre: 'Arnés ajustable para perro', precioVenta: 11000 },
      { nombre: 'Bozal de nylon regulable', precioVenta: 6500 },
    ],
  },
  {
    categoria: { nombre: 'Extras', color: '#06b6d4', icono: 'package' },
    tipo: 'unidad',
    productos: [
      { nombre: 'Piedras sanitarias para gatos 4kg', precioVenta: 7500 },
      { nombre: 'Shampoo antipulgas perros 500ml', precioVenta: 9800 },
      { nombre: 'Pipeta antipulgas perro 10-20kg', precioVenta: 5800 },
      { nombre: 'Snacks hueso masticable', precioVenta: 2200 },
      { nombre: 'Toallitas húmedas para mascotas', precioVenta: 5800 },
      { nombre: 'Comedero elevado antireflujo', precioVenta: 14000 },
      { nombre: 'Fuente bebedero para gatos', precioVenta: 25000 },
      { nombre: 'Comida húmeda lata para gato', precioVenta: 2400 },
      { nombre: 'Pañales para mascotas', precioVenta: 8500 },
      { nombre: 'Bandeja sanitaria para gato', precioVenta: 12500 },
    ],
  },
];

const seedElRey = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    const admin = await User.findOne({ rol: 'admin' });
    if (!admin) throw new Error('No se encontró usuario admin. Ejecutá createAdmin.js primero.');

    let totalCreados = 0;
    let totalOmitidos = 0;
    let skuCounter = 1;

    const lastProd = await Product.findOne({ sku: /^REY-/ }).sort({ sku: -1 });
    if (lastProd) {
      const num = parseInt(lastProd.sku.replace('REY-', ''), 10);
      if (!isNaN(num)) skuCounter = num + 1;
    }

    for (const grupo of grupos) {
      let cat = await Category.findOne({ nombre: grupo.categoria.nombre });
      if (!cat) {
        cat = await Category.create(grupo.categoria);
        console.log(`📦 Categoría creada: ${cat.nombre}`);
      } else {
        console.log(`📦 Categoría existente: ${cat.nombre}`);
      }

      const stockMovements = [];
      let creadosEnCat = 0;

      for (const p of grupo.productos) {
        const existente = await Product.findOne({
          nombre: { $regex: new RegExp(`^${p.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });
        if (existente) {
          console.log(`  ⚠️  Ya existe: ${p.nombre}`);
          totalOmitidos++;
          continue;
        }

        const sku = `REY-${String(skuCounter).padStart(3, '0')}`;
        skuCounter++;

        const esAlimento = grupo.tipo === 'alimento';
        const prod = await Product.create({
          nombre: p.nombre,
          sku,
          categoria: cat._id,
          precioCompra: 0,
          precioVenta: p.precioVenta,
          stock: 0,
          stockMinimo: 1,
          unidadMedida: esAlimento ? 'kg' : 'unidad',
          esBolsaAlimento: esAlimento,
          kilosPorBolsa: esAlimento ? p.kilos : undefined,
          margenSuelto: 42,
          esGenerico: false,
          activo: true,
        });

        stockMovements.push({
          producto: prod._id,
          tipo: 'entrada',
          cantidad: 0,
          stockAnterior: 0,
          stockNuevo: 0,
          motivo: 'Carga inicial catálogo Reycito Petshop',
          usuario: admin._id,
        });

        creadosEnCat++;
        totalCreados++;
      }

      if (stockMovements.length > 0) {
        await StockMovement.insertMany(stockMovements);
      }
      console.log(`  ✅ ${creadosEnCat} productos cargados en ${cat.nombre}\n`);
    }

    console.log('─────────────────────────────────────');
    console.log(`🎉 ¡Proceso finalizado!`);
    console.log(`   ✅ Productos creados:  ${totalCreados}`);
    console.log(`   ⚠️  Ya existían:        ${totalOmitidos}`);
    console.log(`\n   ℹ️  Costo (precioCompra) y stock en 0.`);
    console.log(`      Actualizá costos y stock desde el panel.`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedElRey();
