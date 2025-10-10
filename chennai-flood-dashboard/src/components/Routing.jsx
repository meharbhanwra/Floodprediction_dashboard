import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// This component is a child of the MapContainer and uses its context
const Routing = ({ rerouteData }) => {
  const map = useMap();

  useEffect(() => {
    // First, clear any previous routes and road highlights from the map
    map.eachLayer((layer) => {
        if (layer.options.id === 'routing-control' || layer.options.id === 'closed-road') {
            map.removeLayer(layer);
        }
    });

    // If there is new rerouteData, draw the routes
    if (rerouteData) {
      // 1. Draw the "closed" roads in red using their coordinates
      rerouteData.avoid.forEach(road => {
          L.polyline(road.coordinates, { 
            color: 'red', 
            weight: 6, 
            opacity: 0.8, 
            id: 'closed-road' // Give it an ID for easy removal later
          }).addTo(map);
      });

      // 2. Calculate and draw the safe alternative route in green
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(rerouteData.start[0], rerouteData.start[1]),
          L.latLng(rerouteData.end[0], rerouteData.end[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false, // Hides the default text-based directions panel
        lineOptions: {
          styles: [{ color: 'green', opacity: 1, weight: 6 }]
        },
      }).addTo(map);
      
      // Give the control's layer group an ID for easy removal
       routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        routes.forEach(route => {
          const line = L.Routing.line(route, {
            styles: [{ color: 'green', opacity: 1, weight: 6 }],
            id: 'routing-control' // ID for removal
          });
          line.addTo(map);
        });
      });
    }
  }, [rerouteData, map]); // This effect runs whenever the route data or map instance changes

  return null; // This component does not render any visible HTML itself
};

export default Routing;