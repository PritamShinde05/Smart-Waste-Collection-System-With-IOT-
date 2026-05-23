import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";

function EmployeeReportIssue() {
    const [tasks, setTasks] = useState([]);
    const [taskDetails, setTaskDetails] = useState(null);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        task_id: "",
        bin_id: "",
        issue_type: "",
        description: ""
    });

    const token = localStorage.getItem("token");

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/employee/my-tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setTasks(data);
            } else {
                setMessage(data.message || "Failed to fetch tasks");
            }
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const fetchTaskDetails = async (taskId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setTaskDetails(data);
            } else {
                setMessage(data.message || "Failed to fetch task details");
            }
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
            bin_id: name === "task_id" ? "" : formData.bin_id
        });

        if (name === "task_id" && value) {
            fetchTaskDetails(value);
        }

        if (name === "task_id" && !value) {
            setTaskDetails(null);
        }
    };

    const clearForm = () => {
        setFormData({
            task_id: "",
            bin_id: "",
            issue_type: "",
            description: ""
        });
        setTaskDetails(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.issue_type) {
            setMessage("Issue type is required");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    task_id: formData.task_id ? Number(formData.task_id) : null,
                    bin_id: formData.bin_id ? Number(formData.bin_id) : null,
                    issue_type: formData.issue_type,
                    description: formData.description
                })
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to report issue");
                return;
            }

            setMessage(data.message);
            clearForm();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    return (
        <div>
            <h1 className="page-title">Report Issue</h1>

            <div className="form-card">
                <h3>Submit Issue Report</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Task</label>
                            <select
                                name="task_id"
                                value={formData.task_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Task</option>
                                {tasks.map((task) => (
                                    <option key={task.task_id} value={task.task_id}>
                                        Task #{task.task_id} - {task.area_name} - {task.status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Bin</label>
                            <select
                                name="bin_id"
                                value={formData.bin_id}
                                onChange={handleChange}
                                disabled={!formData.task_id}
                            >
                                <option value="">Select Bin</option>
                                {taskDetails &&
                                    taskDetails.bins.map((bin) => (
                                        <option key={bin.bin_id} value={bin.bin_id}>
                                            {bin.bin_code} - {bin.bin_status}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Issue Type</label>
                            <select
                                name="issue_type"
                                value={formData.issue_type}
                                onChange={handleChange}
                            >
                                <option value="">Select Issue Type</option>
                                <option value="Bin damaged">Bin damaged</option>
                                <option value="Sensor faulty">Sensor faulty</option>
                                <option value="Road blocked">Road blocked</option>
                                <option value="Collection delayed">Collection delayed</option>
                                <option value="Vehicle issue">Vehicle issue</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                placeholder="Write issue details"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn" type="submit">
                            Submit Issue
                        </button>

                        <button className="btn btn-danger" type="button" onClick={clearForm}>
                            Clear
                        </button>
                    </div>
                </form>

                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default EmployeeReportIssue;