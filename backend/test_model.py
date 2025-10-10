import joblib
import pandas as pd
import numpy as np

# --- 1. Load the Trained Model and Feature List ---
MODEL_PATH = "rf_flood_model.joblib"
try:
    model_data = joblib.load(MODEL_PATH)
    model = model_data["model"]
    model_features = model_data["features"]
    print(f"✅ Model '{MODEL_PATH}' loaded successfully.")
    print(f"Model expects the following features: {model_features}")
except FileNotFoundError:
    print(f"❌ Error: Model file not found at '{MODEL_PATH}'.")
    print("Please run the 'run_pipeline.py' script first to train and save the model.")
    exit()

# --- 2. Create a Prediction Function ---
def predict_flood(input_data):
    """
    Takes a dictionary of feature values, makes a prediction,
    and prints a human-readable result.
    """
    # Create a pandas DataFrame from the single data point
    input_df = pd.DataFrame([input_data])
    
    # Ensure the columns are in the same order as the model was trained on
    input_df = input_df[model_features]

    # Make prediction (0 or 1)
    prediction = model.predict(input_df)[0]
    # Get prediction probability (the risk score for the 'flood' class)
    probability = model.predict_proba(input_df)[0][1]

    print("-" * 40)
    print("Input Data:")
    print(input_df.to_string(index=False))
    print("\nPrediction Result:")
    if prediction == 1:
        print(f"🚨 FLOOD PREDICTED with a risk score of {probability:.2f}")
    else:
        print(f"✅ NO FLOOD PREDICTED. Risk score is {probability:.2f}")
    print("-" * 40)

# --- 3. Define Test Scenarios ---
# Scenario 1: A normal day with light, scattered rain from two days ago
scenario_no_flood = {
    'lag_1': 0.0, 'lag_2': 5.0, 'lag_3': 2.0, 'lag_4': 0.0, 'lag_5': 0.0, 'lag_6': 0.0,
    'sum_3d': 7.0,
    'sum_6d': 7.0,
    'dayofyear': 150,  # Approx. late May
    'month': 5
}

# Scenario 2: A day after very heavy rainfall, exceeding the 50mm threshold
scenario_flood = {
    'lag_1': 30.0, 'lag_2': 25.0, 'lag_3': 10.0, 'lag_4': 5.0, 'lag_5': 1.0, 'lag_6': 0.0,
    'sum_3d': 65.0,  # Sum of last 3 days > 50mm
    'sum_6d': 71.0,
    'dayofyear': 200,  # Approx. mid-July (monsoon season)
    'month': 7
}

# --- 4. Run Predictions on the Scenarios ---
if __name__ == "__main__":
    print("\n--- Testing with 'No Flood' Scenario ---")
    predict_flood(scenario_no_flood)

    print("\n--- Testing with 'Flood' Scenario ---")
    predict_flood(scenario_flood)