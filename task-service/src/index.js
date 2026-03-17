const express = require('express');
const cors = require('cors');
require('dotenv').config();
const taskRoutes = require('./routes/tasks'); // <--- ดึงมา

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes); // <--- ใส่ path ให้ตรงตามโจทย์

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 [task-service] Running on port :${PORT}`);
});