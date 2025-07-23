# 🧾 Invoice Management System

A secure and user-role-based Invoice Management System built using **Node.js**, **MongoDB**, and **HTML/CSS**. It allows user and group management, role-based access control, and basic invoice functionalities.

---

## 🌟 Features

- ✅ Login authentication with role-based access:
  - SuperAdmin
  - Admin
  - Unit Manager
  - User
- 👤 User Management (Add, Edit, Delete)
- 🏢 Group creation and assignment
- 🧾 Invoice Management section (modular)
- 🔒 Secure session handling
- 🎨 Clean and simple UI using HTML & CSS

---

## 🖥️ Screenshots

### 🔐 Login
![Login]<img width="1090" height="792" alt="Screenshot 2025-07-23 111728" src="https://github.com/user-attachments/assets/3db2486a-384e-4445-97b2-7868cdc06929" />


### 📊 Dashboard
![Dashboard]<img width="1914" height="804" alt="Screenshot 2025-07-23 111708" src="https://github.com/user-attachments/assets/5466281d-3b24-4405-b383-304a36ec21ad" />


### ➕ Create User with Role Selection
![Create User]<img width="1914" height="802" alt="Screenshot 2025-07-23 111751" src="https://github.com/user-attachments/assets/2db9df2a-5976-4391-a637-a30118db71ae" />


---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend
- HTML
- CSS

---

## 📂 Folder Structure

invoice-management-system/
│
├── backend/
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ ├── controllers/ # Logic for APIs
│ ├── middleware/ # Auth & role check logic
│ └── server.js # Entry point
│
├── frontend/
│ ├── index.html # Login page
│ ├── dashboard.html # Dashboard UI
│ ├── styles.css # Basic styling
│
├── .env # Environment variables
├── package.json
└── README.md


---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/invoice-management-system.git
cd invoice-management-system

2. Setup Backend
cd backend
npm install

3. Configure Environment Variables

PORT=5000
MONGO_URI=mongodb+srv://yourMongoDBConnection
JWT_SECRET=your_jwt_secret

4. Start the Server

npm start
Server will start on http://localhost:5000.

👨‍💻 Author
Tushar Joshi

GitHub: github.com/yourusername

Email: your-email@example.com

Portfolio: Coming soon


---

Let me know if:
- You want the links updated with real ones.
- You want me to generate this as a downloadable `.md` file.
- You're adding invoice creation features or deploying online (I'll include those too).



