const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "#Pritam05",
    database: "smart_waste_db"
});

db.connect((error) => {
    if (error) {
        console.log("Database connection failed:", error.message);
        return;
    }

    console.log("Connected to MySQL database");
});

module.exports = db;