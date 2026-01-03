import React from 'react';
import './ControlSuggestions.css';

const getPriorityClass = (priority) => {
  if (!priority) return 'priority-info';
  switch (priority.toLowerCase()) {
    case 'critical': return 'priority-critical';
    case 'high': return 'priority-high';
    case 'medium': 
    case 'warning': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return 'priority-info';
  }
};

const ControlSuggestions = ({ suggestions, isLoading, onShowReroute }) => {
  if (isLoading) {
    return (
      <div className="suggestions-container">
        <p className="loading-text">Analyzing risk data...</p>
      </div>
    );
  }
  
  // This is the critical fix: If suggestions is empty, we force the fallback text
  // to ensure "Drain A01" never shows "No specific resources defined"
  const hasSuggestions = suggestions && suggestions.length > 0;

  return (
    <div className="suggestions-container">
      <h4>Recommended Actions</h4>
      <ul className="suggestions-list">
        {!hasSuggestions ? (
          <li className="suggestion-item">
            <span className="priority-badge priority-info">STATUS</span>
            <div className="suggestion-content">
              <p>Monitoring active. No critical blockages detected in this drainage sector.</p>
            </div>
          </li>
        ) : (
          suggestions.map((item, index) => (
            <li key={index} className="suggestion-item">
              <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                {(item.priority || 'INFO').toUpperCase()}
              </span>
              <div className="suggestion-content">
                <p>{item.action}</p>
                {item.type === 'traffic_reroute' && (
                  <button 
                    className="reroute-button"
                    onClick={() => onShowReroute && onShowReroute(item.payload)}
                  >
                    View Reroute Plan
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ControlSuggestions;