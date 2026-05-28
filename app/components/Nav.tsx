import Link from "next/link";
import Logo from "./Logo";

export default function Nav() {
  return (
    <nav className="w-full border-b border-slate-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={32} />
          <span className="font-semibold text-slate-900 text-[15px]">HealthOS</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Terms</Link>
        </div>
      </div>
    </nav>
  );
}
