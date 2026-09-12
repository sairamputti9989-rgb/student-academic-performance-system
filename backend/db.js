const { Pool } = require("pg");


// =====================================================
// POSTGRESQL DATABASE CONNECTION
// =====================================================

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "student_academic_db",
    password: "12345",
    port: 5432
});


// =====================================================
// TEST DATABASE CONNECTION
// =====================================================

pool.connect()
    .then((client) => {
        console.log("PostgreSQL connected successfully");

        // Release the test connection
        client.release();
    })
    .catch((error) => {
        console.log(
            "Database connection error:",
            error.message
        );
    });


// =====================================================
// EXPORT DATABASE CONNECTION
// =====================================================

module.exports = pool;