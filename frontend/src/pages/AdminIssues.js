import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminIssues() {
    const [issues, setIssues] = useState([]);
    const [message, setMessage] = useState("");
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const fetchIssues = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/issues`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setIssues(data);
            } else {
                setMessage(data.message || "Failed to fetch issues");
            }
        } catch (error) {
            setMessage("Backend server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const updateIssueStatus = async (issueId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to update issue");
                return;
            }

            setMessage(data.message);
            fetchIssues();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const filteredIssues = issues.filter((issue) => {
        const search = searchText.toLowerCase();

        const matchesSearch =
            String(issue.issue_id).includes(searchText) ||
            issue.employee_name.toLowerCase().includes(search) ||
            issue.employee_email.toLowerCase().includes(search) ||
            (issue.bin_code || "").toLowerCase().includes(search) ||
            String(issue.task_id || "").includes(searchText) ||
            issue.issue_type.toLowerCase().includes(search) ||
            (issue.description || "").toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === "" || issue.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <LoadingSpinner text="Loading issues..." />;
    }

    return (
        <div>
            <h1 className="page-title">Issues</h1>

            {message && <p className="message">{message}</p>}

            <div className="form-card">
                <h3>Search & Filter Issues</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search by issue ID, employee, email, bin, task, issue type"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Status Filter</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <h3>Issue Reports</h3>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Bin</th>
                            <th>Task ID</th>
                            <th>Issue Type</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredIssues.length > 0 ? (
                            filteredIssues.map((issue) => (
                                <tr key={issue.issue_id}>
                                    <td>{issue.issue_id}</td>
                                    <td>{issue.employee_name}</td>
                                    <td>{issue.employee_email}</td>
                                    <td>{issue.bin_code || "N/A"}</td>
                                    <td>{issue.task_id || "N/A"}</td>
                                    <td>{issue.issue_type}</td>
                                    <td>{issue.description || "No description"}</td>
                                    <td>
                                        <StatusBadge status={issue.status} />
                                    </td>
                                    <td>{new Date(issue.created_at).toLocaleString()}</td>
                                    <td>
                                        {issue.status === "pending" ? (
                                            <button
                                                className="btn"
                                                onClick={() =>
                                                    updateIssueStatus(issue.issue_id, "resolved")
                                                }
                                            >
                                                Mark Resolved
                                            </button>
                                        ) : (
                                            <span>Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">No issues found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminIssues;