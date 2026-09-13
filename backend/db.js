require("dotenv").config();

const { Pool } = require("pg");

console.log("DB CONFIG CHECK:");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "SET" : "NOT SET");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,

    ssl: {
        rejectUnauthorized: false
    },

    connectionTimeoutMillis: 10000
});

pool.connect()
    .then((client) => {
        console.log("PostgreSQL connected successfully");
        client.release();
    })
    .catch((error) => {
        console.error("DATABASE CONNECTION ERROR");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Full error:", error);
    });

module.exports = pool;