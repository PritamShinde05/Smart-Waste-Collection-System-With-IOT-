import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

function AdminCharts({ bins, tasks, issues }) {
    const countBinsByStatus = (status) => {
        return bins.filter((bin) => bin.status === status).length;
    };

    const countTasksByStatus = (status) => {
        return tasks.filter((task) => task.status === status).length;
    };

    const countIssuesByStatus = (status) => {
        return issues.filter((issue) => issue.status === status).length;
    };

    const binChartData = {
        labels: ["Empty", "Half Filled", "Full", "Overflow"],
        datasets: [
            {
                label: "Bins",
                data: [
                    countBinsByStatus("empty"),
                    countBinsByStatus("half-filled"),
                    countBinsByStatus("full"),
                    countBinsByStatus("overflow")
                ],
                backgroundColor: [
                    "#4CAF50", // Empty - Green
                    "#FFC107", // Half Filled - Yellow
                    "#FF5722", // Full - Orange
                    "#F44336"  // Overflow - Red
                ],
                borderWidth: 1
            }
        ]
    };

    const taskChartData = {
        labels: ["Pending", "In Progress", "Completed"],
        datasets: [
            {
                label: "Tasks",
                data: [
                    countTasksByStatus("pending"),
                    countTasksByStatus("in-progress"),
                    countTasksByStatus("completed")
                ],
                backgroundColor: [
                    "#FFC107", // Pending
                    "#2196F3", // In Progress
                    "#4CAF50"  // Completed
                ]
            }
        ]
    };

    const issueChartData = {
        labels: ["Pending", "Resolved"],
        datasets: [
            {
                label: "Issues",
                data: [
                    countIssuesByStatus("pending"),
                    countIssuesByStatus("resolved")
                ],
                backgroundColor: [
                    "#FF9800", // Pending
                    "#4CAF50"  // Resolved
                ],
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom"
        }
    }
};

    return (
        <div className="chart-grid">
            <div className="chart-card">
                <h3>Bin Status Distribution</h3>
                <Pie data={binChartData} options={chartOptions} />
            </div>

            <div className="chart-card">
                <h3>Task Status Distribution</h3>
                <Bar data={taskChartData} options={chartOptions} />
            </div>

            <div className="chart-card">
                <h3>Issue Status Distribution</h3>
                <Doughnut data={issueChartData} options={chartOptions} />
            </div>
        </div>
    );
}

export default AdminCharts;