import { NextResponse } from "next/server";
import { ensureIntakeTable, pool } from "@/lib/db";

const goals = new Set([
  "general-strength",
  "core-strength",
  "mobility",
  "flexibility",
  "balance-control",
  "movement-confidence",
  "general-fitness",
  "return-to-exercise",
  "support-activity",
  "workday-body",
]);

const experiences = new Set(["new", "beginner", "intermediate", "experienced"]);
const equipmentAllowed = new Set([
  "mat",
  "reformer",
  "band",
  "ring",
  "small-ball",
  "large-ball",
  "light-weights",
  "none",
]);
const daysAllowed = new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
const minutesAllowed = new Set([10, 20, 30, 45]);

function strings(value: unknown, allowed?: Set<string>) {
  if (!Array.isArray(value)) return [];
  const list = value.filter((v): v is string => typeof v === "string");
  return allowed ? list.filter((v) => allowed.has(v)) : list;
}

function cleanText(value: unknown, max = 1500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const body = await request.json();
  const firstName = cleanText(body.firstName, 80);
  const email = cleanText(body.email, 180).toLowerCase();
  const primaryGoal = cleanText(body.primaryGoal, 60);
  const experience = cleanText(body.experience, 40);
  const sessionMinutes = Number(body.sessionMinutes);
  const sessionsPerWeek = Number(body.sessionsPerWeek);
  const consent = body.consent === true;
  const adult = body.adult === true;

  if (
    !firstName ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !goals.has(primaryGoal) ||
    !experiences.has(experience)
  ) {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  if (
    !minutesAllowed.has(sessionMinutes) ||
    !Number.isInteger(sessionsPerWeek) ||
    sessionsPerWeek < 1 ||
    sessionsPerWeek > 5
  ) {
    return NextResponse.json({ error: "Please choose a valid schedule." }, { status: 400 });
  }

  if (!consent || !adult) {
    return NextResponse.json(
      { error: "Consent and 18+ confirmation are required for this pilot." },
      { status: 400 }
    );
  }

  const secondaryGoals = strings(body.secondaryGoals, goals)
    .filter((goal) => goal !== primaryGoal)
    .slice(0, 2);
  const equipment = strings(body.equipment, equipmentAllowed);
  const preferredDays = strings(body.preferredDays, daysAllowed);
  const hasLimitations = body.hasLimitations === true;
  const needsProfessionalAssessment = body.needsProfessionalAssessment === true;
  const screeningStatus = hasLimitations || needsProfessionalAssessment ? "review" : "clear";

  await ensureIntakeTable();

  const result = await pool.query(
    `INSERT INTO intake_submissions (
      first_name, email, primary_goal, secondary_goals, experience, equipment, reformer_brand,
      session_minutes, sessions_per_week, preferred_days, enjoys, dislikes, has_limitations,
      limitation_notes, needs_professional_assessment, extra_notes, screening_status, consent
    ) VALUES ($1,$2,$3,$4::jsonb,$5,$6::jsonb,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,$16,$17,$18)
    RETURNING id, screening_status`,
    [
      firstName,
      email,
      primaryGoal,
      JSON.stringify(secondaryGoals),
      experience,
      JSON.stringify(equipment),
      cleanText(body.reformerBrand, 120) || null,
      sessionMinutes,
      sessionsPerWeek,
      JSON.stringify(preferredDays),
      cleanText(body.enjoys),
      cleanText(body.dislikes),
      hasLimitations,
      cleanText(body.limitationNotes),
      needsProfessionalAssessment,
      cleanText(body.extraNotes),
      screeningStatus,
      consent,
    ]
  );

  return NextResponse.json({
    ok: true,
    id: result.rows[0].id,
    status: result.rows[0].screening_status,
  });
}
