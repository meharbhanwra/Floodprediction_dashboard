# mqtt_listener.py
import paho.mqtt.client as mqtt
import requests
import json

# --- Configuration ---
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
# IMPORTANT: Make this topic unique to you!
MQTT_TOPIC = "ishani-jindal/flood-sensor/drain01" 
SERVER_URL = "https://floodprediction-dashboard.onrender.com"

def on_connect(client, userdata, flags, rc):
    """Callback for when the client connects to the broker."""
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(MQTT_TOPIC)
        print(f"Subscribed to topic: {MQTT_TOPIC}")
    else:
        print(f"Failed to connect, return code {rc}\n")

def on_message(client, userdata, msg):
    """Callback for when a message is received from the broker."""
    try:
        payload_str = msg.payload.decode()
        print(f"\nReceived message: {payload_str}")
        
        data = json.loads(payload_str)
        
        # Forward the data to the local Flask server
        response = requests.post(SERVER_URL, json=data)
        response.raise_for_status()
        print(f"  --> Relayed to server. Status: {response.status_code}")
        
    except Exception as e:
        print(f"[ERROR] Could not process or relay message: {e}")

# --- Main script ---
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print(f"Attempting to connect to MQTT broker at {MQTT_BROKER}...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Start a forever loop to listen for messages
client.loop_forever()