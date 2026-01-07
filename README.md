# 🌊 Chennai Flood Watch: AIoT Flash Flood Prediction & Monitoring

A proactive, real-time decision support system that integrates IoT telemetry with Machine Learning to predict and manage urban flash floods in Chennai.

**[🌐 Live Authority Dashboard](https://floodprediction-dashboard.vercel.app/)** | **[⚙️ Prediction Engine API](https://floodprediction-dashboard.onrender.com)**

---

## 🚀 Core Features
* **AI-Powered Prediction**: Utilizes a **Random Forest** model trained on historical IMD weather datasets to provide localized risk assessments.
* **Real-Time GIS Mapping**: Interactive map interface using **Leaflet.js** to visualize flood risk scores across multiple city nodes.
* **Authority Control Panel**: Secure dashboard for officials to monitor live sensor feeds, view historical trends, and prepare emergency broadcasts.
* **Role-Based Security**: Integrated with **Clerk** to ensure only authorized personnel can access the command center.
* **Hardware-in-the-Loop Simulation**: A custom testing harness that bridges virtual hardware (Wokwi) with live cloud infrastructure.

---

## 🏗️ Technical Architecture
The system follows a distributed architecture to separate the **Intelligence Layer** from the **Visualization Layer**.

* **Backend (Python/Flask)**: Orchestrates the MQTT data listener, the Random Forest inference engine, and real-time data simulation.
* **Frontend (React/Vite)**: A multi-page application with distinct entry points for the landing page (`landingPage.jsx`) and the secure dashboard.
* **Deployment**: The frontend is hosted on **Vercel** with custom rewrite rules in `vercel.json` for multi-page support, while the backend is hosted on **Render**.

---

## 🛠️ Technology Stack
* **Frontend**: React, Vite, Tailwind CSS, Leaflet.js, Clerk Auth.
* **Backend**: Flask, Scikit-Learn, Paho-MQTT, Joblib.
* **IoT & Hardware**: ESP32 (Wokwi Simulation), MQTT Broker.
* **DevOps**: Vercel, Render, GitHub.

---

## 📡 Hardware Simulation & Event Injection
To validate the system, we utilized a **Hardware-in-the-Loop (HIL)** approach using **Wokwi**. Instead of waiting for real rain, we manually inject sensor data to test the system's response to critical thresholds.

### **The "Sensor-to-Score" Workflow**
1. **Manual Trigger**: An official pushes an increment button on the **ESP32 (Wokwi)** to simulate rising water levels.
2. **MQTT Transmission**: Data is published to a cloud broker and picked up by our **Flask listener**.
3. **AI Inference**: The **Random Forest model** processes telemetry and updates the risk score.
4. **Dashboard Update**: The React frontend reflects the change instantly on the map.

### **Demonstration**
(<img width="748" height="601" alt="Screenshot 2026-01-07 101342" src="https://github.com/user-attachments/assets/4587f118-efd6-4d13-9a35-84309551ed7d" />)
*Caption: The Wokwi ESP32 interface used for manual data injection.*

**📽️ Watch the Live Data Flow:**
<video src="https://drive.google.com/file/d/1Gxyo06AlTnsa0b9eJqM3X46hL2GmJfAB/view?usp=sharing" width="600" controls></video>
*In this video, you can see that when the button is pushed in Wokwi, the data passes to the model, which predicts the risk score on the live map in real-time.*

---

## 👥 The Team
* **Ishani Jindal**: full stack developer/ Ui UX designing
* **Aditi Mehta**: 
* **Mehar Bhanwra**: 

---

## 🛠️ Local Setup
1. **Clone the repository**:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/flood-prediction.git](https://github.com/YOUR_USERNAME/flood-prediction.git)

2. **Setup Frontend**
   cd chennai-flood-dashboard
   npm install

3. **Run the Full Ecosystem**
   npm run start-all
