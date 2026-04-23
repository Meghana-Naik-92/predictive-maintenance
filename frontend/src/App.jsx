import { useState, useEffect } from "react";

const FIELDS = [
  {
    id: "air_temperature",
    label: "Air Temperature",
    unit: "K",
    min: 250,
    max: 350,
    step: 0.1,
    default: 298.1,
    icon: "🌡️",
    hint: "Ambient temp around machine",
  },
  {
    id: "process_temperature",
    label: "Process Temperature",
    unit: "K",
    min: 250,
    max: 350,
    step: 0.1,
    default: 308.6,
    icon: "🔥",
    hint: "Temp during process",
  },
  {
    id: "rotational_speed",
    label: "Rotational Speed",
    unit: "rpm",
    min: 0,
    max: 5000,
    step: 1,
    default: 1551,
    icon: "⚙️",
    hint: "Motor shaft rpm",
  },
  {
    id: "torque",
    label: "Torque",
    unit: "Nm",
    min: 0,
    max: 200,
    step: 0.1,
    default: 42.8,
    icon: "🔩",
    hint: "Rotational force applied",
  },
  {
    id: "tool_wear",
    label: "Tool Wear",
    unit: "min",
    min: 0,
    max: 300,
    step: 1,
    default: 108,
    icon: "🪛",
    hint: "Cumulative tool usage",
  },
];

const TYPES = [
  { value: "L", label: "Low (L)", desc: "Entry-grade" },
  { value: "M", label: "Medium (M)", desc: "Standard industrial" },
  { value: "H", label: "High (H)", desc: "Precision-grade" },
];

function getRiskColors(risk) {
  if (risk === "HIGH")
    return {
      bg: "#fee2e2",
      border: "#ef4444",
      text: "#991b1b",
      badge: "#ef4444",
    };
  if (risk === "MEDIUM")
    return {
      bg: "#fef3c7",
      border: "#f59e0b",
      text: "#92400e",
      badge: "#f59e0b",
    };
  return {
    bg: "#d1fae5",
    border: "#10b981",
    text: "#065f46",
    badge: "#10b981",
  };
}

function GaugeArc({ probability }) {
  const r = 68,
    cx = 88,
    cy = 84,
    circ = Math.PI * r;
  const dash = (probability / 100) * circ;
  const col =
    probability >= 70 ? "#ef4444" : probability >= 40 ? "#f59e0b" : "#10b981";
  return (
    <svg
      viewBox="0 0 176 96"
      style={{
        width: "100%",
        maxWidth: 200,
        margin: "0 auto",
        display: "block",
      }}
    >
      <path
        d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none"
        stroke={col}
        strokeWidth="13"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill={col}
        fontSize="22"
        fontWeight="700"
        fontFamily="'DM Mono',monospace"
      >
        {probability}%
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="8"
        fontFamily="sans-serif"
        letterSpacing="1.2"
      >
        FAILURE PROBABILITY
      </text>
    </svg>
  );
}

