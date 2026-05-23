const API_BASE_URL = "http://localhost:5000/api";

export const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
        return true;
    }

    return false;
};

export default API_BASE_URL;