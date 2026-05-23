const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const { employee_id, area_id, bin_ids } = req.body;

    if (!employee_id || !area_id || !Array.isArray(bin_ids) || bin_ids.length === 0) {
        return res.status(400).json({
            message: "Employee ID, area ID, and bin IDs are required"
        });
    }

    const checkEmployeeSql = `
        SELECT user_id FROM users
        WHERE user_id = ? AND role = 'employee'
    `;

    db.query(checkEmployeeSql, [employee_id], (empError, empResult) => {
        if (empError) {
            return res.status(500).json({
                message: "Database error while checking employee",
                error: empError.message
            });
        }

        if (empResult.length === 0) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const duplicateTaskSql = `
            SELECT task_id FROM tasks
            WHERE employee_id = ?
            AND area_id = ?
            AND status IN ('pending', 'in-progress')
        `;

        db.query(duplicateTaskSql, [employee_id, area_id], (dupError, dupResult) => {
            if (dupError) {
                return res.status(500).json({
                    message: "Database error while checking duplicate task",
                    error: dupError.message
                });
            }

            if (dupResult.length > 0) {
                return res.status(409).json({
                    message: "This employee already has a pending or in-progress task for this area"
                });
            }

            const createTaskSql = `
                INSERT INTO tasks (employee_id, area_id)
                VALUES (?, ?)
            `;

            db.query(createTaskSql, [employee_id, area_id], (taskError, taskResult) => {
                if (taskError) {
                    if (taskError.code === "ER_NO_REFERENCED_ROW_2") {
                        return res.status(400).json({
                            message: "Invalid area ID"
                        });
                    }

                    return res.status(500).json({
                        message: "Database error while creating task",
                        error: taskError.message
                    });
                }

                const taskId = taskResult.insertId;
                const taskBinValues = bin_ids.map((binId) => [taskId, binId]);

                const insertTaskBinsSql = `
                    INSERT INTO task_bins (task_id, bin_id)
                    VALUES ?
                `;

                db.query(insertTaskBinsSql, [taskBinValues], (binError) => {
                    if (binError) {
                        return res.status(500).json({
                            message: "Task created but bin assignment failed",
                            error: binError.message
                        });
                    }

                    res.status(201).json({
                        message: "Task created and bins assigned successfully",
                        task_id: taskId
                    });
                });
            });
        });
    });
});

router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT 
            t.task_id,
            t.employee_id,
            u.name AS employee_name,
            u.email AS employee_email,
            t.area_id,
            a.area_name,
            a.city,
            t.status,
            t.assigned_date,
            t.completed_date
        FROM tasks t
        INNER JOIN users u ON t.employee_id = u.user_id
        INNER JOIN areas a ON t.area_id = a.area_id
        ORDER BY t.task_id DESC
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

