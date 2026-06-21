import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Editorial serif for display type (matches the design's Newsreader).
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Clean grotesque for body + UI.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

const DESCRIPTION =
  "HealthOS is a voice-first, on-device iOS app that reads your nervous-system state from how you sound. " +
  "A check-in takes just a few seconds — up to thirty — and surfaces eight signals — energy, stress, fatigue, confidence and more — " +
  "before you consciously feel them. No wearable, no bloodwork; your voice never leaves your phone.";

export const metadata: Metadata = {
  metadataBase: new URL("https://healthos.live"),
  title: "HealthOS — Notices what you don't",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "HealthOS — Notices what you don't",
    description: DESCRIPTION,
    url: "https://healthos.live",
    siteName: "HealthOS",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "HealthOS — Your voice is the biomarker that speaks first.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthOS — Notices what you don't",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

// ── Site-wide structured data (GEO / AI answer engines) ──
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HealthOS",
  url: "https://healthos.live",
  description:
    "HealthOS builds voice-first, on-device wellness technology that reads nervous-system state from how you sound.",
  founder: { "@type": "Person", name: "Sabber Ahamed" },
  foundingLocation: "Dallas, TX",
};

const APP_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HealthOS",
  applicationCategory: "HealthApplication",
  operatingSystem: "iOS",
  url: "https://healthos.live",
  description: DESCRIPTION,
  featureList: [
    "On-device voice biomarker analysis",
    "Eight nervous-system signals: energy, stress, confidence, fatigue, vocal strain, expressiveness, articulation, breathing",
    "Daily voice check-in that takes just a few seconds (up to 30)",
    "Pattern detection over your personal baseline",
    "Fully private — voice audio never leaves the phone",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free during beta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`h-full ${newsreader.variable} ${hanken.variable}`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSONLD) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === "production" && (
          <Script id="fullstory" strategy="afterInteractive">{`
            window['_fs_host'] = 'fullstory.com';
            window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
            window['_fs_org'] = '10A2GH';
            window['_fs_namespace'] = 'FS';
            !function(m,n,e,t,l,o,g,y){var s,f,a=function(h){
            return!(h in m)||(m.console&&m.console.log&&m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].'),!1)}(e)
            ;function p(b){var h,d=[];function j(){h&&(d.forEach((function(b){var d;try{d=b[h[0]]&&b[h[0]](h[1])}catch(h){return void(b[3]&&b[3](h))}
            d&&d.then?d.then(b[2],b[3]):b[2]&&b[2](d)})),d.length=0)}function r(b){return function(d){h||(h=[b,d],j())}}return b(r(0),r(1)),{
            then:function(b,h){return p((function(r,i){d.push([b,h,r,i]),j()}))}}}a&&(g=m[e]=function(){var b=function(b,d,j,r){function i(i,c){
            h(b,d,j,i,c,r)}r=r||2;var c,u=/Async$/;return u.test(b)?(b=b.replace(u,""),"function"==typeof Promise?new Promise(i):p(i)):h(b,d,j,c,c,r)}
            ;function h(h,d,j,r,i,c){return b._api?b._api(h,d,j,r,i,c):(b.q&&b.q.push([h,d,j,r,i,c]),null)}return b.q=[],b}(),y=function(b){function h(h){
            "function"==typeof h[4]&&h[4](new Error(b))}var d=g.q;if(d){for(var j=0;j<d.length;j++)h(d[j]);d.length=0,d.push=h}},function(){
            (o=n.createElement(t)).async=!0,o.crossOrigin="anonymous",o.src="https://"+l,o.onerror=function(){y("Error loading "+l)}
            ;var b=n.getElementsByTagName(t)[0];b&&b.parentNode?b.parentNode.insertBefore(o,b):n.head.appendChild(o)}(),function(){function b(){}
            function h(b,h,d){g(b,h,d,1)}function d(b,d,j){h("setProperties",{type:b,properties:d},j)}function j(b,h){d("user",b,h)}function r(b,h,d){j({
            uid:b},d),h&&j(h,d)}g.identify=r,g.setUserVars=j,g.identifyAccount=b,g.clearUserCookie=b,g.setVars=d,g.event=function(b,d,j){h("trackEvent",{
            name:b,properties:d},j)},g.anonymize=function(){r(!1)},g.shutdown=function(){h("shutdown")},g.restart=function(){h("restart")},
            g.log=function(b,d){h("log",{level:b,msg:d})},g.consent=function(b){h("setIdentity",{consent:!arguments.length||b})}}(),s="fetch",
            f="XMLHttpRequest",g._w={},g._w[f]=m[f],g._w[s]=m[s],m[s]&&(m[s]=function(){return g._w[s].apply(this,arguments)}),g._v="2.0.0")
            }(window,document,window._fs_namespace,"script",window._fs_script);
          `}</Script>
        )}
      </body>
    </html>
  );
}
