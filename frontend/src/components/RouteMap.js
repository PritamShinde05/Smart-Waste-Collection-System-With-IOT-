import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function RouteMap({ routeData, allBins = [] }) {
    const [roadRoute, setRoadRoute] = useState([]);

    useEffect(() => {
        const fetchRoadRoute = async () => {
            if (!routeData || !routeData.route || routeData.route.length === 0) {
                return;
            }

            const coordinates = [
                [
                    Number(routeData.start_location.longitude),
                    Number(routeData.start_location.latitude)
                ],
                ...routeData.route.map((bin) => [
                    Number(bin.longitude),
                    Number(bin.latitude)
                ])
            ];

            const coordinateString = coordinates
                .map((point) => `${point[0]},${point[1]}`)
                .join(";");

            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`
                );

                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const routeCoordinates = data.routes[0].geometry.coordinates.map(
                        (point) => [point[1], point[0]]
                    );

                    setRoadRoute(routeCoordinates);
                }
            } catch (error) {
                console.log("Road route fetch failed", error);
            }
        };

        fetchRoadRoute();
    }, [routeData]);

    if (!routeData || !routeData.route || routeData.route.length === 0) {
        return null;
    }

    const startPosition = [
        Number(routeData.start_location.latitude),
        Number(routeData.start_location.longitude)
    ];

    const directLinePositions = [
        startPosition,
        ...routeData.route.map((bin) => [
            Number(bin.latitude),
            Number(bin.longitude)
        ])
    ];

    const otherBins = allBins.filter(
        (bin) =>
            !routeData.route.some(
                (routeBin) => Number(routeBin.bin_id) === Number(bin.bin_id)
            )
    );

    return (
        <div className="map-container">
            <MapContainer center={startPosition} zoom={14} className="route-map">
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={startPosition} icon={redIcon}>
                    <Popup>
                        <strong>Starting Point</strong>
                    </Popup>
                </Marker>

                {routeData.route.map((bin, index) => (
                    <Marker
                        key={bin.task_bin_id}
                        position={[Number(bin.latitude), Number(bin.longitude)]}
                        icon={blueIcon}
                    >
                        <Popup>
                            <strong>Stop {index + 1}</strong>
                            <br />
                            Bin: {bin.bin_code}
                            <br />
                            Area: {bin.area_name}
                            <br />
                            Status: {bin.bin_status}
                        </Popup>
                    </Marker>
                ))}

                {otherBins.map((bin) => (
                    <Marker
                        key={`other-${bin.bin_id}`}
                        position={[Number(bin.latitude), Number(bin.longitude)]}
                        icon={greenIcon}
                    >
                        <Popup>
                            <strong>{bin.bin_code}</strong>
                            <br />
                            Other Smart Bin
                            <br />
                            Area: {bin.area_name}
                            <br />
                            Status: {bin.status}
                        </Popup>
                    </Marker>
                ))}

                {roadRoute.length > 0 ? (
                    <Polyline
                        positions={roadRoute}
                        pathOptions={{
                            color: "blue",
                            weight: 5
                        }}
                    />
                ) : (
                    <Polyline
                        positions={directLinePositions}
                        pathOptions={{
                            color: "red",
                            weight: 4,
                            dashArray: "8"
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default RouteMap;