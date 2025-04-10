require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt')
const app = express();
const PORT = process.env.PORT || 4000;


const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,  // Allow credentials
};


app.use(cors(corsOptions));

app.use(express.json());


app.get('/locations', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM locations');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const user = users[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ error: `User is not authorized as ${role}.` });
    }

    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
app.post('/register', async (req, res) => {
  try {
    const { username, password, email, role, contact_number } = req.body;

   
    console.log(req.body);

  
    const [result] = await db.query(
      'INSERT INTO users (username, password, email, role, contact_number) VALUES (?, ?, ?, ?, ?)',
      [username, password, email, role, contact_number || null]
    );

    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/volunteers/requests', async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT r.id AS request_id, u.username AS citizen, l.name AS location,
             res.name AS resource, r.quantity_requested, r.status, r.remarks
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN resources res ON r.resource_id = res.id
      JOIN locations l ON r.location_id = l.id
      WHERE r.status = 'pending'
    `);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch help requests' });
  }
});


app.get('/volunteers/resources', async (req, res) => {
  try {
    const [resources] = await db.query(`
      SELECT r.id, r.name, r.type, r.quantity, r.unit, l.name AS location
      FROM resources r
      JOIN locations l ON r.location_id = l.id
    `);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.post('/volunteers/assign-task', async (req, res) => {
  const { volunteer_id, request_id } = req.body;

  try {
   
    const [[request]] = await db.query('SELECT * FROM requests WHERE id = ? AND status = "pending"', [request_id]);

    if (!request) {
      return res.status(400).json({ error: 'Request not found or already assigned' });
    }

    
    await db.query('UPDATE requests SET status = "approved" WHERE id = ?', [request_id]);

    await db.query('INSERT INTO audit_log (action, performed_by) VALUES (?, ?)', [
      `Volunteer ${volunteer_id} assigned to request ${request_id}`,
      volunteer_id
    ]);

    res.json({ success: true, message: 'Task assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});


app.post('/volunteers/update-task', async (req, res) => {
  const { request_id, new_status, volunteer_id } = req.body;

  try {
    const validStatus = ['fulfilled', 'denied'];
    if (!validStatus.includes(new_status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query('UPDATE requests SET status = ? WHERE id = ?', [new_status, request_id]);

  
    await db.query('INSERT INTO audit_log (action, performed_by) VALUES (?, ?)', [
      `Volunteer ${volunteer_id} updated request ${request_id} to ${new_status}`,
      volunteer_id
    ]);

    res.json({ success: true, message: 'Request status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.get('/volunteers/locations', async (req, res) => {
  try {
    const [locations] = await db.query('SELECT * FROM locations');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.get('/admin/requests', async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT 
        r.id AS request_id, 
        u.username AS citizen, 
        l.name AS location, 
        res.name AS resource, 
        r.quantity_requested, 
        r.status, 
        r.remarks,
        (SELECT v.username FROM users v 
         JOIN audit_log a ON a.performed_by = v.id 
         WHERE a.action LIKE CONCAT('%', r.id) 
         ORDER BY a.timestamp DESC LIMIT 1) AS volunteer
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN resources res ON r.resource_id = res.id
      JOIN locations l ON r.location_id = l.id
    `);

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin requests' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
