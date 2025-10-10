// SelectedLocationPanel.jsx - UPDATED CODE

import { useState, useEffect } from 'react'; // --- ADDED --- hooks
import RiskGauge from './RiskGauge.jsx';
import ForecastChart from './ForecastChart.jsx';
import ControlSuggestions from './ControlSuggestions.jsx'; // --- ADDED --- new component

// This component displays the details for the currently selected location
function SelectedLocationPanel({ location }) {
  // --- ADDED --- State for suggestions and loading status
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- ADDED --- This effect fetches new suggestions whenever the location changes
  useEffect(() => {
    // Check if we have a valid location with an ID and risk score
    if (location && location.id && typeof location.riskScore !== 'undefined') {
      setIsLoading(true);
      
      // Fetch suggestions from the new backend endpoint
      fetch('http://127.0.0.1:5000/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: location.id,
          risk_score: location.riskScore,
        }),
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setSuggestions(data);
      })
      .catch(error => {
        console.error("Error fetching suggestions:", error);
        // Set a user-friendly error message
        setSuggestions([{ priority: 'Critical', action: 'Could not load suggestions from server.' }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [location]); // Dependency array: this runs whenever 'location' prop changes


  // If no location is selected (e.g., on initial load)
  if (!location) {
    return (
      <div className="details-panel">
        <div className="details-panel-placeholder">
            <h3>Awaiting Data...</h3>
            <p>Click a location on the map or list to see its risk assessment.</p>
        </div>
      </div>
    );
  }

  // --- REMOVED --- The old hardcoded 'action' and 'authorityAction' logic is gone.

  return (
    <div className="details-panel">
      <h2>{location.name}</h2>
      
      <RiskGauge score={location.riskScore} />

      <div className="forecast-chart-container">
        <h4>Risk score prediction</h4>
        <ForecastChart location={location} />
      </div>

      {/* --- ADDED --- The new dynamic suggestions component replaces the old alert cards */}
      <ControlSuggestions suggestions={suggestions} isLoading={isLoading} />
    </div>
  );
}

export default SelectedLocationPanel;