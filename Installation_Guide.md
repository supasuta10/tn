# คู่มือการติดตั้งและตั้งค่าโปรเจค Chai Charoen Catering

## สารบัญ
- [ความต้องการของระบบ](#ความต้องการของระบบ)
- [การติดตั้ง Backend](#การติดตั้ง-backend)
- [การติดตั้ง Frontend](#การติดตั้ง-frontend)
- [การตั้งค่าสภาพแวดล้อม (Environment)](#การตั้งค่าสภาพแวดล้อม-environment)
- [การเริ่มต้นใช้งาน](#การเริ่มต้นใช้งาน)
- [การทดสอบระบบ](#การทดสอบระบบ)

## ความต้องการของระบบ

ก่อนที่จะเริ่มติดตั้ง โปรดตรวจสอบว่าคุณมีสิ่งต่อไปนี้พร้อมใช้งาน:

### ร่วมกันทั้ง Frontend และ Backend
- **Node.js** (เวอร์ชัน 18 หรือใหม่กว่า)
- **npm** หรือ **yarn** (มาพร้อมกับ Node.js โดยอัตโนมัติ)
- **Git** (สำหรับการ clone โปรเจค)

### สำหรับ Backend เท่านั้น
- **MongoDB** (สามารถใช้งานผ่าน MongoDB Atlas หรือติดตั้ง local instance)
- **MongoDB Compass** (ตัวเลือก - สำหรับการจัดการฐานข้อมูลแบบ GUI)

## การติดตั้ง Backend

### 1. ดาวน์โหลดและตั้งค่าโปรเจค
```bash
# โคลนโปรเจค (ถ้ายังไม่ได้ทำ)
git clone <URL ของโปรเจค>
cd ChaiCharoen-Catering

# เข้าไปยังโฟลเดอร์ backend
cd backend
```

### 2. ติดตั้ง dependencies
```bash
npm install
```

### 3. ตรวจสอบโครงสร้างโฟลเดอร์
หลังจากติดตั้ง dependencies แล้ว ควรได้รับโครงสร้างโฟลเดอร์ดังนี้:
```
backend/
├── .env exmaple
├── .gitignore
├── package.json
├── package-lock.json
├── node_modules/
└── src/
    ├── configs/
    ├── controllers/
    ├── helpers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── utils/
    └── server.js
```

## การติดตั้ง Frontend

### 1. เข้าไปยังโฟลเดอร์ frontend
```bash
cd ../frontend
```

### 2. ติดตั้ง dependencies
```bash
npm install
```

### 3. ตรวจสอบโครงสร้างโฟลเดอร์
หลังจากติดตั้ง dependencies แล้ว ควรได้รับโครงสร้างโฟลเดอร์ดังนี้:
```
frontend/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── node_modules/
├── src/
├── public/
└── README.md
```

## การตั้งค่าสภาพแวดล้อม (Environment)

### 1. ตั้งค่า Backend Environment

1.1. ในโฟลเดอร์ `backend` ให้สร้างไฟล์ชื่อว่า `.env` (โดยไม่มีชื่อไฟล์ แค่ส่วนขยาย)

1.2. คัดลอกเนื้อหาจากไฟล์ `.env exmaple` และแก้ไขค่าต่างๆ ตามความเหมาะสม:

```env
PORT=8080
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/chai_charoen_catering?retryWrites=true&w=majority
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_USER_ID=your_line_user_id
LINE_CHANNEL_SECRET=your_line_channel_secret
```

**หมายเหตุสำคัญเกี่ยวกับค่าต่างๆ:**
- `PORT`: พอร์ตที่เซิร์ฟเวอร์จะรัน (ค่าเริ่มต้นคือ 3000)
- `JWT_SECRET`: คีย์ลับสำหรับการสร้างและยืนยัน JWT tokens ควรเป็นสตริงที่ซับซ้อน
- `MONGO_URL`: URL สำหรับเชื่อมต่อกับ MongoDB (สามารถใช้ MongoDB Atlas ได้)
- `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_USER_ID`, `LINE_CHANNEL_SECRET`: ค่าที่ใช้สำหรับการเชื่อมต่อกับ LINE API (ตัวเลือก)

## การเริ่มต้นใช้งาน

### เริ่มต้น Backend

1. ตรวจสอบว่าคุณอยู่ในโฟลเดอร์ `backend`
```bash
cd ../backend
```

2. เริ่มต้นเซิร์ฟเวอร์
```bash
npm start
```

หรือ
```bash
npm run dev
```

3. คุณควรเห็นข้อความใน terminal ว่า:
```
Server is running on port 8080
MongoDB connection established
```

### เริ่มต้น Frontend

1. เปิดเทอร์มินัลใหม่ และไปยังโฟลเดอร์ `frontend`
```bash
cd ../frontend
```

2. เริ่มต้น development server
```bash
npm run dev
```

3. คุณควรเห็นข้อความใน terminal ว่า:
```
VITE v5.0.0  ready in 100 ms

  ➜  Local:   http://localhost:5173
  ➜  Network: use --host to expose
```

4. เปิดเบราว์เซอร์และไปที่ `http://localhost:5173` เพื่อใช้งานแอปพลิเคชัน

## การทดสอบระบบ

### ทดสอบ Backend

1. ตรวจสอบการเชื่อมต่อ API ด้วยการเข้าถึง URL ต่อไปนี้:
   - `http://localhost:8080/api/users` (ควรได้รับข้อมูลผู้ใช้งานหรือข้อความว่าต้องการการยืนยันตัวตน)
   - `http://localhost:8080/api/menus` (ควรได้รับข้อมูลเมนูอาหาร)

2. ตรวจสอบฐานข้อมูล MongoDB ว่าสามารถเชื่อมต่อได้โดยไม่มีข้อผิดพลาดใน console

### ทดสอบ Frontend

1. ตรวจสอบว่าหน้าเว็บโหลดได้ตามปกติ
2. ทดสอบการเข้าถึงหน้าต่างๆ ของแอปพลิเคชัน
3. ตรวจสอบ console ของเบราว์เซอร์ (เปิด Developer Tools > Console) เพื่อดูข้อผิดพลาดต่างๆ

### การทดสอบ API Integration

1. ลองลงทะเบียนผู้ใช้งานใหม่ผ่าน API:
   - เรียก `POST` `/api/auth/register` ด้วยข้อมูลผู้ใช้งาน
2. ลองเข้าสู่ระบบ:
   - เรียก `POST` `/api/auth/login` ด้วยข้อมูลที่ลงทะเบียน
3. ตรวจสอบว่าการยืนยันตัวตนทำงานได้ถูกต้อง

## ปัญหาที่พบบ่อยและการแก้ไข

### ปัญหาการเชื่อมต่อ MongoDB
- ตรวจสอบว่า `MONGO_URL` ในไฟล์ `.env` ถูกต้อง
- ตรวจสอบว่า MongoDB Atlas ได้รับการตั้งค่า IP whitelist ให้อนุญาตการเชื่อมต่อจากที่อยู่ของคุณ

### พอร์ตถูกใช้งานแล้ว
- เปลี่ยนค่า `PORT` ในไฟล์ `.env` เป็นพอร์ตอื่น (เช่น 3001, 4000 ฯลฯ)

### ข้อผิดพลาดจาก dependency
- ลบโฟลเดอร์ `node_modules` และไฟล์ `package-lock.json` แล้วรัน `npm install` ใหม่
- ตรวจสอบว่า Node.js และ npm เป็นเวอร์ชันที่รองรับ
