import { ensureIntakeTable, pool } from "@/lib/db";

export const dynamic = "force-dynamic";

const goalLabels: Record<string, string> = {
  "general-strength": "General strength",
  "core-strength": "Core strength",
  mobility: "Mobility",
  flexibility: "Flexibility",
  "balance-control": "Balance & control",
  "movement-confidence": "Movement confidence",
  "general-fitness": "General fitness",
  "return-to-exercise": "Return to exercise",
  "support-activity": "Support another activity",
  "workday-body": "Feel better after work / sitting",
};

export default async function AdminPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="admin-shell">
        <h1>Database not configured</h1>
      </main>
    );
  }

  await ensureIntakeTable();
  const { rows } = await pool.query(
    "SELECT * FROM intake_submissions ORDER BY created_at DESC LIMIT 200"
  );

  return (
    <main className="admin-shell">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">THE SARAH METHOD</p>
          <h1>Intake submissions</h1>
        </div>
        <div className="admin-count">{rows.length} shown</div>
      </div>

      <div className="admin-list">
        {rows.length === 0 && <div className="empty">No submissions yet.</div>}

        {rows.map((row) => (
          <article className="submission" key={row.id}>
            <div className="submission-top">
              <div>
                <h2>{row.first_name}</h2>
                <a href={`mailto:${row.email}`}>{row.email}</a>
              </div>
              <span className={`status ${row.screening_status}`}>{row.screening_status}</span>
            </div>

            <div className="facts">
              <div>
                <span>Primary goal</span>
                <strong>{goalLabels[row.primary_goal] ?? row.primary_goal}</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>{row.experience}</strong>
              </div>
              <div>
                <span>Schedule</span>
                <strong>
                  {row.sessions_per_week} × {row.session_minutes} min
                </strong>
              </div>
              <div>
                <span>Equipment</span>
                <strong>{(row.equipment ?? []).join(", ") || "—"}</strong>
              </div>
            </div>

            {(row.limitation_notes || row.extra_notes || row.enjoys || row.dislikes) && (
              <div className="notes-grid">
                {row.limitation_notes && (
                  <p>
                    <b>Movement limitation:</b> {row.limitation_notes}
                  </p>
                )}
                {row.enjoys && (
                  <p>
                    <b>Enjoys:</b> {row.enjoys}
                  </p>
                )}
                {row.dislikes && (
                  <p>
                    <b>Dislikes:</b> {row.dislikes}
                  </p>
                )}
                {row.extra_notes && (
                  <p>
                    <b>Notes:</b> {row.extra_notes}
                  </p>
                )}
              </div>
            )}

            <div className="submission-date">
              {new Date(row.created_at).toLocaleString("en-NZ", {
                timeZone: "Pacific/Auckland",
              })}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
