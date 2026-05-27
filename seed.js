require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const seedDatabase = async () => {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://alvaroybanez@localhost:5432/template1";

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Conectado a PostgreSQL para inicializar la base de datos...");

    console.log("Reiniciando esquema público para evitar solapamientos...");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");

    const initSqlPath = path.join(__dirname, "database", "init.sql");
    const sql = fs.readFileSync(initSqlPath, "utf8");

    console.log("Ejecutando nuevo script init.sql...");
    await client.query(sql);

    console.log("✅ ¡Base de datos inicializada y mockeada correctamente!");
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error);
  } finally {
    await client.end();
  }
};

seedDatabase();
