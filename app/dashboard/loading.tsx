// Shown the instant a dashboard navigation starts.
//
// Both dashboard pages are force-dynamic, so every navigation waits on
// a server round trip. Without this the browser sits on the old page
// with nothing happening, which reads as a hang even when the server
// answers in 150ms. A skeleton that matches the real layout makes the
// wait legible and stops the page jumping when the data lands.

export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="srOnly">Loading</span>
      <div className="topbar">
        <div>
          <div className="skel" style={{ width: 180, height: 34 }} />
          <div className="skel" style={{ width: 280, height: 16, marginTop: 10 }} />
        </div>
      </div>
      <div className="tiles">
        {[0, 1, 2, 3].map((i) => (
          <div className="tile" key={i}>
            <div className="skel" style={{ width: 90, height: 11 }} />
            <div className="skel" style={{ width: 54, height: 30, marginTop: 10 }} />
            <div className="skel" style={{ width: 120, height: 12, marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="skel" style={{ width: "100%", height: 190 }} />
      </div>
    </div>
  );
}
