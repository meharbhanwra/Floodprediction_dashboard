import json

def load_resources():
    """Loads the location-to-resource mapping from a JSON file."""
    with open('resources.json', 'r') as f:
        return json.load(f)

RESOURCES = load_resources()

def generate_control_strategies(location_id, risk_score):
    """Generates control strategies based on location and risk score."""
    
    suggestions = []
    
    if location_id not in RESOURCES:
        return [{"priority": "Info", "action": "No specific resources defined for this location."}]

    location_resources = RESOURCES[location_id]
    location_name = location_resources.get("name", "the area")

    # Rule 1: Critical Risk
    if risk_score > 0.8:
        suggestions.append({
            "priority": "Critical",
            "type": "pumping", 
            "action": f"Activate all pumping stations immediately: {', '.join(location_resources['pumping_stations'])}."
        })
        
        roads_to_divert = location_resources['major_roads_for_rerouting']
        road_names = ', '.join([road['name'] for road in roads_to_divert])
        suggestions.append({
            "priority": "Critical",
            "type": "traffic_reroute",
            "action": f"Initiate mandatory traffic diversion on: {road_names}.",
            "payload": {
                "roads": roads_to_divert
            }
        })
        suggestions.append({
            "priority": "High",
            "type": "alert",
            "action": f"Send 'Severe Flood Alert' SMS to citizens in {location_name}."
        })
        suggestions.append({
            "priority": "Medium", 
            "action": f"Prepare emergency shelter for evacuees: {location_resources['emergency_shelters'][0]}."
        })

    # Rule 2: High Risk
    elif risk_score > 0.6:
        suggestions.append({
            "priority": "High", 
            "action": f"Place pumping stations on standby: {', '.join(location_resources['pumping_stations'])}."
        })
        suggestions.append({
            "priority": "Medium", 
            "action": "Send 'Flood Watch' notifications to citizens."
        })
        suggestions.append({
            "priority": "Medium", 
            "action": f"Alert traffic police to monitor congestion on: {', '.join(location_resources['major_roads_for_rerouting'])}."
        })

    # Rule 3: Medium Risk
    elif risk_score > 0.4:
        suggestions.append({
            "priority": "Low", 
            "action": "Continuously monitor water levels and downstream flow."
        })
        suggestions.append({
            "priority": "Info", 
            "action": "Ensure drainage channels are clear of obstructions."
        })
        
    else:
        suggestions.append({
            "priority": "Info",
            "action": f"Conditions are normal in {location_name}. Continue routine monitoring."
        })

    return suggestions