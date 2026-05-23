import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import StatusBadge from "../components/StatusBadge";

function EmployeeTasks() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [message, setMessage] = useState("");

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

    useEffect(() => {
        fetchTasks();
    }, []);

    const viewTaskDetails = async (taskId) => {
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

            if (!response.ok) {
                setMessage(data.message || "Failed to fetch task details");
                return;
            }

            setSelectedTask(data);
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to update task status");
                return;
            }

            setMessage(data.message);
            fetchTasks();

            if (selectedTask) {
                viewTaskDetails(taskId);
            }
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const markBinCollected = async (taskBinId, taskId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/tasks/task-bin/${taskBinId}/collect`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to mark bin collected");
                return;
            }

            setMessage(data.message);
            viewTaskDetails(taskId);
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    return (
        <div>
            <h1 className="page-title">My Tasks</h1>

            {message && <p className="message">{message}</p>}

            <div className="table-container">
                <h3>Assigned Tasks</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Task ID</th>
                            <th>Area</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Assigned Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <tr key={task.task_id}>
                                    <td>{task.task_id}</td>
                                    <td>{task.area_name}</td>
                                    <td>{task.city}</td>
                                    <td>
                                        <StatusBadge status={task.status} />
                                    </td>
                                    <td>{new Date(task.assigned_date).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => viewTaskDetails(task.task_id)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No tasks assigned</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTask && (
                <div className="table-container">
                    <h3>Task Details - Task #{selectedTask.task.task_id}</h3>

                    <p>
                        <strong>Area:</strong> {selectedTask.task.area_name}
                    </p>

                    <p>
                        <strong>Status:</strong>{" "}
                        <StatusBadge status={selectedTask.task.status} />
                    </p>

                    <br />

                    <div className="action-buttons">
                        <button
                            className="btn"
                            onClick={() =>
                                updateTaskStatus(selectedTask.task.task_id, "in-progress")
                            }
                        >
                            Start Task
                        </button>

                        <button
                            className="btn"
                            onClick={() =>
                                updateTaskStatus(selectedTask.task.task_id, "completed")
                            }
                        >
                            Complete Task
                        </button>
                    </div>

                    <br />

                    <table>
                        <thead>
                            <tr>
                                <th>Task Bin ID</th>
                                <th>Bin Code</th>
                                <th>Bin Status</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Collection Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {selectedTask.bins.map((bin) => (
                                <tr key={bin.task_bin_id}>
                                    <td>{bin.task_bin_id}</td>
                                    <td>{bin.bin_code}</td>
                                    <td>
                                        <StatusBadge status={bin.bin_status} />
                                    </td>
                                    <td>{bin.latitude}</td>
                                    <td>{bin.longitude}</td>
                                    <td>
                                        <StatusBadge status={bin.collection_status} />
                                    </td>
                                    <td>
                                        {bin.collection_status === "pending" ? (
                                            <button
                                                className="btn"
                                                onClick={() =>
                                                    markBinCollected(
                                                        bin.task_bin_id,
                                                        selectedTask.task.task_id
                                                    )
                                                }
                                            >
                                                Mark Collected
                                            </button>
                                        ) : (
                                            <span>Collected</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default EmployeeTasks;