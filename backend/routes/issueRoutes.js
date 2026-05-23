const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("employee"), (req, res) => {
    const employeeId = req.user.id;
    const { bin_id, task_id, issue_type, description } = req.body;

    if (!issue_type) {
        return res.status(400).json({
            message: "Issue type is required"
        });
    }

    const sql = `
        INSERT INTO employee_issues 
        (employee_id, bin_id, task_id, issue_type, description)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [employeeId, bin_id || null, task_id || null, issue_type, description || null],
        (error, result) => {
            if (error) {
                if (error.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        message: "Invalid bin ID or task ID"
                    });
                }

                return res.status(500).json({
                    message: "Database error",
                    error: error.message
                });
            }

            res.status(201).json({
                message: "Issue reported successfully",
                issue_id: result.insertId
            });
        }
    );
});

router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT 
            ei.issue_id,
            ei.employee_id,
            u.name AS employee_name,
            u.email AS employee_email,
            ei.bin_id,
            b.bin_code,
            ei.task_id,
            ei.issue_type,
            ei.description,
            ei.status,
            ei.created_at
        FROM employee_issues ei
        INNER JOIN users u ON ei.employee_id = u.user_id
        LEFT JOIN bins b ON ei.bin_id = b.bin_id
        ORDER BY ei.issue_id DESC
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

router.get("/my-issues", authMiddleware, roleMiddleware("employee"), (req, res) => {
    const employeeId = req.user.id;

    const sql = `
        SELECT 
            ei.issue_id,
            ei.bin_id,
            b.bin_code,
            ei.task_id,
            ei.issue_type,
            ei.description,
            ei.status,
            ei.created_at
        FROM employee_issues ei
        LEFT JOIN bins b ON ei.bin_id = b.bin_id
        WHERE ei.employee_id = ?
        ORDER BY ei.issue_id DESC
    `;

    db.query(sql, [employeeId], (error, results) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        res.json(results);
    });
});

router.put("/:id/status", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const issueId = req.params.id;
    const { status } = req.body;

    if (!["pending", "resolved"].includes(status)) {
        return res.status(400).json({
            message: "Status must be pending or resolved"
        });
    }

    const sql = `
        UPDATE employee_issues
        SET status = ?
        WHERE issue_id = ?
    `;

    db.query(sql, [status, issueId], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }

        res.json({
            message: "Issue status updated successfully"
        });
    });
});

module.exports = router;