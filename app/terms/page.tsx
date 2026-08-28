import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import styles from "../privacy/privacy.module.css";
import terms from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms of Use — Ontor",
  description: "The terms that govern your use of Ontor, including accounts, subscriptions, acceptable use, and service limitations.",
};

const sections = [["#acceptance", "Acceptance"], ["#service", "What Ontor provides"], ["#medical", "Not medical advice"], ["#accuracy", "Accuracy"], ["#responsibilities", "Your responsibilities"], ["#data", "Your data"], ["#billing", "Trials and subscriptions"], ["#teams", "Team use"], ["#contact", "Contact"]];

export default function TermsPage() {
  return (<>
    <Nav />
    <main>
      <header className={styles.hero}><div className={styles.heroInner}>
        <p className={styles.eyebrow}>Terms of use</p>
        <h1>The terms for using Ontor.</h1>
        <p className={styles.intro}>These terms explain what Ontor provides, what we ask of you, and how trials and subscriptions work.</p>
        <p className={styles.updated}>Last updated: August 28, 2026</p>
      </div></header>

      <div className={styles.pageShell}>
        <aside className={styles.contents} aria-label="On this page"><p className={styles.contentsLabel}>On this page</p><nav>{sections.map(([href,label]) => <a key={href} href={href}>{label}</a>)}</nav></aside>
        <article className={styles.policy}>
          <section className={terms.notice} aria-labelledby="medical-summary"><p id="medical-summary"><strong>Ontor is not a medical device.</strong> Its readings are informational and do not provide medical advice, diagnosis, or treatment.</p></section>

          <section className={styles.policySection} id="acceptance"><p className={styles.sectionNumber}>01</p><h2>Acceptance of these terms</h2><p>By creating an account or using Ontor and its related services, you agree to these Terms of Use. If you do not agree, do not use Ontor.</p></section>

          <section className={styles.policySection} id="service"><p className={styles.sectionNumber}>02</p><h2>What Ontor provides</h2><p>Ontor reads patterns in your voice and compares them with your usual range. Depending on the device and plan you use, Ontor may let you:</p><ul><li>Record a voice check-in or run a live session.</li><li>Review signals such as energy, stress, fatigue, confidence, speech clarity, vocal strain, and breathing.</li><li>Receive a suggested reset when a shift lasts.</li><li>Review session history and compare check-ins.</li><li>Turn on optional sync across supported devices.</li></ul><p>Features may change as the product develops.</p></section>

          <section className={styles.policySection} id="medical"><p className={styles.sectionNumber}>03</p><h2>Not medical advice</h2><p>Ontor is a wellness and performance intelligence product, not a medical device or clinical tool. Its readings do not constitute medical advice, diagnosis, or treatment. Speak with a qualified professional about medical or mental-health decisions.</p></section>

          <section className={styles.policySection} id="accuracy"><p className={styles.sectionNumber}>04</p><h2>Accuracy and appropriate use</h2><p>Ontor&apos;s readings are estimates derived from your voice. Background noise, recording conditions, illness, microphone quality, and other factors may affect them. Treat each reading as one source of information, not a definitive measurement or a basis for a medical, employment, insurance, or other high-impact decision.</p></section>

          <section className={styles.policySection} id="responsibilities"><p className={styles.sectionNumber}>05</p><h2>Your responsibilities</h2><p>You agree to:</p><ul><li>Use Ontor lawfully and only through an account or team access you are authorized to use.</li><li>Respect other people&apos;s privacy and obtain any consent required before recording a conversation.</li><li>Keep your account, email, and devices secure.</li><li>Not attempt to reverse-engineer, decompile, disrupt, or misuse Ontor.</li><li>Not use Ontor to diagnose, rank, discriminate against, or make high-impact decisions about another person.</li></ul></section>

          <section className={styles.policySection} id="data"><p className={styles.sectionNumber}>06</p><h2>Your data and privacy</h2><p>You retain ownership of your voice recordings and the information derived from them. Our <Link href="/privacy">Privacy Policy</Link> explains what Ontor processes, how optional sync works, and how to delete check-ins or your account.</p></section>

          <section className={styles.policySection} id="billing"><p className={styles.sectionNumber}>07</p><h2>Trials and subscriptions</h2><p>Eligible new accounts may start one 14-day trial without providing a payment card. A free trial does not automatically become a paid subscription.</p><p>If you later purchase a monthly or annual subscription, Stripe processes the payment. Paid subscriptions renew at the interval shown when you subscribe until you cancel. You can cancel at any time, and access continues through the end of the paid billing period. Current prices and plan details appear on the <Link href="/pricing">Pricing page</Link> and at checkout.</p></section>

          <section className={styles.policySection} id="teams"><p className={styles.sectionNumber}>08</p><h2>Team use</h2><p>An organization may provide access to Ontor under a separate pilot, order, or service agreement. If that agreement conflicts with these terms, the separate agreement controls for the organization&apos;s use. Individual sessions and readings remain subject to the privacy and access controls described in the product and Privacy Policy.</p></section>

          <section className={styles.policySection} id="warranties"><p className={styles.sectionNumber}>09</p><h2>Service availability and warranties</h2><p>Ontor is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind to the extent permitted by law. We do not promise that the service will always be available, error-free, or that every reading will be complete or accurate.</p></section>

          <section className={styles.policySection} id="liability"><p className={styles.sectionNumber}>10</p><h2>Limitation of liability</h2><p>To the fullest extent permitted by law, Ontor will not be liable for indirect, incidental, special, or consequential damages arising from your use of Ontor or reliance on its readings.</p></section>

          <section className={styles.policySection} id="property"><p className={styles.sectionNumber}>11</p><h2>Intellectual property</h2><p>Ontor&apos;s design, code, models, branding, and related materials, excluding open-source components and your data, are owned by Ontor. We grant you a limited, non-exclusive, non-transferable right to use the product under these terms.</p></section>

          <section className={styles.policySection} id="changes"><p className={styles.sectionNumber}>12</p><h2>Changes to Ontor or these terms</h2><p>We may change the product or update these terms as Ontor develops. Material changes will be posted here with a new last-updated date. Continued use after the updated terms take effect means you accept them.</p></section>

          <section className={styles.policySection} id="law"><p className={styles.sectionNumber}>13</p><h2>Governing law</h2><p>These terms are governed by the laws of the United States. Disputes will be resolved in the applicable courts of the United States.</p></section>

          <section className={styles.policySection} id="contact"><p className={styles.sectionNumber}>14</p><h2>Contact</h2><p>Questions about these terms? Contact us at <a href="mailto:sabber@ontor.ai">sabber@ontor.ai</a>.</p></section>
        </article>
      </div>
    </main>
    <Footer />
  </>);
}
