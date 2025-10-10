// src/components/RiskGauge.jsx
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function RiskGauge({ score }) {
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
            textColor: '#f8f9fa',
            trailColor: '#343a40',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      <div className="risk-level-text" style={{ color: riskColor }}>
        {riskLevel} Risk
      </div>
    </div>
  );
}

export default RiskGauge;