const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// จำลองการดึง Log ง่ายๆ
app.get('/', (req, res) => {
    res.json([{ id: 1, action: 'User Login', timestamp: new Date() }]);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`🚀 [log-service] Running on port :${PORT}`);
});