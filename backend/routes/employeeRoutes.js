const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/*
    GET all employees
    Only admin can access this API
*/
router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT user_id, name, email, role, phone, created_at
        FROM users
        WHERE role = 'employee'
        ORDER BY user_id DESC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        res.json(results);
    });
});

/*
    ADD new employee
    Only admin can create employee
*/
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email, and password are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password, role, phone)
            VALUES (?, ?, ?, 'employee', ?)
        `;

        db.query(sql, [name, email, hashedPassword, phone], (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Email already exists"
                    });
                }

                return res.status(500).json({
                    message: "Database error",
                    error: error.message
                });
            }

            res.status(201).json({
                message: "Employee added successfully",
                employee_id: result.insertId
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/*
    UPDATE employee
    Only admin can update employee details
*/
router.put("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const employeeId = req.params.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const sql = `
        UPDATE users
        SET name = ?, email = ?, phone = ?
        WHERE user_id = ? AND role = 'employee'
    `;

    db.query(sql, [name, email, phone, employeeId], (error, result) => {
        if (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            message: "Employee updated successfully"
        });
    });
});

/*
    DELETE employee
    Only admin can delete employee
*/
router.delete("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const employeeId = req.params.id;

    const sql = `
        DELETE FROM users
        WHERE user_id = ? AND role = 'employee'
    `;

    db.query(sql, [employeeId], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            message: "Employee deleted successfully"
        });
    });
});

module.exports = router;