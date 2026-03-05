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
    `CREATE TABLE IF NOT EXISTS employees (
      id INT PRIMARY KEY AUTO_INCREMENT,
      emp_id VARCHAR(20) UNIQUE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email VARCHAR(150),
      department VARCHAR(100),
      designation VARCHAR(100),
      joining_date DATE,
      exit_date DATE,
      status VARCHAR(20),
      created_at DATETIME,
      updated_at DATETIME
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
  // Populate emp_master if empty
  db.query('SELECT COUNT(*) as count FROM emp_master', (err, results) => {
    if (err) {
      console.error('Error checking emp_master:', err);
      return;
    }

    if (results[0].count === 0) {
      const sampleEmployees = [
        [1, 'John', 'M', 'Doe', '2023-01-15', null],
        [2, 'Jane', 'A', 'Smith', '2023-02-20', null],
        [3, 'Bob', 'R', 'Johnson', '2022-11-10', '2024-01-31'],
        [4, 'Alice', 'B', 'Williams', '2023-03-05', null],
        [5, 'Charlie', 'C', 'Brown', '2023-04-12', null]
      ];

      const insertQuery = 'INSERT INTO emp_master (emp_id, first_name, middle_name, last_name, start_date, end_date) VALUES ?';
      db.query(insertQuery, [sampleEmployees], (err, result) => {
        if (err) console.error('Error inserting emp_master sample data:', err);
        else console.log(`emp_master sample inserted: ${result.affectedRows}`);
      });
    }
  });

  // Populate employees table if empty
  db.query('SELECT COUNT(*) as count FROM employees', (err, results) => {
    if (err) {
      console.error('Error checking employees table:', err);
      return;
    }

    if (results[0].count === 0) {
      const sampleEmployees = [
        ['EMP001', 'Bhanu', 'Teja', 'bteja1055@gmail.com', 'IT', 'Developer', '2023-01-15', null, 'ACTIVE'],
        ['EMP002', 'Alice', 'M', 'alice@example.com', 'HR', 'Manager', '2022-05-10', null, 'ACTIVE'],
        ['EMP003', 'Bob', 'R', 'bob@example.com', 'Sales', 'Salesperson', '2021-03-22', '2024-01-31', 'EXITED']
      ];
      const insertQuery = 'INSERT INTO employees (emp_id, first_name, last_name, email, department, designation, joining_date, exit_date, status) VALUES ?';
      db.query(insertQuery, [sampleEmployees], (err, result) => {
        if (err) console.error('Error inserting employees sample data:', err);
        else console.log(`employees table sample inserted: ${result.affectedRows}`);
      });
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
  let query = 'SELECT emp_id, first_name, last_name, email, department, designation, joining_date, exit_date, status FROM employees';
  let filters = [];

  if (search) {
    const like = `%${search}%`;
    // emp_id is string so treat as LIKE
    query += ' WHERE emp_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
    filters = [like, like, like];
  }

  if (status && status !== 'ALL') {
    query += search ? ' AND' : ' WHERE';
    query += ' status = ?';
    filters.push(status);
  }

  db.query(query, filters, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const data = results.map(emp => ({
      emp_id: emp.emp_id,
      first_name: emp.first_name,
      middle_name: emp.middle_name || '',
      last_name: emp.last_name,
      start_date: emp.joining_date ? emp.joining_date.toISOString().split('T')[0] : null,
      end_date: emp.exit_date ? emp.exit_date.toISOString().split('T')[0] : null,
      status: emp.status || 'ACTIVE'
    }));

    res.json(data);
  });
});

app.get('/api/employees/reports/headcount', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  db.query('SELECT COUNT(*) as total FROM employees', (err, totalResult) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT COUNT(*) as active FROM employees WHERE exit_date IS NULL OR exit_date > ?', [today], (err, activeResult) => {
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


// profile endpoint for individual employee
app.get('/api/employees/:empId/profile', (req, res) => {
  const empId = req.params.empId;
  db.query('SELECT * FROM employees WHERE emp_id = ?', [empId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Employee not found' });
    // return full row under "personal"
    res.json({ personal: results[0] });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
