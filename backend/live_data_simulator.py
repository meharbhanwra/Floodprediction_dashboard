import requests
import json
import time
import random

# --- Configuration ---
API_KEY = "API KEY" # Not used in demo modeAPI_KEY = "API KEY" # Not used in demo mode
LIVE_CITY = "Chennai"
SERVER_URL = "http://127.0.0.1:5000/data"

# Set to True to use a predictable rainfall pattern for the main 'live' sensor
DEMO_MODE = True
# This pattern will be used for the 'live_chennai' node to show a predictable event
DEMO_RAINFALL_PATTERN = [0.0, 5.0, 15.0, 45.0, 60.0, 25.0, 10.0, 0.0, 0.0]

SIMULATED_NODES = [
    {"id": "chennai_adyar", "lat": 13.0044, "lon": 80.2534},
    {"id": "chennai_t_nagar", "lat": 13.0398, "lon": 80.2333},
    {"id": "chennai_velachery", "lat": 12.9806, "lon": 80.2215},
    {"id": "chennai_guindy", "lat": 13.0076, "lon": 80.2133},
    {"id": "chennai_madipakkam", "lat": 12.9649, "lon": 80.1983},
    {"id": "chennai_saidapet", "lat": 13.0250, "lon": 80.2255},
]

def get_live_weather(city, api_key):
    """Fetches real-time weather if DEMO_MODE is False."""
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": api_key, "units": "metric"}
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        weather = response.json()
        rainfall_mm = weather.get('rain', {}).get('1h', 0.0)
        return {
            "node_id": f"live_{city.lower().replace(' ', '_')}",
            "lat": weather['coord']['lat'],
            "lon": weather['coord']['lon'],
            "rainfall_mm_hr": rainfall_mm,
            "temperature_c": weather['main']['temp'],
            "humidity_percent": weather['main']['humidity']
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching live weather: {e}")
        return None

def simulate_node_data(node_info):
    """
    ✅ CORRECTED: Simulates UNIQUE rainfall data for each node.
    This is the key to making each region have an independent risk score.
    """
    # Each region gets a different random rainfall value to simulate localized weather
    simulated_rainfall = round(random.uniform(0, 65), 2) if random.random() > 0.4 else 0.0

    return {
        "node_id": node_info['id'],
        "lat": node_info['lat'],
        "lon": node_info['lon'],
        "rainfall_mm_hr": simulated_rainfall, # This is the crucial field for the model
        "water_level_cm": round(simulated_rainfall * random.uniform(0.5, 1.5), 2),
        "flow_rate_lps": round(simulated_rainfall * random.uniform(2, 5), 2)
    }

def send_to_server(data):
    """Sends a data packet to the Flask server."""
    try:
        response = requests.post(SERVER_URL, json=data, timeout=5)
        response.raise_for_status()
        print(f"Successfully sent data for node: {data['node_id']} (Rain: {data.get('rainfall_mm_hr', 'N/A')} mm/hr)")
    except requests.exceptions.RequestException as e:
        print(f"Error sending data for {data.get('node_id', 'unknown')}: {e}")

if __name__ == "__main__":
    cycle_count = 0
    while True:
        print(f"\n--- Starting Data Simulation Cycle #{cycle_count + 1} ---")
        live_data = None

        if DEMO_MODE:
            demo_rain_value = DEMO_RAINFALL_PATTERN[cycle_count % len(DEMO_RAINFALL_PATTERN)]
            print(f"DEMO MODE: Main 'live' sensor rainfall is {demo_rain_value} mm/hr.")
            live_data = {
                "node_id": f"live_{LIVE_CITY.lower()}",
                "lat": 13.0827, "lon": 80.2707,
                "rainfall_mm_hr": demo_rain_value,
                "temperature_c": 29.5,
                "humidity_percent": 85
            }
        else:
            print("LIVE MODE: Fetching real weather from OpenWeatherMap...")
            live_data = get_live_weather(LIVE_CITY, API_KEY=API_KEY)

        # Send data for the main 'live' node first
        if live_data:
            send_to_server(live_data)
        
        # Send unique data for all other simulated nodes
        for node in SIMULATED_NODES:
            simulated_data = simulate_node_data(node)
            send_to_server(simulated_data)
            time.sleep(0.2) # Small delay between sends
            
        wait_time = 15
        print(f"\n--- Cycle complete. Waiting for {wait_time} seconds... ---")
        time.sleep(wait_time)
        cycle_count += 1