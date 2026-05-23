import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminAreas() {
    const [areas, setAreas] = useState([]);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        area_name: "",
        city: "",
        pincode: ""
    });

    const token = localStorage.getItem("token");

    const fetchAreas = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/areas`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (response.ok) {
                setAreas(data);
            } else {
                setMessage(data.message || "Failed to fetch areas");
            }
        } catch (error) {
            setMessage("Backend server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const clearForm = () => {
        setFormData({
            area_name: "",
            city: "",
            pincode: ""
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.area_name || !formData.city) {
            setMessage("Area name and city are required");
            return;
        }

        try {
            const url = editingId
                ? `${API_BASE_URL}/areas/${editingId}`
                : `${API_BASE_URL}/areas`;

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
            fetchAreas();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const handleEdit = (area) => {
        setEditingId(area.area_id);
        setFormData({
            area_name: area.area_name,
            city: area.city,
            pincode: area.pincode || ""
        });
        setMessage("Editing area details.");
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this area?");

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/areas/${id}`, {
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
            fetchAreas();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const filteredAreas = areas.filter((area) =>
        area.area_name.toLowerCase().includes(searchText.toLowerCase()) ||
        area.city.toLowerCase().includes(searchText.toLowerCase()) ||
        (area.pincode || "").includes(searchText)
    );

    if (loading) {
        return <LoadingSpinner text="Loading areas..." />;
    }

    return (
        <div>
            <h1 className="page-title">Areas</h1>

            <div className="form-card">
                <h3>{editingId ? "Update Area" : "Add Area"}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Area Name</label>
                            <input
                                type="text"
                                name="area_name"
                                placeholder="Enter area name"
                                value={formData.area_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="Enter city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                placeholder="Enter pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn" type="submit">
                            {editingId ? "Update Area" : "Add Area"}
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
                <h3>Search Areas</h3>

                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Search by area name, city, or pincode"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <h3>Area List</h3>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Area Name</th>
                            <th>City</th>
                            <th>Pincode</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAreas.length > 0 ? (
                            filteredAreas.map((area) => (
                                <tr key={area.area_id}>
                                    <td>{area.area_id}</td>
                                    <td>{area.area_name}</td>
                                    <td>{area.city}</td>
                                    <td>{area.pincode}</td>
                                    <td>{new Date(area.created_at).toLocaleString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn" onClick={() => handleEdit(area)}>
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(area.area_id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No areas found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminAreas;