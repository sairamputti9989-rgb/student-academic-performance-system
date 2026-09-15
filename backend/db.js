require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,

    ssl:
        process.env.DB_HOST === "localhost"
            ? false
            : {
                rejectUnauthorized: false
            }
});

pool.connect()
    .then((client) => {
        console.log("PostgreSQL connected successfully");
        client.release();
    })
    .catch((error) => {
        console.error("DATABASE CONNECTION ERROR:");
        console.error(error.message);
    });

module.exports = pool;