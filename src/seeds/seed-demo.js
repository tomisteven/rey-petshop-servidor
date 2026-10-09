require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Forzar resolvers DNS públicos (evita error "querySrv ECONNREFUSED" con routers locales)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = () => mongoose.connect(process.env.MONGODB_URI);

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const StockMovement = require('../models/StockMovement');
const Customer = require('../models/Customer');

const importData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Conectado para Seed Demo');

    // Limpiar BD
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Sale.deleteMany();
    await StockMovement.deleteMany();
    await Customer.deleteMany();

    // ==================== USUARIOS ====================
    const admin = await User.create({
      nombre: 'Administrador',
      email: 'admin@mascotienda.com',
      password: 'admin123',
      rol: 'admin'
    });

    const empleado1 = await User.create({
      nombre: 'María López',
      email: 'maria@mascotienda.com',
      password: 'empleado123',
      rol: 'empleado'
    });

    const empleado2 = await User.create({
      nombre: 'Carlos García',
      email: 'carlos@mascotienda.com',
      password: 'empleado123',
      rol: 'empleado'
    });

    console.log('Usuarios creados.');

    // ==================== CATEGORÍAS ====================
    const categoriasData = [
      { nombre: 'Alimentos Perros', color: '#f97316', icono: 'dog' },
      { nombre: 'Alimentos Gatos', color: '#a855f7', icono: 'cat' },
      { nombre: 'Snacks y Premios', color: '#eab308', icono: 'cookie' },
      { nombre: 'Higiene y Limpieza', color: '#06b6d4', icono: 'droplets' },
      { nombre: 'Accesorios', color: '#10b981', icono: 'tag' },
      { nombre: 'Medicamentos', color: '#ef4444', icono: 'pill' },
      { nombre: 'Juguetes', color: '#ec4899', icono: 'toy' },
      { nombre: 'Camas y Transportadoras', color: '#78350f', icono: 'home' }
    ];

    const cats = await Category.insertMany(categoriasData);
    console.log('Categorías creadas.');

    // ==================== PRODUCTOS (35) ====================
    // precioKilo = precio por kilo suelto (costo/kg * (1 + margenSuelto/100))
    const productosData = [
      // --- ALIMENTOS PERROS (fraccionables - esBolsaAlimento: true) ---
      { nombre: 'Dog Chow Adulto 20kg', sku: 'PER-001', categoria: cats[0]._id, precioCompra: 46900, precioVenta: 58000, stock: 25, stockMinimo: 5, esBolsaAlimento: true, kilosPorBolsa: 20, precioKilo: Math.round(46900 / 20 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Distribuidora Pet' },
      { nombre: 'Pro Plan Adulto 15kg', sku: 'PER-002', categoria: cats[0]._id, precioCompra: 118000, precioVenta: 145000, stock: 12, stockMinimo: 3, esBolsaAlimento: true, kilosPorBolsa: 15, precioKilo: Math.round(118000 / 15 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Agro Pet' },
      { nombre: 'Royal Canin Medium 15kg', sku: 'PER-003', categoria: cats[0]._id, precioCompra: 185000, precioVenta: 225000, stock: 8, stockMinimo: 3, esBolsaAlimento: true, kilosPorBolsa: 15, precioKilo: Math.round(185000 / 15 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Agro Pet' },
      { nombre: 'Eukanuba Adulto 15kg', sku: 'PER-004', categoria: cats[0]._id, precioCompra: 92000, precioVenta: 115000, stock: 10, stockMinimo: 3, esBolsaAlimento: true, kilosPorBolsa: 15, precioKilo: Math.round(92000 / 15 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Distribuidora Pet' },
      { nombre: 'Pedigree Adulto 21kg', sku: 'PER-005', categoria: cats[0]._id, precioCompra: 48000, precioVenta: 62000, stock: 20, stockMinimo: 5, esBolsaAlimento: true, kilosPorBolsa: 21, precioKilo: Math.round(48000 / 21 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Distribuidora Pet' },
      { nombre: 'Dog Chow Cachorros 21kg', sku: 'PER-006', categoria: cats[0]._id, precioCompra: 56100, precioVenta: 72000, stock: 15, stockMinimo: 4, esBolsaAlimento: true, kilosPorBolsa: 21, precioKilo: Math.round(56100 / 21 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Distribuidora Pet' },

      // --- ALIMENTOS GATOS (fraccionables) ---
      { nombre: 'Whiskas Gato Adulto 20kg', sku: 'GAT-001', categoria: cats[1]._id, precioCompra: 63500, precioVenta: 82000, stock: 18, stockMinimo: 5, esBolsaAlimento: true, kilosPorBolsa: 20, precioKilo: Math.round(63500 / 20 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Agro Pet' },
      { nombre: 'Cat Chow Adulto 15kg', sku: 'GAT-002', categoria: cats[1]._id, precioCompra: 66200, precioVenta: 85000, stock: 14, stockMinimo: 4, esBolsaAlimento: true, kilosPorBolsa: 15, precioKilo: Math.round(66200 / 15 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Agro Pet' },
      { nombre: 'Royal Canin Esterilizado 10kg', sku: 'GAT-003', categoria: cats[1]._id, precioCompra: 132000, precioVenta: 165000, stock: 6, stockMinimo: 3, esBolsaAlimento: true, kilosPorBolsa: 10, precioKilo: Math.round(132000 / 10 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Agro Pet' },
      { nombre: 'Excellent Gato Adulto 15kg', sku: 'GAT-004', categoria: cats[1]._id, precioCompra: 70000, precioVenta: 92000, stock: 10, stockMinimo: 4, esBolsaAlimento: true, kilosPorBolsa: 15, precioKilo: Math.round(70000 / 15 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Distribuidora Pet' },
      { nombre: 'Pro Plan Gato Pescado 10kg', sku: 'GAT-005', categoria: cats[1]._id, precioCompra: 98000, precioVenta: 125000, stock: 5, stockMinimo: 3, esBolsaAlimento: true, kilosPorBolsa: 10, precioKilo: Math.round(98000 / 10 * 1.42), margenSuelto: 42, unidadMedida: 'kg', proveedor: 'Agro Pet' },

      // --- SNACKS Y PREMIOS ---
      { nombre: 'Rabos de Cerdo x1', sku: 'SNA-001', categoria: cats[2]._id, precioCompra: 400, precioVenta: 850, stock: 50, stockMinimo: 10, unidadMedida: 'unidad', proveedor: 'PetSnacks' },
      { nombre: 'Huesos 5/6', sku: 'SNA-002', categoria: cats[2]._id, precioCompra: 1200, precioVenta: 2800, stock: 40, stockMinimo: 10, unidadMedida: 'unidad', proveedor: 'PetSnacks' },
      { nombre: 'Golocan Palitos de Pollo', sku: 'SNA-003', categoria: cats[2]._id, precioCompra: 900, precioVenta: 2000, stock: 35, stockMinimo: 8, unidadMedida: 'unidad', proveedor: 'PetSnacks' },
      { nombre: 'Garritas x5', sku: 'SNA-004', categoria: cats[2]._id, precioCompra: 2000, precioVenta: 4500, stock: 25, stockMinimo: 5, unidadMedida: 'unidad', proveedor: 'PetSnacks' },
      { nombre: 'Dentastix Grande', sku: 'SNA-005', categoria: cats[2]._id, precioCompra: 1500, precioVenta: 3300, stock: 30, stockMinimo: 8, unidadMedida: 'unidad', proveedor: 'Pedigree' },
      { nombre: 'Whiskas Snacks Gato', sku: 'SNA-006', categoria: cats[2]._id, precioCompra: 1100, precioVenta: 2300, stock: 40, stockMinimo: 10, unidadMedida: 'unidad', proveedor: 'Mars' },

      // --- HIGIENE Y LIMPIEZA ---
      { nombre: 'Shampoo Osspret Tradicional', sku: 'HIG-001', categoria: cats[3]._id, precioCompra: 4500, precioVenta: 9700, stock: 20, stockMinimo: 5, unidadMedida: 'unidad', proveedor: 'Osspret' },
      { nombre: 'Shampoo Dermosedan Aloe', sku: 'HIG-002', categoria: cats[3]._id, precioCompra: 4200, precioVenta: 8900, stock: 15, stockMinimo: 4, unidadMedida: 'unidad', proveedor: 'VetAgro' },
      { nombre: 'Piedras Sueltas 3kg', sku: 'HIG-003', categoria: cats[3]._id, precioCompra: 1500, precioVenta: 3000, stock: 30, stockMinimo: 8, unidadMedida: 'kg', proveedor: 'Zootec' },
      { nombre: 'Arena Zootec 15kg', sku: 'HIG-004', categoria: cats[3]._id, precioCompra: 12000, precioVenta: 22500, stock: 12, stockMinimo: 3, unidadMedida: 'kg', proveedor: 'Zootec' },
      { nombre: 'Absorsol 3.6kg', sku: 'HIG-005', categoria: cats[3]._id, precioCompra: 2200, precioVenta: 4900, stock: 25, stockMinimo: 6, unidadMedida: 'kg', proveedor: 'Zootec' },
      { nombre: 'Toallitas Húmedas', sku: 'HIG-006', categoria: cats[3]._id, precioCompra: 2500, precioVenta: 5800, stock: 20, stockMinimo: 5, unidadMedida: 'unidad', proveedor: 'PetClean' },

      // --- ACCESORIOS ---
      { nombre: 'Collar Ecthol', sku: 'ACC-001', categoria: cats[4]._id, precioCompra: 8000, precioVenta: 16000, stock: 15, stockMinimo: 4, unidadMedida: 'unidad', proveedor: 'VetAgro' },
      { nombre: 'Desatanudos', sku: 'ACC-002', categoria: cats[4]._id, precioCompra: 9000, precioVenta: 17000, stock: 10, stockMinimo: 3, unidadMedida: 'unidad', proveedor: 'VetAgro' },
      { nombre: 'Bolsita de Caca x50', sku: 'ACC-003', categoria: cats[4]._id, precioCompra: 500, precioVenta: 1000, stock: 60, stockMinimo: 15, unidadMedida: 'unidad', proveedor: 'PetClean' },
      { nombre: 'Limpia Lágrimas', sku: 'ACC-004', categoria: cats[4]._id, precioCompra: 6000, precioVenta: 11800, stock: 12, stockMinimo: 3, unidadMedida: 'unidad', proveedor: 'VetAgro' },

      // --- MEDICAMENTOS ---
      { nombre: 'FrontLine Perro 20kg', sku: 'MED-001', categoria: cats[5]._id, precioCompra: 4500, precioVenta: 9200, stock: 18, stockMinimo: 5, unidadMedida: 'unidad', proveedor: 'VetAgro' },
      { nombre: 'FrontLine Gato Spot On', sku: 'MED-002', categoria: cats[5]._id, precioCompra: 4000, precioVenta: 7800, stock: 15, stockMinimo: 4, unidadMedida: 'unidad', proveedor: 'VetAgro' },
      { nombre: 'Simparica hasta 20kg', sku: 'MED-003', categoria: cats[5]._id, precioCompra: 15000, precioVenta: 31000, stock: 10, stockMinimo: 3, unidadMedida: 'unidad', proveedor: 'Zoetis' },
      { nombre: 'Total Full CG 15ml', sku: 'MED-004', categoria: cats[5]._id, precioCompra: 5500, precioVenta: 11000, stock: 12, stockMinimo: 4, unidadMedida: 'unidad', proveedor: 'VetAgro' },
      { nombre: 'Vermican 20ml', sku: 'MED-005', categoria: cats[5]._id, precioCompra: 2500, precioVenta: 5500, stock: 20, stockMinimo: 5, unidadMedida: 'unidad', proveedor: 'VetAgro' },

      // --- JUGUETES ---
      { nombre: 'Juguete Perro Soga', sku: 'JUG-001', categoria: cats[6]._id, precioCompra: 800, precioVenta: 2200, stock: 25, stockMinimo: 5, unidadMedida: 'unidad', proveedor: 'PetToys' },
      { nombre: 'Pelota Gato con Cascabel', sku: 'JUG-002', categoria: cats[6]._id, precioCompra: 300, precioVenta: 800, stock: 40, stockMinimo: 10, unidadMedida: 'unidad', proveedor: 'PetToys' },
      { nombre: 'Ratón de Peluche Gato', sku: 'JUG-003', categoria: cats[6]._id, precioCompra: 200, precioVenta: 600, stock: 35, stockMinimo: 8, unidadMedida: 'unidad', proveedor: 'PetToys' },

      // --- CAMAS Y TRANSPORTADORAS ---
      { nombre: 'Cama King Side', sku: 'CAM-001', categoria: cats[7]._id, precioCompra: 20000, precioVenta: 37000, stock: 5, stockMinimo: 2, unidadMedida: 'unidad', proveedor: 'PetHome' },
      { nombre: 'Transportadora Grande', sku: 'CAM-002', categoria: cats[7]._id, precioCompra: 16000, precioVenta: 29500, stock: 4, stockMinimo: 2, unidadMedida: 'unidad', proveedor: 'PetHome' },
      { nombre: 'Nido Gato 50cm', sku: 'CAM-003', categoria: cats[7]._id, precioCompra: 5500, precioVenta: 10500, stock: 8, stockMinimo: 3, unidadMedida: 'unidad', proveedor: 'PetHome' }
    ];

    const createdProducts = await Product.insertMany(productosData);
    console.log(`${createdProducts.length} productos creados.`);

    // ==================== CLIENTES ====================
    const clientesData = [
      { nombre: 'Lucía Fernández', telefono: '291-5551234', email: 'lucia@email.com', esAfiliado: true, puntos: 150, fechaAfiliacion: new Date('2025-06-15') },
      { nombre: 'Martín Rodríguez', telefono: '291-5555678', email: 'martin@email.com', esAfiliado: true, puntos: 85, fechaAfiliacion: new Date('2025-08-20') },
      { nombre: 'Ana García', telefono: '291-5559012', email: 'ana@email.com', esAfiliado: true, puntos: 220, fechaAfiliacion: new Date('2025-03-10') },
      { nombre: 'Pedro Sánchez', telefono: '291-5553456', email: 'pedro@email.com', esAfiliado: false },
      { nombre: 'Sofía Martínez', telefono: '291-5557890', email: 'sofia@email.com', esAfiliado: true, puntos: 45, fechaAfiliacion: new Date('2025-09-01') },
      { nombre: 'Diego López', telefono: '291-5552345', email: 'diego@email.com', esAfiliado: false },
      { nombre: 'Camila Torres', telefono: '291-5556789', email: 'camila@email.com', esAfiliado: true, puntos: 310, fechaAfiliacion: new Date('2025-01-05') },
      { nombre: 'Joaquín Ruiz', telefono: '291-5550123', email: 'joaquin@email.com', esAfiliado: false },
      { nombre: 'Valentina Díaz', telefono: '291-5554567', email: 'valentina@email.com', esAfiliado: true, puntos: 95, fechaAfiliacion: new Date('2025-07-22') },
      { nombre: 'Mateo Romero', telefono: '291-5558901', email: 'mateo@email.com', esAfiliado: false }
    ];

    const createdClients = await Customer.insertMany(clientesData);
    console.log(`${createdClients.length} clientes creados.`);

    // ==================== VENTAS (50) ====================
    // Distribuidas del 01/09 al 21/09/2025
    const empleados = [admin, empleado1, empleado2];
    const metodosPago = ['efectivo', 'tarjeta', 'transferencia'];
    const clientesAfiliados = createdClients.filter(c => c.esAfiliado);

    const ventas = [];
    const stockUpdates = []; // Para actualizar stock
    const movements = [];    // Movimientos de stock

    // Helper: fecha aleatoria entre 01/09 y 21/09
    const randomDate = () => {
      const start = new Date('2025-09-01T08:00:00');
      const end = new Date('2025-09-21T21:00:00');
      const fecha = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return fecha;
    };

    // Pre-calcular stock inicial para cada producto
    const stockInicial = {};
    createdProducts.forEach(p => {
      stockInicial[p._id.toString()] = p.stock;
    });

    let ticketNum = 1;

    for (let i = 0; i < 50; i++) {
      const fecha = randomDate();
      const empleado = empleados[i % 3];
      
      // 60% de chance de tener cliente afiliado
      const tieneCliente = Math.random() < 0.6;
      const cliente = tieneCliente 
        ? clientesAfiliados[Math.floor(Math.random() * clientesAfiliados.length)]
        : null;

      // Cantidad de items por venta: 1 a 4
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotalVenta = 0;

      for (let j = 0; j < numItems; j++) {
        const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const prodId = prod._id.toString();

        // Determinar cantidad
        let cantidad;
        if (prod.esBolsaAlimento) {
          // Alimentos fraccionables: cantidad entre 1 y 5 (kilos)
          cantidad = Math.floor(Math.random() * 5) + 1;
        } else {
          // Productos unitarios: cantidad entre 1 y 3
          cantidad = Math.floor(Math.random() * 3) + 1;
        }

        // Calcular precio de venta (con margen suelto si es fraccionable)
        let precioUnitario = prod.precioVenta;
        let costoUnitario = prod.precioCompra;
        if (prod.esBolsaAlimento && cantidad < prod.kilosPorBolsa) {
          // Venta suelta por kilo: usar precioKilo directamente
          precioUnitario = prod.precioKilo;
          costoUnitario = Math.round(prod.precioCompra / prod.kilosPorBolsa);
        }

        const subtotal = precioUnitario * cantidad;
        subtotalVenta += subtotal;

        items.push({
          producto: prod._id,
          cantidad,
          precioVentaHisto: precioUnitario,
          precioCompraHisto: costoUnitario,
          subtotal,
          esVentaSuelta: prod.esBolsaAlimento && cantidad < prod.kilosPorBolsa,
          kilosVendidos: prod.esBolsaAlimento ? cantidad : undefined
        });

        // Registrar movimiento de stock
        const stockAnterior = stockInicial[prodId] || prod.stock;
        const stockNuevo = stockAnterior - cantidad;
        stockInicial[prodId] = stockNuevo;

        movements.push({
          producto: prod._id,
          tipo: 'venta',
          cantidad,
          stockAnterior,
          stockNuevo,
          motivo: `Venta T-${ticketNum.toString().padStart(4, '0')}`,
          usuario: empleado._id,
          fecha
        });
      }

      const descuento = Math.random() < 0.2 ? Math.floor(Math.random() * 15) + 1 : 0;
      const totalFinal = Math.round(subtotalVenta * (1 - descuento / 100));
      const metodoPago = metodosPago[Math.floor(Math.random() * 3)];
      const montoPagado = metodoPago === 'efectivo' 
        ? totalFinal + Math.floor(Math.random() * 5000) // Paga con billete
        : totalFinal;
      const vuelto = metodoPago === 'efectivo' ? Math.max(0, montoPagado - totalFinal) : 0;

      // Puntos ganados (si tiene cliente afiliado)
      const puntosGanados = cliente ? Math.floor(totalFinal / 200) : 0;

      ventas.push({
        numeroTicket: `T-${ticketNum.toString().padStart(4, '0')}`,
        fecha,
        empleado: empleado._id,
        cliente: cliente?._id,
        puntosGanados,
        items,
        subtotal: subtotalVenta,
        descuento,
        totalFinal,
        metodoPago,
        montoPagado,
        vuelto,
        estado: 'completada'
      });

      ticketNum++;
    }

    await Sale.insertMany(ventas);
    console.log(`${ventas.length} ventas creadas.`);

    // ==================== ACTUALIZAR STOCK ====================
    // Crear movimientos de stock iniciales (entradas)
    const stockInicialMovements = createdProducts.map(p => ({
      producto: p._id,
      tipo: 'entrada',
      cantidad: p.stock,
      stockAnterior: 0,
      stockNuevo: p.stock,
      motivo: 'Stock Inicial Demo',
      usuario: admin._id,
      fecha: new Date('2025-08-30T10:00:00')
    }));

    await StockMovement.insertMany([...stockInicialMovements, ...movements]);
    console.log(`${stockInicialMovements.length + movements.length} movimientos de stock creados.`);

    // Actualizar stock real de productos
    const bulkOps = createdProducts.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { stock: stockInicial[p._id.toString()] || 0 }
      }
    }));
    await Product.bulkWrite(bulkOps);
    console.log('Stock de productos actualizado.');

    // Actualizar puntos de clientes afiliados
    const puntosPorCliente = {};
    ventas.forEach(v => {
      if (v.cliente) {
        const id = v.cliente.toString();
        puntosPorCliente[id] = (puntosPorCliente[id] || 0) + v.puntosGanados;
      }
    });

    for (const [clienteId, puntos] of Object.entries(puntosPorCliente)) {
      await Customer.findByIdAndUpdate(clienteId, { $inc: { puntos } });
    }
    console.log('Puntos de clientes actualizados.');

    console.log('\n--- RESUMEN ---');
    console.log(`Usuarios: 3 (admin + 2 empleados)`);
    console.log(`Categorías: ${cats.length}`);
    console.log(`Productos: ${createdProducts.length}`);
    console.log(`Clientes: ${createdClients.length} (${clientesAfiliados.length} afiliados)`);
    console.log(`Ventas: ${ventas.length} (01/09 - 21/09)`);
    console.log(`Movimientos de stock: ${stockInicialMovements.length + movements.length}`);
    console.log('\nCredenciales Admin: admin@mascotienda.com / admin123');
    console.log('Credenciales Empleado: maria@mascotienda.com / empleado123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

importData();
