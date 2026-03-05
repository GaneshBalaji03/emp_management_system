const mysql = require('mysql2');

const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
const user = process.env.MYSQL_USER || process.env.DB_USER || 'root';
const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'admin123';
const database = process.env.MYSQL_DB || process.env.DB_NAME || 'employee_crud';

const db = mysql.createConnection({
  host,
  user,
  password,
  database
});

// Connection will be handled in app.js
module.exports = db;