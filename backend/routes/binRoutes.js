const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const validStatuses = ["empty", "half-filled", "full", "overflow"];

function validateBinInput(data) {
    const { bin_code, area_id, latitude, longitude, capacity, status } = data;

    if (!bin_code || String(bin_code).trim() === "") {
        return "Bin code is required";
    }

    if (!area_id || isNaN(Number(area_id)) || Number(area_id) <= 0) {
        return "Valid area ID is required";
    }

    if (latitude === undefined || latitude === "" || isNaN(Number(latitude))) {
        return "Valid latitude is required";
    }

    if (Number(latitude) < -90 || Number(latitude) > 90) {
        return "Latitude must be between -90 and 90";
    }

    if (longitude === undefined || longitude === "" || isNaN(Number(longitude))) {
        return "Valid longitude is required";
    }

    if (Number(longitude) < -180 || Number(longitude) > 180) {
        return "Longitude must be between -180 and 180";
    }

    if (capacity === undefined || capacity === "" || isNaN(Number(capacity))) {
        return "Valid capacity is required";
    }

    if (Number(capacity) <= 0) {
        return "Capacity must be greater than 0";
    }

    if (status && !validStatuses.includes(status)) {
        return "Invalid bin status";
    }

    return null;
}

router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT 
            bins.bin_id,
            bins.bin_code,
            bins.area_id,
            areas.area_name,
            areas.city,
            bins.latitude,
            bins.longitude,
            bins.capacity,
            bins.status,
            bins.last_collected_at,
            bins.created_at
        FROM bins
        INNER JOIN areas ON bins.area_id = areas.area_id
        ORDER BY bins.bin_id DESC
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
    const { bin_code, area_id, latitude, longitude, capacity, status } = req.body;

    const validationError = validateBinInput(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const sql = `
        INSERT INTO bins (bin_code, area_id, latitude, longitude, capacity, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            String(bin_code).trim(),
            Number(area_id),
            Number(latitude),
            Number(longitude),
            Number(capacity),
            status || "empty"
        ],
        (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Bin code already exists"
                    });
                }

                if (error.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        message: "Invalid area ID. Please create area first."
                    });
                }

                return res.status(500).json({
                    message: "Database error",
                    error: error.message
                });
            }

            res.status(201).json({
                message: "Smart bin added successfully",
                bin_id: result.insertId
            });
        }
    );
});

router.put("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const binId = req.params.id;
    const { bin_code, area_id, latitude, longitude, capacity, status } = req.body;

    if (!binId || isNaN(Number(binId)) || Number(binId) <= 0) {
        return res.status(400).json({
            message: "Valid bin ID is required"
        });
    }

    const validationError = validateBinInput(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const sql = `
        UPDATE bins
        SET bin_code = ?, area_id = ?, latitude = ?, longitude = ?, capacity = ?, status = ?
        WHERE bin_id = ?
    `;

    db.query(
        sql,
        [
            String(bin_code).trim(),
            Number(area_id),
            Number(latitude),
            Number(longitude),
            Number(capacity),
            status || "empty",
            Number(binId)
        ],
        (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Bin code already exists"
                    });
                }

                if (error.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        message: "Invalid area ID"
                    });
                }

                return res.status(500).json({
                    message: "Database error",
                    error: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Smart bin not found"
                });
            }

            res.json({
                message: "Smart bin updated successfully"
            });
        }
    );
});

router.delete("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const binId = req.params.id;

    if (!binId || isNaN(Number(binId)) || Number(binId) <= 0) {
        return res.status(400).json({
            message: "Valid bin ID is required"
        });
    }

    const sql = `
        DELETE FROM bins
        WHERE bin_id = ?
    `;

    db.query(sql, [Number(binId)], (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Smart bin not found"
            });
        }

        res.json({
            message: "Smart bin deleted successfully"
        });
    });
});

module.exports = router;