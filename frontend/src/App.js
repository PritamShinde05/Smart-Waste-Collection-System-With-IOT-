import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const savedToken = localStorage.getItem("token");

    const getInitialPage = () => {
        if (!savedToken || !savedUser) {
            return "login";
        }

        if (savedUser.role === "admin") {
            return "admin";
        }

        if (savedUser.role === "employee") {
            return "employee";
        }

        return "login";
    };

    const [currentPage, setCurrentPage] = useState(getInitialPage());

    if (currentPage === "admin") {
        return <AdminDashboard />;
    }

    if (currentPage === "employee") {
        return <EmployeeDashboard />;
    }

    return <Login setCurrentPage={setCurrentPage} />;
}

export default App;