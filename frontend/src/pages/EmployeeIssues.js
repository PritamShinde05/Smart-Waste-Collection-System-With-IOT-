import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import StatusBadge from "../components/StatusBadge";

function EmployeeIssues() {
    const [issues, setIssues] = useState([]);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchIssues = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/issues/my-issues`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setIssues(data);
            } else {
                setMessage(data.message || "Failed to fetch issues");
            }
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    return (
        <div>
            <h1 className="page-title">My Issues</h1>

            {message && <p className="message">{message}</p>}

            <div className="table-container">
                <h3>Reported Issues</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Issue ID</th>
                            <th>Bin</th>
                            <th>Task ID</th>
                            <th>Issue Type</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created At</th>
                        </tr>
                    </thead>

                    <tbody>
                        {issues.length > 0 ? (
                            issues.map((issue) => (
                                <tr key={issue.issue_id}>
                                    <td>{issue.issue_id}</td>
                                    <td>{issue.bin_code || "N/A"}</td>
                                    <td>{issue.task_id || "N/A"}</td>
                                    <td>{issue.issue_type}</td>
                                    <td>{issue.description || "No description"}</td>
                                    <td>
                                        <StatusBadge status={issue.status} />
                                    </td>
                                    <td>{new Date(issue.created_at).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No issues reported</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EmployeeIssues;