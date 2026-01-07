import { useState, useEffect } from 'react';
import RiskGauge from './RiskGauge.jsx';
import ForecastChart from './ForecastChart.jsx';
import ControlSuggestions from './ControlSuggestions.jsx';

function SelectedLocationPanel({ location }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- CLIENT-SIDE INTELLIGENCE ---
  // This generates the advice when the server has nothing useful to say
  const generateIoTSuggestions = (score, name) => {
    const safeScore = score || 0; 
    const locName = name || "Drain Sensor";

    if (safeScore >= 0.8) {
      return [{ 
        priority: 'Critical', 
        type: 'alert',
        action: `FLOOD DETECTED at ${locName}: Risk level is critical (${(safeScore*100).toFixed(0)}%). Activate outflow pumps immediately.` 
      }];
    } else if (safeScore >= 0.4) {
      return [{ 
        priority: 'Warning',
        type: 'warning', 
        action: `Rising water levels at ${locName}. Verify sensor calibration and clear debris screens.` 
      }];
    }
    return [{ 
      priority: 'Low',
      type: 'info', 
      action: `IoT Link Active: ${locName} is reporting normal water levels. Standby.` 
    }];
  };

  useEffect(() => {
    if (location && location.id) {
      setIsLoading(true);
      
      const API_URL = 'https://floodprediction-dashboard.onrender.com/api/suggestions';

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: location.id,
          risk_score: location.riskScore || 0,
        }),
      })
      .then(res => {
        if (!res.ok) throw new Error('Server Offline'); 
        return res.json();
      })
      .then(data => {
        // --- THE FIX IS HERE ---
        // We check if the data is empty OR if it contains the generic "No specific resources" message
        const isGenericResponse = data.length === 1 && 
                                  data[0].action && 
                                  data[0].action.includes("No specific resources");

        if (!data || data.length === 0 || isGenericResponse) {
          console.log("Server returned generic/empty response. Using local IoT logic.");
          // Ignore the server and use our smart local logic
          setSuggestions(generateIoTSuggestions(location.riskScore, location.name));
        } else {
          setSuggestions(data);
        }
      })
      .catch(error => {
        console.warn("API failed, switching to offline IoT mode.");
        setSuggestions(generateIoTSuggestions(location.riskScore, location.name));
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [location]); 

  if (!location) {
    return (
      <div className="details-panel">
        <div className="details-panel-placeholder">
          <h3>Awaiting Sensor Selection...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="details-panel">
      <h2>{location.name}</h2>
      <RiskGauge score={location.riskScore || 0} />

      <div className="forecast-chart-container">
      <h4 style={{ color: '#1a365d' }}>Risk Score Prediction</h4> 
      <ForecastChart location={location} />
    </div>


      <div className="suggestions-section">
        <ControlSuggestions suggestions={suggestions} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default SelectedLocationPanel;