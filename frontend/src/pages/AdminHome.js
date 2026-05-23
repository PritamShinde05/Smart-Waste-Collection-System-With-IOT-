import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import AdminCharts from "../components/AdminCharts";

function AdminHome() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [employees, setEmployees] = useState([]);
    const [areas, setAreas] = useState([]);
    const [bins, setBins] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [message, setMessage] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    const goToPage = (page) => {
        window.dispatchEvent(
            new CustomEvent("dashboardNavigate", {
                detail: page
            })
        );
    };

    const fetchSummary = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [employeesRes, areasRes, binsRes, tasksRes, issuesRes] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/employees`, { headers }),
                    fetch(`${API_BASE_URL}/areas`, { headers }),
                    fetch(`${API_BASE_URL}/bins`, { headers }),
                    fetch(`${API_BASE_URL}/tasks`, { headers }),
                    fetch(`${API_BASE_URL}/issues`, { headers })
                ]);

            if (
                handleAuthError(employeesRes) ||
                handleAuthError(areasRes) ||
                handleAuthError(binsRes) ||
                handleAuthError(tasksRes) ||
                handleAuthError(issuesRes)
            ) {
                return;
            }

            setEmployees(await employeesRes.json());
            setAreas(await areasRes.json());
            setBins(await binsRes.json());
            setTasks(await tasksRes.json());
            setIssues(await issuesRes.json());
            setLastUpdated(new Date().toLocaleTimeString());
            setMessage("");
        } catch (error) {
            setMessage("Failed to load dashboard summary");
        }
    };

    useEffect(() => {
        fetchSummary();

        const intervalId = setInterval(() => {
            fetchSummary();
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const fullBins = bins.filter(
        (bin) => bin.status === "full" || bin.status === "overflow"
    ).length;

    const pendingIssues = issues.filter(
        (issue) => issue.status === "pending"
    ).length;

    return (
        <>
            <h1 className="page-title">Admin Dashboard</h1>

            <p style={{ marginTop: "8px", color: "#555" }}>
                Auto refresh enabled. Last updated: {lastUpdated || "Loading..."}
            </p>

            {message && <p className="message">{message}</p>}

            <div className="card-grid">
                <div className="card clickable-card" onClick={() => goToPage("employees")}>
                    <h3>{employees.length}</h3>
                    <p>Total Employees</p>
                </div>

                <div className="card clickable-card" onClick={() => goToPage("areas")}>
                    <h3>{areas.length}</h3>
                    <p>Total Areas</p>
                </div>

                <div className="card clickable-card" onClick={() => goToPage("bins")}>
                    <h3>{bins.length}</h3>
                    <p>Total Smart Bins</p>
                </div>

                <div className="card clickable-card" onClick={() => goToPage("bins")}>
                    <h3>{fullBins}</h3>
                    <p>Full / Overflow Bins</p>
                </div>

                <div className="card clickable-card" onClick={() => goToPage("tasks")}>
                    <h3>{tasks.length}</h3>
                    <p>Total Tasks</p>
                </div>

                <div className="card clickable-card" onClick={() => goToPage("issues")}>
                    <h3>{pendingIssues}</h3>
                    <p>Pending Issues</p>
                </div>
            </div>

            <AdminCharts bins={bins} tasks={tasks} issues={issues} />
        </>
    );
}

export default AdminHome;