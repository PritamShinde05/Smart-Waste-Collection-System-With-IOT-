import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";

function EmployeeRoute() {
    const [tasks, setTasks] = useState([]);
    const [routeData, setRouteData] = useState(null);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        task_id: "",
        start_latitude: "",
        start_longitude: ""
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

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const generateRoute = async (e) => {
        e.preventDefault();

        if (!formData.task_id || !formData.start_latitude || !formData.start_longitude) {
            setMessage("Task, start latitude, and start longitude are required");
            return;
        }

        try {
            const url = `${API_BASE_URL}/routes/task/${formData.task_id}?start_latitude=${formData.start_latitude}&start_longitude=${formData.start_longitude}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to generate route");
                setRouteData(null);
                return;
            }

            setMessage(data.message);
            setRouteData(data);
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    return (
        <div>
            <h1 className="page-title">My Route</h1>

            <div className="form-card">
                <h3>Generate Route</h3>

                <form onSubmit={generateRoute}>
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
                            <label>Start Latitude</label>
                            <input
                                type="number"
                                step="any"
                                name="start_latitude"
                                placeholder="Example: 16.8500"
                                value={formData.start_latitude}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Longitude</label>
                            <input
                                type="number"
                                step="any"
                                name="start_longitude"
                                placeholder="Example: 74.5800"
                                value={formData.start_longitude}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button className="btn" type="submit">
                        Generate Route
                    </button>
                </form>

                {message && <p className="message">{message}</p>}
            </div>

            {routeData && (
                <div className="table-container">
                    <h3>Optimized Collection Route</h3>

                    <p>
                        <strong>Task ID:</strong> {routeData.task_id}
                    </p>

                    <p>
                        <strong>Total Distance:</strong> {routeData.total_distance_km} km
                    </p>

                    <br />

                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Bin Code</th>
                                <th>Area</th>
                                <th>City</th>
                                <th>Bin Status</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Distance From Previous</th>
                            </tr>
                        </thead>

                        <tbody>
                            {routeData.route.map((bin, index) => (
                                <tr key={bin.task_bin_id}>
                                    <td>{index + 1}</td>
                                    <td>{bin.bin_code}</td>
                                    <td>{bin.area_name}</td>
                                    <td>{bin.city}</td>
                                    <td>{bin.bin_status}</td>
                                    <td>{bin.latitude}</td>
                                    <td>{bin.longitude}</td>
                                    <td>{bin.distance_from_previous_km} km</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default EmployeeRoute;