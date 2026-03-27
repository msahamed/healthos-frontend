import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full border-b border-slate-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0F766E" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" fillOpacity="0.25" />
              <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
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
