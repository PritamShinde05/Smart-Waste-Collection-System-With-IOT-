const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const MAX_SENSOR_RECORDS = 500;

function getBinStatus(fillLevel) {
    if (fillLevel >= 90) {
        return "overflow";
    }

    if (fillLevel >= 70) {
        return "full";
    }

    if (fillLevel >= 40) {
        return "half-filled";
    }

    return "empty";
}

function cleanupOldSensorData() {
    const cleanupSql = `
        DELETE FROM sensor_data
        WHERE data_id NOT IN (
            SELECT data_id FROM (
                SELECT data_id
                FROM sensor_data
                ORDER BY data_id DESC
                LIMIT ?
            ) AS latest_records
        )
    `;

    db.query(cleanupSql, [MAX_SENSOR_RECORDS], (error) => {
        if (error) {
            console.log("Sensor cleanup failed:", error.message);
        }
    });
}

router.post("/", (req, res) => {
    const { bin_id, fill_level, battery_level, sensor_status } = req.body;

    if (!bin_id || isNaN(Number(bin_id)) || Number(bin_id) <= 0) {
        return res.status(400).json({
            message: "Valid bin ID is required"
        });
    }

    if (fill_level === undefined || fill_level === "" || isNaN(Number(fill_level))) {
        return res.status(400).json({
            message: "Valid fill level is required"
        });
    }

    if (Number(fill_level) < 0 || Number(fill_level) > 100) {
        return res.status(400).json({
            message: "Fill level must be between 0 and 100"
        });
    }

    if (
        battery_level !== undefined &&
        battery_level !== null &&
        battery_level !== "" &&
        (isNaN(Number(battery_level)) ||
            Number(battery_level) < 0 ||
            Number(battery_level) > 100)
    ) {
        return res.status(400).json({
            message: "Battery level must be between 0 and 100"
        });
    }

    const allowedSensorStatuses = ["active", "inactive", "faulty"];

    if (sensor_status && !allowedSensorStatuses.includes(sensor_status)) {
        return res.status(400).json({
            message: "Invalid sensor status"
        });
    }

    const binStatus = getBinStatus(Number(fill_level));

    const insertSql = `
        INSERT INTO sensor_data (bin_id, fill_level, battery_level, sensor_status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        insertSql,
        [
            Number(bin_id),
            Number(fill_level),
            battery_level === undefined || battery_level === "" ? null : Number(battery_level),
            sensor_status || "active"
        ],
        (insertError, result) => {
            if (insertError) {
                if (insertError.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        message: "Invalid bin ID. Please create smart bin first."
                    });
                }

                return res.status(500).json({
                    message: "Database error while saving sensor data",
                    error: insertError.message
                });
            }

            const updateBinSql = `
                UPDATE bins
                SET status = ?
                WHERE bin_id = ?
            `;

            db.query(updateBinSql, [binStatus, Number(bin_id)], (updateError) => {
                if (updateError) {
                    return res.status(500).json({
                        message: "Sensor data saved but failed to update bin status",
                        error: updateError.message
                    });
                }

                cleanupOldSensorData();

                res.status(201).json({
                    message: "Sensor reading saved successfully",
                    data_id: result.insertId,
                    bin_status: binStatus
                });
            });
        }
    );
});

router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT 
            sd.data_id,
            sd.bin_id,
            b.bin_code,
            a.area_name,
            a.city,
            sd.fill_level,
            sd.battery_level,
            sd.sensor_status,
            b.status AS bin_status,
            sd.recorded_at
        FROM sensor_data sd
        INNER JOIN bins b ON sd.bin_id = b.bin_id
        INNER JOIN areas a ON b.area_id = a.area_id
        ORDER BY sd.data_id DESC
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

router.get("/latest", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT 
            sd.data_id,
            sd.bin_id,
            b.bin_code,
            a.area_name,
            a.city,
            sd.fill_level,
            sd.battery_level,
            sd.sensor_status,
            b.status AS bin_status,
            sd.recorded_at
        FROM sensor_data sd
        INNER JOIN (
            SELECT bin_id, MAX(data_id) AS latest_data_id
            FROM sensor_data
            GROUP BY bin_id
        ) latest ON sd.data_id = latest.latest_data_id
        INNER JOIN bins b ON sd.bin_id = b.bin_id
        INNER JOIN areas a ON b.area_id = a.area_id
        ORDER BY sd.data_id DESC
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

module.exports = router;