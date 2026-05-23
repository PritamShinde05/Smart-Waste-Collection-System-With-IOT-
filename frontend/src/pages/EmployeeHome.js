import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";

function EmployeeHome() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [summary, setSummary] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalIssues: 0,
        pendingIssues: 0
    });

    const [message, setMessage] = useState("");

    const fetchSummary = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [tasksRes, issuesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/tasks/employee/my-tasks`, {
                    headers
                }),
                fetch(`${API_BASE_URL}/issues/my-issues`, {
                    headers
                })
            ]);

            if (
                handleAuthError(tasksRes) ||
                handleAuthError(issuesRes)
            ) {
                return;
            }

            const tasks = await tasksRes.json();
            const issues = await issuesRes.json();

            setSummary({
                totalTasks: Array.isArray(tasks)
                    ? tasks.length
                    : 0,

                pendingTasks: Array.isArray(tasks)
                    ? tasks.filter(
                          (task) =>
                              task.status === "pending"
                      ).length
                    : 0,

                inProgressTasks: Array.isArray(tasks)
                    ? tasks.filter(
                          (task) =>
                              task.status ===
                              "in-progress"
                      ).length
                    : 0,

                completedTasks: Array.isArray(tasks)
                    ? tasks.filter(
                          (task) =>
                              task.status ===
                              "completed"
                      ).length
                    : 0,

                totalIssues: Array.isArray(issues)
                    ? issues.length
                    : 0,

                pendingIssues: Array.isArray(issues)
                    ? issues.filter(
                          (issue) =>
                              issue.status ===
                              "pending"
                      ).length
                    : 0
            });
        } catch (error) {
            setMessage(
                "Failed to load employee dashboard summary"
            );
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    return (
        <>
            <h1 className="page-title">
                Employee Dashboard
            </h1>

            {message && (
                <p className="message">
                    {message}
                </p>
            )}

            <div className="card-grid">
                <div className="card">
                    <h3>
                        {summary.totalTasks}
                    </h3>
                    <p>My Total Tasks</p>
                </div>

                <div className="card">
                    <h3>
                        {summary.pendingTasks}
                    </h3>
                    <p>Pending Tasks</p>
                </div>

                <div className="card">
                    <h3>
                        {
                            summary.inProgressTasks
                        }
                    </h3>
                    <p>In Progress Tasks</p>
                </div>

                <div className="card">
                    <h3>
                        {
                            summary.completedTasks
                        }
                    </h3>
                    <p>Completed Tasks</p>
                </div>

                <div className="card">
                    <h3>
                        {summary.totalIssues}
                    </h3>
                    <p>
                        My Reported Issues
                    </p>
                </div>

                <div className="card">
                    <h3>
                        {
                            summary.pendingIssues
                        }
                    </h3>
                    <p>Pending Issues</p>
                </div>
            </div>
        </>
    );
}

export default EmployeeHome;