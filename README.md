# ENGSE207 Software Architecture
## README — Final Lab Set 1: Microservices + HTTPS + Lightweight Logging

เอกสารฉบับนี้ใช้เป็นคู่มือสำหรับ Repository ของงาน **Final Lab Set 1** เพื่อประกอบการส่งงานในรายวิชา

---

## 1. ข้อมูลรายวิชาและสมาชิก
* **รายวิชา:** ENGSE207 Software Architecture
* **ชื่องาน:** Final Lab — ชุดที่ 1: Microservices + HTTPS + Lightweight Logging
* **Repository:** `final-lab-set1/`

### สมาชิกในกลุ่ม
| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา |
| :--- | :--- | :--- |
| 1 | นาย ณฐภาพ สายหล้า | 67543210054-2 |
| 2 | นางสาว วรินทร เครืออินตา | 67543210065-8 |

---

## 2. ภาพรวมของระบบ
ระบบ Task Board ที่พัฒนาด้วยสถาปัตยกรรม Microservices โดยเน้นหัวข้อสำคัญดังนี้:
* **Service Separation:** แยกหน้าที่ความรับผิดชอบชัดเจน (Auth, Task, Log)
* **API Gateway:** ใช้ Nginx เป็นประตูหลักและทำ Reverse Proxy
* **Security:** เปิดใช้งาน HTTPS (Self-Signed) และยืนยันตัวตนด้วย **JWT**
* **Logging:** ระบบ Lightweight Logging บันทึกกิจกรรมผ่าน Log Service ลง Database
* **Infrastructure:** ควบคุมการทำงานทั้งหมดผ่าน Docker Compose

---

## 3. วัตถุประสงค์ของงาน
* ออกแบบและจัดการระบบแบบ Microservices เบื้องต้น
* ประยุกต์ใช้ Nginx สำหรับ TLS Termination และ Rate Limiting
* ออกแบบการสื่อสารระหว่าง Service และการจัดการ CORS
* ฝึกการใช้ Docker Compose สำหรับระบบที่มีหลาย Container

---

## 4. Architecture Overview

```text
Browser / Postman
       │
       │ HTTPS :443  (HTTP :80 → redirect HTTPS)
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Nginx (API Gateway + TLS Termination + Rate Limiter)       │
│                                                             │
│  /api/auth/* → auth-service:3001                    │
│  /api/tasks/* → task-service:3002  [JWT required]    │
│  /api/logs/internal  → BLOCKED (403)                        │
│  /api/logs/* → log-service:3003   [admin JWT only]  │
│  /                   → frontend:80                          │
└──────┬───────────────┬──────────────────┬───────────────────┘
       │               │                  │
       ▼               ▼                  ▼
  auth-service    task-service       log-service
    :3001            :3002              :3003
       │               │                  │
       └───────────────┴──────────────────┘
                       │
              PostgreSQL :5432 (Shared Database)
              • users table | • tasks table | • logs table
