const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this connects to your MySQL

// POST: Register a new donor
router.post('/register', (req, res) => {
  const { name, phone, city, bloodGroup } = req.body;

  if (!name || !phone || !city || !bloodGroup) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO donors (name, phone, city, blood_group) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, phone, city, bloodGroup], (err, result) => {
    if (err) {
      console.error('Error inserting donor:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      message: '✅ Donor registered successfully',
      donorId: result.insertId
    });
  });
});

// GET: Fetch donors with optional filters
router.get('/', (req, res) => {
  const { city, bloodGroup } = req.query;

  let sql = 'SELECT * FROM donors WHERE 1';
  const params = [];

  if (city) {
    sql += ' AND city = ?';
    params.push(city);
  }

  if (bloodGroup) {
    sql += ' AND blood_group = ?'; // ✅ correct column name
    params.push(bloodGroup);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching donors:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

// ✅ Export the router properly!
module.exports = router;
