import os
import glob
from pathlib import Path
import xarray as xr
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report, confusion_matrix
import joblib
from tqdm import tqdm
import matplotlib.pyplot as plt

# -------------------------
# User-configurable params
# -------------------------
# FIX: Use a raw string (r"...") or forward slashes ("/") for Windows paths
DATA_DIR = "C:/Users/Ishani Jindal/Desktop/flood-prediction/backend"
NC_GLOB = "RF25_ind*_rfp25.nc"  # Pattern to match your rainfall files

# Chennai bounding box (approx).
LAT_MIN, LAT_MAX = 12.75, 13.25
LON_MIN, LON_MAX = 79.8, 80.5

# Labeling threshold: cumulative rainfall over this window that defines a flood event
LABEL_WINDOW_HOURS = 3
LABEL_THRESHOLD_MM = 50.0  # e.g., 50 mm over 3 hours

# Feature engineering
N_LAGS = 6  # Create lag features up to this many hours

# Model
RANDOM_SEED = 42
MODEL_OUTPATH = "rf_flood_model.joblib"

# -------------------------
# Step 1: Discover files
# -------------------------
nc_paths = sorted(glob.glob(os.path.join(DATA_DIR, NC_GLOB)))
if not nc_paths:
    raise FileNotFoundError(f"No files found with pattern {NC_GLOB} in {DATA_DIR}")

print("Found files:", nc_paths)

# -------------------------
# Step 2: Read and concatenate NetCDF files
# -------------------------
POSSIBLE_RAIN_NAMES = ["rainfall", "precipitation", "rf", "rain", "pr", "RFP", "rfl", "tp", "RAINFALL"]

def find_rain_var(ds: xr.Dataset):
    names = [n.lower() for n in ds.data_vars]
    for cand in POSSIBLE_RAIN_NAMES:
        if cand.lower() in names:
            for n in ds.data_vars:
                if n.lower() == cand.lower():
                    return n
    if len(ds.data_vars) == 1:
        return list(ds.data_vars)[0]
    return None

datasets = []
rain_var_name = None
for p in nc_paths:
    print("Opening", p)
    ds = xr.open_dataset(p)
    if rain_var_name is None:
        cand = find_rain_var(ds)
        if cand is None:
            print("Available vars:", list(ds.data_vars))
            raise RuntimeError("Cannot auto-detect rainfall variable.")
        rain_var_name = cand
        print("Detected rainfall variable:", rain_var_name)
    datasets.append(ds)

combined = xr.concat(datasets, dim="TIME") if len(datasets) > 1 else datasets[0]
print(combined)

# --- FIX: Find and rename coordinates to a standard lowercase ---
rename_dict = {}
if "LATITUDE" in combined.coords:
    rename_dict["LATITUDE"] = "lat"
if "LONGITUDE" in combined.coords:
    rename_dict["LONGITUDE"] = "lon"
if "TIME" in combined.coords:
    rename_dict["TIME"] = "time"

combined = combined.rename(rename_dict)
print("Standardized coordinate names to lowercase.")
# --- End of FIX ---

# -------------------------
# Step 3: Subset Chennai bbox and convert to dataframe
# -------------------------
lat_name = "lat" if "lat" in combined.coords else None
lon_name = "lon" if "lon" in combined.coords else None
time_name = "time" if "time" in combined.coords else None
if not lat_name or not lon_name or not time_name:
    raise RuntimeError(f"Missing lat/lon/time coords. Found coords: {list(combined.coords)}")

sub = combined.sel({lat_name: slice(LAT_MIN, LAT_MAX), lon_name: slice(LON_MIN, LON_MAX)})

stacked = sub[rain_var_name].to_dataframe().reset_index()
stacked = stacked.rename(columns={rain_var_name: "rain_mm"})
print("Rows after spatial subset:", len(stacked))

df_ts = stacked.groupby(time_name)["rain_mm"].mean().reset_index().sort_values(time_name)
df_ts = df_ts.set_index(time_name)
df_ts = df_ts.resample("D").mean().interpolate() # Resample to Daily frequency
print("Timeseries length (days):", len(df_ts))

# -------------------------
# Step 4: Feature engineering
# -------------------------
df = df_ts.copy()
df["roll_sum_{}d".format(LABEL_WINDOW_HOURS)] = df["rain_mm"].rolling(window=LABEL_WINDOW_HOURS, min_periods=1).sum()
df["label_raw"] = (df["roll_sum_{}d".format(LABEL_WINDOW_HOURS)] >= LABEL_THRESHOLD_MM).astype(int)

df["label"] = 0
in_event = False
for idx, row in df.iterrows():
    if row["label_raw"] == 1 and not in_event:
        df.at[idx, "label"] = 1
        in_event = True
    elif row["label_raw"] == 1 and in_event:
        df.at[idx, "label"] = 0
    else:
        in_event = False

for lag in range(1, N_LAGS + 1):
    df[f"lag_{lag}"] = df["rain_mm"].shift(lag).fillna(0)

df["sum_3d"] = df["rain_mm"].rolling(window=3, min_periods=1).sum()
df["sum_6d"] = df["rain_mm"].rolling(window=6, min_periods=1).sum()

df["dayofyear"] = df.index.dayofyear
df["month"] = df.index.month
df = df.dropna(subset=["label"])

# -------------------------
# Step 5: Prepare X, y
# -------------------------
feature_cols = [c for c in df.columns if c not in ["label", "label_raw", "roll_sum_{}d".format(LABEL_WINDOW_HOURS), "rain_mm"]]
X = df[feature_cols].values
y = df["label"].values

if len(y) == 0:
    raise ValueError("Dataset is empty after feature engineering. Check data or parameters.")
    
print("Positive labels (flood events):", y.sum(), "out of", len(y))
if y.sum() == 0:
    print("WARNING: No positive labels found. Model will not be meaningful. Adjust LABEL_THRESHOLD_MM.")

# -------------------------
# Step 6: Train Random Forest
# -------------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y)
clf = RandomForestClassifier(n_estimators=200, random_state=RANDOM_SEED, class_weight="balanced")
clf.fit(X_train, y_train)

y_pred_proba = clf.predict_proba(X_test)[:, 1]
y_pred = clf.predict(X_test)
roc = roc_auc_score(y_test, y_pred_proba) if len(np.unique(y_test)) > 1 else None

print("ROC AUC:", roc)
print("Classification report:")
print(classification_report(y_test, y_pred, digits=4, zero_division=0))
print("Confusion matrix:")
print(confusion_matrix(y_test, y_pred))

# -------------------------
# Step 7: Save model & artifacts
# -------------------------
joblib.dump({"model": clf, "features": feature_cols}, MODEL_OUTPATH)
print("Model saved to", MODEL_OUTPATH)