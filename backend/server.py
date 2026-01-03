# server.py - FINAL UPDATED CODE

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import pandas as pd
from collections import deque, defaultdict
from controlmodule import generate_control_strategies

app = Flask(__name__)
CORS(app)

# --- Load Model ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "rf_flood_model.joblib")

try:
    model_data = joblib.load(MODEL_PATH)
    model = model_data["model"]
    model_features = model_data["features"]
    print("OK: Model loaded successfully.") # Removed special emoji for encoding safety
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# --- NEW FUNCTION FOR THRESHOLD-BASED RISK SCORING ---
def calculate_threshold_risk(water_level, rainfall):
    """
    Calculates a risk score between 0.0 and 1.0 based on simple thresholds.
    These thresholds can be easily adjusted.
    """
    # Define thresholds (Water level is out of 100cm, Rainfall in mm/hr)
    CRITICAL_WATER = 90.0  # 90% full
    HIGH_WATER = 75.0      # 75% full
    MEDIUM_WATER = 50.0    # 50% full

    CRITICAL_RAIN = 50.0   # Torrential downpour / cloudburst
    HIGH_RAIN = 25.0       # Very heavy rain
    MEDIUM_RAIN = 10.0     # Heavy rain

    # Calculate risk score based on the most severe condition
    if water_level >= CRITICAL_WATER or rainfall >= CRITICAL_RAIN:
        return 0.95  # Critical risk
    elif water_level >= HIGH_WATER or rainfall >= HIGH_RAIN:
        return 0.75  # High risk
    elif water_level >= MEDIUM_WATER or rainfall >= MEDIUM_RAIN:
        return 0.45  # Medium risk
    else:
        return 0.10  # Low risk

# --- In-Memory Data Storage ---
sensor_live_data = {}
sensor_histories = defaultdict(lambda: deque([0.0] * 7, maxlen=7))

# --- API Endpoints ---
@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    node_id = data.get('node_id')
    if not node_id:
        return jsonify({"status": "error", "message": "node_id is required"}), 400

    sensor_live_data[node_id] = data
    
    rainfall = data.get('rainfall_mm_hr', 0.0)
    sensor_histories[node_id].append(rainfall)

    print(f"Received data from {node_id}. Current rainfall: {rainfall}")
    return jsonify({"status": "success"}), 200


@app.route('/status', methods=['GET'])
def get_status():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    predictions = {}
    
    for node_id, history_deque in sensor_histories.items():
        if node_id not in sensor_live_data:
            continue

        # --- START OF MODIFICATION ---
         # We will make the comparison case-insensitive to be more robust
        if node_id.lower() == "drain_a01":
            
            # This message should appear for your Wokwi sensor
            print(f"DEBUG: Node '{node_id}' is using THRESHOLD logic.") 
            
            live_data = sensor_live_data.get(node_id, {})
            water_level = live_data.get("water_level_cm", 0.0)
            rainfall = live_data.get("rainfall_mm_hr", 0.0)
            
            risk_score = calculate_threshold_risk(water_level, rainfall)
            prediction = 1 if risk_score > 0.5 else 0 
            
            predictions[node_id] = {
                "live_data": live_data,
                "prediction": prediction,
                "risk_score": risk_score,
                "history": list(history_deque) 
            }
        else:
            
            # If you see this message for DRAIN_A01, there is a problem
            print(f"DEBUG: Node '{node_id}' is using MACHINE LEARNING logic.")
            
            history = list(history_deque)
            
            features = {
                'lag_1': history[-2], 'lag_2': history[-3], 'lag_3': history[-4],
                'lag_4': history[-5], 'lag_5': history[-6], 'lag_6': history[-7],
                'sum_3d': sum(history[-3:]),
                'sum_6d': sum(history[-6:]),
                'dayofyear': pd.Timestamp.now().dayofyear,
                'month': pd.Timestamp.now().month
            }
            input_df = pd.DataFrame([features])[model_features]
            
            prediction = model.predict(input_df)[0]
            probability = model.predict_proba(input_df)[0][1]

            predictions[node_id] = {
                "live_data": sensor_live_data[node_id],
                "prediction": int(prediction),
                "risk_score": float(probability),
                "history": history
            }
        # --- END OF DEBUG MODIFICATION ---
            
    return jsonify(predictions)

# --- ADDED: NEW ENDPOINT FOR CONTROL STRATEGIES ---
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    data = request.get_json()
    location_id = data.get('location_id')
    risk_score = data.get('risk_score')

    if location_id is None or risk_score is None:
        return jsonify({"error": "Missing location_id or risk_score"}), 400

    try:
        risk_score_float = float(risk_score)
        suggestions = generate_control_strategies(location_id, risk_score_float)
        return jsonify(suggestions)
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return jsonify({"error": "Could not generate suggestions"}), 500
# --- END ADDED SECTION ---

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)