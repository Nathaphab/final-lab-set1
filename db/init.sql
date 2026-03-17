-- 1. ล้างตารางเก่า
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. สร้างตาราง users ให้ตรงตามที่ auth.js เรียกใช้
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- ต้องเป็นชื่อนี้ตามโค้ด
    username VARCHAR(255) NOT NULL,      -- ต้องมีเพื่อใช้ใน Token/Response
    role VARCHAR(50) DEFAULT 'user',     -- ต้องมีเพื่อใช้ใน Token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. สร้างตาราง tasks (เผื่อไว้สำหรับ task-service)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. เพิ่ม Alice (ใช้รหัสผ่าน Hash ของ bcrypt สำหรับคำว่า 'alice123')
INSERT INTO users (email, password_hash, username, role) 
VALUES (
    'alice@lab.local', 
    '$2b$10$EPfLpv7u3rEN1/vvyMC9Eu5H07uNByS7fL50eHSC9.vWwS8pXW6uO', 
    'Alice', 
    'admin'
);