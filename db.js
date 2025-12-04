const mysql = require("mysql2/promise");

// Configuración de conexión a la base de datos
const {
  DB_HOST = "127.0.0.1",
  DB_USER = "root",
  DB_PASS = "rootpass",
  DB_NAME = "reserva_salas",
} = process.env;

// Crear conexión a la base de datos
async function getConn() {
  return mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });
}

// Ejecutar consulta SELECT y obtener resultados
async function query(sql, params) {
  const conn = await getConn();
  const [rows] = await conn.execute(sql, params || []);
  await conn.end();
  return rows;
}

// Ejecutar consulta INSERT, UPDATE o DELETE
async function execute(sql, params) {
  const conn = await getConn();
  const [res] = await conn.execute(sql, params || []);
  await conn.end();
  return res.insertId || res.affectedRows || 0;
}

module.exports = { query, execute };
