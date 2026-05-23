const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function optimizeRoute(startLat, startLon, bins) {
    const remainingBins = [...bins];
    const optimizedRoute = [];

    let currentLat = startLat;
    let currentLon = startLon;
    let totalDistance = 0;

    while (remainingBins.length > 0) {
        let nearestIndex = 0;

        let nearestDistance = calculateDistance(
            currentLat,
            currentLon,
            Number(remainingBins[0].latitude),
            Number(remainingBins[0].longitude)
        );

        for (let i = 1; i < remainingBins.length; i++) {
            const distance = calculateDistance(
                currentLat,
                currentLon,
                Number(remainingBins[i].latitude),
                Number(remainingBins[i].longitude)
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        const nearestBin = remainingBins.splice(nearestIndex, 1)[0];

        optimizedRoute.push({
            ...nearestBin,
            distance_from_previous_km: Number(nearestDistance.toFixed(2))
        });

        totalDistance += nearestDistance;
        currentLat = Number(nearestBin.latitude);
        currentLon = Number(nearestBin.longitude);
    }

    return {
        optimizedRoute,
        totalDistance: Number(totalDistance.toFixed(2))
    };
}

/*
    Employee route optimization
    Only bins with latest fill_level >= 70 are included
*/
router.get("/task/:taskId", authMiddleware, roleMiddleware("employee"), (req, res) => {
    const taskId = req.params.taskId;
    const employeeId = req.user.id;
    const { start_latitude, start_longitude } = req.query;

    if (!start_latitude || !start_longitude) {
        return res.status(400).json({
            message: "Start latitude and start longitude are required"
        });
    }

    const sql = `
        SELECT 
            tb.task_bin_id,
            tb.collection_status,
            b.bin_id,
            b.bin_code,
            b.latitude,
            b.longitude,
            b.status AS bin_status,
            a.area_name,
            a.city,
            latest_sensor.fill_level,
            latest_sensor.battery_level,
            latest_sensor.sensor_status,
            latest_sensor.recorded_at
        FROM task_bins tb
        INNER JOIN tasks t ON tb.task_id = t.task_id
        INNER JOIN bins b ON tb.bin_id = b.bin_id
        INNER JOIN areas a ON b.area_id = a.area_id
        INNER JOIN (
            SELECT sd1.*
            FROM sensor_data sd1
            INNER JOIN (
                SELECT bin_id, MAX(data_id) AS latest_data_id
                FROM sensor_data
                GROUP BY bin_id
            ) sd2 ON sd1.data_id = sd2.latest_data_id
        ) latest_sensor ON b.bin_id = latest_sensor.bin_id
        WHERE 
            tb.task_id = ?
            AND t.employee_id = ?
            AND tb.collection_status = 'pending'
            AND latest_sensor.fill_level >= 70
    `;

    db.query(sql, [taskId, employeeId], (error, results) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "No pending bins found with fill level 70% or above for this task"
            });
        }

        const routeResult = optimizeRoute(
            Number(start_latitude),
            Number(start_longitude),
            results
        );

        res.json({
            message: "Optimized route generated successfully for bins filled 70% or above",
            task_id: Number(taskId),
            start_location: {
                latitude: Number(start_latitude),
                longitude: Number(start_longitude)
            },
            total_distance_km: routeResult.totalDistance,
            route: routeResult.optimizedRoute
        });
    });
});

/*
    Admin route optimization
    Only bins with latest fill_level >= 70 are included
*/
router.get("/admin/task/:taskId", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const taskId = req.params.taskId;
    const { start_latitude, start_longitude } = req.query;

    if (!start_latitude || !start_longitude) {
        return res.status(400).json({
            message: "Start latitude and start longitude are required"
        });
    }

    const sql = `
        SELECT 
            tb.task_bin_id,
            tb.collection_status,
            b.bin_id,
            b.bin_code,
            b.latitude,
            b.longitude,
            b.status AS bin_status,
            a.area_name,
            a.city,
            latest_sensor.fill_level,
            latest_sensor.battery_level,
            latest_sensor.sensor_status,
            latest_sensor.recorded_at
        FROM task_bins tb
        INNER JOIN tasks t ON tb.task_id = t.task_id
        INNER JOIN bins b ON tb.bin_id = b.bin_id
        INNER JOIN areas a ON b.area_id = a.area_id
        INNER JOIN (
            SELECT sd1.*
            FROM sensor_data sd1
            INNER JOIN (
                SELECT bin_id, MAX(data_id) AS latest_data_id
                FROM sensor_data
                GROUP BY bin_id
            ) sd2 ON sd1.data_id = sd2.latest_data_id
        ) latest_sensor ON b.bin_id = latest_sensor.bin_id
        WHERE 
            tb.task_id = ?
            AND tb.collection_status = 'pending'
            AND latest_sensor.fill_level >= 70
    `;

    db.query(sql, [taskId], (error, results) => {
        if (error) {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "No pending bins found with fill level 70% or above for this task"
            });
        }

        const routeResult = optimizeRoute(
            Number(start_latitude),
            Number(start_longitude),
            results
        );

        res.json({
            message: "Optimized route generated successfully for bins filled 70% or above",
            task_id: Number(taskId),
            start_location: {
                latitude: Number(start_latitude),
                longitude: Number(start_longitude)
            },
            total_distance_km: routeResult.totalDistance,
            route: routeResult.optimizedRoute
        });
    });
});

module.exports = router;