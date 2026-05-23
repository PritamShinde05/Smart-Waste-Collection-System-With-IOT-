const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const areaRoutes = require("./routes/areaRoutes");
const binRoutes = require("./routes/binRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const taskRoutes = require("./routes/taskRoutes");
const issueRoutes = require("./routes/issueRoutes");
const routeOptimizationRoutes = require("./routes/routeOptimizationRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Smart Waste Management Backend is running");
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 'Database connected successfully' AS message", (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Database test failed",
                error: error.message
            });
        }

        res.json(result[0]);
    });
});

app.get("/api/admin/test", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.json({
        message: "Welcome Admin. You have access."
    });
});

app.get("/api/employee/test", authMiddleware, roleMiddleware("employee"), (req, res) => {
    res.json({
        message: "Welcome Employee. You have access."
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/bins", binRoutes);
app.use("/api/sensor-data", sensorRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/routes", routeOptimizationRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});