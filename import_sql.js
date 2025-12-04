const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Configuración de la base de datos
const {
  DB_HOST = "127.0.0.1",
  DB_USER = "root",
  DB_PASS = "rootpass",
  DB_NAME = "reserva_salas",
} = process.env;

// Función para separar comandos SQL correctamente
function parseStatements(sql) {
  const lines = sql.split("\n");
  let currentStatement = "";
  const statements = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Saltar líneas de comentarios y vacías
    if (trimmedLine.startsWith("--") || trimmedLine === "") {
      continue;
    }

    currentStatement += " " + line;

    // Si la línea termina en punto y coma, tenemos un comando completo
    if (trimmedLine.endsWith(";")) {
      const statement = currentStatement.trim();
      if (statement) {
        statements.push(statement);
      }
      currentStatement = "";
    }
  }

  // Agregar cualquier comando restante
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

async function main() {
  const dbFile = path.join(__dirname, "create_db.sql");
  const insertFile = path.join(__dirname, "insert_data.sql");

  // Primero, conectar a MySQL sin seleccionar base de datos
  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
  });

  const dbSql = fs.readFileSync(dbFile, "utf8");
  const dbStatements = parseStatements(dbSql);

  // Ejecutar comandos de creación de base de datos
  for (const st of dbStatements) {
    try {
      if (st.toUpperCase().startsWith("USE ")) {
        break;
      }
      if (
        st.toUpperCase().includes("DROP DATABASE") ||
        st.toUpperCase().includes("CREATE DATABASE")
      ) {
        await rootConn.query(st);
      }
    } catch (e) {
      if (!e.message.includes("database exists")) {
        throw e;
      }
    }
  }

  await rootConn.end();

  // Conectar a la base de datos específica para crear tablas
  const dbConn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });

  // Ejecutar comandos de creación de tablas
  let foundUse = false;
  for (const st of dbStatements) {
    try {
      if (st.toUpperCase().startsWith("USE ")) {
        foundUse = true;
        continue;
      }
      if (
        !foundUse ||
        st.toUpperCase().includes("DROP DATABASE") ||
        st.toUpperCase().includes("CREATE DATABASE")
      ) {
        continue;
      }
      await dbConn.query(st);
    } catch (e) {
      throw e;
    }
  }

  // Ejecutar comandos de inserción de datos
  const insertSql = fs.readFileSync(insertFile, "utf8");
  const insertStatements = parseStatements(insertSql);

  for (const st of insertStatements) {
    try {
      if (st.toUpperCase().startsWith("USE ")) {
        continue;
      }
      await dbConn.query(st);
    } catch (e) {
      throw e;
    }
  }

  await dbConn.end();
  process.exit(0);
}

main().catch((e) => {
  process.exit(1);
});
