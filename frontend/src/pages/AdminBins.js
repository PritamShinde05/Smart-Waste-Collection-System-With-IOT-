import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminBins() {
    const [bins, setBins] = useState([]);
    const [areas, setAreas] = useState([]);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        bin_code: "",
        area_id: "",
        latitude: "",
        longitude: "",
        capacity: "",
        status: "empty"
    });

    const token = localStorage.getItem("token");

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
            } else {
                setMessage(data.message || "Failed to fetch bins");
            }
        } catch (error) {
            setMessage("Backend server error");
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

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchBins(), fetchAreas()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const clearForm = () => {
        setFormData({
            bin_code: "",
            area_id: "",
            latitude: "",
            longitude: "",
            capacity: "",
            status: "empty"
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bin_code || !formData.area_id) {
            setMessage("Bin code and area are required");
            return;
        }

        try {
            const url = editingId
                ? `${API_BASE_URL}/bins/${editingId}`
                : `${API_BASE_URL}/bins`;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Operation failed");
                return;
            }

            setMessage(data.message);
            clearForm();
            fetchBins();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const handleEdit = (bin) => {
        setEditingId(bin.bin_id);
        setFormData({
            bin_code: bin.bin_code,
            area_id: bin.area_id,
            latitude: bin.latitude || "",
            longitude: bin.longitude || "",
            capacity: bin.capacity || "",
            status: bin.status || "empty"
        });
        setMessage("Editing smart bin details.");
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this smart bin?");

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/bins/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Delete failed");
                return;
            }

            setMessage(data.message);
            fetchBins();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const filteredBins = bins.filter((bin) => {
        const matchesSearch =
            bin.bin_code.toLowerCase().includes(searchText.toLowerCase()) ||
            bin.area_name.toLowerCase().includes(searchText.toLowerCase()) ||
            bin.city.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus =
            statusFilter === "" || bin.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <LoadingSpinner text="Loading smart bins..." />;
    }

    return (
        <div>
            <h1 className="page-title">Smart Bins</h1>

            <div className="form-card">
                <h3>{editingId ? "Update Smart Bin" : "Add Smart Bin"}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Bin Code</label>
                            <input
                                type="text"
                                name="bin_code"
                                placeholder="Example: BIN-001"
                                value={formData.bin_code}
                                onChange={handleChange}
                            />
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

                    <div className="form-row">
                        <div className="form-group">
                            <label>Latitude</label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                placeholder="Example: 16.8524"
                                value={formData.latitude}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Longitude</label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                placeholder="Example: 74.5815"
                                value={formData.longitude}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Capacity</label>
                            <input
                                type="number"
                                name="capacity"
                                placeholder="Example: 100"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="empty">Empty</option>
                                <option value="half-filled">Half Filled</option>
                                <option value="full">Full</option>
                                <option value="overflow">Overflow</option>
                            </select>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn" type="submit">
                            {editingId ? "Update Bin" : "Add Bin"}
                        </button>

                        {editingId && (
                            <button className="btn btn-danger" type="button" onClick={clearForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {message && <p className="message">{message}</p>}
            </div>

            <div className="form-card">
                <h3>Search & Filter Smart Bins</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search by bin code, area, or city"
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
                            <option value="empty">Empty</option>
                            <option value="half-filled">Half Filled</option>
                            <option value="full">Full</option>
                            <option value="overflow">Overflow</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <h3>Smart Bin List</h3>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Bin Code</th>
                            <th>Area</th>
                            <th>City</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Capacity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBins.length > 0 ? (
                            filteredBins.map((bin) => (
                                <tr key={bin.bin_id}>
                                    <td>{bin.bin_id}</td>
                                    <td>{bin.bin_code}</td>
                                    <td>{bin.area_name}</td>
                                    <td>{bin.city}</td>
                                    <td>{bin.latitude}</td>
                                    <td>{bin.longitude}</td>
                                    <td>{bin.capacity}</td>
                                    <td>
                                        <StatusBadge status={bin.status} />
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn" onClick={() => handleEdit(bin)}>
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(bin.bin_id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No smart bins found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminBins;