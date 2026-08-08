/* Ontor pattern charts. The exact visualizations from week-in-voice.html (same code, same real data),
   packaged as <ontor-chart chart="timeline|week|hours|scatter">. */
(function () {
  if (customElements.get('ontor-chart')) return;
  var DATA = {"markers":["stress","confidence","energy","fatigue","vocal_strain","articulation","breathing"],"matrix":[[1.0,-0.21,0.36,-0.1,0.19,-0.03,0.02],[-0.21,1.0,0.64,-0.52,-0.08,-0.13,0.45],[0.36,0.64,1.0,-0.68,-0.14,-0.26,0.62],[-0.1,-0.52,-0.68,1.0,-0.11,0.31,-0.26],[0.19,-0.08,-0.14,-0.11,1.0,-0.08,-0.04],[-0.03,-0.13,-0.26,0.31,-0.08,1.0,-0.09],[0.02,0.45,0.62,-0.26,-0.04,-0.09,1.0]],"byDay":{"2026-07-22":{"stress":60.7,"confidence":53.7,"energy":62.9,"fatigue":44.3,"vocal_strain":34,"articulation":32.3,"breathing":57,"n":7},"2026-07-24":{"stress":55.8,"confidence":52.5,"energy":55.2,"fatigue":53.7,"vocal_strain":48.8,"articulation":50.1,"breathing":59.5,"n":48},"2026-07-25":{"stress":57.9,"confidence":46.4,"energy":53.1,"fatigue":52.1,"vocal_strain":46.5,"articulation":42.5,"breathing":49.2,"n":110},"2026-07-27":{"stress":53.9,"confidence":48.6,"energy":46,"fatigue":57.4,"vocal_strain":50.0,"articulation":59.1,"breathing":46.2,"n":180},"2026-07-28":{"stress":57.4,"confidence":48.8,"energy":50.8,"fatigue":51.8,"vocal_strain":41.0,"articulation":53.4,"breathing":41.1,"n":180},"2026-07-30":{"stress":55.1,"confidence":59.2,"energy":54.1,"fatigue":42.6,"vocal_strain":53.8,"articulation":47.3,"breathing":42.2,"n":117},"2026-07-31":{"stress":57.7,"confidence":48.1,"energy":52.0,"fatigue":50.3,"vocal_strain":42.2,"articulation":54.3,"breathing":43.4,"n":197}},"byHour":{"10":{"confidence":51.5,"breathing":50.1,"n":231},"11":{"confidence":54.3,"breathing":45.3,"n":173},"12":{"confidence":48.9,"breathing":43.6,"n":154},"13":{"confidence":44.7,"breathing":40.4,"n":61},"14":{"confidence":48.9,"breathing":44.0,"n":150},"19":{"confidence":42.6,"breathing":36.5,"n":52}},"byTOD":{"morning":{"stress":56.1,"confidence":52.2,"energy":53.0,"fatigue":49.4,"vocal_strain":46.9,"articulation":50.2,"breathing":47.1,"n":450},"afternoon":{"stress":56.4,"confidence":48.3,"energy":49,"fatigue":53.8,"vocal_strain":45.4,"articulation":56.3,"breathing":43.8,"n":319},"evening":{"stress":58.4,"confidence":43.7,"energy":49.1,"fatigue":53.8,"vocal_strain":44.3,"articulation":46.4,"breathing":38.3,"n":70}},"coupling":{"stress":{"confidence":-0.21,"energy":0.36,"fatigue":-0.1,"vocal_strain":0.19,"articulation":-0.03,"breathing":0.02},"confidence":{"stress":-0.21,"energy":0.64,"fatigue":-0.52,"vocal_strain":-0.08,"articulation":-0.13,"breathing":0.45}},"timelines":{"442":{"date":"2026-07-28","clock":"13:45","span":43.5,"pts":[[0.0,54,56,55],[0.17,58,46,52],[0.33,49,52,47],[1.21,60,53,53],[1.38,57,53,50],[1.54,55,49,48],[1.71,61,36,36],[1.96,45,55,46],[2.29,45,56,43],[2.46,60,41,39],[2.83,69,45,56],[3.33,61,43,46],[3.5,55,55,53],[3.66,49,59,49],[3.83,56,48,51],[4.08,46,44,39],[4.25,37,46,36],[5.04,50,47,50],[5.21,57,49,54],[6.25,56,54,55],[6.41,50,54,53],[6.58,49,46,45],[7.0,52,37,44],[7.16,51,65,63],[7.33,51,59,50],[7.5,52,56,59],[7.66,58,31,40],[8.08,54,45,44],[8.25,57,53,55],[8.41,57,55,59],[8.92,58,43,46],[9.08,47,53,51],[10.04,64,41,47],[10.2,47,61,50],[13.75,56,48,51],[14.2,75,30,42],[14.54,45,54,54],[14.7,56,43,48],[15.46,48,44,51],[16.45,54,48,50],[17.5,55,54,58],[17.66,48,56,52],[18.0,87,45,58],[18.16,55,53,47],[19.2,52,46,44],[19.37,46,58,49],[19.54,49,56,53],[20.7,50,55,50],[20.87,56,43,52],[21.04,56,61,57],[21.37,62,46,55],[21.83,59,63,59],[22.0,47,57,47],[22.16,58,41,41],[23.0,68,58,64],[23.16,65,53,59],[23.33,55,58,52],[23.5,64,49,58],[23.66,60,38,38],[23.83,54,54,49],[24.58,84,45,68],[29.04,65,31,37],[29.2,57,53,53],[29.45,66,32,43],[30.08,64,44,51],[30.45,64,37,54],[31.29,70,49,63],[31.83,50,46,42],[43.48,60,32,37]]},"445":{"date":"2026-07-31","clock":"10:20","span":44.0,"pts":[[0.0,50,42,40],[0.88,58,60,56],[1.04,63,58,60],[1.21,61,59,58],[1.37,59,40,46],[1.54,65,53,55],[1.71,61,48,57],[1.87,66,47,55],[2.04,53,54,44],[2.21,71,56,61],[2.37,44,52,41],[2.54,59,60,58],[2.71,51,53,46],[2.87,59,62,56],[3.04,53,41,40],[3.21,49,57,51],[3.37,63,51,54],[3.54,67,43,50],[3.71,70,50,62],[3.87,59,40,42],[4.04,53,59,52],[4.21,59,38,45],[6.08,50,32,33],[6.87,51,26,36],[7.33,61,37,41],[8.33,66,53,63],[8.91,67,34,48],[9.54,50,51,50],[9.71,49,54,47],[9.87,51,46,45],[10.25,54,37,42],[10.58,44,46,42],[10.75,57,51,51],[10.91,53,46,49],[11.08,58,36,45],[11.25,49,52,57],[11.41,60,42,49],[11.58,46,53,48],[11.75,45,38,28],[12.71,58,47,52],[12.87,55,49,53],[13.04,60,47,48],[13.21,62,35,51],[13.37,71,40,49],[13.54,72,39,53],[13.71,55,49,48],[13.87,47,49,48],[14.04,56,36,37],[14.71,54,61,59],[14.87,45,41,43],[15.04,57,55,56],[15.21,48,47,51],[15.62,48,51,47],[15.79,52,54,48],[16.33,56,57,57],[16.5,54,55,56],[16.66,62,54,63],[16.83,49,49,47],[17.0,49,59,56],[17.16,64,35,48],[19.21,50,53,51],[19.37,53,53,51],[19.54,56,48,54],[20.08,54,50,54],[20.25,64,52,58],[20.41,53,48,53],[20.58,57,46,49],[21.46,62,43,50],[21.62,61,47,58],[21.79,45,48,41],[22.25,74,37,59],[22.41,52,55,63],[23.21,55,56,66],[23.37,47,60,55],[23.54,57,48,53],[23.71,58,56,51],[23.87,63,37,42],[24.04,60,42,51],[24.33,59,50,54],[24.5,51,61,56],[24.66,52,48,57],[29.21,57,32,38],[29.37,60,59,61],[30.12,58,47,47],[30.29,49,54,49],[30.46,51,52,47],[30.62,61,32,38],[34.0,67,52,64],[34.5,57,49,53],[41.87,48,43,45],[43.37,56,38,47],[43.54,50,55,46],[43.71,59,52,50],[43.87,47,53,46],[44.04,46,47,45]]}},"scatter":[[63,46],[60,49],[51,54],[49,53],[67,62],[69,54],[66,58],[54,58],[57,56],[57,59],[50,63],[56,57],[55,57],[52,53],[51,47],[62,53],[58,58],[66,57],[59,49],[59,53],[63,54],[58,45],[55,51],[61,51],[52,55],[51,55],[55,52],[53,53],[56,51],[51,59],[56,56],[47,48],[51,57],[69,45],[51,49],[66,45],[53,53],[63,52],[55,53],[53,53],[59,56],[55,51],[54,55],[55,49],[67,50],[64,55],[73,64],[67,53],[53,49],[55,51],[48,47],[42,43],[46,50],[43,46],[43,42],[49,54],[48,59],[55,41],[51,46],[52,58],[62,50],[63,48],[67,56],[50,56],[55,50],[55,54],[49,53],[56,56],[52,64],[55,58],[52,46],[49,47],[58,57],[50,55],[61,56],[57,62],[55,47],[61,52],[63,50],[44,52],[55,47],[62,49],[58,55],[48,47],[56,40],[51,43],[47,57],[76,51],[59,50],[56,51],[54,53],[55,50],[51,54],[56,50],[57,62],[52,48],[66,50],[50,53],[62,27],[61,41],[64,33],[59,52],[67,54],[61,51],[55,59],[59,49],[64,48],[77,37],[57,45],[56,53],[52,49],[55,44],[51,54],[50,40],[48,47],[64,45],[49,45],[61,49],[60,37],[51,48],[52,52],[52,36],[58,31],[56,48],[76,28],[69,49],[64,49],[67,58],[69,35],[70,37],[73,51],[55,42],[51,43],[69,39],[49,48],[59,49],[57,35],[49,52],[56,39],[65,43],[49,37],[65,33],[44,33],[68,6],[51,46],[53,44],[58,29],[59,45],[49,50],[55,40],[67,45],[73,34],[62,21],[66,54],[70,52],[66,51],[68,41],[54,49],[52,42],[57,38],[66,20],[44,39],[57,40],[75,57],[65,51],[45,54],[48,53],[45,64],[49,52],[57,44],[54,56],[55,59],[55,42],[49,52],[48,54],[49,48],[50,37],[48,58],[43,53],[51,49],[52,51],[48,50],[55,47],[51,59],[55,43],[51,46],[54,38],[59,26],[54,61],[52,58],[51,59],[45,66],[58,45],[47,43],[50,55],[52,57],[52,53],[50,58],[46,55],[50,61],[50,56],[61,44],[56,51],[52,51],[50,49],[53,38],[54,25],[52,48],[51,44],[55,53],[51,40],[58,58],[58,51],[54,47],[61,49],[53,45],[61,42],[55,44],[59,31],[54,54],[45,60],[44,53],[58,38],[60,54],[53,57],[47,59],[54,63],[53,40],[61,49],[51,56],[47,55],[56,42],[54,47],[54,53],[58,29],[53,47],[54,47],[49,54],[47,50],[72,58],[55,45],[56,52],[43,49],[42,37],[53,46],[56,46],[51,46],[48,43],[58,25],[55,31],[46,54],[55,34],[51,47],[56,47],[52,39],[48,58],[56,57],[56,53],[49,51],[51,51],[50,58],[45,55],[44,56],[43,55],[54,57],[53,56],[49,39],[48,50],[54,53],[51,51],[51,45],[54,51],[56,45],[52,39],[58,46],[53,61],[56,51],[61,67],[66,54],[54,58],[55,46],[54,56],[63,59],[61,56],[52,57],[60,44],[54,53],[60,39],[58,36],[49,53],[53,53],[60,56],[57,53],[52,57],[50,30],[45,58],[46,46],[38,51],[49,57],[47,41],[47,59],[57,34],[53,17],[49,20],[50,40],[56,42],[55,42],[58,36],[55,27],[54,46],[53,42],[51,35],[44,46],[52,40],[48,24],[56,48],[55,43],[51,28],[48,57],[55,20],[49,38],[50,38],[52,55],[51,51],[53,55],[59,46],[73,57],[62,54],[62,46],[61,54],[55,49],[56,61],[60,67],[69,40],[66,48],[71,51],[60,56],[75,44],[73,54],[73,58],[63,58],[68,43],[64,53],[67,67],[58,63],[43,69],[47,64],[52,46],[65,60],[54,49],[56,55],[48,60],[42,45],[68,50],[48,63],[46,53],[50,72],[52,56],[61,50],[62,56],[48,55],[43,58],[46,69],[61,47],[42,62],[54,37],[55,35],[65,39],[70,63],[49,65],[59,45],[45,50],[48,45],[58,48],[51,47],[53,48],[50,54],[46,42],[59,46],[60,47],[55,45],[50,47],[65,56],[61,36],[60,45],[59,49],[46,45],[52,51],[69,38],[60,42],[53,46],[69,39],[56,45],[61,36],[69,46],[66,53],[60,40],[53,46],[57,50],[55,40],[64,53],[76,54],[58,53],[49,51],[60,43],[51,52],[50,48],[78,40],[59,39],[62,38],[52,62],[68,44],[57,45],[53,37],[55,56],[67,41],[66,49],[60,37],[57,54],[62,44],[54,59],[81,41],[60,40],[70,43],[69,51],[57,48],[58,69],[57,39],[60,56],[70,52],[63,45],[55,55],[59,43],[54,45],[65,43],[50,51],[59,56],[66,44],[73,42],[55,54],[63,47],[54,58],[74,27],[55,45],[60,43],[56,54],[54,33],[54,58],[62,43],[73,42],[58,46],[63,56],[50,54],[74,45],[70,43],[57,58],[54,56],[58,46],[49,52],[60,53],[57,53],[55,49],[61,36],[45,55],[45,56],[60,41],[69,45],[61,43],[55,55],[49,59],[56,48],[46,44],[37,46],[50,47],[57,49],[56,54],[50,54],[49,46],[52,37],[51,65],[51,59],[52,56],[58,31],[54,45],[57,53],[57,55],[58,43],[47,53],[64,41],[47,61],[56,48],[75,30],[45,54],[56,43],[48,44],[54,48],[55,54],[48,56],[87,45],[55,53],[52,46],[46,58],[49,56],[50,55],[56,43],[56,61],[62,46],[59,63],[47,57],[58,41],[68,58],[65,53],[55,58],[64,49],[60,38],[54,54],[84,45],[65,31],[57,53],[66,32],[64,44],[64,37],[70,49],[50,46],[60,32],[50,57],[52,58],[46,66],[60,60],[48,59],[65,51],[52,64],[47,61],[53,61],[58,55],[44,70],[52,38],[50,54],[56,75],[44,67],[45,72],[48,56],[50,45],[53,45],[53,43],[57,41],[57,48],[50,61],[54,64],[45,63],[58,64],[54,72],[60,69],[57,69],[55,64],[59,60],[51,66],[56,59],[53,62],[50,78],[62,60],[60,66],[54,65],[64,60],[49,72],[51,61],[63,53],[65,54],[56,64],[55,69],[57,64],[55,63],[45,72],[47,68],[52,67],[53,59],[55,56],[61,40],[53,69],[52,64],[52,68],[72,63],[57,67],[53,61],[61,44],[56,64],[52,58],[59,70],[56,52],[57,47],[64,64],[50,71],[59,57],[59,51],[52,70],[48,66],[76,51],[55,48],[46,69],[64,53],[52,69],[66,64],[54,54],[59,58],[60,52],[55,48],[60,58],[50,63],[63,51],[55,67],[63,67],[60,66],[47,64],[53,51],[50,61],[58,65],[53,50],[62,50],[51,65],[47,50],[50,68],[56,61],[61,36],[65,66],[69,40],[48,45],[53,61],[50,66],[48,68],[59,43],[48,62],[58,63],[43,67],[60,60],[64,52],[47,55],[67,42],[59,51],[55,65],[58,56],[55,47],[52,45],[50,42],[58,60],[63,58],[61,59],[59,40],[65,53],[61,48],[66,47],[53,54],[71,56],[44,52],[59,60],[51,53],[59,62],[53,41],[49,57],[63,51],[67,43],[70,50],[59,40],[53,59],[59,38],[50,32],[51,26],[61,37],[66,53],[67,34],[50,51],[49,54],[51,46],[54,37],[44,46],[57,51],[53,46],[58,36],[49,52],[60,42],[46,53],[45,38],[58,47],[55,49],[60,47],[62,35],[71,40],[72,39],[55,49],[47,49],[56,36],[54,61],[45,41],[57,55],[48,47],[48,51],[52,54],[56,57],[54,55],[62,54],[49,49],[49,59],[64,35],[50,53],[53,53],[56,48],[54,50],[64,52],[53,48],[57,46],[62,43],[61,47],[45,48],[74,37],[52,55],[55,56],[47,60],[57,48],[58,56],[63,37],[60,42],[59,50],[51,61],[52,48],[57,32],[60,59],[58,47],[49,54],[51,52],[61,32],[67,52],[57,49],[48,43],[56,38],[50,55],[59,52],[47,53],[46,47],[70,46],[83,38],[74,52],[61,54],[66,57],[79,62],[67,54],[49,56],[67,51],[53,54],[50,31],[59,51],[66,47],[60,43],[46,60],[47,53],[44,46],[51,53],[55,67],[61,59],[53,49],[58,56],[50,52],[49,56],[65,32],[62,42],[71,51],[64,52],[61,45],[51,52],[56,60],[54,55],[64,55],[65,50],[66,48],[52,48],[58,39],[69,55],[50,51],[72,34],[67,44],[62,40],[68,36],[68,45],[57,49],[53,51],[63,17],[57,39],[45,44],[54,47],[47,41],[63,52],[52,49],[60,50],[61,43],[54,46],[64,39],[53,50],[58,39],[61,53],[60,47],[42,51],[46,51],[50,41],[59,40],[50,47],[52,50],[60,49],[63,47],[59,30],[57,63],[63,39],[58,57],[62,48],[51,51],[54,46],[51,51],[55,63],[61,42],[58,43],[59,49],[55,48],[61,53],[54,46],[66,60],[48,53],[58,48],[59,45],[47,54],[90,47],[66,50],[55,45],[72,46],[59,48],[75,27],[52,53],[57,50],[67,56],[64,40],[58,57],[71,42],[73,49]]};
  var C = { card:'#FFFFFF', grid:'#EAE3D4', axis:'#CFC6B4', ink:'#1B1A17', ink2:'#5A554B', muted:'#8A8375', accent:'#0F766E', pos:'#2a78d6', neg:'#e34948', stress:'#2a78d6', conf:'#008300', energy:'#eda100', fatigue:'#e87ba4' };
  var CSSTXT = ':host{display:block}svg{display:block;width:100%;height:auto}text{font:11px ui-monospace,Menlo,Consolas,monospace;fill:' + C.muted + '}' +
    '.dlabel{font:700 11px "Hanken Grotesk",system-ui,sans-serif}.vlabel{font:700 10.5px ui-monospace,Menlo,monospace;fill:' + C.ink2 + '}' +
    '.anno{font:700 12px "Hanken Grotesk",system-ui,sans-serif;fill:' + C.ink + '}.anno-sub{font:10.5px "Hanken Grotesk",system-ui,sans-serif;fill:' + C.ink2 + '}' +
    '.tip{position:fixed;pointer-events:none;z-index:10;display:none;background:#1B1A17;color:#F7F4EE;font:12px/1.5 ui-monospace,Menlo,monospace;border-radius:8px;padding:8px 11px;max-width:250px;box-shadow:0 5px 16px rgba(0,0,0,.2)}';
  function svgEl(w, h) { var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); return s; }
  function el(name, attrs, parent) { var n = document.createElementNS('http://www.w3.org/2000/svg', name); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  function grid(svg, x0, x1, yScale, vals) { for (var i = 0; i < vals.length; i++) { var v = vals[i], y = yScale(v); el('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: C.grid, 'stroke-width': 1 }, svg); el('text', { x: x0 - 8, y: y + 4, 'text-anchor': 'end' }, svg).textContent = v; } }
  function linePath(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '); }

  function timeline(root, tip) {
    var W = 840, H = 420, L = 42, R = 96, T = 86, B = 96;
    var tl = DATA.timelines['442'].pts;
    var tmax = tl[tl.length - 1][0];
    var x = function (t) { return L + (t / tmax) * (W - L - R); };
    var y = function (v) { return T + (1 - v / 100) * (H - T - B); };
    var svg = svgEl(W, H);
    grid(svg, L, W - R, y, [0, 25, 50, 75, 100]);
    [0, 10, 20, 30, 40].forEach(function (m) { el('text', { x: x(m), y: H - B + 14, 'text-anchor': 'middle' }, svg).textContent = m + 'm'; });
    var series = [{ i: 1, name: 'Stress', color: C.stress }, { i: 2, name: 'Confidence', color: C.conf }];
    series.forEach(function (s) {
      var pts = tl.map(function (p) { return [x(p[0]), y(p[s.i])]; });
      el('path', { d: linePath(pts), fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
      var last = pts[pts.length - 1];
      el('text', { x: last[0] + 8, y: last[1] + 4, 'class': 'dlabel', fill: s.color }, svg).textContent = s.name;
    });
    var ANNO = [
      { t: 7.66, v: 31, c: C.conf, below: true, slot: 0, label: 'conf 31 · asks for help', sub: 'the voice hedges while asking for guidance' },
      { t: 14.2, v: 75, c: C.stress, slot: 0, anchor: 'end', label: 'stress 75 · asks for proof', sub: '“how many founders actually raised?”' },
      { t: 18.0, v: 87, c: C.stress, slot: 1, anchor: 'middle', label: 'stress 87 · the price', sub: 'the $3,600 payment plan hits the table' },
      { t: 24.58, v: 84, c: C.stress, slot: 0, anchor: 'start', label: 'stress 84 · the squeeze', sub: 'family brought up + a deadline discount' },
      { t: 29.04, v: 31, c: C.conf, below: true, slot: 1, label: 'conf 31 · after hanging up', sub: 'the post-call slump, mic still running' }
    ];
    ANNO.forEach(function (a) {
      var px = x(a.t), py = y(a.v);
      var below = !!a.below;
      var ly = below ? (H - B + 36 + a.slot * 32) : (16 + a.slot * 34);
      el('line', { x1: px, x2: px, y1: below ? py + 8 : py - 8, y2: below ? ly - 14 : ly + 18, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, svg);
      el('circle', { cx: px, cy: py, r: 5.5, fill: 'none', stroke: a.c, 'stroke-width': 2 }, svg);
      el('circle', { cx: px, cy: py, r: 2.3, fill: a.c }, svg);
      var anchor = a.anchor || (px > W - R - 160 ? 'end' : px < L + 140 ? 'start' : 'middle');
      el('text', { x: px, y: ly, 'text-anchor': anchor, 'class': 'anno' }, svg).textContent = a.label;
      el('text', { x: px, y: ly + 14, 'text-anchor': anchor, 'class': 'anno-sub' }, svg).textContent = a.sub;
    });
    var cross = el('line', { y1: T, y2: H - B, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '3 3', visibility: 'hidden' }, svg);
    var hit = el('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'transparent' }, svg);
    hit.addEventListener('mousemove', function (e) {
      var box = svg.getBoundingClientRect();
      var t = ((e.clientX - box.left) / box.width * W - L) / (W - L - R) * tmax;
      var best = tl[0];
      tl.forEach(function (p) { if (Math.abs(p[0] - t) < Math.abs(best[0] - t)) best = p; });
      cross.setAttribute('x1', x(best[0])); cross.setAttribute('x2', x(best[0]));
      cross.setAttribute('visibility', 'visible');
      tip.show('<b>min ' + best[0].toFixed(1) + '</b><br>stress ' + best[1] + ' · conf ' + best[2], e.clientX, e.clientY);
    });
    hit.addEventListener('mouseleave', function () { cross.setAttribute('visibility', 'hidden'); tip.hide(); });
    root.appendChild(svg);
  }

  function week(root, tip) {
    var W = 840, H = 340, L = 42, R = 104, T = 20, B = 34;
    var days = Object.keys(DATA.byDay);
    var dayNum = function (d) { return +d.slice(8); };
    var D0 = 22, D1 = 31;
    var x = function (n) { return L + ((n - D0) / (D1 - D0)) * (W - L - R); };
    var y = function (v) { return T + (1 - v / 100) * (H - T - B); };
    var svg = svgEl(W, H);
    grid(svg, L, W - R, y, [0, 25, 50, 75, 100]);
    var have = {}; days.forEach(function (d) { have[dayNum(d)] = 1; });
    for (var n = D0; n <= D1; n++) {
      el('text', { x: x(n), y: H - 12, 'text-anchor': 'middle', opacity: have[n] ? 1 : .45 }, svg).textContent = n;
      if (!have[n]) {
        el('rect', { x: x(n) - 8, y: T, width: 16, height: H - T - B, fill: C.grid, opacity: .35 }, svg);
        el('text', { x: x(n), y: T + 11, 'text-anchor': 'middle', 'font-size': 9, opacity: .8 }, svg).textContent = 'no logs';
      }
    }
    el('text', { x: L, y: 12, 'text-anchor': 'start' }, svg).textContent = 'July';
    var series = [
      { key: 'stress', name: 'Stress', color: C.stress },
      { key: 'confidence', name: 'Confidence', color: C.conf },
      { key: 'energy', name: 'Energy', color: C.energy },
      { key: 'fatigue', name: 'Fatigue', color: C.fatigue }
    ];
    var endYs = [];
    series.forEach(function (s) {
      var pts = days.map(function (d) { return [dayNum(d), x(dayNum(d)), y(DATA.byDay[d][s.key])]; });
      for (var i = 1; i < pts.length; i++) {
        if (pts[i][0] - pts[i - 1][0] === 1) el('line', { x1: pts[i - 1][1], y1: pts[i - 1][2], x2: pts[i][1], y2: pts[i][2], stroke: s.color, 'stroke-width': 2 }, svg);
        else el('line', { x1: pts[i - 1][1], y1: pts[i - 1][2], x2: pts[i][1], y2: pts[i][2], stroke: s.color, 'stroke-width': 1.2, 'stroke-dasharray': '2 5', opacity: .55 }, svg);
      }
      pts.forEach(function (p) { el('circle', { cx: p[1], cy: p[2], r: 3.2, fill: s.color, stroke: C.card, 'stroke-width': 2 }, svg); });
      var ly = pts[pts.length - 1][2] + 4;
      while (endYs.some(function (v) { return Math.abs(v - ly) < 13; })) ly += 13;
      endYs.push(ly);
      el('text', { x: pts[pts.length - 1][1] + 9, y: ly, 'class': 'dlabel', fill: s.color }, svg).textContent = s.name;
    });
    var dx = x(24) + 6;
    [[31, C.energy], [72, C.fatigue]].forEach(function (dv) {
      el('path', { d: 'M ' + dx + ' ' + (y(dv[0]) - 6) + ' l 6 6 l -6 6 l -6 -6 Z', fill: dv[1], stroke: C.card, 'stroke-width': 1.5 }, svg);
    });
    el('line', { x1: dx, x2: dx, y1: y(72) + 8, y2: y(31) - 8, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, svg);
    el('text', { x: dx + 12, y: y(72) - 2, 'class': 'anno' }, svg).textContent = '7:17 pm · energy 31 · fatigue 72';
    el('text', { x: dx + 12, y: y(72) + 12, 'class': 'anno-sub' }, svg).textContent = 'while the words said “everything looks pretty good”';
    var cross = el('line', { y1: T, y2: H - B, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '3 3', visibility: 'hidden' }, svg);
    var hit = el('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'transparent' }, svg);
    hit.addEventListener('mousemove', function (e) {
      var box = svg.getBoundingClientRect();
      var n2 = Math.round(((e.clientX - box.left) / box.width * W - L) / (W - L - R) * (D1 - D0)) + D0;
      var d = DATA.byDay['2026-07-' + n2];
      cross.setAttribute('x1', x(n2)); cross.setAttribute('x2', x(n2));
      cross.setAttribute('visibility', 'visible');
      tip.show(d ? '<b>Jul ' + n2 + '</b><br>stress ' + Math.round(d.stress) + ' · conf ' + Math.round(d.confidence) + '<br>energy ' + Math.round(d.energy) + ' · fatigue ' + Math.round(d.fatigue) : '<b>Jul ' + n2 + '</b><br>no check-ins', e.clientX, e.clientY);
    });
    hit.addEventListener('mouseleave', function () { cross.setAttribute('visibility', 'hidden'); tip.hide(); });
    root.appendChild(svg);
  }

  function hours(root, tip) {
    var W = 840, H = 300, L = 42, R = 104, T = 26, B = 34;
    var hrs = Object.keys(DATA.byHour).map(Number).sort(function (a, b) { return a - b; });
    var H0 = hrs[0], H1 = hrs[hrs.length - 1];
    var x = function (h) { return L + ((h - H0) / (H1 - H0)) * (W - L - R); };
    var y = function (v) { return T + (1 - v / 60) * (H - T - B); };
    var svg = svgEl(W, H);
    grid(svg, L, W - R, y, [0, 20, 40, 60]);
    for (var h = H0; h <= H1; h++) {
      var has = DATA.byHour[h] != null;
      el('text', { x: x(h), y: H - 12, 'text-anchor': 'middle', opacity: has ? 1 : .45 }, svg).textContent = h === 12 ? 'noon' : h > 12 ? (h - 12) + 'pm' : h + 'am';
    }
    var metrics = [{ key: 'confidence', name: 'Confidence', color: C.conf }, { key: 'breathing', name: 'Breathing', color: C.stress }];
    metrics.forEach(function (m) {
      var pts = hrs.map(function (hh) { return [hh, x(hh), y(DATA.byHour[hh][m.key])]; });
      for (var i = 1; i < pts.length; i++) {
        var gap = pts[i][0] - pts[i - 1][0] > 1;
        el('line', { x1: pts[i - 1][1], y1: pts[i - 1][2], x2: pts[i][1], y2: pts[i][2], stroke: m.color, 'stroke-width': gap ? 1.4 : 2.4, 'stroke-dasharray': gap ? '3 6' : 'none', opacity: gap ? .55 : 1 }, svg);
      }
      pts.forEach(function (p) {
        var c = el('circle', { cx: p[1], cy: p[2], r: 4, fill: m.color, stroke: C.card, 'stroke-width': 2 }, svg);
        var d = DATA.byHour[p[0]];
        c.addEventListener('mousemove', function (e) { tip.show('<b>' + (p[0] > 12 ? (p[0] - 12) + ' pm' : p[0] + ' am') + '</b><br>' + m.name + ' ' + Math.round(d[m.key]) + ' · ' + d.n + ' windows', e.clientX, e.clientY); });
        c.addEventListener('mouseleave', tip.hide);
        el('text', { x: p[1], y: p[2] - 10, 'text-anchor': 'middle', 'class': 'vlabel' }, svg).textContent = Math.round(d[m.key]);
      });
      var last = pts[pts.length - 1];
      el('text', { x: last[1] + 10, y: last[2] + 4, 'class': 'dlabel', fill: m.color }, svg).textContent = m.name;
    });
    el('text', { x: x(11), y: T + 2, 'text-anchor': 'middle', 'class': 'anno-sub' }, svg).textContent = 'peak';
    root.appendChild(svg);
  }

  function scatter(root, tip) {
    var W = 840, H = 360, L = 46, R = 20, T = 18, B = 44;
    var x = function (v) { return L + (v / 100) * (W - L - R); };
    var y = function (v) { return T + (1 - v / 100) * (H - T - B); };
    var svg = svgEl(W, H);
    grid(svg, L, W - R, y, [0, 25, 50, 75, 100]);
    [0, 25, 50, 75, 100].forEach(function (v) { el('text', { x: x(v), y: H - 26, 'text-anchor': 'middle' }, svg).textContent = v; });
    el('text', { x: (L + W - R) / 2, y: H - 8, 'text-anchor': 'middle' }, svg).textContent = 'stress →';
    el('text', { x: 12, y: T + 10 }, svg).textContent = 'conf ↑';
    DATA.scatter.forEach(function (p) { el('circle', { cx: x(p[0]), cy: y(p[1]), r: 2.8, fill: C.accent, opacity: .26 }, svg); });
    var n = DATA.scatter.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
    DATA.scatter.forEach(function (p) { sx += p[0]; sy += p[1]; sxy += p[0] * p[1]; sxx += p[0] * p[0]; });
    var slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    var icept = (sy - slope * sx) / n;
    var x0 = 25, x1 = 92;
    el('line', { x1: x(x0), y1: y(icept + slope * x0), x2: x(x1), y2: y(icept + slope * x1), stroke: C.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: .75 }, svg);
    el('text', { x: x(x1) + 4, y: y(icept + slope * x1) + 4, 'class': 'anno' }, svg).textContent = 'trend';
    el('text', { x: W - R - 8, y: T + 16, 'text-anchor': 'end', 'class': 'anno' }, svg).textContent = 'r = −0.21';
    el('text', { x: W - R - 8, y: T + 31, 'text-anchor': 'end', 'class': 'anno-sub' }, svg).textContent = 'nearly flat — two separate dials';
    var ring = el('circle', { r: 6, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, visibility: 'hidden' }, svg);
    var hit = el('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'transparent' }, svg);
    hit.addEventListener('mousemove', function (e) {
      var box = svg.getBoundingClientRect();
      var mx = (e.clientX - box.left) / box.width * W, my = (e.clientY - box.top) / box.height * H;
      var best = null, bd = 1e9;
      DATA.scatter.forEach(function (p) { var dx = x(p[0]) - mx, dy = y(p[1]) - my, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = p; } });
      if (best && bd < 400) { ring.setAttribute('cx', x(best[0])); ring.setAttribute('cy', y(best[1])); ring.setAttribute('visibility', 'visible'); tip.show('stress ' + best[0] + ' · conf ' + best[1], e.clientX, e.clientY); }
      else { ring.setAttribute('visibility', 'hidden'); tip.hide(); }
    });
    hit.addEventListener('mouseleave', function () { ring.setAttribute('visibility', 'hidden'); tip.hide(); });
    root.appendChild(svg);
  }

  function coupling(root, tip) {
    var c = DATA.coupling.confidence;
    var rows = [
      { name: 'Energy', v: c.energy, note: 'shares inputs' },
      { name: 'Breathing', v: c.breathing, note: 'clean signal' },
      { name: 'Stress', v: c.stress, note: '' },
      { name: 'Vocal strain', v: c.vocal_strain, note: '' },
      { name: 'Fatigue', v: c.fatigue, note: 'shares inputs' }
    ];
    var W = 840, rowH = 42, T = 12, B = 28, L = 116, R = 104;
    var H = T + rows.length * rowH + B;
    var mid = L + (W - L - R) / 2;
    var x = function (v) { return mid + v * ((W - L - R) / 2); };
    var svg = svgEl(W, H);
    [-0.5, 0, 0.5].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: T, y2: H - B, stroke: v === 0 ? C.axis : C.grid, 'stroke-width': 1 }, svg);
      el('text', { x: x(v), y: H - 8, 'text-anchor': 'middle' }, svg).textContent = v > 0 ? '+' + v : v;
    });
    rows.forEach(function (r, i) {
      var cy = T + i * rowH + rowH / 2;
      el('text', { x: L - 12, y: cy + 4, 'text-anchor': 'end', fill: C.ink2, 'font-weight': 600, 'font-family': '"Hanken Grotesk", system-ui, sans-serif' }, svg).textContent = r.name;
      var w = Math.abs(x(r.v) - mid);
      var rect = el('rect', { x: r.v < 0 ? x(r.v) : mid, y: cy - 10, width: w, height: 20, rx: 4, fill: r.v >= 0 ? C.pos : C.neg, opacity: r.note === 'clean signal' ? 1 : .72 }, svg);
      el('text', { x: r.v >= 0 ? x(r.v) + 8 : x(r.v) - 8, y: cy + 4, 'text-anchor': r.v >= 0 ? 'start' : 'end', 'class': 'vlabel' }, svg).textContent = (r.v > 0 ? '+' : '') + r.v.toFixed(2);
      if (r.note) {
        el('text', { x: W - 4, y: cy + 4, 'text-anchor': 'end', fill: r.note === 'clean signal' ? C.accent : C.muted, 'font-weight': r.note === 'clean signal' ? 700 : 400 }, svg).textContent = r.note;
      }
      rect.addEventListener('mousemove', function (e) { tip.show('<b>' + r.name + '</b> ' + (r.v > 0 ? '+' : '') + r.v.toFixed(2) + ' with confidence', e.clientX, e.clientY); });
      rect.addEventListener('mouseleave', tip.hide);
    });
    root.appendChild(svg);
  }

  var BUILDERS = { timeline: timeline, week: week, hours: hours, scatter: scatter, coupling: coupling };
  class OntorChart extends HTMLElement {
    connectedCallback() {
      if (this.__built) return; this.__built = true;
      var sh = this.attachShadow({ mode: 'open' });
      var st = document.createElement('style'); st.textContent = CSSTXT; sh.appendChild(st);
      var tipEl = document.createElement('div'); tipEl.className = 'tip'; sh.appendChild(tipEl);
      var tip = {
        show: function (h, x2, y2) { tipEl.innerHTML = h; tipEl.style.display = 'block'; var r = tipEl.getBoundingClientRect(); tipEl.style.left = Math.min(x2 + 14, innerWidth - r.width - 8) + 'px'; tipEl.style.top = Math.max(8, y2 - r.height - 12) + 'px'; },
        hide: function () { tipEl.style.display = 'none'; }
      };
      var kind = this.getAttribute('chart') || 'week';
      (BUILDERS[kind] || BUILDERS.week)(sh, tip);
    }
  }
  customElements.define('ontor-chart', OntorChart);
})();
