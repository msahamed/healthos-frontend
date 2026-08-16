// Skeleton for one person's page. Mirrors the real section rhythm so
// the layout does not jump when the data arrives.

export default function ClientLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="srOnly">Loading</span>
      <div className="skel" style={{ width: 90, height: 14 }} />
      <div className="topbar" style={{ marginTop: 14 }}>
        <div>
          <div className="skel" style={{ width: 140, height: 34 }} />
          <div className="skel" style={{ width: 300, height: 16, marginTop: 10 }} />
        </div>
      </div>
      <div className="dials" style={{ marginTop: 24 }}>
        {[0, 1, 2, 3].map((i) => (
          <div className="dial" key={i}>
            <div className="skel" style={{ width: 80, height: 13 }} />
            <div className="skel" style={{ width: 48, height: 27, marginTop: 12 }} />
            <div className="skel" style={{ width: 130, height: 12, marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div className="sect">
        <div className="skel" style={{ width: 220, height: 12 }} />
        <div className="skel" style={{ width: 260, height: 26, marginTop: 10 }} />
        <div className="card" style={{ marginTop: 14 }}>
          <div className="skel" style={{ width: "100%", height: 240 }} />
        </div>
      </div>
    </div>
  );
}
