import { useEffect, useRef, useState } from "react";
import API_BASE_URL, { handleAuthError } from "../services/api";

function IoTSimulator() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSimulating, setIsSimulating] = useState(
        localStorage.getItem("iotSimulation") === "running"
    );
    const [message, setMessage] = useState("");

    const intervalRef = useRef(null);
    const token = localStorage.getItem("token");

    const fetchBins = async () => {
        const response = await fetch(`${API_BASE_URL}/bins`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (handleAuthError(response)) {
            return [];
        }

        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
            return [];
        }

        return data;
    };

    const sendRandomSensorData = async () => {
        try {
            const bins = await fetchBins();

            if (bins.length === 0) {
                setMessage("No bins available for simulation");
                return;
            }

            const randomBin = bins[Math.floor(Math.random() * bins.length)];
            const randomFillLevel = Math.floor(Math.random() * 101);
            const randomBatteryLevel = Math.floor(Math.random() * 41) + 60;

            await fetch(`${API_BASE_URL}/sensor-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bin_id: Number(randomBin.bin_id),
                    fill_level: randomFillLevel,
                    battery_level: randomBatteryLevel,
                    sensor_status: "active"
                })
            });

            setMessage(`${randomBin.bin_code} updated to ${randomFillLevel}%`);

            window.dispatchEvent(new Event("sensorDataUpdated"));
        } catch (error) {
            setMessage("Simulation error");
        }
    };

    const startSimulation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        localStorage.setItem("iotSimulation", "running");
        setIsSimulating(true);
        setMessage("Simulation started");

        sendRandomSensorData();

        intervalRef.current = setInterval(() => {
            sendRandomSensorData();
        }, 5000);
    };

    const stopSimulation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        localStorage.removeItem("iotSimulation");
        setIsSimulating(false);
        setMessage("Simulation stopped");
    };

    useEffect(() => {
        if (localStorage.getItem("iotSimulation") === "running") {
            startSimulation();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <>
            <button
                className={`iot-floating-btn ${isSimulating ? "iot-running" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                title="IoT Simulator"
            >
                📡
            </button>

            {isOpen && (
                <div className="iot-popup">
                    <div className="iot-popup-header">
                        <h3>Live IoT Sensor</h3>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <p className="iot-popup-text">
                        Simulates sensor readings every 5 seconds.
                    </p>

                    <p>
                        Status:{" "}
                        <strong>
                            {isSimulating ? "Running" : "Stopped"}
                        </strong>
                    </p>

                    <div className="action-buttons">
                        <button
                            className="btn"
                            onClick={startSimulation}
                            disabled={isSimulating}
                        >
                            Start
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={stopSimulation}
                            disabled={!isSimulating}
                        >
                            Stop
                        </button>
                    </div>

                    {message && <p className="message">{message}</p>}
                </div>
            )}
        </>
    );
}

export default IoTSimulator;