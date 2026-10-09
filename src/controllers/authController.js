const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const id = (identifier || email || '').trim();

    const user = await User.findOne({ $or: [{ email: id }, { nombre: id }] });

    if (user && user.activo && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña inválidos o usuario inactivo' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Obtener perfil del usuario logueado
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Actualizar usuario y contraseña del usuario logueado
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { nombre, currentPassword, newPassword } = req.body;

    if (nombre !== undefined) {
      const nuevoNombre = String(nombre).trim();
      if (!nuevoNombre) {
        return res.status(400).json({ message: 'El usuario no puede estar vacío' });
      }
      if (nuevoNombre !== user.nombre) {
        const enUso = await User.findOne({ nombre: nuevoNombre, _id: { $ne: user._id } });
        if (enUso) {
          return res.status(400).json({ message: 'Ese usuario ya está en uso' });
        }
        user.nombre = nuevoNombre;
      }
    }

    if (newPassword) {
      if (String(newPassword).length < 4) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres' });
      }
      const coincide = await user.matchPassword(currentPassword || '');
      if (!coincide) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

// @desc    Desloguear usuario / logout (se maneja en cliente limpiando el token, pero dejamos el endpoint por si hay logica extra)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  // Cuando se usa JWT el logout real se hace en el cliente borrando el token de localStorage/Cookies
  res.json({ message: 'Sesión cerrada exitosamente' });
};

module.exports = {
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
};
