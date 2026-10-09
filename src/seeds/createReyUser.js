const mongoose = require('mongoose');
const dns = require('dns');
const User = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

dns.setServers(['8.8.8.8', '1.1.1.1']);

const NOMBRE = 'reypetshop';
const PASSWORD = 'facundo';
const EMAIL = 'reypetshop@elreypetshop.com';

const createReyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    const existing = await User.findOne({ nombre: NOMBRE });
    if (existing) {
      console.log(`⚠️  El usuario "${NOMBRE}" ya existe. No se creó uno nuevo.`);
      process.exit(0);
    }

    const user = new User({
      nombre: NOMBRE,
      email: EMAIL,
      password: PASSWORD,
      rol: 'admin',
      activo: true,
    });

    await user.save();
    console.log('🎉 Usuario creado exitosamente!');
    console.log(`   Usuario:  ${NOMBRE}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   Rol:      admin`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createReyUser();
