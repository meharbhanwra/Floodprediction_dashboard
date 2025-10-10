import xarray as xr
import matplotlib.pyplot as plt

# --- CONFIGURATION ---
# Use the path to one of your rainfall files
file_path = 'RF25_ind2015_rfp25.nc' 
# Enter the date you want to view in YYYY-MM-DD format
date_to_view = '2015-12-01'
# --------------------

# Open the dataset
ds = xr.open_dataset(file_path)

# Select the rainfall data for the specific date
rainfall_on_date = ds['RAINFALL'].sel(TIME=date_to_view)

# Create the plot
print(f"Plotting rainfall map for {date_to_view}...")
rainfall_on_date.plot()

# Display the plot
plt.title(f"Rainfall for {date_to_view}")
plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.show()