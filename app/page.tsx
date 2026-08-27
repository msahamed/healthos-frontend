import Link from "next/link";
import InlineWaitlistForm from "./components/InlineWaitlistForm";
import Nav from "./components/Nav";
import styles from "./page.module.css";

const START_FREE = "/login/?next=/dashboard/subscription/";

const markers = [
  ["Stress", "Higher than usual", "72%"],
  ["Energy", "In your range", "48%"],
  ["Confidence", "Steady", "61%"],
];

// Dot positions for the after-the-call timeline mock: [left %, elevated?]
const timeline: [string, [number, boolean][]][] = [
  ["Stress", [[12, false], [26, false], [55, true], [63, true], [88, false]]],
  ["Energy", [[10, false], [30, false], [58, false], [86, true]]],
  ["Confidence", [[14, false], [34, false], [60, false], [84, false]]],
];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>See when you&rsquo;re slipping, before your work does.</h1>
            <p className={styles.lede}>Ontor reads stress, energy, and confidence from your voice while you work. See when your state changes and what helps you recover.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href={START_FREE}>Start free</Link>
              <a className={styles.textLink} href="#how">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <p className={styles.trialNote}>14 days free. No card required.</p>
          </div>
          <div className={styles.productCard} aria-label="Example Ontor voice reading">
            <div className={styles.productHeader}><span className={styles.liveDot} /><span>Today&rsquo;s call</span><span className={styles.duration}>32 min</span></div>
            <div className={styles.productBody}>
            <div className={styles.reading}>
              <h2>Stress rose near the end of the call.</h2>
              <p>Your pace quickened after minute 24. Energy and confidence stayed close to your usual range.</p>
            </div>
            <div className={styles.markers}>
              {markers.map(([name, value, width]) => (
                <div className={styles.marker} key={name}>
                  <div><span>{name}</span><small>{value}</small></div>
                  <div className={styles.track}><span style={{ width }} /></div>
                </div>
              ))}
              <p className={styles.productFoot}>Compared with your own baseline</p>
            </div>
            </div>
          </div>
        </section>

        <section className={styles.proofStrip} aria-label="Product details">
          <span>macOS, Windows, iOS &amp; Android</span><span>Works during calls and check-ins</span><span>Only your voice is measured</span><span>No wearable needed</span>
        </section>

        <section className={styles.section} id="how">
          <div className={styles.sectionHeading}><h2>Press Start. Take the call. See how you held up.</h2></div>
          <div className={styles.steps}>
            <article>
              <p className={styles.stepWhen}>Before the call</p>
              <div className={styles.menuMock} aria-hidden="true">
                <div className={styles.menuTop}>
                  <span className={styles.menuWave}>{[5, 9, 12, 9, 5].map((h, i) => <span key={i} style={{ height: h }} />)}</span>
                  <span>Tue 9:58 AM</span>
                </div>
                <div className={styles.menuList}>
                  <div>Open Ontor</div>
                  <div className={styles.menuActive}>Start</div>
                  <div>Microphone <span className={styles.menuChevron}>›</span></div>
                </div>
              </div>
              <h3>Press Start in your menu bar</h3>
              <p>One click before the call. No window to manage, no bot joining the meeting.</p>
            </article>
            <article>
              <p className={styles.stepWhen}>During the call</p>
              <div className={styles.gateMock} aria-hidden="true">
                <div>
                  <p className={styles.gateLabel}>You speak → analyzed</p>
                  <div className={styles.gateWave}>{[8, 15, 20, 12, 18, 9, 16, 11, 19, 7].map((h, i) => <span key={i} style={{ height: h }} />)}</div>
                </div>
                <div>
                  <p className={`${styles.gateLabel} ${styles.gateLabelMuted}`}>They speak → nothing captured</p>
                  <div className={styles.gateSilence}><i /><i /></div>
                </div>
              </div>
              <h3>It reads only you</h3>
              <p>Pace, pitch, and steadiness, read quietly while you talk. Other voices are never analyzed.</p>
            </article>
            <article>
              <p className={styles.stepWhen}>After the call</p>
              <div className={styles.timelineMock} aria-hidden="true">
                {timeline.map(([name, dots]) => (
                  <div className={styles.tlRow} key={name}>
                    <b>{name}</b>
                    <div className={styles.tlTrack}>
                      {dots.map(([left, hot], i) => <span key={i} className={hot ? styles.tlHot : undefined} style={{ left: `${left}%` }} />)}
                    </div>
                  </div>
                ))}
                <p className={styles.tlNote}>Stress climbed at minute 25, right at the pricing question.</p>
              </div>
              <h3>See how you held up</h3>
              <p>A minute-by-minute read of the call, and what was happening when your state shifted.</p>
            </article>
          </div>
          <p className={styles.stepsFoot}>Away from your desk? A short voice check-in on iPhone or Android reads against the same baseline.</p>
        </section>

        <section className={styles.signals}>
          <h2>Eight signals, read from how you sound</h2>
          <dl className={styles.signalList}>
            <div><dt>Energy</dt><dd>how activated you sound</dd></div>
            <div><dt>Stress</dt><dd>pressure showing in pace and pitch</dd></div>
            <div><dt>Confidence</dt><dd>how decisive you come across</dd></div>
            <div><dt>Fatigue</dt><dd>the wear in your voice</dd></div>
            <div><dt>Vocal strain</dt><dd>the effort it takes to speak</dd></div>
            <div><dt>Expressiveness</dt><dd>how much range you&rsquo;re using</dd></div>
            <div><dt>Articulation</dt><dd>how crisp the words land</dd></div>
            <div><dt>Breathing</dt><dd>pauses and breath between phrases</dd></div>
          </dl>
          <p className={styles.signalsFoot}>Each one is compared with your own usual range. Not a population average, and not a score to chase.</p>
        </section>

        <section className={styles.privacy} id="privacy">
          <div className={styles.privacyInner}>
            <h2>Only you are ever measured.</h2>
            <div>
              <p>Ontor is trained to recognize you. When anyone else speaks, nothing is captured. Analysis runs on your device, and optional sync stays under your control.</p>
              <Link href="/privacy">How privacy works</Link>
            </div>
          </div>
        </section>

        <section className={styles.science}>
          <h2>Grounded in voice research</h2>
          <p className={styles.scienceLine}>Decades of research link pitch, pace, and voice quality to stress, effort, and fatigue. Ontor measures those signals against your own baseline, never anyone else&rsquo;s.</p>
          <Link className={styles.scienceLink} href="/voice-biomarkers">Read the science <span aria-hidden="true">→</span></Link>
          <p className={styles.scienceNote}>Ontor is a self-insight tool, not a medical device.</p>
        </section>

        <section className={styles.faq}>
          <h2>Questions people ask first</h2>
          <details>
            <summary>Is anyone else on the call measured?</summary>
            <p>No. Ontor is enrolled to your voice. When someone else speaks, nothing is captured, so there&rsquo;s nothing to disclose and no one to ask.</p>
          </details>
          <details>
            <summary>Does it join the meeting like a notetaker bot?</summary>
            <p>No. It never appears in the call. The reading happens on your side only, and nobody on the call sees anything.</p>
          </details>
          <details>
            <summary>Do I have to change how I work?</summary>
            <p>You press Start before the call and read the result after. That&rsquo;s the whole habit.</p>
          </details>
          <details>
            <summary>What does it cost?</summary>
            <p>14 days free, no card. After that it&rsquo;s $20 a month, or $168 a year.</p>
          </details>
          <Link className={styles.faqLink} href="/faq">More questions <span aria-hidden="true">→</span></Link>
        </section>

        <section className={styles.finalCta} id="start">
          <h2>Know how you sound before the day gets away from you.</h2>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href={START_FREE}>Start free</Link>
          </div>
          <p className={styles.trialNote}>14 days free. No card required. Cancel anytime.</p>
        </section>
      </main>

      <footer>
        <div className={styles.footerSignup}>
          <p>Not ready yet? Get an email when there&rsquo;s something worth sharing.</p>
          <InlineWaitlistForm variant="cta" buttonLabel="Join the list" successLabel="You're on the list." />
        </div>
        <div className={styles.footerRow}>
          <span>© {new Date().getFullYear()} Ontor</span>
          <div><Link href="/pricing">Pricing</Link><Link href="/blog">Blog</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        </div>
      </footer>
    </>
  );
}
