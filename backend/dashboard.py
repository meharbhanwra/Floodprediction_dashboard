import streamlit as st
import pandas as pd
import requests
import joblib
import time

# --- Configuration ---
SERVER_URL = "http://127.0.0.1:5000/data"
MODEL_PATH = "rf_flood_model.joblib"
# We will use the live Chennai node for our main prediction
PREDICTION_NODE_ID = "live_chennai"

# --- Load Model ---
# Use st.cache_resource to load the model only once
@st.cache_resource
def load_model(path):
    try:
        model_data = joblib.load(path)
        return model_data
    except FileNotFoundError:
        return None

model_data = load_model(MODEL_PATH)
if model_data:
    model = model_data["model"]
    model_features = model_data["features"]
else:
    st.error(f"Model file not found at '{MODEL_PATH}'. Please train the model first.")
    st.stop()

# --- App Layout ---
st.set_page_config(layout="wide")
st.title("🌊 Urban Flood Monitoring Dashboard")

# Create two columns for layout
col1, col2 = st.columns([2, 1])

with col1:
    st.header("Live Sensor Network Status")
    # Placeholder for the map
    map_placeholder = st.empty()
    # Placeholder for the data table
    data_placeholder = st.empty()

with col2:
    st.header(f"Flood Prediction for {PREDICTION_NODE_ID}")
    # Placeholders for prediction results
    prediction_placeholder = st.empty()
    risk_placeholder = st.empty()

# --- Data Fetching and Prediction Logic ---
def get_live_data():
    """Fetches the latest data from our server."""
    try:
        response = requests.get(SERVER_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Could not connect to data server: {e}")
        return {}

def create_features_from_live_data(live_data, history):
    """
    Creates the feature set required by the model from live sensor data.
    This is a simplified version for demonstration.
    """
    # For this demo, we'll use a very simple approach.
    # A real system would have a more robust way of tracking history.
    
    # Get today's rainfall
    today_rain = live_data.get('rainfall_mm_hr', 0.0)
    history.append(today_rain)
    if len(history) > 7: # Keep history for the last 7 days
        history.pop(0)

    # Calculate features
    features = {}
    for i in range(1, 7):
        features[f'lag_{i}'] = history[-1-i] if len(history) > i else 0
    
    features['sum_3d'] = sum(history[-3:])
    features['sum_6d'] = sum(history[-6:])
    
    now = pd.Timestamp.now()
    features['dayofyear'] = now.dayofyear
    features['month'] = now.month
    
    return features

# Initialize session state to store rainfall history
if 'rainfall_history' not in st.session_state:
    st.session_state.rainfall_history = [0.0] * 7 # Start with a week of no rain

# --- Main App Loop ---
while True:
    live_data = get_live_data()
    
    if live_data:
        # --- Update Dashboard ---
        # 1. Display Sensor Data Table
        node_ids = list(live_data.keys())
        rows = []
        map_data = []
        for node_id in node_ids:
            node = live_data[node_id]['data']
            # Coordinates for map (example values)
            lat = 13.08 + random.uniform(-0.05, 0.05)
            lon = 80.27 + random.uniform(-0.05, 0.05)
            rows.append(node)
            map_data.append({"lat": lat, "lon": lon})
        
        data_placeholder.dataframe(pd.DataFrame(rows).set_index('node_id'))
        
        # 2. Display Map
        if map_data:
            map_placeholder.map(pd.DataFrame(map_data))

        # --- Make Prediction ---
        # 3. Get data for our main prediction node
        prediction_node_data = live_data.get(PREDICTION_NODE_ID, {}).get('data', {})
        
        if prediction_node_data:
            # Create features for the model
            features = create_features_from_live_data(prediction_node_data, st.session_state.rainfall_history)
            
            # Predict
            input_df = pd.DataFrame([features])[model_features]
            prediction = model.predict(input_df)[0]
            probability = model.predict_proba(input_df)[0][1]

            # Display prediction
            if prediction == 1:
                prediction_placeholder.error("🚨 FLOOD PREDICTED")
            else:
                prediction_placeholder.success("✅ NO FLOOD PREDICTED")
            
            risk_placeholder.progress(probability, text=f"Flood Risk Score: {probability:.2f}")

    # Refresh every 10 seconds
    time.sleep(10)
