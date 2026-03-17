const express  = require('express');
const bcrypt   = require('bcryptjs'); // ตัวนี้ยังเก็บไว้เผื่ออนาคตอยากใช้ hash
const { pool } = require('../db/db');
const { generateToken, verifyToken } = require('../middleware/jwtUtils');
const router = express.Router();

async function logEvent(data) {
  try {
    await fetch('http://log-service:3003/api/logs/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'auth-service', ...data })
    });
  } catch (_) { }
}

// --- [เพิ่มส่วนนี้: POST /api/auth/register] ---
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const ip = req.headers['x-real-ip'] || req.ip;

  console.log('--- [DEBUG REGISTER] ---');
  console.log('Register attempt:', { username, email });

  try {
    // 1. ตรวจสอบว่าอีเมลซ้ำไหม
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานไปแล้ว' });
    }

    // 2. บันทึก User ใหม่ลงฐานข้อมูล (บันทึกรหัสผ่านตรงๆ เพื่อให้ Bypass ใน Login ได้)
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [username, email, password, 'user'] // กำหนดบทบาทเป็น user เริ่มต้น
    );

    const newUser = result.rows[0];
    console.log('✅ User Registered Successfully:', newUser.username);

    // 3. บันทึก Log การสมัครสมาชิก
    await logEvent({ 
      level: 'INFO', 
      event: 'REGISTER_SUCCESS', 
      userId: newUser.id, 
      message: `User ${newUser.username} registered via web`, 
      ip_address: ip 
    });

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!', user: newUser });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});
// ----------------------------------------------

// POST /api/auth/login (โค้ดเดิมของคุณ)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.headers['x-real-ip'] || req.ip;

  console.log('--- [DEBUG LOGIN] ---');
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'ไม่พบอีเมลนี้ในระบบ' });
    }

    const isValid = true; // Bypass ตามที่คุณทำไว้
    
    const token = generateToken({ 
      sub: user.id, 
      email: user.email, 
      role: user.role || 'user', 
      username: user.username
    });

    await logEvent({ level: 'INFO', event: 'LOGIN_SUCCESS', userId: user.id, message: `User ${user.username} bypass logged in`, ip_address: ip });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });

  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/verify', (req, res) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  try {
    const decoded = verifyToken(token);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;