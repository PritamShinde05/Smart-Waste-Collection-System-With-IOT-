import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminSensorData() {
    const [sensorData, setSensorData] = useState([]);
    const [bins, setBins] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const recordsPerPage = 10;

    const [formData, setFormData] = useState({
        bin_id: "",
        fill_level: "",
        battery_level: "",
        sensor_status: "active"
    });

    const token = localStorage.getItem("token");

    const fetchSensorData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/sensor-data`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setSensorData(data);
                setCurrentPage(1);
            } else {
                setMessage(data.message || "Failed to fetch sensor data");
            }
        } catch (error) {
            setMessage("Backend server error");
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
        await Promise.all([fetchSensorData(), fetchBins()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();

        const updateHandler = () => {
            fetchSensorData();
            fetchBins();
        };

        window.addEventListener("sensorDataUpdated", updateHandler);

        return () => {
            window.removeEventListener("sensorDataUpdated", updateHandler);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const clearForm = () => {
        setFormData({
            bin_id: "",
            fill_level: "",
            battery_level: "",
            sensor_status: "active"
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bin_id || formData.fill_level === "") {
            setMessage("Bin and fill level are required");
            return;
        }

        if (Number(formData.fill_level) < 0 || Number(formData.fill_level) > 100) {
            setMessage("Fill level must be between 0 and 100");
            return;
        }

        if (
            formData.battery_level !== "" &&
            (Number(formData.battery_level) < 0 || Number(formData.battery_level) > 100)
        ) {
            setMessage("Battery level must be between 0 and 100");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/sensor-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bin_id: Number(formData.bin_id),
                    fill_level: Number(formData.fill_level),
                    battery_level:
                        formData.battery_level === "" ? null : Number(formData.battery_level),
                    sensor_status: formData.sensor_status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to save sensor data");
                return;
            }

            setMessage(`${data.message}. Bin status: ${data.bin_status}`);
            clearForm();
            fetchSensorData();
            fetchBins();

            window.dispatchEvent(new Event("sensorDataUpdated"));
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const totalPages = Math.ceil(sensorData.length / recordsPerPage);

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;

    const currentRecords = sensorData.slice(startIndex, endIndex);

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading sensor data..." />;
    }

    return (
        <div>
            <h1 className="page-title">Sensor Data</h1>

            <div className="form-card">
                <h3>Simulate IoT Sensor Reading Manually</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Smart Bin</label>
                            <select
                                name="bin_id"
                                value={formData.bin_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Bin</option>
                                {bins.map((bin) => (
                                    <option key={bin.bin_id} value={bin.bin_id}>
                                        {bin.bin_code} - {bin.area_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fill Level (%)</label>
                            <input
                                type="number"
                                name="fill_level"
                                placeholder="Example: 85"
                                value={formData.fill_level}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Battery Level (%)</label>
                            <input
                                type="number"
                                name="battery_level"
                                placeholder="Example: 90"
                                value={formData.battery_level}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Sensor Status</label>
                            <select
                                name="sensor_status"
                                value={formData.sensor_status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="faulty">Faulty</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn" type="submit">
                        Send Sensor Data
                    </button>
                </form>

                {message && <p className="message">{message}</p>}
            </div>

            <div className="table-container">
                <h3>Sensor Reading History</h3>

                <p>
                    Showing {currentRecords.length} of {sensorData.length} records
                </p>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Bin Code</th>
                            <th>Area</th>
                            <th>City</th>
                            <th>Fill Level</th>
                            <th>Battery</th>
                            <th>Sensor Status</th>
                            <th>Bin Status</th>
                            <th>Recorded At</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((item) => (
                                <tr key={item.data_id}>
                                    <td>{item.data_id}</td>
                                    <td>{item.bin_code}</td>
                                    <td>{item.area_name}</td>
                                    <td>{item.city}</td>
                                    <td>{item.fill_level}%</td>
                                    <td>
                                        {item.battery_level === null
                                            ? "N/A"
                                            : `${item.battery_level}%`}
                                    </td>
                                    <td>
                                        <StatusBadge status={item.sensor_status} />
                                    </td>
                                    <td>
                                        <StatusBadge status={item.bin_status} />
                                    </td>
                                    <td>{new Date(item.recorded_at).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No sensor readings found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {sensorData.length > recordsPerPage && (
                    <div className="pagination">
                        <button
                            className="btn"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            className="btn"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminSensorData;