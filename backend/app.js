require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database tables on startup
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('MySQL Connected');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS emp_master (
      emp_id INT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      middle_name VARCHAR(50),
      last_name VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE
    )`,
    `CREATE TABLE IF NOT EXISTS emp_bank_info (
      emp_bank_id INT PRIMARY KEY AUTO_INCREMENT,
      emp_id INT,
      bank_acct_no VARCHAR(20) UNIQUE,
      ifsc_code VARCHAR(11),
      branch_name VARCHAR(100),
      bank_name VARCHAR(100),
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS emp_reg_info (
      emp_reg_info_id INT PRIMARY KEY AUTO_INCREMENT,
      emp_id INT UNIQUE,
      pan VARCHAR(10) UNIQUE,
      aadhaar VARCHAR(12) UNIQUE,
      uan_epf_acctno VARCHAR(20) UNIQUE,
      esi VARCHAR(25) UNIQUE,
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS emp_ctc_info (
      emp_ctc_id INT PRIMARY KEY AUTO_INCREMENT,
      emp_id INT,
      int_title VARCHAR(30),
      ext_title VARCHAR(60),
      main_level INT,
      sub_level VARCHAR(1),
      start_of_ctc DATE,
      end_of_ctc DATE,
      ctc_amt INT,
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS emp_compliance_tracker (
      emp_compliance_tracker_id INT PRIMARY KEY AUTO_INCREMENT,
      emp_id INT,
      comp_type VARCHAR(60),
      status VARCHAR(20),
      doc_url VARCHAR(255),
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`
  ];

  let completed = 0;
  const total = createTables.length;

  createTables.forEach((query) => {
    db.query(query, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        completed++;
        if (completed === total) {
          console.log('All database tables created successfully');
          insertSampleData();
        }
      }
    });
  });
}

function insertSampleData() {
  // Check if data already exists
  db.query('SELECT COUNT(*) as count FROM emp_master', (err, results) => {
    if (err) return console.error('Error checking data:', err);

    if (results[0].count === 0) {
      // Insert sample employee data
      const sampleEmployees = [
        [1, 'John', 'M', 'Doe', '2023-01-15', null],
        [2, 'Jane', 'A', 'Smith', '2023-02-20', null],
        [3, 'Bob', 'R', 'Johnson', '2022-11-10', '2024-01-31'],
        [4, 'Alice', 'B', 'Williams', '2023-03-05', null],
        [5, 'Charlie', 'C', 'Brown', '2023-04-12', null]
      ];

      const insertQuery = 'INSERT INTO emp_master (emp_id, first_name, middle_name, last_name, start_date, end_date) VALUES ?';

      db.query(insertQuery, [sampleEmployees], (err, result) => {
        if (err) {
          console.error('Error inserting sample data:', err);
        } else {
          console.log(`Sample data inserted: ${result.affectedRows} employees`);
        }
      });
    } else {
      console.log('Sample data already exists');
    }
  });
}

app.get('/db-tables', (req, res) => {
  db.query('SHOW TABLES', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const tables = results.map(r => Object.values(r)[0]);
    res.json({ tables, count: tables.length });
  });
});

app.post('/create-sample-data', (req, res) => {
  // Create all required tables
  const createTables = [
    `CREATE TABLE IF NOT EXISTS emp_master (
      emp_id INT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      middle_name VARCHAR(50),
      last_name VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE
    )`,
    `CREATE TABLE IF NOT EXISTS emp_bank_info (
      emp_bank_id INT PRIMARY KEY,
      emp_id INT,
      bank_acct_no VARCHAR(20) UNIQUE,
      ifsc_code VARCHAR(11),
      branch_name VARCHAR(100),
      bank_name VARCHAR(100),
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS emp_reg_info (
      emp_reg_info_id INT PRIMARY KEY,
      emp_id INT UNIQUE,
      pan VARCHAR(10) UNIQUE,
      aadhaar VARCHAR(12) UNIQUE,
      uan_epf_acctno VARCHAR(20) UNIQUE,
      esi VARCHAR(25) UNIQUE,
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS emp_ctc_info (
      emp_ctc_id INT PRIMARY KEY,
      emp_id INT,
      int_title VARCHAR(30),
      ext_title VARCHAR(60),
      main_level INT,
      sub_level VARCHAR(1),
      start_of_ctc DATE,
      end_of_ctc DATE,
      ctc_amt INT,
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS emp_compliance_tracker (
      emp_compliance_tracker_id INT PRIMARY KEY,
      emp_id INT,
      comp_type VARCHAR(60),
      status VARCHAR(20),
      doc_url VARCHAR(255),
      FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id)
    )`
  ];

  // Execute table creation queries sequentially
  let completed = 0;
  const total = createTables.length;

  createTables.forEach((query, index) => {
    db.query(query, (err) => {
      if (err) {
        console.error(`Error creating table ${index + 1}:`, err);
        return;
      }

      completed++;
      if (completed === total) {
        // All tables created, now insert sample data
        insertSampleData();
      }
    });
  });
});

function insertSampleData() {
  // Check if data already exists
  db.query('SELECT COUNT(*) as count FROM emp_master', (err, results) => {
    if (err) {
      console.error('Error checking data:', err);
      return;
    }

    if (results[0].count === 0) {
      // Insert sample employee data
      const sampleEmployees = [
        [1, 'John', 'M', 'Doe', '2023-01-15', null],
        [2, 'Jane', 'A', 'Smith', '2023-02-20', null],
        [3, 'Bob', 'R', 'Johnson', '2022-11-10', '2024-01-31'],
        [4, 'Alice', 'B', 'Williams', '2023-03-05', null],
        [5, 'Charlie', 'C', 'Brown', '2023-04-12', null]
      ];

      const insertQuery = 'INSERT INTO emp_master (emp_id, first_name, middle_name, last_name, start_date, end_date) VALUES ?';

      db.query(insertQuery, [sampleEmployees], (err, result) => {
        if (err) {
          console.error('Error inserting sample data:', err);
        } else {
          console.log(`Sample data inserted: ${result.affectedRows} employees`);
        }
      });
    } else {
      console.log('Sample data already exists');
    }
  });
}

// API endpoints
app.get('/api/home', (req, res) => {
  res.json({
    user: { id: 1, username: 'admin@example.com' },
    member: { id: 1, name: 'Admin User', email: 'admin@example.com', phone: '+1234567890' }
  });
});

app.get('/api/employees', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT emp_id, first_name, middle_name, last_name, start_date, end_date FROM emp_master';
  let params = [];

  if (search) {
    if (!isNaN(search)) {
      query += ' WHERE emp_id = ? OR first_name LIKE ? OR last_name LIKE ?';
      params = [parseInt(search), `%${search}%`, `%${search}%`];
    } else {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR middle_name LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const data = results.map(emp => ({
      emp_id: emp.emp_id,
      first_name: emp.first_name,
      middle_name: emp.middle_name,
      last_name: emp.last_name,
      start_date: emp.start_date ? emp.start_date.toISOString().split('T')[0] : null,
      end_date: emp.end_date ? emp.end_date.toISOString().split('T')[0] : null,
      status: emp.end_date && emp.end_date <= new Date() ? 'EXITED' : 'ACTIVE'
    }));

    res.json(data);
  });
});

app.get('/api/employees/reports/headcount', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  db.query('SELECT COUNT(*) as total FROM emp_master', (err, totalResult) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT COUNT(*) as active FROM emp_master WHERE end_date IS NULL OR end_date > ?', [today], (err, activeResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const total = totalResult[0].total;
      const active = activeResult[0].active;
      const exited = total - active;

      res.json({
        total,
        active,
        exited,
        as_of: today
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
