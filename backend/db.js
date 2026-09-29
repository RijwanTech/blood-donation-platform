const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',                 // or your MySQL username
  password: 'rij@$8329',                 // your MySQL password ('' if empty)
  database: 'blooddonationdb'  // ✅ your confirmed DB name
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL Database');
});

module.exports = db;
