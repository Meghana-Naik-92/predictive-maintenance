from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib, os

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("[INFO] model.pkl loaded")
else:
    print("[WARN] model.pkl not found — using demo logic")

def build_features(air_temp, proc_temp, rot_speed, torque, tool_wear, mtype):
    # Build raw dataframe exactly like Colab does
    raw = pd.DataFrame([{
        'Type': mtype,
        'Air temperature [K]': air_temp,
        'Process temperature [K]': proc_temp,
        'Rotational speed [rpm]': rot_speed,
        'Torque [Nm]': torque,
        'Tool wear [min]': tool_wear,
    }])

    # One-hot encode Type with drop_first=True (same as training)
    encoded = pd.get_dummies(raw, columns=['Type'], drop_first=True)

    # These are the exact columns your model was trained on
    expected_cols = [
        'Air temperature [K]',
        'Process temperature [K]',
        'Rotational speed [rpm]',
        'Torque [Nm]',
        'Tool wear [min]',
        'Type_L',
        'Type_M'
    ]

    # Add any missing columns as 0 (e.g. Type_L when M is selected)
    for col in expected_cols:
        if col not in encoded.columns:
            encoded[col] = 0

    # Reorder to match training column order exactly
    encoded = encoded[expected_cols]
    return encoded

def demo_predict(air_temp, proc_temp, rot_speed, torque, tool_wear):
    temp_diff = proc_temp - air_temp
    power = torque * rot_speed * (2 * 3.14159 / 60)
    score = 0
    if temp_diff > 10: score += 1
    if torque > 50:    score += 1
    if tool_wear > 180: score += 1
    if power > 9000:   score += 1
    if rot_speed < 1300: score += 1
    failure = score >= 2
    probability = min(0.95, score * 0.18 + 0.05)
    return int(failure), round(probability, 3)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        required = ["air_temperature", "process_temperature",
                    "rotational_speed", "torque", "tool_wear", "machine_type"]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

        air_temp  = float(data["air_temperature"])
        proc_temp = float(data["process_temperature"])
        rot_speed = float(data["rotational_speed"])
        torque    = float(data["torque"])
        tool_wear = float(data["tool_wear"])
        mtype     = str(data["machine_type"]).upper()

        if mtype not in ["L", "M", "H"]:
            return jsonify({"error": "machine_type must be L, M, or H"}), 400

        checks = [
            (250 <= air_temp <= 350,  "air_temperature must be 250–350 K"),
            (250 <= proc_temp <= 350, "process_temperature must be 250–350 K"),
            (0 <= rot_speed <= 5000,  "rotational_speed must be 0–5000 rpm"),
            (0 <= torque <= 200,      "torque must be 0–200 Nm"),
            (0 <= tool_wear <= 300,   "tool_wear must be 0–300 min"),
        ]
        for ok, msg in checks:
            if not ok:
                return jsonify({"error": msg}), 400

        if model is not None:
            features = build_features(air_temp, proc_temp, rot_speed, torque, tool_wear, mtype)
            pred = int(model.predict(features)[0])
            prob = float(model.predict_proba(features)[0][1])
        else:
            pred, prob = demo_predict(air_temp, proc_temp, rot_speed, torque, tool_wear)

        risk = "HIGH" if prob >= 0.70 else "MEDIUM" if prob >= 0.40 else "LOW"

        return jsonify({
            "failure":     bool(pred),
            "probability": round(prob * 100, 1),
            "label":       "Failure Likely" if pred else "No Failure Detected",
            "risk_level":  risk,
        })

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {e}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)