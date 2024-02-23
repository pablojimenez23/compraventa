const express = require('express');
const { Pool } = require('pg');
const path = require('path');

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

// Llamada a la función para crear la tabla 'users'
createUsersTable();

// Rutas de la aplicación
app.use(express.static(path.join(__dirname, 'public')));

// Manejar la solicitud de inicio de sesión
// Manejar la solicitud de inicio de sesión
// Manejar la solicitud de inicio de sesión
app.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;
  
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT nombre FROM users WHERE email = $1 AND contraseña = $2', [email, contraseña]);
      client.release();
  
      if (result.rows.length > 0) {
        const nombreUsuario = result.rows[0].nombre; // Obtener el nombre de usuario del primer registro
        res.status(200).json({ nombre: nombreUsuario }); // Enviar el nombre de usuario al cliente
      } else {
        res.sendStatus(401); // Enviar respuesta de no autorizado si las credenciales son inválidas
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).send('Error interno del servidor'); // Enviar un mensaje de error al cliente
    }
});
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
