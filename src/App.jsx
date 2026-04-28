import React, { useEffect, useMemo, useState } from "react";

const weeklyPlan = [
  { key: "monday", label: "Måndag", title: "Push", short: "Bröst, axlar, triceps" },
  { key: "tuesday", label: "Tisdag", title: "Ben", short: "Knäböj, höft, lår" },
  { key: "wednesday", label: "Onsdag", title: "Pull", short: "Rygg, biceps" },
  { key: "thursday", label: "Torsdag", title: "Helkropp", short: "Tempo + puls" },
  { key: "friday", label: "Fredag", title: "Flex", short: "Missat pass / kondition" },
];

const fullProgram = {
  monday: [
    { name: "Bänkpress", weight: 50, reps: 8, sets: 3, rest: 60 },
    { name: "Armhävningar", weight: 0, reps: 12, sets: 3, rest: 45 },
    { name: "Lutande hantelpress", weight: 18, reps: 10, sets: 3, rest: 60 },
    { name: "Axelpress", weight: 16, reps: 10, sets: 3, rest: 60 },
    { name: "Sidolyft", weight: 7, reps: 12, sets: 2, rest: 45 },
  ],
  tuesday: [
    { name: "Knäböj", weight: 50, reps: 8, sets: 3, rest: 75 },
    { name: "Utfall", weight: 12, reps: 10, sets: 3, rest: 60 },
    { name: "Raka marklyft", weight: 45, reps: 10, sets: 3, rest: 75 },
    { name: "Höftlyft", weight: 40, reps: 12, sets: 3, rest: 60 },
    { name: "Wall sit", weight: 0, reps: 45, sets: 2, rest: 45, unit: "sek" },
  ],
  wednesday: [
    { name: "Skivstångsrodd", weight: 55, reps: 8, sets: 3, rest: 60 },
    { name: "Hantelrodd", weight: 24, reps: 10, sets: 3, rest: 60 },
    { name: "Omvända flyes", weight: 7, reps: 12, sets: 3, rest: 45 },
    { name: "Bicepscurl", weight: 11, reps: 10, sets: 3, rest: 45 },
    { name: "Farmers walk", weight: 28, reps: 30, sets: 3, rest: 45, unit: "sek" },
  ],
  thursday: [
    { name: "Knäböj", weight: 50, reps: 10, sets: 3, rest: 30 },
    { name: "Armhävningar", weight: 0, reps: 12, sets: 3, rest: 30 },
    { name: "Rodd", weight: 45, reps: 10, sets: 3, rest: 30 },
    { name: "Axelpress", weight: 16, reps: 10, sets: 3, rest: 30 },
    { name: "Planka", weight: 0, reps: 30, sets: 3, rest: 30, unit: "sek" },
  ],
  friday: [
    { name: "Cykel eller löpband", weight: 0, reps: 20, sets: 1, rest: 0, unit: "min" },
    { name: "Mage", weight: 0, reps: 12, sets: 3, rest: 30 },
    { name: "Axelpress lätt", weight: 12, reps: 12, sets: 2, rest: 45 },
  ],
};

const todayIndexMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getTodayKey() {
  const jsDay = new Date().getDay();
  const english = todayIndexMap[jsDay];
  return ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(english) ? english : "monday";
}

function storageKey(day, name, field) {
  return `ptapp:${day}:${name}:${field}`;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function findNextIncompleteDay(sessionDone) {
  for (const day of weeklyPlan) {
    const exercises = fullProgram[day.key] || [];
    const allDone = exercises.length > 0 && exercises.every((ex) => sessionDone[`${day.key}:${ex.name}`]);
    if (!allDone) return day.key;
  }
  return getTodayKey();
}

function parseValue(value) {
  if (!value) return null;
  const match = String(value).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

function buttonClass(active, primary = false) {
  if (active && primary) return "btn btn-primary";
  if (active) return "btn btn-dark";
  return "btn";
}

export default function App() {
  const [day, setDay] = useState(getTodayKey());
  const [started, setStarted] = useState(false);
  const [sessionDone, setSessionDone] = useState({});
  const [log, setLog] = useState({});
  const [feedback, setFeedback] = useState({});
  const [weightToday, setWeightToday] = useState("");
  const [energyToday, setEnergyToday] = useState("");
  const [waistToday, setWaistToday] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [history, setHistory] = useState([]);
  const [nightSession, setNightSession] = useState("");

  const todaysPlan = useMemo(() => fullProgram[day] || [], [day]);
  const nextRecommendedDay = useMemo(() => findNextIncompleteDay(sessionDone), [sessionDone]);

  useEffect(() => {
    const saved = {};
    const savedFb = {};
    const done = {};

    Object.keys(fullProgram).forEach((d) => {
      fullProgram[d].forEach((ex) => {
        const lv = localStorage.getItem(storageKey(d, ex.name, "log"));
        const fb = localStorage.getItem(storageKey(d, ex.name, "feedback"));
        const dn = localStorage.getItem(storageKey(d, ex.name, "done"));
        if (lv) saved[`${d}:${ex.name}`] = lv;
        if (fb) savedFb[`${d}:${ex.name}`] = fb;
        if (dn === "true") done[`${d}:${ex.name}`] = true;
      });
    });

    const savedHistory = JSON.parse(localStorage.getItem("ptapp:history") || "[]");

    setLog(saved);
    setFeedback(savedFb);
    setSessionDone(done);
    setHistory(savedHistory);
    setWeightToday(localStorage.getItem("ptapp:daily:weight") || "");
    setEnergyToday(localStorage.getItem("ptapp:daily:energy") || "");
    setWaistToday(localStorage.getItem("ptapp:daily:waist") || "");
    setNightSession(localStorage.getItem("ptapp:daily:night") || "");
    setDay(findNextIncompleteDay(done));
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleLogChange = (exercise, value) => {
    const key = `${day}:${exercise}`;
    const next = { ...log, [key]: value };
    setLog(next);
    localStorage.setItem(storageKey(day, exercise, "log"), value);
  };

  const handleFeedback = (exercise, value) => {
    const key = `${day}:${exercise}`;
    const next = { ...feedback, [key]: value };
    setFeedback(next);
    localStorage.setItem(storageKey(day, exercise, "feedback"), value);
  };

  const toggleDone = (exercise) => {
    const key = `${day}:${exercise}`;
    const nextValue = !sessionDone[key];
    const next = { ...sessionDone, [key]: nextValue };
    setSessionDone(next);
    localStorage.setItem(storageKey(day, exercise, "done"), String(nextValue));
  };

  const getNextWeight = (ex) => {
    if (!ex.weight) return "Samma";
    const fb = feedback[`${day}:${ex.name}`];
    if (fb === "Lätt") return `${ex.weight + 5} kg`;
    if (fb === "Lagom") return `${ex.weight + 2.5} kg`;
    if (fb === "Tungt") return `${ex.weight} kg`;
    return `${ex.weight} kg`;
  };

  const completedCount = todaysPlan.filter((ex) => sessionDone[`${day}:${ex.name}`]).length;
  const progress = todaysPlan.length ? Math.round((completedCount / todaysPlan.length) * 100) : 0;

  const saveDailyMetric = (field, value, setter) => {
    setter(value);
    localStorage.setItem(`ptapp:daily:${field}`, value);
  };

  const formatTimer = () => {
    const min = Math.floor(secondsLeft / 60);
    const sec = secondsLeft % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const completeWorkout = () => {
    const entry = {
      date: todayDateString(),
      day,
      dayLabel: weeklyPlan.find((d) => d.key === day)?.label || day,
      weightToday,
      waistToday,
      energyToday,
      nightSession,
      exercises: todaysPlan.map((ex) => ({
        name: ex.name,
        log: log[`${day}:${ex.name}`] || "",
        feedback: feedback[`${day}:${ex.name}`] || "",
        next: getNextWeight(ex),
      })),
    };
    const nextHistory = [entry, ...history].slice(0, 20);
    setHistory(nextHistory);
    localStorage.setItem("ptapp:history", JSON.stringify(nextHistory));
    setDay(findNextIncompleteDay(sessionDone));
  };

  const recentWeights = history
    .map((h) => ({ date: h.date.slice(5), value: parseValue(h.weightToday) }))
    .filter((x) => x.value !== null)
    .slice(0, 7)
    .reverse();

  const recentWaist = history
    .map((h) => ({ date: h.date.slice(5), value: parseValue(h.waistToday) }))
    .filter((x) => x.value !== null)
    .slice(0, 7)
    .reverse();

  const maxWeight = Math.max(...recentWeights.map((x) => x.value), 0);
  const maxWaist = Math.max(...recentWaist.map((x) => x.value), 0);

  return (
    <div className="page">
      <div className="container">
        <section className="hero card">
          <div>
            <h1>Din privata PT-app</h1>
            <p>Enkel webbapp för mobilen</p>
          </div>
          <div className="hero-note">Öppna, logga, klart</div>
        </section>

        <section className="stats-grid">
          <div className="card stat">
            <div className="stat-label">Rekommenderat idag</div>
            <div className="stat-value">
              {weeklyPlan.find((d) => d.key === nextRecommendedDay)?.label} – {weeklyPlan.find((d) => d.key === nextRecommendedDay)?.title}
            </div>
            <div className="muted">Appen flyttar dig till nästa ofärdiga pass.</div>
          </div>

          <div className="card stat">
            <div className="stat-label">Passprogress</div>
            <div className="stat-value">{completedCount}/{todaysPlan.length} övningar klara</div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="card stat">
            <div className="stat-label">Vilotimer</div>
            <div className="timer">{secondsLeft > 0 ? formatTimer() : "Klar"}</div>
            <div className="row">
              <button className="btn" onClick={() => setSecondsLeft(30)}>30 s</button>
              <button className="btn" onClick={() => setSecondsLeft(45)}>45 s</button>
              <button className="btn" onClick={() => setSecondsLeft(60)}>60 s</button>
            </div>
          </div>
        </section>

        <div className="layout">
          <div className="main-col">
            <section className="card">
              <h2>Veckoplan</h2>
              <div className="week-grid">
                {weeklyPlan.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDay(d.key)}
                    className={day === d.key ? "day-card active" : "day-card"}
                  >
                    <div className="day-title">{d.label}</div>
                    <div className="day-subtitle">{d.title}</div>
                    <div className="day-short">{d.short}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="section-head">
                <h2>Dagens pass</h2>
                <button className={buttonClass(started, true)} onClick={() => setStarted((s) => !s)}>
                  {started ? "Avsluta passläge" : "Starta pass"}
                </button>
              </div>

              <div className="exercise-list">
                {todaysPlan.map((ex, idx) => {
                  const logKey = `${day}:${ex.name}`;
                  const isDone = !!sessionDone[logKey];
                  return (
                    <div key={ex.name} className={isDone ? "exercise done" : "exercise"}>
                      <div className="exercise-head">
                        <div>
                          <div className="exercise-title">{idx + 1}. {ex.name}</div>
                          <div className="muted">Mål: {ex.sets} set x {ex.reps} {ex.unit || "reps"} {ex.weight ? `@ ${ex.weight} kg` : ""}</div>
                          <div className="tiny">Vila: {ex.rest} sek</div>
                        </div>
                        <button className={isDone ? "check active" : "check"} onClick={() => toggleDone(ex.name)}>
                          ✓
                        </button>
                      </div>

                      <div className="exercise-controls">
                        <input
                          value={log[logKey] || ""}
                          onChange={(e) => handleLogChange(ex.name, e.target.value)}
                          placeholder={started ? "T.ex. 55 x 8, 8, 8" : "Vad körde du?"}
                        />
                        <div className="feedback-row">
                          {["Lätt", "Lagom", "Tungt"].map((lvl) => (
                            <button
                              key={lvl}
                              className={feedback[logKey] === lvl ? "btn btn-dark" : "btn"}
                              onClick={() => handleFeedback(ex.name, lvl)}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="exercise-foot">
                        <div className="muted">
                          Nästa gång: <strong>{getNextWeight(ex)}</strong>
                        </div>
                        <button className="btn" onClick={() => setSecondsLeft(ex.rest)}>Starta vila</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="btn btn-primary full" onClick={completeWorkout}>Spara passet</button>
            </section>
          </div>

          <div className="side-col">
            <section className="card">
              <h2>Daglig check-in</h2>
              <div className="form-stack">
                <input value={weightToday} onChange={(e) => saveDailyMetric("weight", e.target.value, setWeightToday)} placeholder="Vikt idag" />
                <input value={waistToday} onChange={(e) => saveDailyMetric("waist", e.target.value, setWaistToday)} placeholder="Midjemått" />
                <input value={energyToday} onChange={(e) => saveDailyMetric("energy", e.target.value, setEnergyToday)} placeholder="Energi 1–10" />
                <input value={nightSession} onChange={(e) => saveDailyMetric("night", e.target.value, setNightSession)} placeholder="Kvällspass? t.ex. promenad, tennis, inget" />
              </div>
            </section>

            <section className="card">
              <h2>Trend</h2>
              <div className="trend-block">
                <div className="trend-title">Vikt senaste passen</div>
                {recentWeights.length === 0 ? <div className="muted">Ingen data ännu</div> : recentWeights.map((item) => (
                  <div key={item.date} className="trend-row">
                    <div className="trend-meta"><span>{item.date}</span><span>{item.value}</span></div>
                    <div className="mini-bar"><div className="mini-fill" style={{ width: `${maxWeight ? (item.value / maxWeight) * 100 : 0}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="trend-block">
                <div className="trend-title">Midja senaste passen</div>
                {recentWaist.length === 0 ? <div className="muted">Ingen data ännu</div> : recentWaist.map((item) => (
                  <div key={item.date} className="trend-row">
                    <div className="trend-meta"><span>{item.date}</span><span>{item.value}</span></div>
                    <div className="mini-bar"><div className="mini-fill" style={{ width: `${maxWaist ? (item.value / maxWaist) * 100 : 0}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h2>Historik</h2>
              <div className="history-list">
                {history.length === 0 ? (
                  <div className="note">När du sparar ditt första pass dyker det upp här.</div>
                ) : history.slice(0, 5).map((entry, index) => (
                  <div key={`${entry.date}-${index}`} className="history-card">
                    <div className="history-head">
                      <div>
                        <div className="history-title">{entry.dayLabel}</div>
                        <div className="tiny">{entry.date}</div>
                      </div>
                      <div className="tiny">Energi: {entry.energyToday || "-"}</div>
                    </div>
                    <div className="history-items">
                      {entry.exercises.slice(0, 3).map((ex) => (
                        <div key={ex.name} className="history-row">
                          <span>{ex.name}</span>
                          <span>{ex.log || ex.next}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h2>PT-insikter</h2>
              <div className="tip-list">
                <div className="tip">Appen är byggd för enkel användning i mobilen: öppna, logga, klart.</div>
                <div className="tip">Missat en dag? Kör bara nästa rekommenderade pass överst i appen.</div>
                <div className="tip">Kvällspass kan du skriva in i check-in så justerar vi veckan smartare ihop.</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
