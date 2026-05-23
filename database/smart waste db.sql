CREATE DATABASE smart_waste_db;

use smart_waste_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE areas (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bins (
    bin_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_code VARCHAR(50) NOT NULL UNIQUE,
    area_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INT,
    status ENUM('empty', 'half-filled', 'full', 'overflow') DEFAULT 'empty',
    last_collected_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(area_id)
);

CREATE TABLE sensor_data (
    data_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_id INT NOT NULL,
    fill_level INT NOT NULL,
    battery_level INT,
    sensor_status ENUM('active', 'inactive', 'faulty') DEFAULT 'active',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bin_id) REFERENCES bins(bin_id)
);

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    area_id INT NOT NULL,
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date DATETIME,
    FOREIGN KEY (employee_id) REFERENCES users(user_id),
    FOREIGN KEY (area_id) REFERENCES areas(area_id)
);

CREATE TABLE task_bins (
    task_bin_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    bin_id INT NOT NULL,
    collection_status ENUM('pending', 'collected') DEFAULT 'pending',
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (bin_id) REFERENCES bins(bin_id)
);

CREATE TABLE employee_issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    bin_id INT,
    task_id INT,
    issue_type VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('pending', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(user_id),
    FOREIGN KEY (bin_id) REFERENCES bins(bin_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);
