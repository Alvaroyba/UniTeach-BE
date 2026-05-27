const { dbConnect } = require("../../config/mysql");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

const checkFieldsExistence = async (data) => {
  const connection = await dbConnect().promise(); // Crear una conexión basada en promesas
  const fieldsToCheck = ["DNI", "Legajo", "Mail", "Username"];

  try {
    const promises = fieldsToCheck.map(async (field) => {
      const sql = `SELECT * FROM users WHERE ${field} = ?`;
      const [results] = await connection.query(sql, [data[field]]);
      return { field, exists: results.length > 0 };
    });

    const results = await Promise.all(promises);
    const existingFields = results
      .filter((result) => result.exists)
      .map((result) => result.field);

    return existingFields;
  } catch (err) {
    throw err; // Lanzar el error para que pueda ser manejado en otro lugar
  } finally {
    await connection.end(); // Asegurarse de cerrar la conexión
  }
};

require("dotenv").config();

const mail_rover = (callback) => {
  const transportConfig = {
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  };

  const transporter = nodemailer.createTransport(transportConfig);
  callback(transporter);
};

module.exports = { checkFieldsExistence, mail_rover };
