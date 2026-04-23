# 🔧 Predictive Maintenance System

Machine learning application that predicts industrial equipment failure using real-time sensor data.

---

## 📌 What It Does

Enter **5 sensor readings + machine type** → Get:

* Failure prediction
* Probability (0–100%)
* Risk level (**Low / Medium / High**)

✅ Runs entirely on your laptop
❌ No cloud
❌ No API keys

---

## 🎯 The Problem

**Before:**

* Run machines until failure
* Emergency repairs
* Production downtime

**After:**

* Monitor sensors
* Predict failures early
* Schedule maintenance

📊 **Impact:**

* 25–30% lower costs
* 70–75% fewer breakdowns
* 20–25% longer machine life

---

## 🧠 How It Works

**ML Model:** Random Forest trained on 10,000+ industrial sensor readings (AI4I 2020 dataset)

### 🔍 Sensors Used

* Air Temperature & Process Temperature
* Rotational Speed & Torque
* Tool Wear
* Machine Type (L / M / H)

💡 Learned pattern:

> High tool wear + high torque + low speed → 70%+ failure probability

---

## 🏗️ Architecture

```
User Input (React) → Flask API → ML Model → Prediction → Visual Result
```

✅ Everything runs locally
🔒 Your data never leaves your machine

---

## 🛠️ Tech Stack

| Layer    | Technologies                             |
| -------- | ---------------------------------------- |
| Backend  | Python 3.11, Flask, scikit-learn, pandas |
| Frontend | React, Vite, CSS                         |

---

## 🚀 Getting Started (15 min)

### 📌 Prerequisites

* Python 3.11
* Node.js 16+

---

### ⚙️ Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
# OR
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
python app.py
```

👉 Runs on: **http://127.0.0.1:5000**

---

### 🎨 Frontend Setup (new terminal)

```
cd frontend
npm install
npm run dev
```

👉 Runs on: **http://localhost:3000**

---

### 🌐 Open in Browser

```
http://localhost:3000
```

Look for:
🟢 **"● Backend Connected"** (top-right)

---

## 🧪 Test It Out

| Scenario   | Air Temp | Process Temp | Speed | Torque | Tool Wear | Type | Expected   |
| ---------- | -------- | ------------ | ----- | ------ | --------- | ---- | ---------- |
| 🟢 Healthy | 298      | 308          | 1551  | 40     | 50        | M    | LOW RISK ✅ |
| 🟡 Warning | 298      | 315          | 1200  | 60     | 200       | L    | MEDIUM ⚠️  |
| 🔴 Failure | 300      | 328          | 950   | 85     | 280       | L    | HIGH 🚨    |

---

## 🔑 Critical: Making Your Model Work

### ❗ Issue:

Predictions don’t match training results

### ✅ Fix:

Column mismatch

Run in training notebook:

```python
print(list(X_train.columns))
```

Update in `app.py`:

```python
expected_cols = [...]
```

---

## 🐛 Real Troubleshooting

| Problem            | Real Cause        | Fix                 |
| ------------------ | ----------------- | ------------------- |
| Backend pill red   | Flask not running | Run `python app.py` |
| Predictions random | Using demo logic  | Add `model.pkl`     |
| CORS error         | Backend blocked   | Ensure `CORS(app)`  |
| Port 5000 busy     | AirPlay (Mac)     | Disable AirPlay     |

---

## 📁 Project Structure

```
predictive-maintenance/
│
├── backend/
│   ├── app.py
│   ├── model.pkl
│   └── requirements.txt
│
├── frontend/
│   ├── src/App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## 🔄 Using Your Own Model

1. Train model (Colab / Jupyter)
2. Save:

```python
joblib.dump(model, "model.pkl")
```

3. Replace `backend/model.pkl`
4. Update `build_features()`
5. Restart Flask

---

## 🎓 What This Project Demonstrates

✅ ML model training on real data
✅ Full-stack deployment (Flask + React)
✅ Clean UI for non-technical users
✅ Real-world industrial use case

---

## 🙏 Credits

* Dataset: AI4I 2020 Predictive Maintenance (UCI)
* Built with: Python, Flask, scikit-learn, React, Vite

**Team Members:**

* Prathiksha Shetty
* Maya Kamath
* N S Suhani

---

## 💡 Final Note

This project showcases an **end-to-end machine learning system**, from data to deployment.

---

⭐ Built with Python, React and determination 🔧
