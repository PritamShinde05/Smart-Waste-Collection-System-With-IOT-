import { useState } from "react";
import EmployeeHome from "./EmployeeHome";
import EmployeeTasks from "./EmployeeTasks";
import EmployeeRoute from "./EmployeeRoute";
import EmployeeReportIssue from "./EmployeeReportIssue";
import EmployeeIssues from "./EmployeeIssues";

function EmployeeDashboard() {
    const [activePage, setActivePage] = useState("dashboard");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const renderContent = () => {
        if (activePage === "dashboard") return <EmployeeHome />;
        if (activePage === "tasks") return <EmployeeTasks />;
        if (activePage === "route") return <EmployeeRoute />;
        if (activePage === "report") return <EmployeeReportIssue />;
        if (activePage === "issues") return <EmployeeIssues />;
    };

    return (
        <div className="admin-layout">
            <div className="sidebar">
                <h2>Employee Panel</h2>

                <button
                    className={activePage === "dashboard" ? "active" : ""}
                    onClick={() => setActivePage("dashboard")}
                >
                    Dashboard
                </button>

                <button
                    className={activePage === "tasks" ? "active" : ""}
                    onClick={() => setActivePage("tasks")}
                >
                    My Tasks
                </button>

                <button
                    className={activePage === "route" ? "active" : ""}
                    onClick={() => setActivePage("route")}
                >
                    Route
                </button>

                <button
                    className={activePage === "report" ? "active" : ""}
                    onClick={() => setActivePage("report")}
                >
                    Report Issue
                </button>

                <button
                    className={activePage === "issues" ? "active" : ""}
                    onClick={() => setActivePage("issues")}
                >
                    My Issues
                </button>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="main-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default EmployeeDashboard;