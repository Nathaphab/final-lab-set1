const express = require('express');
const { pool } = require('../db/db'); // ต้องดึง pool มาใช้คุยกับ Database
const router = express.Router();

// 📥 GET /api/tasks - ดึงข้อมูลงานทั้งหมดจาก Database มาโชว์
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 📤 POST /api/tasks - รับข้อมูลจากหน้าเว็บมาบันทึกลง Database
router.post('/', async (req, res) => {
    const { title } = req.body;
    
    // ตรวจสอบว่าส่งชื่อ Task มาไหม
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        // บันทึกลงตาราง tasks
        const result = await pool.query(
            'INSERT INTO tasks (title, status) VALUES ($1, $2) RETURNING *',
            [title, 'Pending']
        );
        
        console.log('✅ Task Added:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error adding task:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

module.exports = router;