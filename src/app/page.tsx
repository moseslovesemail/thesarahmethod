import IntakeForm from "@/components/IntakeForm";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="brandbar">
        <div className="wordmark">THE SARAH METHOD</div>
        <div className="brand-note">Personal Pilates</div>
      </header>

      <section className="intro">
        <p className="eyebrow">YOUR PROGRAMME STARTS HERE</p>
        <h1>Pilates programmed around you.</h1>
        <p className="lede">
          Tell us about your goals, experience, equipment and the time you actually have. This takes about five minutes.
        </p>
      </section>

      <IntakeForm />

      <footer className="footer">
        The Sarah Method provides Pilates and exercise programming, not medical diagnosis or treatment.
      </footer>
    </main>
  );
}
