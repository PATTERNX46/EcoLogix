import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time
import random

# 1. Initialize Firebase Connection
print("Initializing Connection to Firebase...")
cred = credentials.Certificate("serviceAccountKey.json") # Ensure this file is in the same folder
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Baseline Metrics
baseline = {
    "healthScore": 96.4,
    "activeShipments": 1402,
    "fuelEfficiency": 8.4,
    "co2Saved": 14200.5
}

print("✅ IoT Fleet Engine Online. Transmitting live telemetry...")

# 3. Infinite Simulation Loop
tick = 1
try:
    while True:
        # Simulate realistic minor fluctuations
        live_data = {
            "healthScore": round(baseline["healthScore"] + random.uniform(-0.5, 0.5), 1),
            "activeShipments": baseline["activeShipments"] + random.randint(-3, 5),
            "fuelEfficiency": round(baseline["fuelEfficiency"] + random.uniform(-0.2, 0.2), 1),
            "co2Saved": round(baseline["co2Saved"] + random.uniform(0.1, 2.5), 1),
            "timestamp": firestore.SERVER_TIMESTAMP
        }

        # Push to Firestore
        db.collection("telemetry").document("global").set(live_data)
        
        print(f"[{tick}] Transmitted: Health: {live_data['healthScore']}% | Fleet: {live_data['activeShipments']} | CO2: {live_data['co2Saved']}t")
        
        tick += 1
        time.sleep(3) # Wait 3 seconds before next update

except KeyboardInterrupt:
    print("\n⚠️ Engine Shutdown Initiated. Telemetry halted.")