# ♻️ Smart Waste Management System

A full-stack Smart Waste Management System developed to improve waste collection efficiency using IoT sensor simulation, route optimization, and real-time monitoring.

The system helps administrators monitor smart bins, assign collection tasks, optimize routes, track employees, manage issues, and generate reports.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT Authentication
- Secure Login System
- Role-Based Access Control
- Admin Dashboard
- Employee Dashboard

### 👨‍💼 Employee Management

- Add Employee
- Update Employee
- Delete Employee
- Search Employees
- Employee Task Tracking

### 📍 Area Management

- Add Area
- Update Area
- Delete Area
- Area-wise Monitoring

### 🗑 Smart Bin Management

- Add Smart Bin
- Update Bin Information
- Delete Smart Bin
- Track Bin Status
- Bin Capacity Monitoring
- Last Collection Tracking

### 📡 IoT Sensor Simulation

- Real-Time Sensor Data Simulation
- Fill Level Monitoring
- Battery Level Monitoring
- Sensor Health Status
- Automatic Bin Status Updates

### 🚛 Route Optimization

- Route Generation for Collection Tasks
- Real Road Route Visualization
- OpenStreetMap Integration
- Route Created Only For Bins ≥ 70% Filled
- Distance Calculation
- Optimized Collection Path

### 📋 Task Management

- Assign Tasks To Employees
- Bin Assignment
- Task Status Tracking
- Collection Tracking
- Automatic Task Completion

### ⚠ Issue Management

- Employee Issue Reporting
- Admin Issue Resolution
- Issue Status Tracking

### 📊 Dashboard Analytics

- Total Employees
- Total Areas
- Total Smart Bins
- Total Tasks
- Total Issues
- Sensor Statistics
- Interactive Charts

### 📄 Reports

- Bin Status Report
- Task Status Report
- Issue Status Report
- Area-wise Bin Report
- PDF Export

### 🧹 Data Maintenance

- Sensor Data Auto Cleanup
- Pagination Support
- Loading Indicators
- Form Validation

---

## 🛠 Technology Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- Leaflet Maps
- Chart.js
- jsPDF

### Backend

- Node.js
- Express.js
- JWT Authentication

### Database

- MySQL

### Maps & Routing

- OpenStreetMap
- OSRM Routing Engine

---

## 📂 Project Structure

```text
smart-waste-management-system
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   └── styles
│
├── backend
│   ├── routes
│   ├── middleware
│   ├── config
│   └── controllers
│
├── database
│   └── smart_waste_db.sql
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/smart-waste-management-system.git
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

### Database

1. Open MySQL
2. Create database:

```sql
CREATE DATABASE smart_waste_db;
```

3. Import:

```text
database/smart_waste_db.sql
```

---

## 🔄 System Workflow

```text
IoT Sensor Data
       │
       ▼
Smart Bin Status Updated
       │
       ▼
Admin Monitors Dashboard
       │
       ▼
Task Assigned To Employee
       │
       ▼
Route Optimized (70%+ Filled Bins)
       │
       ▼
Collection Completed
       │
       ▼
Bin Emptied Automatically
       │
       ▼
Task Marked Completed
```

---

## 🎯 Future Scope

- ESP32 Hardware Integration
- Real GPS Tracking
- Mobile Application
- SMS/Email Notifications
- AI-Based Route Optimization
- Predictive Waste Analysis
- Cloud Deployment

---

## 👨‍💻 Author

**Pritam Mahadev Shinde**

Smart Waste Management System Project

---

## ⭐ Support

If you like this project, please give it a ⭐ on GitHub.
