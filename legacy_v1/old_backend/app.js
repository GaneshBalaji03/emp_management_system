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
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'employee',
      emp_id VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
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
  // Populate users table
  db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
    if (results[0].count === 0) {
      const sampleUsers = [
        ['admin@example.com', 'admin123', 'hr', null],
        ['user@example.com', 'user123', 'employee', 'EMP001']
      ];
      db.query('INSERT INTO users (username, password, role, emp_id) VALUES ?', [sampleUsers]);
    }
  });

  // Populate emp_master if empty
  db.query('SELECT COUNT(*) as count FROM emp_master', (err, results) => {
    if (err) return;
    if (results[0].count === 0) {
      const data = [
        [1, 'John', 'M', 'Doe', '2023-01-15', null],
        [2, 'Jane', 'A', 'Smith', '2023-02-20', null],
        [3, 'Bob', 'R', 'Johnson', '2022-11-10', '2024-01-31'],
        [4, 'Alice', 'B', 'Williams', '2023-03-05', null],
        [5, 'Charlie', 'C', 'Brown', '2023-04-12', null]
      ];
      db.query('INSERT INTO emp_master (emp_id, first_name, middle_name, last_name, start_date, end_date) VALUES ?', [data]);
    }
  });

  // Populate employees table if empty
  db.query('SELECT COUNT(*) as count FROM employees', (err, results) => {
    if (err) return;
    if (results[0].count === 0) {
      const data = [
        ['EMP001', 'Bhanu', 'Teja', 'bteja1055@gmail.com', 'IT', 'Developer', '2023-01-15', null, 'ACTIVE'],
        ['EMP002', 'Alice', 'M', 'alice@example.com', 'HR', 'Manager', '2022-05-10', null, 'ACTIVE'],
        ['EMP003', 'Bob', 'R', 'bob@example.com', 'Sales', 'Salesperson', '2021-03-22', '2024-01-31', 'EXITED']
      ];
      db.query('INSERT INTO employees (emp_id, first_name, last_name, email, department, designation, joining_date, exit_date, status) VALUES ?', [data]);
    }
  });
}

// API endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    res.json({
      token: 'mock-jwt-token-' + user.id,
      user: { id: user.id, username: user.username, role: user.role }
    });
  });
});

// Helper to determine role from token/request
const getRole = (req) => {
  // logic to parse token and get role
  return req.headers['x-role'] || 'employee';
};

app.get('/api/me/profile', (req, res) => {
  const username = req.headers['x-user'];
  const query = `
    SELECT e.*, c.emp_compliance_tracker_id, c.comp_type, c.status as comp_status, c.doc_url 
    FROM employees e 
    JOIN users u ON e.emp_id = u.emp_id 
    LEFT JOIN emp_compliance_tracker c ON e.id = c.emp_id
    WHERE u.username = ?`;

  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });

    const profile = {
      ...results[0],
      compliance: results.filter(r => r.emp_compliance_tracker_id).map(r => ({
        emp_compliance_tracker_id: r.emp_compliance_tracker_id,
        comp_type: r.comp_type,
        status: r.comp_status,
        doc_url: r.doc_url
      }))
    };
    res.json({ personal: profile, compliance: profile.compliance });
  });
});

