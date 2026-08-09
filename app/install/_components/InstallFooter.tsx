import Link from "next/link";
import Logo from "@/app/components/Logo";

// Shared footer for every /install/* page.
export default function InstallFooter() {
  return (
    <footer className="inst-foot">
      <div className="inst-wrap inst-foot-inner">
        <span className="inst-foot-brand">
          <Logo size={26} />
          Ontor
        </span>
        <div className="inst-foot-links">
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
