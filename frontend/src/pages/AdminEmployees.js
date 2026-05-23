import { useEffect, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const token = localStorage.getItem("token");

    const fetchEmployees = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/employees`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setEmployees(data);
            } else {
                setMessage(data.message || "Failed to fetch employees");
            }
        } catch (error) {
            setMessage("Backend server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const clearForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            phone: ""
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            setMessage("Name and email are required");
            return;
        }

        if (!editingId && !formData.password) {
            setMessage("Password is required for new employee");
            return;
        }

        try {
            const url = editingId
                ? `${API_BASE_URL}/employees/${editingId}`
                : `${API_BASE_URL}/employees`;

            const method = editingId ? "PUT" : "POST";

            const bodyData = editingId
                ? {
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone
                  }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Operation failed");
                return;
            }

            setMessage(data.message);
            clearForm();
            fetchEmployees();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const handleEdit = (employee) => {
        setEditingId(employee.user_id);
        setFormData({
            name: employee.name,
            email: employee.email,
            password: "",
            phone: employee.phone || ""
        });
        setMessage("Editing employee. Password is not required while updating.");
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this employee?");

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Delete failed");
                return;
            }

            setMessage(data.message);
            fetchEmployees();
        } catch (error) {
            setMessage("Backend server error");
        }
    };

    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (employee.phone || "").includes(searchText)
    );

    if (loading) {
        return <LoadingSpinner text="Loading employees..." />;
    }

    return (
        <div>
            <h1 className="page-title">Employees</h1>

            <div className="form-card">
                <h3>{editingId ? "Update Employee" : "Add Employee"}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter employee name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter employee email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder={editingId ? "Not required while updating" : "Enter password"}
                                value={formData.password}
                                onChange={handleChange}
                                disabled={editingId ? true : false}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn" type="submit">
                            {editingId ? "Update Employee" : "Add Employee"}
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
                <h3>Search Employees</h3>

                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <h3>Employee List</h3>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <tr key={employee.user_id}>
                                    <td>{employee.user_id}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.phone}</td>
                                    <td>{new Date(employee.created_at).toLocaleString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn" onClick={() => handleEdit(employee)}>
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(employee.user_id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No employees found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminEmployees;