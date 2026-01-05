// src/components/RiskGauge.jsx
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function RiskGauge({ score, locationName = "Selected Location" }) { // Add locationName prop
  const riskValue = Math.round(score * 100);
  let riskColor, riskLevel;

  if (score < 0.4) {
    riskColor = '#28a745'; // Green
    riskLevel = 'Low';
  } else if (score < 0.7) {
    riskColor = '#fd7e14'; // Orange
    riskLevel = 'Medium';
  } else {
    riskColor = '#dc3545'; // Red
    riskLevel = 'High';
  }
  
  return (
    <div className="risk-display">
      
      <h2>Current Flood Risk</h2>
      <div className="risk-gauge-wrapper">
        <CircularProgressbar
          value={riskValue}
          text={`${riskValue}%`}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: riskColor,
            textColor: riskColor, // Use riskColor for percentage text
            trailColor: '#e2e8f0',
            pathTransitionDuration: 0.5,
            textSize: '24px',
          })}
        />
      </div>
      <div className="risk-level-text" style={{ color: riskColor }}>
        {riskLevel} Risk
      </div>

      
      {/* Optional: Add CSS for better styling */}
      <style jsx>{`
        .risk-display {
          text-align: center;
          padding: 20px;
        }
        
        .location-header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        
        .risk-gauge-wrapper {
          width: 180px;
          height: 180px;
          margin: 0 auto 20px;
        }
        
        h2 {
          color: #2d3748;
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .risk-level-text {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          padding: 8px 16px;
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 20px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

export default RiskGauge;
