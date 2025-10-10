import { useState, useEffect } from 'react';
import { Waves, List } from 'lucide-react';
import MapDisplay from './components/MapDisplay.jsx';
import SelectedLocationPanel from './components/SelectedLocationPanel.jsx';
import './index.css';

// --- Helper Functions ---
function formatNodeName(nodeId) {
    return nodeId.replace(/_/g, ' ').replace('chennai', '').replace('live', 'Live Feed').trim().replace(/\b\w/g, l => l.toUpperCase());
}

function AllRegionsList({ locations, onLocationSelect }) {
    const sortedLocations = [...locations].sort((a, b) => b.riskScore - a.riskScore);
    return (
        <div className="details-panel list-panel">
            <h3>All Monitored Regions</h3>
            {sortedLocations.map(loc => {
                const riskLevel = loc.riskScore >= 0.7 ? 'High' : loc.riskScore >= 0.4 ? 'Medium' : 'Low';
                const riskColor = riskLevel === 'High' ? 'var(--color-red)' : riskLevel === 'Medium' ? 'var(--color-orange)' : 'var(--color-green)';
                return (
                    <div key={loc.id} className="list-item" onClick={() => onLocationSelect(loc.id)} style={{ cursor: 'pointer' }}>
                        <strong>{loc.name}</strong>
                        <span style={{ color: riskColor, fontWeight: 'bold' }}>{riskLevel} Risk ({loc.riskScore.toFixed(2)})</span>
                    </div>
                );
            })}
        </div>
    );
}

// --- Main App Component ---
function App() {
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [rerouteData, setRerouteData] = useState(null); // --- ADDED: State for rerouting
    const [showAllRegions, setShowAllRegions] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/status');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                const transformedLocations = Object.keys(data).map(nodeId => ({
                    id: nodeId,
                    name: formatNodeName(data[nodeId].live_data.node_id),
                    lat: data[nodeId].live_data.lat,
                    lon: data[nodeId].live_data.lon,
                    riskScore: data[nodeId].risk_score,
                    liveData: data[nodeId].live_data,
                    history: data[nodeId].history || []
                }));

                setLocations(transformedLocations);

                if (transformedLocations.length > 0) {
                    if (!selectedLocationId || !transformedLocations.find(l => l.id === selectedLocationId)) {
                        const highestRisk = transformedLocations.reduce((max, loc) => loc.riskScore > max.riskScore ? loc : max, transformedLocations[0]);
                        setSelectedLocationId(highestRisk.id);
                    }
                }
                
                setError(null);
            } catch (e) {
                console.error("Could not fetch data from backend. Is the Python server running?", e);
                setError("Failed to connect to the prediction server.");
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 10000);
        return () => clearInterval(intervalId);
    }, [selectedLocationId]);

    // --- MODIFIED: Clears old routes when a new location is selected ---
    const handleLocationSelect = (locationId) => {
        setSelectedLocationId(locationId);
        setRerouteData(null); 
        setShowAllRegions(false);
    };

    // --- ADDED: Function to be called from the suggestions panel to set route data ---
    const handleShowReroute = (roadsPayload) => {
        // This creates a demo route. For a real app, start/end might be user-defined.
        const demoRoute = {
            start: [13.05, 80.22], // Demo start point (e.g., a major transport hub)
            end: [13.03, 80.24],   // Demo end point (e.g., a safe zone)
            avoid: roadsPayload,  // The roads to close, received from the suggestion
        };
        setRerouteData(demoRoute);
    };


    const selectedLocation = locations.find(l => l.id === selectedLocationId);

    return (
        <div className="dashboard-container">
            <div className="control-panel">
                <div className="panel-header">
                    <Waves size={40} />
                    <h1>Chennai Flood Intel</h1>
                </div>
                
                {error && <div className="error-message">{error}</div>}

                {showAllRegions ? (
                    <AllRegionsList locations={locations} onLocationSelect={handleLocationSelect} />
                ) : (
                     // --- MODIFIED: Pass the onShowReroute handler down to the panel ---
                    <SelectedLocationPanel 
                        location={selectedLocation} 
                        onShowReroute={handleShowReroute}
                    />
                )}

                <div className="show-more-section">
                    <button onClick={() => setShowAllRegions(!showAllRegions)} disabled={!locations.length}>
                        <List size={16} /> {showAllRegions ? 'Back to Details' : 'Show All Risk Regions'}
                    </button>
                </div>
            </div>

            {/* --- MODIFIED: Pass the rerouting data down to the map component --- */}
            <MapDisplay 
                locations={locations} 
                onMarkerClick={handleLocationSelect} 
                selectedLocationId={selectedLocationId}
                rerouteData={rerouteData}
            />
        </div>
    );
}

export default App;
