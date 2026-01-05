function AllRegionsList({ locations, onLocationSelect }) {
  const sortedLocations = [...locations].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="list-panel">
      <h3>All Monitored Regions</h3>
      {sortedLocations.map(loc => {
        const riskLevel =
          loc.riskScore >= 0.7 ? 'High' :
            loc.riskScore >= 0.4 ? 'Medium' : 'Low';

        const riskColor =
          riskLevel === 'High'
            ? '#e53e3e'
            : riskLevel === 'Medium'
              ? '#dd6b20'
              : '#38a169';

        return (
          <div
            key={loc.id}
            className="list-item"
            onClick={() => onLocationSelect(loc.id)}
            style={{
              cursor: 'pointer',
              padding: '12px',
              margin: '8px 0',
              borderLeft: `4px solid ${riskColor}`,
              backgroundColor: '#f7fafc',
              borderRadius: '4px',
              color: '#000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <strong style={{ color: '#000000' }}>
              {loc.name}
            </strong>
            <span style={{ color: riskColor, fontWeight: 'bold' }}>
              {riskLevel} Risk ({loc.riskScore.toFixed(2)})
            </span>
          </div>
        );
      })}

      {/* <style jsx>{`
          .list-panel h3 {
            margin-bottom: 20px;
            color: #2d3748;
          }
          
          .list-item:hover {
            background-color: #edf2f7;
            transform: translateX(2px);
            transition: all 0.2s ease;
          }
        `}</style> */}
    </div>
  );
}

export default AllRegionsList;