const express = require('express');
const { pool } = require('../db/db'); 
const router = express.Router();

// 📥 1. ดึงข้อมูลงานทั้งหมด
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 📤 2. เพิ่มงานใหม่
router.post('/', async (req, res) => {
    const { title } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
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

// 🗑️ 3. ลบงาน (Route นี้ต้องอยู่เดี่ยวๆ ไม่ซ้อนในอันอื่น)
router.delete('/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบงานที่ต้องการลบ' });
        }

        console.log(`✅ Task ID ${taskId} Deleted`);
        res.json({ message: 'ลบงานสำเร็จ', deletedTask: result.rows[0] });
    } catch (err) {
        console.error('❌ Error deleting task:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// ✅ PATCH /api/tasks/:id/approve - สำหรับ Admin กดอนุมัติงาน
router.patch('/:id/approve', async (req, res) => {
    const taskId = req.params.id;
    try {
        const result = await pool.query(
            "UPDATE tasks SET status = 'Approved' WHERE id = $1 RETURNING *",
            [taskId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบงานที่ต้องการอนุมัติ' });
        }

        res.json({ message: 'อนุมัติงานสำเร็จ', task: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

module.exports = router;