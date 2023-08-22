require('dotenv').config();
const mysql = require('mysql');
const { Pool } = require('pg');

// Create a MySQL connection
const legacyConnection = mysql.createConnection({
  host: process.env.LEGACY_DB_HOST,
  port: process.env.LEGACY_DB_PORT,
  user: process.env.LEGACY_DB_USER,
  password: process.env.LEGACY_DB_PASSWORD,
  database: process.env.LEGACY_DB_DATABASE
});

// Connect to MySQL
legacyConnection.connect(err => {
  if (err) {
    console.error('Error connecting to legacy MySQL database:', err);
    return;
  }
  console.log('Connected to the legacy MySQL database.');
});

// Create a PostgreSQL connection pool
const modernPool = new Pool({
  host: process.env.MODERN_DB_HOST,
  port: process.env.MODERN_DB_PORT,
  user: process.env.MODERN_DB_USER,
  password: process.env.MODERN_DB_PASSWORD,
  database: process.env.MODERN_DB_DATABASE
});

// Export connections for use in other parts of your app
module.exports = { legacyConnection, modernPool };
