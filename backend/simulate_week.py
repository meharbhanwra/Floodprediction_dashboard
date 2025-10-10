import joblib
import pandas as pd
import numpy as np

# --- 1. Load the Trained Model and Feature List ---
MODEL_PATH = "rf_flood_model.joblib"
try:
    model_data = joblib.load(MODEL_PATH)
    model = model_data["model"]
    model_features = model_data["features"]
    print(f"✅ Model '{MODEL_PATH}' loaded successfully.\n")
except FileNotFoundError:
    print(f"❌ Error: Model file not found at '{MODEL_PATH}'.")
    print("Please run the 'run_pipeline.py' script first to train and save the model.")
    exit()

# --- 2. Define the Simulation Data ---
print("--- Setting up 7-Day Weather Simulation ---")
# Define a 7-day rainfall pattern: starts dry, heavy rain mid-week, then tapers off.
# Day 3 + Day 4 + Day 5 = 25+30+15 = 70mm, which should trigger the flood label.
daily_rainfall = [0.0, 5.0, 25.0, 30.0, 15.0, 2.0, 0.0]
dates = pd.to_datetime(pd.date_range(start="2025-07-15", periods=7, freq="D"))
simulation_df = pd.DataFrame({'time': dates, 'rain_mm': daily_rainfall}).set_index('time')

print("Simulated Daily Rainfall (mm):")
print(simulation_df['rain_mm'].to_string())
print("-" * 60)


# --- 3. Run the Daily Prediction Loop ---
print("--- Running Daily Flood Predictions ---")
for date in simulation_df.index:
    # Get the history of rainfall up to (and including) the current day
    history = simulation_df.loc[:date]

    # --- Feature Engineering for the current day ---
    # Calculate lag features (rainfall on previous days) based on history
    current_day_features = {}
    for i in range(1, 7):
        if len(history) > i:
            current_day_features[f'lag_{i}'] = history['rain_mm'].shift(i).iloc[-1]
        else:
            current_day_features[f'lag_{i}'] = 0
            
    # Calculate sum features (rolling sums)
    current_day_features['sum_3d'] = history['rain_mm'].rolling(window=3, min_periods=1).sum().iloc[-1]
    current_day_features['sum_6d'] = history['rain_mm'].rolling(window=6, min_periods=1).sum().iloc[-1]
    
    # Add time features
    current_day_features['dayofyear'] = date.dayofyear
    current_day_features['month'] = date.month

    # --- Make Prediction ---
    input_df = pd.DataFrame([current_day_features])[model_features]
    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]

    # --- Print Daily Report ---
    result_text = "🚨 FLOOD" if prediction == 1 else "✅ No Flood"
    rain_today = history['rain_mm'].iloc[-1]
    print(f"Date: {date.date()} | Today's Rain: {rain_today:>5.1f} mm | Prediction: {result_text} (Risk: {probability:.2f})")

print("-" * 60)