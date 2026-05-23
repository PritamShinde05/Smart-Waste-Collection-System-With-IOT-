import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API_BASE_URL, { handleAuthError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminReports() {
    const [employees, setEmployees] = useState([]);
    const [areas, setAreas] = useState([]);
    const [bins, setBins] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [sensorData, setSensorData] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const fetchReports = async () => {
        try {
            setLoading(true);

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [
                employeesRes,
                areasRes,
                binsRes,
                tasksRes,
                issuesRes,
                sensorRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/employees`, { headers }),
                fetch(`${API_BASE_URL}/areas`, { headers }),
                fetch(`${API_BASE_URL}/bins`, { headers }),
                fetch(`${API_BASE_URL}/tasks`, { headers }),
                fetch(`${API_BASE_URL}/issues`, { headers }),
                fetch(`${API_BASE_URL}/sensor-data/latest`, { headers })
            ]);

            if (
                handleAuthError(employeesRes) ||
                handleAuthError(areasRes) ||
                handleAuthError(binsRes) ||
                handleAuthError(tasksRes) ||
                handleAuthError(issuesRes) ||
                handleAuthError(sensorRes)
            ) {
                return;
            }

            setEmployees(await employeesRes.json());
            setAreas(await areasRes.json());
            setBins(await binsRes.json());
            setTasks(await tasksRes.json());
            setIssues(await issuesRes.json());
            setSensorData(await sensorRes.json());
        } catch (error) {
            setMessage("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const countByStatus = (items, status) => {
        return Array.isArray(items)
            ? items.filter((item) => item.status === status).length
            : 0;
    };

    const countBinsByStatus = (status) => {
        return Array.isArray(bins)
            ? bins.filter((bin) => bin.status === status).length
            : 0;
    };

    const getAreaWiseReport = () => {
        return areas.map((area) => {
            const areaBins = bins.filter((bin) => bin.area_id === area.area_id);

            return {
                area_id: area.area_id,
                area_name: area.area_name,
                city: area.city,
                total_bins: areaBins.length,
                full_bins: areaBins.filter(
                    (bin) => bin.status === "full" || bin.status === "overflow"
                ).length
            };
        });
    };

    const downloadPDF = (fileName, title, columns, rows) => {
        if (!rows || rows.length === 0) {
            setMessage("No data available to export");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(title, 14, 15);

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 23);

        autoTable(doc, {
            startY: 30,
            head: [columns],
            body: rows
        });

        doc.save(fileName);
    };

    const getBinStatusRows = () => [
        ["Empty", countBinsByStatus("empty")],
        ["Half Filled", countBinsByStatus("half-filled")],
        ["Full", countBinsByStatus("full")],
        ["Overflow", countBinsByStatus("overflow")]
    ];

    const getTaskStatusRows = () => [
        ["Pending", countByStatus(tasks, "pending")],
        ["In Progress", countByStatus(tasks, "in-progress")],
        ["Completed", countByStatus(tasks, "completed")]
    ];

    const getIssueStatusRows = () => [
        ["Pending", countByStatus(issues, "pending")],
        ["Resolved", countByStatus(issues, "resolved")]
    ];

    const exportBinStatusReportPDF = () => {
        downloadPDF(
            "bin_status_report.pdf",
            "Bin Status Report",
            ["Status", "Total Bins"],
            getBinStatusRows()
        );
    };

    const exportTaskStatusReportPDF = () => {
        downloadPDF(
            "task_status_report.pdf",
            "Task Status Report",
            ["Status", "Total Tasks"],
            getTaskStatusRows()
        );
    };

    const exportIssueStatusReportPDF = () => {
        downloadPDF(
            "issue_status_report.pdf",
            "Issue Status Report",
            ["Status", "Total Issues"],
            getIssueStatusRows()
        );
    };

    const exportAreaWiseReportPDF = () => {
        const rows = getAreaWiseReport().map((area) => [
            area.area_id,
            area.area_name,
            area.city,
            area.total_bins,
            area.full_bins
        ]);

        downloadPDF(
            "area_wise_bin_report.pdf",
            "Area-wise Bin Report",
            ["Area ID", "Area Name", "City", "Total Bins", "Full / Overflow Bins"],
            rows
        );
    };

    if (loading) {
        return <LoadingSpinner text="Loading reports..." />;
    }

    return (
        <div>
            <h1 className="page-title">Reports</h1>

            {message && <p className="message">{message}</p>}

            <div className="form-card">
                <h3>Export Reports</h3>

                <div className="action-buttons">
                    <button className="btn" onClick={exportBinStatusReportPDF}>
                        Bin Status PDF
                    </button>

                    <button className="btn" onClick={exportTaskStatusReportPDF}>
                        Task Status PDF
                    </button>

                    <button className="btn" onClick={exportIssueStatusReportPDF}>
                        Issue Status PDF
                    </button>

                    <button className="btn" onClick={exportAreaWiseReportPDF}>
                        Area-wise PDF
                    </button>
                </div>
            </div>

            <div className="card-grid">
                <div className="card">
                    <h3>{employees.length}</h3>
                    <p>Total Employees</p>
                </div>

                <div className="card">
                    <h3>{areas.length}</h3>
                    <p>Total Areas</p>
                </div>

                <div className="card">
                    <h3>{bins.length}</h3>
                    <p>Total Bins</p>
                </div>

                <div className="card">
                    <h3>{tasks.length}</h3>
                    <p>Total Tasks</p>
                </div>

                <div className="card">
                    <h3>{issues.length}</h3>
                    <p>Total Issues</p>
                </div>

                <div className="card">
                    <h3>{sensorData.length}</h3>
                    <p>Latest Sensor Readings</p>
                </div>
            </div>

            <div className="table-container">
                <h3>Bin Status Report</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Total Bins</th>
                        </tr>
                    </thead>

                    <tbody>
                        {getBinStatusRows().map((row) => (
                            <tr key={row[0]}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <h3>Task Status Report</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Total Tasks</th>
                        </tr>
                    </thead>

                    <tbody>
                        {getTaskStatusRows().map((row) => (
                            <tr key={row[0]}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <h3>Issue Status Report</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Total Issues</th>
                        </tr>
                    </thead>

                    <tbody>
                        {getIssueStatusRows().map((row) => (
                            <tr key={row[0]}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <h3>Area-wise Bin Report</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Area ID</th>
                            <th>Area Name</th>
                            <th>City</th>
                            <th>Total Bins</th>
                            <th>Full / Overflow Bins</th>
                        </tr>
                    </thead>

                    <tbody>
                        {getAreaWiseReport().length > 0 ? (
                            getAreaWiseReport().map((area) => (
                                <tr key={area.area_id}>
                                    <td>{area.area_id}</td>
                                    <td>{area.area_name}</td>
                                    <td>{area.city}</td>
                                    <td>{area.total_bins}</td>
                                    <td>{area.full_bins}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No area report found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminReports;