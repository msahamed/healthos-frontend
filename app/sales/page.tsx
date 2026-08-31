import type { Metadata } from "next";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import styles from "../marketing-pages.module.css";
import salesStyles from "./sales.module.css";

const PILOT_URL = "https://calendly.com/sabber-ahamed/30min";

export const metadata: Metadata = {
  title: "Ontor for sales teams | Help reps recover between calls",
  description:
    "Ontor gives reps a private way to notice and recover from pressure during the workday. Managers see aggregate team patterns only.",
  alternates: { canonical: "/sales" },
  openGraph: {
    title: "Ontor for sales teams",
    description:
      "Help reps recover between calls and give managers an earlier view of changes across the team.",
    url: "https://ontor.ai/sales",
    images: [
      {
        url: "/og.png?v=2",
        width: 1200,
        height: 630,
        alt: "Ontor detects shifts and helps you reset.",
      },
    ],
  },
  twitter: {
    title: "Ontor for sales teams",
    description:
      "Help reps recover between calls and give managers an earlier view of changes across the team.",
    images: ["/og.png?v=2"],
  },
};

const signalRows = [
  {
    name: "Stress",
    meaning: "Higher means more pressure",
    status: "Above usual more often",
    points: [0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
  },
  {
    name: "Vocal strain",
    meaning: "Higher means more strained",
    status: "Rises in late call blocks",
    points: [0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1],
  },
  {
    name: "Speech clarity",
    meaning: "Higher means clearer",
    status: "Near the usual range",
    points: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

export default function SalesPage() {
  return (
    <div className={styles.page}>
      <Nav />
      <main className={salesStyles.main}>
        <section className={salesStyles.hero}>
          <h1>Ontor helps retain top reps and reduce high turnover.</h1>
          <p>
            Ontor helps identify when your sales reps get fatigued and helps
            them recover to peak performance by providing near-real-time
            feedback about their state.
          </p>
          <a className={styles.primaryButton} href={PILOT_URL} target="_blank" rel="noreferrer">
            Talk through a sales-team pilot
          </a>
        </section>

        <section className={salesStyles.productSection}>
          <div className={salesStyles.sectionCopy}>
            <h2>The rep gets something useful during the workday.</h2>
            <p>
              Ontor compares each call with that rep&rsquo;s usual range. If pressure
              lasts through the call, it suggests a short exercise before the
              next one. The rep can speak again afterward and see whether the
              reading changed.
            </p>
          </div>
          <figure className={salesStyles.productShot}>
            <Image
              src="/landing/post-call-reset.png"
              alt="Ontor session view showing a completed reset and stress, energy, and fatigue during a call"
              fill
              sizes="(max-width: 980px) 100vw, 920px"
              priority
            />
          </figure>
        </section>

        <section className={salesStyles.managerSection}>
          <div className={salesStyles.sectionCopy}>
            <h2>The manager sees whether the same change is showing up across the team.</h2>
            <p>
              This is an illustrative aggregate view. It uses the same markers
              and usual-range comparison as the rep&rsquo;s view, but removes the
              individual readings.
            </p>
          </div>

          <div className={salesStyles.teamView} aria-label="Illustrative aggregate view of a sales team's voice markers over 30 days">
            <header>
              <div><strong>Sales team</strong><span>Last 30 days</span></div>
              <p>12 reps contributing</p>
            </header>
            <div className={salesStyles.signalList}>
              {signalRows.map((signal) => (
                <div className={salesStyles.signalRow} key={signal.name}>
                  <div className={salesStyles.signalName}>
                    <strong>{signal.name}</strong>
                    <span>{signal.meaning}</span>
                  </div>
                  <div className={salesStyles.dotLine} aria-hidden="true">
                    <i className={salesStyles.usualBand} />
                    {signal.points.map((warm, index) => (
                      <b
                        className={warm ? salesStyles.warmDot : undefined}
                        key={index}
                        style={{ left: `${4 + index * 8.25}%`, top: `${warm ? 18 + (index % 3) * 5 : 36 + (index % 2) * 5}%` }}
                      />
                    ))}
                  </div>
                  <span className={signal.status === "Near the usual range" ? salesStyles.steadyStatus : salesStyles.attentionStatus}>
                    {signal.status}
                  </span>
                </div>
              ))}
            </div>
            <div className={salesStyles.managerRead}>
              <strong>What the manager can check</strong>
              <p>
                Stress and vocal strain are showing up more often in late call
                blocks, while speech clarity is steady. Review the afternoon call
                load before assigning another talk-track drill.
              </p>
            </div>
            <footer>Team totals only. Individual readings stay with the rep.</footer>
          </div>
        </section>

        <section className={salesStyles.turnoverSection}>
          <div className={salesStyles.sectionCopy}>
            <h2>A resignation creates costs that headcount does not show.</h2>
            <p>
              Accounts need coverage. The manager spends time hiring instead of
              coaching. A replacement can fill the seat before they replace the
              previous rep&rsquo;s output.
            </p>
          </div>
          <div className={salesStyles.turnoverPath} aria-label="Operational effects after a productive sales representative leaves">
            <div><span>Rep leaves</span><strong>Customer and pipeline context leaves with them</strong></div>
            <div><span>Territory is open</span><strong>The rest of the team absorbs the work</strong></div>
            <div><span>Manager hires</span><strong>Coaching time moves to recruiting and onboarding</strong></div>
            <div><span>Replacement ramps</span><strong>Payroll returns before full sales output</strong></div>
          </div>
          <p className={salesStyles.limitNote}>
            Ontor cannot tell a manager which rep will leave. It can show when a
            team&rsquo;s usual pattern has changed, giving the manager a reason to
            check workload, coaching, and support before the exit interview.
          </p>
        </section>

        <section className={salesStyles.pilotSection}>
          <h2>Test it against the numbers you already use.</h2>
          <p>
            Start with one SDR team. Establish its usual pattern, introduce the
            private resets, then compare the aggregate changes with late-day call
            consistency, attainment, absence, and turnover. We have not proved a
            retention lift yet. The pilot is how we find out whether this helps a
            manager act sooner.
          </p>
          <a className={styles.primaryButton} href={PILOT_URL} target="_blank" rel="noreferrer">
            Talk through the pilot
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
