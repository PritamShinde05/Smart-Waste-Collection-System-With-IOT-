import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminTasks() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [areas, setAreas] = useState([]);
    const [bins, setBins] = useState([]);
    const [message, setMessage] = useState("");
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        employee_id: "",
        area_id: "",
        bin_ids: []
    });

    const token = localStorage.getItem("token");

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setTasks(data);
            } else {
                setMessage(data.message || "Failed to fetch tasks");
            }
        } catch (error) {
            setMessage("Failed to fetch tasks");
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setEmployees(data);
            }
        } catch (error) {
            setMessage("Failed to fetch employees");
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/areas`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setAreas(data);
            }
        } catch (error) {
            setMessage("Failed to fetch areas");
        }
    };

    const fetchBins = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bins`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setBins(data);
            }
        } catch (error) {
            setMessage("Failed to fetch bins");
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([
            fetchTasks(),
            fetchEmployees(),
            fetchAreas(),
            fetchBins()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
            bin_ids: e.target.name === "area_id" ? [] : formData.bin_ids
        });
    };

    const handleBinSelect = (binId) => {
        const numericBinId = Number(binId);

        if (formData.bin_ids.includes(numericBinId)) {
            setFormData({
                ...formData,
                bin_ids: formData.bin_ids.filter((id) => id !== numericBinId)
            });
        } else {
            setFormData({
                ...formData,
                bin_ids: [...formData.bin_ids, numericBinId]
            });
        }
    };

    const clearForm = () => {
        setFormData({
            employee_id: "",
            area_id: "",
            bin_ids: []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.employee_id || !formData.area_id || formData.bin_ids.length === 0) {
            setMessage("Employee, area, and at least one bin are required");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    employee_id: Number(formData.employee_id),
                    area_id: Number(formData.area_id),
                    bin_ids: formData.bin_ids
                })
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to create task");
                return;
            }

            setMessage(data.message);
            clearForm();
            fetchTasks();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const filteredBins = formData.area_id
        ? bins.filter((bin) => Number(bin.area_id) === Number(formData.area_id))
        : [];

    const filteredTasks = tasks.filter((task) => {
        const search = searchText.toLowerCase();

        const matchesSearch =
            String(task.task_id).includes(searchText) ||
            task.employee_name.toLowerCase().includes(search) ||
            task.employee_email.toLowerCase().includes(search) ||
            task.area_name.toLowerCase().includes(search) ||
            task.city.toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === "" || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <LoadingSpinner text="Loading tasks..." />;
    }

    return (
        <div>
            <h1 className="page-title">Tasks</h1>

            <div className="form-card">
                <h3>Create Collection Task</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee</label>
                            <select
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.user_id} value={employee.user_id}>
                                        {employee.name} - {employee.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Area</label>
                            <select
                                name="area_id"
                                value={formData.area_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Area</option>
                                {areas.map((area) => (
                                    <option key={area.area_id} value={area.area_id}>
                                        {area.area_name} - {area.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-card inner-form-card">
                        <h3>Select Bins</h3>

                        {formData.area_id ? (
                            filteredBins.length > 0 ? (
                                <div className="checkbox-grid">
                                    {filteredBins.map((bin) => (
                                        <label key={bin.bin_id} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={formData.bin_ids.includes(bin.bin_id)}
                                                onChange={() => handleBinSelect(bin.bin_id)}
                                            />
                                            {bin.bin_code} ({bin.status})
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p>No bins found for selected area.</p>
                            )
                        ) : (
                            <p>Please select an area first.</p>
                        )}
                    </div>

                    <button className="btn" type="submit">
                        Create Task
                    </button>
                </form>

                {message && <p className="message">{message}</p>}
            </div>

            <div className="form-card">
                <h3>Search & Filter Tasks</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search by task ID, employee, email, area, or city"
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
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <h3>Task List</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Task ID</th>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Area</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Assigned Date</th>
                            <th>Completed Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <tr key={task.task_id}>
                                    <td>{task.task_id}</td>
                                    <td>{task.employee_name}</td>
                                    <td>{task.employee_email}</td>
                                    <td>{task.area_name}</td>
                                    <td>{task.city}</td>
                                    <td>
                                        <StatusBadge status={task.status} />
                                    </td>
                                    <td>{new Date(task.assigned_date).toLocaleString()}</td>
                                    <td>
                                        {task.completed_date
                                            ? new Date(task.completed_date).toLocaleString()
                                            : "Not completed"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">No tasks found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminTasks;