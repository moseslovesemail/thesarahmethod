"use client";

import { useMemo, useState } from "react";

type FormData = {
  firstName: string;
  email: string;
  adult: boolean;
  primaryGoal: string;
  secondaryGoals: string[];
  experience: string;
  equipment: string[];
  reformerBrand: string;
  sessionMinutes: number;
  sessionsPerWeek: number;
  preferredDays: string[];
  enjoys: string;
  dislikes: string;
  hasLimitations: boolean | null;
  limitationNotes: string;
  needsProfessionalAssessment: boolean | null;
  extraNotes: string;
  consent: boolean;
};

const initial: FormData = {
  firstName: "",
  email: "",
  adult: false,
  primaryGoal: "",
  secondaryGoals: [],
  experience: "",
  equipment: [],
  reformerBrand: "",
  sessionMinutes: 20,
  sessionsPerWeek: 3,
  preferredDays: [],
  enjoys: "",
  dislikes: "",
  hasLimitations: null,
  limitationNotes: "",
  needsProfessionalAssessment: null,
  extraNotes: "",
  consent: false,
};

const goals = [
  ["general-strength", "General strength"],
  ["core-strength", "Core strength"],
  ["mobility", "Mobility"],
  ["flexibility", "Flexibility"],
  ["balance-control", "Balance & control"],
  ["movement-confidence", "Movement confidence"],
  ["general-fitness", "General fitness"],
  ["return-to-exercise", "Return to regular exercise"],
  ["support-activity", "Support another activity"],
  ["workday-body", "Feel better after work / sitting"],
];

const equipment = [
  ["mat", "Mat"],
  ["reformer", "Reformer"],
  ["band", "Resistance band"],
  ["ring", "Pilates ring"],
  ["small-ball", "Small ball"],
  ["large-ball", "Exercise ball"],
  ["light-weights", "Light weights"],
  ["none", "No equipment"],
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`choice ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function IntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState<{ id: string; status: string } | null>(null);

  const steps = ["You", "Goals", "Experience", "Equipment", "Schedule", "Movement", "Review"];
  const progress = ((step + 1) / steps.length) * 100;

  const canContinue = useMemo(() => {
    if (step === 0) {
      return (
        form.firstName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(form.email) &&
        form.adult
      );
    }
    if (step === 1) return Boolean(form.primaryGoal);
    if (step === 2) return Boolean(form.experience);
    if (step === 3) return form.equipment.length > 0;
    if (step === 4) return form.sessionsPerWeek > 0;
    if (step === 5) {
      return form.hasLimitations !== null && form.needsProfessionalAssessment !== null;
    }
    if (step === 6) return form.consent;
    return true;
  }, [step, form]);

  const toggle = (
    field: "secondaryGoals" | "equipment" | "preferredDays",
    value: string,
    max?: number
  ) => {
    setForm((current) => {
      const existing = current[field];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];

      return { ...current, [field]: max ? next.slice(-max) : next };
    });
  };

  async function submit() {
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit the form.");
      }

      setComplete({ id: String(data.id), status: data.status });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not submit the form."
      );
    } finally {
      setSending(false);
    }
  }

  if (complete) {
    return (
      <section className="form-card complete-card">
        <div className="checkmark">✓</div>
        <p className="eyebrow">INTAKE COMPLETE</p>
        <h2>Thanks, {form.firstName}.</h2>
        <p>
          Your answers have been saved.{" "}
          {complete.status === "review"
            ? "Sarah will review your intake before a programme is prepared."
            : "Your intake is ready for the next programme-building stage."}
        </p>
        <p className="reference">Reference #{complete.id}</p>
      </section>
    );
  }

  return (
    <section className="form-card">
      <div className="progress-wrap">
        <div className="progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span>
          {step + 1} / {steps.length}
        </span>
      </div>

      {step === 0 && (
        <div className="step">
          <p className="eyebrow">ABOUT YOU</p>
          <h2>First, the basics.</h2>

          <label>
            First name
            <input
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              autoComplete="given-name"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
            />
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.adult}
              onChange={(event) => setForm({ ...form, adult: event.target.checked })}
            />
            <span>I am 18 or older.</span>
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="step">
          <p className="eyebrow">YOUR GOALS</p>
          <h2>What matters most?</h2>
          <p className="hint">Choose one primary goal.</p>

          <div className="choice-grid">
            {goals.map(([id, label]) => (
              <Choice
                key={id}
                selected={form.primaryGoal === id}
                onClick={() =>
                  setForm({
                    ...form,
                    primaryGoal: id,
                    secondaryGoals: form.secondaryGoals.filter((goal) => goal !== id),
                  })
                }
              >
                {label}
              </Choice>
            ))}
          </div>

          <h3>Anything else?</h3>
          <p className="hint">Choose up to two secondary goals.</p>

          <div className="choice-grid compact">
            {goals
              .filter(([id]) => id !== form.primaryGoal)
              .map(([id, label]) => (
                <Choice
                  key={id}
                  selected={form.secondaryGoals.includes(id)}
                  onClick={() => toggle("secondaryGoals", id, 2)}
                >
                  {label}
                </Choice>
              ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <p className="eyebrow">EXPERIENCE</p>
          <h2>Where are you starting from?</h2>

          <div className="stack">
            {[
              ["new", "New", "Little or no Pilates experience."],
              ["beginner", "Beginner", "I know some basic movements."],
              ["intermediate", "Intermediate", "I practise Pilates reasonably regularly."],
              [
                "experienced",
                "Experienced",
                "I’m confident with a broad range of Pilates movements.",
              ],
            ].map(([id, title, description]) => (
              <Choice
                key={id}
                selected={form.experience === id}
                onClick={() => setForm({ ...form, experience: id })}
              >
                <span>
                  <b>{title}</b>
                  <small>{description}</small>
                </span>
              </Choice>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <p className="eyebrow">EQUIPMENT</p>
          <h2>What do you have access to?</h2>

          <div className="choice-grid">
            {equipment.map(([id, label]) => (
              <Choice
                key={id}
                selected={form.equipment.includes(id)}
                onClick={() => {
                  if (id === "none") {
                    setForm({
                      ...form,
                      equipment: form.equipment.includes("none") ? [] : ["none"],
                    });
                    return;
                  }

                  const withoutNone = form.equipment.filter((item) => item !== "none");
                  setForm({
                    ...form,
                    equipment: withoutNone.includes(id)
                      ? withoutNone.filter((item) => item !== id)
                      : [...withoutNone, id],
                  });
                }}
              >
                {label}
              </Choice>
            ))}
          </div>

          {form.equipment.includes("reformer") && (
            <label>
              Reformer brand / model <span className="optional">optional</span>
              <input
                value={form.reformerBrand}
                onChange={(event) =>
                  setForm({ ...form, reformerBrand: event.target.value })
                }
                placeholder="e.g. Balanced Body Allegro"
              />
            </label>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <p className="eyebrow">YOUR WEEK</p>
          <h2>What is realistic?</h2>

          <label>
            Time per session
            <div className="choice-grid four">
              {[10, 20, 30, 45].map((minutes) => (
                <Choice
                  key={minutes}
                  selected={form.sessionMinutes === minutes}
                  onClick={() => setForm({ ...form, sessionMinutes: minutes })}
                >
                  {minutes} min
                </Choice>
              ))}
            </div>
          </label>

          <label>
            Sessions per week
            <div className="choice-grid five">
              {[1, 2, 3, 4, 5].map((sessions) => (
                <Choice
                  key={sessions}
                  selected={form.sessionsPerWeek === sessions}
                  onClick={() => setForm({ ...form, sessionsPerWeek: sessions })}
                >
                  {sessions}
                </Choice>
              ))}
            </div>
          </label>

          <label>
            Preferred days <span className="optional">optional</span>
            <div className="choice-grid seven">
              {days.map((day) => (
                <Choice
                  key={day}
                  selected={form.preferredDays.includes(day)}
                  onClick={() => toggle("preferredDays", day)}
                >
                  {day}
                </Choice>
              ))}
            </div>
          </label>
        </div>
      )}

      {step === 5 && (
        <div className="step">
          <p className="eyebrow">MOVEMENT</p>
          <h2>Help us programme appropriately.</h2>

          <div className="question">
            <p>Is anything currently limiting how you move or exercise?</p>
            <div className="yesno">
              <Choice
                selected={form.hasLimitations === false}
                onClick={() =>
                  setForm({ ...form, hasLimitations: false, limitationNotes: "" })
                }
              >
                No
              </Choice>
              <Choice
                selected={form.hasLimitations === true}
                onClick={() => setForm({ ...form, hasLimitations: true })}
              >
                Yes
              </Choice>
            </div>
          </div>

          {form.hasLimitations && (
            <label>
              Please tell Sarah briefly what is limiting you.
              <textarea
                value={form.limitationNotes}
                onChange={(event) =>
                  setForm({ ...form, limitationNotes: event.target.value })
                }
              />
            </label>
          )}

          <div className="question">
            <p>
              Are you currently dealing with pain or an injury that you believe should
              be professionally assessed before starting a new exercise programme?
            </p>
            <div className="yesno">
              <Choice
                selected={form.needsProfessionalAssessment === false}
                onClick={() =>
                  setForm({ ...form, needsProfessionalAssessment: false })
                }
              >
                No
              </Choice>
              <Choice
                selected={form.needsProfessionalAssessment === true}
                onClick={() => setForm({ ...form, needsProfessionalAssessment: true })}
              >
                Yes
              </Choice>
            </div>
          </div>

          <label>
            Movements or types of exercise you enjoy{" "}
            <span className="optional">optional</span>
            <textarea
              value={form.enjoys}
              onChange={(event) => setForm({ ...form, enjoys: event.target.value })}
            />
          </label>

          <label>
            Anything you dislike or prefer to avoid{" "}
            <span className="optional">optional</span>
            <textarea
              value={form.dislikes}
              onChange={(event) => setForm({ ...form, dislikes: event.target.value })}
            />
          </label>
        </div>
      )}

      {step === 6 && (
        <div className="step">
          <p className="eyebrow">REVIEW</p>
          <h2>Last details.</h2>

          <div className="summary">
            <div>
              <span>Primary goal</span>
              <b>{goals.find(([id]) => id === form.primaryGoal)?.[1]}</b>
            </div>
            <div>
              <span>Experience</span>
              <b>{form.experience}</b>
            </div>
            <div>
              <span>Equipment</span>
              <b>{form.equipment.join(", ")}</b>
            </div>
            <div>
              <span>Schedule</span>
              <b>
                {form.sessionsPerWeek} × {form.sessionMinutes} min
              </b>
            </div>
          </div>

          <label>
            Anything else Sarah should know? <span className="optional">optional</span>
            <textarea
              value={form.extraNotes}
              onChange={(event) => setForm({ ...form, extraNotes: event.target.value })}
            />
          </label>

          <label className="check-row consent">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => setForm({ ...form, consent: event.target.checked })}
            />
            <span>
              I understand this service provides Pilates and exercise programming, not
              medical diagnosis or treatment, and I consent to my answers being used to
              prepare and review my programme.
            </span>
          </label>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="actions">
        {step > 0 ? (
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setError("");
              setStep((current) => current - 1);
            }}
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {step < steps.length - 1 ? (
          <button
            className="primary"
            type="button"
            disabled={!canContinue}
            onClick={() => {
              setError("");
              setStep((current) => current + 1);
            }}
          >
            Continue
          </button>
        ) : (
          <button
            className="primary"
            type="button"
            disabled={!canContinue || sending}
            onClick={submit}
          >
            {sending ? "Saving…" : "Submit intake"}
          </button>
        )}
      </div>
    </section>
  );
}
