import React from 'react';
import './ControlSuggestions.css'; // We will create this CSS file next

const getPriorityClass = (priority) => {
  switch (priority.toLowerCase()) {
    case 'critical': return 'priority-critical';
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return 'priority-info';
  }
};

const ControlSuggestions = ({ suggestions, isLoading, onShowReroute }) => {
  if (isLoading) {
    return <div className="suggestions-container"><p>Loading recommended actions...</p></div>;
  }
  
  if (!suggestions || suggestions.length === 0) {
    return <div className="suggestions-container"><p>No immediate actions required.</p></div>;
  }

  return (
    <div className="suggestions-container">
      <h4>Recommended Actions</h4>
      <ul className="suggestions-list">
        {suggestions.map((item, index) => (
            <li key={index} className="suggestion-item">
                <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                    {item.priority}
                </span>
                {item.type === 'traffic_reroute' ? (
                    <div className="suggestion-action">
                        <p>{item.action}</p>
                    </div>
                ) : (
                    <p>{item.action}</p>
                )}
            </li>
        ))}
      </ul>
    </div>
  );
};

export default ControlSuggestions;