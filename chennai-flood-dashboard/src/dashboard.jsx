import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapDisplay from "./components/MapDisplay";
import SelectedLocationPanel from "./components/SelectedLocationPanel";
import AllRegionsList from "./components/AllRegionsList";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons in Next.js/React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

function Dashboard() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Default/fallback locations in case API fails or is loading
  const defaultLocations = [
    {
      id: "default_1",
      name: "Anna Nagar",
      lat: 13.0915,
      lon: 80.2101,
      riskScore: 0.3
    },
    {
      id: "default_2",
      name: "T Nagar",
      lat: 13.0414,
      lon: 80.2297,
      riskScore: 0.5
    },
    {
      id: "default_3",
      name: "Adyar",
      lat: 13.0067,
      lon: 80.2587,
      riskScore: 0.7
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://floodprediction-dashboard.onrender.com/status');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const transformedLocations = Object.keys(data).map(nodeId => ({
          id: nodeId,
          name: formatNodeName(nodeId),
          lat: data[nodeId].live_data?.lat || 13.0827,
          lon: data[nodeId].live_data?.lon || 80.2707,
          riskScore: data[nodeId].risk_score || 0,
          liveData: data[nodeId].live_data || {},
          history: data[nodeId].history || []
        }));

        setLocations(transformedLocations);
        
        // Auto-select first location if none selected
        if (transformedLocations.length > 0 && !selectedLocationId) {
          setSelectedLocationId(transformedLocations[0].id);
        }
        
        setError(null);
      } catch (e) {
        console.error("Backend not reachable", e);
        setError("Failed to connect to the prediction server. Using demo data.");
        // Use default locations on error
        if (locations.length === 0) {
          setLocations(defaultLocations);
          setSelectedLocationId(defaultLocations[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const formatNodeName = (nodeId) => {
    if (!nodeId) return "Unknown Location";
    return nodeId
      .replace(/_/g, ' ')
      .replace('chennai', '')
      .replace('live', 'Live Feed')
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocationId(locationId);
    setShowAllRegions(false);
  };

  const selectedLocation = locations.find(l => l.id === selectedLocationId) || defaultLocations[0];

  return (
    <div className="dashboard-page">
      {/* Navigation Header */}
      <header className="dashboard-header">
  <div className="header-container">
    {/* Hamburger Menu for Mobile */}
    <button 
      className="hamburger-menu" 
      onClick={() => setShowMobileMenu(!showMobileMenu)}
      aria-label="Toggle menu"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 6h16M4 12h16M4 18h16" 
        />
      </svg>
    </button>

    {/* Logo and Title */}
    <div className="header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
      <svg 
        className="logo-icon" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth="1.5" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" 
        />
      </svg>
      <h1>Chennai Flood Dashboard</h1>
    </div>

    {/* Navigation Links */}
    <nav className={`header-nav ${showMobileMenu ? 'mobile-show' : ''}`}>
      <button 
        className="nav-button home-button"
        onClick={() => navigate('/')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span>Home</span>
      </button>
      
      <button 
        className="nav-button about-button"
        onClick={() => navigate('/#about')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>About</span>
      </button>
      
      <button 
        className="nav-button logout-button"
        onClick={async () => {
          try {
            // Sign out from Clerk
            if (window.Clerk && window.Clerk.signOut) {
              await window.Clerk.signOut();
            }
            // Navigate to home page
            navigate('/');
          } catch (error) {
            console.error("Logout failed:", error);
            // Still navigate to home even if logout fails
            navigate('/');
          }
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
        <span>Logout</span>
      </button>
    </nav>
  </div>
</header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
      
      <div className="dashboard-container">
        {/* Control Panel */}
        <div className="control-panel">
          
          {showAllRegions ? (
            <AllRegionsList
              locations={locations.length > 0 ? locations : defaultLocations}
              onLocationSelect={handleLocationSelect}
            />
          ) : (
            <SelectedLocationPanel
              location={selectedLocation}
            />
          )}
          
          <div className="show-more-section">
            <button
              onClick={() => setShowAllRegions(!showAllRegions)}
              className="toggle-regions-btn"
            >
              {showAllRegions ? 'Back to Details' : 'Show All Risk Regions'}
            </button>
          </div>
        </div>
        
        {/* Map Display */}
        <div className="map-section">
          <div className="map-container">
            <MapDisplay
              locations={locations.length > 0 ? locations : defaultLocations}
              onMarkerClick={handleLocationSelect}
              selectedLocationId={selectedLocationId}
            />
          </div>
        </div>
      </div>
      
      {/* Add some CSS for layout */}
      <style jsx>{`
  .dashboard-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
    background-color: #f5f7fa;
    padding-top: 80px; /* Add padding for fixed header */
    overflow: hidden; /* Added to prevent page scrolling */
    height: calc(100vh - 80px); /* Added to fill viewport minus header */
  }
  
  /* Header Styles */
  .dashboard-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .hamburger-menu {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: #4b5563;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }
  
  .hamburger-menu:hover {
    background-color: #f3f4f6;
  }
  
  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.2s;
  }
  
  .header-title:hover {
    transform: translateY(-1px);
  }
  
  .header-title h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #1e40af;
    font-weight: 700;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
    color: #3b82f6;
  }
  
  .header-nav {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .nav-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #4b5563;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }
  
  .nav-button:hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
  }
  
  .home-button:hover {
    background: #10b981;
    border-color: #10b981;
    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
  }
  
  .logout-button:hover {
    background: #ef4444;
    border-color: #ef4444;
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
  }
  
  .nav-button svg {
    width: 16px;
    height: 16px;
  }
  
  /* Error banner - moved down for header */
  .error-banner {
    background-color: #fed7d7;
    color: #9b2c2c;
    padding: 12px;
    border-radius: 6px;
    margin: 20px 0;
    border-left: 4px solid #e53e3e;
    font-weight: 500;
  }
  
  .dashboard-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-top: 20px; /* Changed from 0 to 20px */
    height: 100%; /* Added to fill available space */
  }
  
  @media (max-width: 1024px) {
    .dashboard-container {
      grid-template-columns: 1fr;
    }
    
    .hamburger-menu {
      display: block;
    }
    
    .header-nav {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      background: white;
      flex-direction: column;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-top: 1px solid #e5e7eb;
      display: none;
    }
    
    .header-nav.mobile-show {
      display: flex;
    }
    
    .nav-button {
      width: 100%;
      justify-content: center;
    }
    
    .header-title h1 {
      font-size: 1.2rem;
    }
  }
  
  @media (max-width: 768px) {
    .dashboard-page {
      padding: 15px;
      padding-top: 70px;
      height: calc(100vh - 70px); /* Adjusted for smaller header */
    }
    
    .header-container {
      padding: 0 15px;
      height: 50px;
    }
    
    .header-title h1 {
      font-size: 1.1rem;
    }
    
    .control-panel, .map-section {
      border-radius: 8px;
    }
  }
  
  /* Rest of your existing styles remain the same */
  .control-panel {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    height: 500px; /* Changed from fit-content to 600px */
    min-height: 500px;
    overflow-y: auto; /* Added this line - enables scrolling inside panel */
  }
  
  .map-section {
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 500px; /* Added fixed height */
  }
  
  .map-container {
    height: 500px; /* Changed from 1000px to 600px */
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  
  /* Fix for Leaflet map white space */
  .leaflet-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
    z-index: 1;
  }
  
  .loading-state {
    border-left: 4px solid #3182ce;
    padding: 12px;
    background-color: #ebf8ff;
    color: #2c5282;
    margin-bottom: 20px;
    border-radius: 4px;
  }
  
  .toggle-regions-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.3s ease;
    margin-top: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .toggle-regions-btn:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .toggle-regions-btn:active {
    transform: translateY(0);
  }
`}</style>
    </div>
  );
}

export default Dashboard;