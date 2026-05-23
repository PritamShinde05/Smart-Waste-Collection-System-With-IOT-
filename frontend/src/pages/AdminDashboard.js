import { useState, useEffect } from "react";
import AdminHome from "./AdminHome";
import AdminEmployees from "./AdminEmployees";
import AdminAreas from "./AdminAreas";
import AdminBins from "./AdminBins";
import AdminSensorData from "./AdminSensorData";
import AdminTasks from "./AdminTasks";
import AdminIssues from "./AdminIssues";
import AdminRoutes from "./AdminRoutes";
import AdminReports from "./AdminReports";
import IoTSimulator from "../components/IoTSimulator";

function AdminDashboard() {
    const [activePage, setActivePage] = useState("dashboard");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("iotSimulation");
        window.location.href = "/";
    };

    useEffect(() => {
        const navigateHandler = (event) => {
            setActivePage(event.detail);
        };

        window.addEventListener("dashboardNavigate", navigateHandler);

        return () => {
            window.removeEventListener("dashboardNavigate", navigateHandler);
        };
    }, []);

    const renderContent = () => {
        if (activePage === "dashboard") return <AdminHome />;
        if (activePage === "employees") return <AdminEmployees />;
        if (activePage === "areas") return <AdminAreas />;
        if (activePage === "bins") return <AdminBins />;
        if (activePage === "sensor") return <AdminSensorData />;
        if (activePage === "tasks") return <AdminTasks />;
        if (activePage === "issues") return <AdminIssues />;
        if (activePage === "routes") return <AdminRoutes />;
        if (activePage === "reports") return <AdminReports />;
    };

    return (
        <div className="admin-layout">
            <div className="sidebar">
                <h2>Smart Waste</h2>

                <button
                    className={activePage === "dashboard" ? "active" : ""}
                    onClick={() => setActivePage("dashboard")}
                >
                    Dashboard
                </button>

                <button
                    className={activePage === "employees" ? "active" : ""}
                    onClick={() => setActivePage("employees")}
                >
                    Employees
                </button>

                <button
                    className={activePage === "areas" ? "active" : ""}
                    onClick={() => setActivePage("areas")}
                >
                    Areas
                </button>

                <button
                    className={activePage === "bins" ? "active" : ""}
                    onClick={() => setActivePage("bins")}
                >
                    Smart Bins
                </button>

                <button
                    className={activePage === "sensor" ? "active" : ""}
                    onClick={() => setActivePage("sensor")}
                >
                    Sensor Data
                </button>

                <button
                    className={activePage === "tasks" ? "active" : ""}
                    onClick={() => setActivePage("tasks")}
                >
                    Tasks
                </button>

                <button
                    className={activePage === "issues" ? "active" : ""}
                    onClick={() => setActivePage("issues")}
                >
                    Issues
                </button>

                <button
                    className={activePage === "routes" ? "active" : ""}
                    onClick={() => setActivePage("routes")}
                >
                    Routes
                </button>

                <button
                    className={activePage === "reports" ? "active" : ""}
                    onClick={() => setActivePage("reports")}
                >
                    Reports
                </button>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="main-content">
                <IoTSimulator />
                {renderContent()}
            </div>

            <IoTSimulator />
        </div>
    );
}

export default AdminDashboard;