app.get('/api/alerts', (req, res) => {
  const query = `
    SELECT 'DOC_UPLOAD' as type, e.first_name, e.last_name, c.comp_type as subject, c.updated_at as time, e.emp_id
    FROM emp_compliance_tracker c
    JOIN employees e ON c.emp_id = e.id
    WHERE c.status = 'COMPLETED'
    ORDER BY c.updated_at DESC LIMIT 10
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/home', (req, res) => {
  const username = req.headers['x-user'] || 'admin@example.com';
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (results && results.length > 0) {
      const user = results[0];
      res.json({
        user: { id: user.id, username: user.username, role: user.role },
        member: { id: user.id, name: user.username, email: user.username, phone: '+1234567890' }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

app.post('/api/employees/documents/upload', (req, res) => {
  const { emp_id, comp_type, doc_url } = req.body;
  const query = 'UPDATE emp_compliance_tracker SET doc_url = ?, status = "COMPLETED", updated_at = NOW() WHERE emp_id = (SELECT id FROM employees WHERE emp_id = ?) AND comp_type = ?';
  db.query(query, [doc_url, emp_id, comp_type], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Document uploaded successfully' });
  });
});

app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.post('/api/otp/request', (req, res) => {
  res.json({ challenge_id: 'mock-challenge-' + Date.now() });
});

app.post('/api/otp/verify', (req, res) => {
  res.json({
    token: 'mock-jwt-token-otp',
    user: { id: 2, username: 'user@example.com', role: 'employee' }
  });
});

app.get('/api/employees', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT e.*, c.emp_compliance_tracker_id, c.comp_type, c.status as comp_status, c.doc_url FROM employees e LEFT JOIN emp_compliance_tracker c ON e.id = c.emp_id';
  let filters = [];

  const conditions = [];
  if (search) {
    const like = `%${search}%`;
    conditions.push('(e.emp_id LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ?)');
    filters.push(like, like, like);
  }

  if (status && status !== 'ALL') {
    conditions.push('e.status = ?');
    filters.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  db.query(query, filters, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Group by employee to aggregate compliance items
    const employees = {};
    results.forEach(row => {
      if (!employees[row.id]) {
        employees[row.id] = {
          id: row.id,
          emp_id: row.emp_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          department: row.department,
          designation: row.designation,
          start_date: row.joining_date ? row.joining_date.toISOString().split('T')[0] : null,
          end_date: row.exit_date ? row.exit_date.toISOString().split('T')[0] : null,
          status: row.status || 'ACTIVE',
          items: []
        };
      }
      if (row.emp_compliance_tracker_id) {
        employees[row.id].items.push({
          emp_compliance_tracker_id: row.emp_compliance_tracker_id,
          comp_type: row.comp_type,
          status: row.comp_status,
          doc_url: row.doc_url
        });
      }
    });

    res.json(Object.values(employees));
  });
});

app.post('/api/employees/create', (req, res) => {
  const { emp_id, first_name, last_name, email, department, designation, joining_date } = req.body;
  const query = 'INSERT INTO employees (emp_id, first_name, last_name, email, department, designation, joining_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, "ACTIVE")';
  db.query(query, [emp_id, first_name, last_name, email, department, designation, joining_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee created', id: result.insertId });
  });
});

app.put('/api/employees/:empId/update', (req, res) => {
  const empId = req.params.empId;
  const { first_name, last_name, email, department, designation, status } = req.body;
  const query = 'UPDATE employees SET first_name=?, last_name=?, email=?, department=?, designation=?, status=? WHERE emp_id=?';
  db.query(query, [first_name, last_name, email, department, designation, status, empId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee updated' });
  });
});

app.put('/api/employees/:empId/exit', (req, res) => {
  const empId = req.params.empId;
  const { exit_date } = req.body;
  const query = 'UPDATE employees SET exit_date=?, status="EXITED" WHERE emp_id=?';
  db.query(query, [exit_date, empId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee exited' });
  });
});

app.delete('/api/employees/:empId/delete', (req, res) => {
  const empId = req.params.empId;
  db.query('DELETE FROM employees WHERE emp_id = ?', [empId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted' });
  });
});

app.put('/api/employees/onboarding/tracker/:trackerId', (req, res) => {
  const trackerId = req.params.trackerId;
  const { status } = req.body;
  const query = 'UPDATE emp_compliance_tracker SET status=? WHERE emp_compliance_tracker_id=?';
  db.query(query, [status, trackerId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.get('/api/employees/reports/headcount', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.query('SELECT COUNT(*) as total FROM employees', (err, totalResult) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT COUNT(*) as active FROM employees WHERE status = "ACTIVE"', (err, activeResult) => {
      if (err) return res.status(500).json({ error: err.message });
      const total = totalResult[0].total;
      const active = activeResult[0].active;
      const exited = total - active;
      res.json({ total, active, exited, as_of: today });
    });
  });
});

app.get('/api/employees/reports/joiners-leavers', (req, res) => {
  res.json({ joiners: [], leavers: [] });
});

app.get('/api/employees/reports/ctc-distribution', (req, res) => {
  res.json({ distribution: [] });
});

app.get('/api/employees/reports/compliance-dashboard', (req, res) => {
  res.json({ stats: { completed: 0, pending: 0, overdue: 0 } });
});

app.get('/api/employees/alerts', (req, res) => {
  res.json([]);
});

app.get('/api/employees/:empId/profile', (req, res) => {
  const empId = req.params.empId;
  db.query('SELECT * FROM employees WHERE emp_id = ?', [empId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ personal: results[0] });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
