// src/components/ForecastChart.jsx

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

function ForecastChart({ location }) {
  // --- START OF MODIFICATION ---

  let chartData;
  let chartLabels;
  let chartLabelText;

  // Check if this is the live IoT sensor node
  if (location.id === 'DRAIN_A01') {
    // For the live sensor, show the REAL historical data from the server
    chartLabelText = 'Historical Rainfall (mm/hr)';
    // Use the history array passed from the server
    chartData = location.history; 
    chartLabels = ['-6m', '-5m', '-4m', '-3m', '-2m', '-1m', 'Now']; // Labels for past minutes
  } else {
    // For all other nodes, use the original simulated forecast logic
    chartLabelText = 'Predicted Risk Score';
    chartLabels = ['Now', '+1 hr', '+2 hrs', '+3 hrs'];
    
    const forecastData = [location.riskScore];
    let lastScore = location.riskScore;
    for (let i = 0; i < 3; i++) {
      const change = lastScore > 0.5 ? 0.1 : -0.05;
      lastScore = Math.max(0, Math.min(1, lastScore + change));
      forecastData.push(lastScore);
    }
    chartData = forecastData;
  }

  // --- END OF MODIFICATION ---

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: chartLabelText,
        data: chartData,
        borderColor: '#a5d8ff',
        backgroundColor: 'rgba(165, 216, 255, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0 } }, // Allow y-axis to adjust for rainfall values
  };

  // If we are showing risk score, lock the y-axis between 0 and 1
  if (chartLabelText === 'Predicted Risk Score') {
    options.scales.y.max = 1;
  }

  return <Line options={options} data={data} />;
}

export default ForecastChart;