router.get("/employee/my-tasks", authMiddleware, roleMiddleware("employee"), (req, res) => {
    const employeeId = req.user.id;

    const sql = `
        SELECT 
            t.task_id,
            t.area_id,
            a.area_name,
            a.city,
            t.status,
            t.assigned_date,
            t.completed_date
        FROM tasks t
        INNER JOIN areas a ON t.area_id = a.area_id
        WHERE t.employee_id = ?
        ORDER BY t.task_id DESC
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

router.get("/:id", authMiddleware, (req, res) => {
    const taskId = req.params.id;

    const taskSql = `
        SELECT 
            t.task_id,
            t.employee_id,
            u.name AS employee_name,
            t.area_id,
            a.area_name,
            a.city,
            t.status,
            t.assigned_date,
            t.completed_date
        FROM tasks t
        INNER JOIN users u ON t.employee_id = u.user_id
        INNER JOIN areas a ON t.area_id = a.area_id
        WHERE t.task_id = ?
    `;

    db.query(taskSql, [taskId], (taskError, taskResult) => {
        if (taskError) {
            return res.status(500).json({
                message: "Database error",
                error: taskError.message
            });
        }

        if (taskResult.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const task = taskResult[0];

        if (req.user.role === "employee" && req.user.id !== task.employee_id) {
            return res.status(403).json({
                message: "Access denied. This task is not assigned to you."
            });
        }

        const binsSql = `
            SELECT 
                tb.task_bin_id,
                tb.bin_id,
                b.bin_code,
                b.status AS bin_status,
                b.latitude,
                b.longitude,
                b.last_collected_at,
                tb.collection_status
            FROM task_bins tb
            INNER JOIN bins b ON tb.bin_id = b.bin_id
            WHERE tb.task_id = ?
        `;

        db.query(binsSql, [taskId], (binsError, binsResult) => {
            if (binsError) {
                return res.status(500).json({
                    message: "Database error",
                    error: binsError.message
                });
            }

            res.json({
                task,
                bins: binsResult
            });
        });
    });
});

router.put("/:id/status", authMiddleware, roleMiddleware("employee"), (req, res) => {
    const taskId = req.params.id;
    const employeeId = req.user.id;
    const { status } = req.body;

    if (!["pending", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({
            message: "Status must be pending, in-progress, or completed"
        });
    }

    const completedDate = status === "completed" ? new Date() : null;

    const sql = `
        UPDATE tasks
        SET status = ?, completed_date = ?
        WHERE task_id = ? AND employee_id = ?
    `;

    db.query(sql, [status, completedDate, taskId, employeeId], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found or not assigned to you"
            });
        }

        res.json({
            message: "Task status updated successfully"
        });
    });
});

router.put("/task-bin/:taskBinId/collect", authMiddleware, roleMiddleware("employee"), (req, res) => {
    const taskBinId = req.params.taskBinId;
    const employeeId = req.user.id;

    const findSql = `
        SELECT 
            tb.task_bin_id,
            tb.task_id,
            tb.bin_id,
            tb.collection_status,
            t.employee_id
        FROM task_bins tb
        INNER JOIN tasks t ON tb.task_id = t.task_id
        WHERE tb.task_bin_id = ? AND t.employee_id = ?
    `;

    db.query(findSql, [taskBinId, employeeId], (findError, findResult) => {
        if (findError) {
            return res.status(500).json({
                message: "Database error",
                error: findError.message
            });
        }

        if (findResult.length === 0) {
            return res.status(404).json({
                message: "Task bin not found or not assigned to you"
            });
        }

        const taskBin = findResult[0];

        if (taskBin.collection_status === "collected") {
            return res.status(400).json({
                message: "Bin is already marked as collected"
            });
        }

        db.beginTransaction((transactionError) => {
            if (transactionError) {
                return res.status(500).json({
                    message: "Transaction error",
                    error: transactionError.message
                });
            }

            const updateTaskBinSql = `
                UPDATE task_bins
                SET collection_status = 'collected'
                WHERE task_bin_id = ?
            `;

            db.query(updateTaskBinSql, [taskBinId], (taskBinError) => {
                if (taskBinError) {
                    return db.rollback(() => {
                        res.status(500).json({
                            message: "Failed to update collection status",
                            error: taskBinError.message
                        });
                    });
                }

                const updateBinSql = `
                    UPDATE bins
                    SET status = 'empty',
                        last_collected_at = NOW()
                    WHERE bin_id = ?
                `;

                db.query(updateBinSql, [taskBin.bin_id], (binError) => {
                    if (binError) {
                        return db.rollback(() => {
                            res.status(500).json({
                                message: "Failed to update bin status",
                                error: binError.message
                            });
                        });
                    }

                    const checkPendingSql = `
                        SELECT COUNT(*) AS pending_count
                        FROM task_bins
                        WHERE task_id = ?
                        AND collection_status = 'pending'
                    `;

                    db.query(checkPendingSql, [taskBin.task_id], (pendingError, pendingResult) => {
                        if (pendingError) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    message: "Failed to check pending bins",
                                    error: pendingError.message
                                });
                            });
                        }

                        const pendingCount = pendingResult[0].pending_count;

                        if (pendingCount === 0) {
                            const completeTaskSql = `
                                UPDATE tasks
                                SET status = 'completed',
                                    completed_date = NOW()
                                WHERE task_id = ?
                            `;

                            db.query(completeTaskSql, [taskBin.task_id], (completeError) => {
                                if (completeError) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "Failed to complete task",
                                            error: completeError.message
                                        });
                                    });
                                }

                                db.commit((commitError) => {
                                    if (commitError) {
                                        return db.rollback(() => {
                                            res.status(500).json({
                                                message: "Commit failed",
                                                error: commitError.message
                                            });
                                        });
                                    }

                                    res.json({
                                        message: "Bin marked as collected, bin status updated to empty, and task completed"
                                    });
                                });
                            });
                        } else {
                            db.commit((commitError) => {
                                if (commitError) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "Commit failed",
                                            error: commitError.message
                                        });
                                    });
                                }

                                res.json({
                                    message: "Bin marked as collected and bin status updated to empty"
                                });
                            });
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;