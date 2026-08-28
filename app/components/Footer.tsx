import Link from "next/link";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Ontor home">
          <Logo size={24} />
          <span>Ontor</span>
        </Link>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/blog">Blog</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p>© {new Date().getFullYear()} Ontor</p>
      </div>
    </footer>
  );
}
