const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT area_id, area_name, city, pincode, created_at
        FROM areas
        ORDER BY area_id DESC
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

router.post("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const { area_name, city, pincode } = req.body;

    if (!area_name || !city) {
        return res.status(400).json({
            message: "Area name and city are required"
        });
    }

    const sql = `
        INSERT INTO areas (area_name, city, pincode)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [area_name, city, pincode], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        res.status(201).json({
            message: "Area added successfully",
            area_id: result.insertId
        });
    });
});

router.put("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const areaId = req.params.id;
    const { area_name, city, pincode } = req.body;

    if (!area_name || !city) {
        return res.status(400).json({
            message: "Area name and city are required"
        });
    }

    const sql = `
        UPDATE areas
        SET area_name = ?, city = ?, pincode = ?
        WHERE area_id = ?
    `;

    db.query(sql, [area_name, city, pincode, areaId], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Area not found"
            });
        }

        res.json({
            message: "Area updated successfully"
        });
    });
});

router.delete("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const areaId = req.params.id;

    const sql = `
        DELETE FROM areas
        WHERE area_id = ?
    `;

    db.query(sql, [areaId], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Area not found"
            });
        }

        res.json({
            message: "Area deleted successfully"
        });
    });
});

module.exports = router;