function Field({ f, value, onChange, error }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 14 }}>{f.icon}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#374151",
            letterSpacing: ".06em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          {f.label}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {f.unit}
        </span>
      </div>
      <input
        type="number"
        value={value}
        min={f.min}
        max={f.max}
        step={f.step}
        onChange={(e) => onChange(f.id, e.target.value)}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          background: "transparent",
          fontFamily: "'DM Mono',monospace",
          padding: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{f.hint}</span>
        <span
          style={{
            fontSize: 9,
            color: "#d1d5db",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {f.min}–{f.max}
        </span>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.id, f.default])),
  );
  const [mtype, setMtype] = useState("M");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState("");
  const [backendOk, setBackendOk] = useState(null);

  useEffect(() => {
    fetch("/health")
      .then((r) => r.json())
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const handleChange = (id, v) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
    setResult(null);
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    FIELDS.forEach((f) => {
      const n = parseFloat(values[f.id]);
      if (isNaN(n)) errs[f.id] = "Enter a number";
      else if (n < f.min || n > f.max) errs[f.id] = `Must be ${f.min}–${f.max}`;
    });
    return errs;
  };

  const handlePredict = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setResult(null);
    setApiError("");
    try {
      const body = {
        ...Object.fromEntries(
          FIELDS.map((f) => [f.id, parseFloat(values[f.id])]),
        ),
        machine_type: mtype,
      };
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) setApiError(data.error || "Prediction failed.");
      else setResult(data);
    } catch {
      setApiError(
        "Cannot reach server. Make sure Flask is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(Object.fromEntries(FIELDS.map((f) => [f.id, f.default])));
    setMtype("M");
    setErrors({});
    setResult(null);
    setApiError("");
  };

  const rc = result ? getRiskColors(result.risk_level) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=DM+Mono:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'IBM Plex Sans', sans-serif; background: #f3f4f6; min-height: 100vh; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .result-anim { animation: fadeUp .4s ease both; }
        @media (max-width: 700px) { .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <header style={{ background: "#0f172a", padding: "0 24px" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 60,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-.02em",
              }}
            >
              PredictIQ
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#64748b",
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Predictive Maintenance System
            </div>
          </div>
          {backendOk !== null && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                background: backendOk ? "#0d2d1d" : "#2d1515",
                color: backendOk ? "#34d399" : "#f87171",
                border: `1px solid ${backendOk ? "#065f46" : "#7f1d1d"}`,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              ● {backendOk ? "Backend Connected" : "Backend Offline"}
            </span>
          )}
        </div>
      </header>

      {/* Main */}
      <main
        style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px 60px" }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-.03em",
            marginBottom: 4,
          }}
        >
          Equipment Health Prediction
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>
          Enter live sensor readings to assess failure risk using the trained ML
          model.
        </p>

        <div
          className="main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* LEFT — Form */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              padding: 24,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Machine type */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#374151",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              🏭 Machine Quality Type
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMtype(t.value)}
                  style={{
                    flex: 1,
                    padding: "9px 8px",
                    borderRadius: 9,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .15s",
                    border: `2px solid ${mtype === t.value ? "#3b82f6" : "#e5e7eb"}`,
                    background: mtype === t.value ? "#eff6ff" : "#fff",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: mtype === t.value ? "#1d4ed8" : "#374151",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {t.label}
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", marginBottom: 18 }} />

            {/* Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {FIELDS.map((f) => (
                <Field
                  key={f.id}
                  f={f}
                  value={values[f.id]}
                  onChange={handleChange}
                  error={errors[f.id]}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handlePredict}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: 9,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading
                    ? "#93c5fd"
                    : "linear-gradient(135deg,#2563eb,#0891b2)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.28)",
                  fontFamily: "'IBM Plex Sans',sans-serif",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2.5px solid rgba(255,255,255,.35)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                        display: "inline-block",
                      }}
                    />{" "}
                    Analyzing…
                  </>
                ) : (
                  "⚡ Run Prediction"
                )}
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: "13px 18px",
                  borderRadius: 9,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>

            {apiError && (
              <div
                style={{
                  marginTop: 14,
                  padding: "11px 14px",
                  borderRadius: 9,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: 12,
                }}
              >
                ⚠ {apiError}
              </div>
            )}
          </div>

          {/* RIGHT — Result + Reference */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {result ? (
              <div
                className="result-anim"
                style={{
                  background: rc.bg,
                  border: `1.5px solid ${rc.border}`,
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 38, marginBottom: 6 }}>
  {result.risk_level === "HIGH" ? "🚨" : result.risk_level === "MEDIUM" ? "⚠️" : "✅"}
</div>
<div
  style={{
    fontSize: 19,
    fontWeight: 800,
    color: rc.text,
    letterSpacing: "-.02em",
  }}
>
  {result.risk_level === "HIGH"
    ? "Failure Likely"
    : result.risk_level === "MEDIUM"
    ? "Monitor Closely"
    : "No Failure Detected"}
</div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 7,
                    padding: "3px 12px",
                    borderRadius: 999,
                    background: rc.badge,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                  }}
                >
                  {result.risk_level} RISK
                </span>
                <div style={{ marginTop: 18 }}>
                  <GaugeArc probability={result.probability} />
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  border: "1.5px dashed #d1d5db",
                  borderRadius: 16,
                  padding: 30,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}
                >
                  Awaiting sensor data
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    marginTop: 5,
                    lineHeight: 1.6,
                  }}
                >
                  Fill the readings and click Run Prediction
                </div>
              </div>
            )}

            {/* Live reference */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#374151",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Live Readings
              </div>
              {FIELDS.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom:
                      i < FIELDS.length - 1 ? "1px solid #f9fafb" : "none",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#6b7280" }}>
                    {f.icon} {f.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    {parseFloat(values[f.id]) || f.default} {f.unit}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#6b7280" }}>🏭 Machine Type</span>
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    color: "#2563eb",
                    fontWeight: 600,
                  }}
                >
                  {mtype}
                </span>
              </div>
            </div>

            {/* Model info */}
            <div
              style={{
                background: "#0f172a",
                borderRadius: 14,
                padding: 16,
                color: "#94a3b8",
                fontSize: 11,
                lineHeight: 1.8,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              <div
                style={{ color: "#38bdf8", fontWeight: 700, marginBottom: 4 }}
              >
                MODEL INFO
              </div>
              Dataset: AI4I 2020 Predictive Maintenance
              <br />
              Features: 7 (incl. one-hot type)
              <br />
              Task: Binary classification
              <br />
              Output: Failure probability (%)
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
