const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'datoss',
  password: '$Paolaa2005',
  port: 5433 // El puerto predeterminado de PostgreSQL es 5432
});

// Middleware para parsear JSON
app.use(express.json());

// Middleware para manejar la carga de archivos con Multer
const upload = multer({ dest: 'uploads/' });

// Creación de la tabla 'users' si no existe
async function createUsersTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        contraseña VARCHAR(100) NOT NULL
      )
    `);
    console.log('Table "users" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
  }
}

// Creación de la tabla 'productos' si no existe
async function createProductsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        tipo VARCHAR(50) NOT NULL
      )
    `);
    console.log('Table "productos" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
  }
}

// Llamada a la función para crear la tabla 'users' y 'productos'
createUsersTable();
createProductsTable();
app.get('/', (req, res) => {
  res.redirect('/login.html');
});
app.use(express.static(path.join(__dirname, 'public')));
// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT nombre, email FROM users WHERE email = $1 AND contraseña = $2', [email, contraseña]);
        client.release();
        
        if (result.rows.length > 0) {
            const { nombre, email } = result.rows[0];
            res.json({ nombre, email }); // Enviar el nombre de usuario y el correo como respuesta JSON
        } else {
            res.status(404).json({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para el registro de usuarios
app.post('/register', async (req, res) => {
  const { nombre, apellido, email, contraseña } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO users (nombre, apellido, email, contraseña) VALUES ($1, $2, $3, $4) RETURNING *', [nombre, apellido, email, contraseña]);
    client.release();

    if (result.rows.length > 0) {
      const nuevoUsuario = result.rows[0];
      res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
    } else {
      res.status(500).json({ error: 'No se pudo registrar al usuario' });
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para subir un producto
app.post('/subirproducto', async (req, res) => {
  const { nombre, precio, tipo } = req.body;

  try {
    // Convierte el precio a un entero
    const precioEntero = parseInt(precio);

    const client = await pool.connect();
    const result = await client.query('INSERT INTO productos (nombre, precio, tipo) VALUES ($1, $2, $3) RETURNING *', [nombre, precioEntero, tipo]);
    client.release();

    if (result.rows.length > 0) {
      const nuevoProducto = result.rows[0];
      res.status(201).json({ message: 'Producto subido exitosamente', producto: nuevoProducto });
    } else {
      res.status(500).json({ error: 'No se pudo subir el producto' });
    }
  } catch (error) {
    console.error('Error al subir el producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
