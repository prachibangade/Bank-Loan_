/* Bank Loan Dashboard: vanilla JS. Data comes from data.js (column arrays) and queries.js. */
(function () {
"use strict";
const D = window.LOAN_DATA, N = D.id.length;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const C = {good:"#10b981", bad:"#ef4444", cur:"#f59e0b", blue:"#38bdf8", violet:"#a78bfa"};
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fInt = v => Math.round(v).toLocaleString("en-US");
const fM = v => "$" + (v / 1e6).toFixed(2) + "M";
const fUSD = v => "$" + fInt(v);
const fP = (v, d = 2) => v.toFixed(d) + "%";
const fSign = v => (v >= 0 ? "+" : "") + v.toFixed(2) + "%";

// ---------- derived columns ----------
const mo = new Uint8Array(N), bad = new Uint8Array(N);
for (let i = 0; i < N; i++) { mo[i] = +D.issue_date[i].slice(5, 7); bad[i] = D.loan_status[i] === "Charged Off" ? 1 : 0; }

function agg(pred) {
  const a = {n:0, funded:0, recv:0, rate:0, dti:0, bad:0, badFunded:0, badRecv:0};
  for (let i = 0; i < N; i++) {
    if (pred && !pred(i)) continue;
    a.n++; a.funded += D.loan_amount[i]; a.recv += D.total_payment[i]; a.rate += D.int_rate[i]; a.dti += D.dti[i];
    if (bad[i]) { a.bad++; a.badFunded += D.loan_amount[i]; a.badRecv += D.total_payment[i]; }
  }
  a.avgRate = a.n ? a.rate / a.n * 100 : 0; a.avgDti = a.n ? a.dti / a.n * 100 : 0;
  a.coRate = a.n ? a.bad / a.n * 100 : 0; a.netLoss = a.badFunded - a.badRecv;
  return a;
}
function group(keyFn) {
  const m = new Map();
  for (let i = 0; i < N; i++) {
    const k = keyFn(i); let a = m.get(k);
    if (!a) { a = {n:0, funded:0, bad:0, netLoss:0}; m.set(k, a); }
    a.n++; a.funded += D.loan_amount[i];
    if (bad[i]) { a.bad++; a.netLoss += D.loan_amount[i] - D.total_payment[i]; }
  }
  m.forEach(a => a.coRate = a.bad / a.n * 100);
  return m;
}
const ALL = agg(); // portfolio

// ---------- tooltip ----------
const tip = $("#tip");
function showTip(html, e) {
  tip.innerHTML = html; tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + w > innerWidth - 8) x = e.clientX - w - 14;
  if (y + h > innerHeight - 8) y = e.clientY - h - 14;
  tip.style.left = x + "px"; tip.style.top = y + "px";
}
const hideTip = () => { tip.hidden = true; };
const tipRows = (title, rows) => `<b>${esc(title)}</b>` + rows.map(r => `<div class="r"><span>${esc(r[0])}</span><span>${esc(r[1])}</span></div>`).join("");

// ---------- tabs ----------
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-selected", x === b));
  document.querySelectorAll(".page").forEach(p => p.hidden = p.id !== "tab-" + b.dataset.tab);
  hideTip();
  if (b.dataset.tab === "overview") drawOverview();
}));
$("#hdrCount").textContent = fInt(N);

// ======================= SUMMARY =======================
const monthSel = $("#monthSel");
monthSel.innerHTML = MONTHS.map((m, i) => `<option value="${i + 1}">${m} 2021</option>`).join("");
monthSel.value = "12";
monthSel.addEventListener("change", drawSummary);

function chip(delta, invert) {
  if (delta == null || !isFinite(delta)) return `<span class="chip na">MoM n/a</span>`;
  const good = invert ? delta <= 0 : delta >= 0;
  return `<span class="chip ${good ? "up" : "dn"}">${delta >= 0 ? "▲" : "▼"} ${fSign(delta)}</span>`;
}
function drawSummary() {
  const m = +monthSel.value, cur = agg(i => mo[i] === m), prv = m > 1 ? agg(i => mo[i] === m - 1) : null;
  const d = (a, b) => prv && b ? (a - b) / b * 100 : null;
  const defs = [
    ["Total applications", fInt(cur.n), d(cur.n, prv && prv.n), false, "Portfolio " + fInt(ALL.n)],
    ["Total funded", fM(cur.funded), d(cur.funded, prv && prv.funded), false, "Portfolio " + fM(ALL.funded)],
    ["Total received", fM(cur.recv), d(cur.recv, prv && prv.recv), false, "Portfolio " + fM(ALL.recv)],
    ["Avg interest rate", fP(cur.avgRate), d(cur.avgRate, prv && prv.avgRate), true, "Portfolio " + fP(ALL.avgRate)],
    ["Avg DTI", fP(cur.avgDti), d(cur.avgDti, prv && prv.avgDti), true, "Portfolio " + fP(ALL.avgDti)]
  ];
  $("#kpis").innerHTML = defs.map(k => `<div class="card kpi"><div class="l">${k[0]}</div><div class="v">${k[1]}</div>
    <div class="m">${chip(k[2], k[3])}<span class="hint">vs ${m > 1 ? MONTHS[m - 2] : "n/a"}</span></div><div class="p">${k[4]}</div></div>`).join("");
  $("#monthHint").textContent = `${MONTHS[m - 1]} 2021 = MTD · ${m > 1 ? MONTHS[m - 2] + " = PMTD" : "no prior month"} · rate/DTI change shown as relative %, lower is better`;

  const good = agg(i => !bad[i]), badA = ALL.bad;
  const card = (cls, title, a, extra) => `<div class="card ${cls}"><div class="l hint">${title}</div>
    <div class="big">${fP(a.n / ALL.n * 100)}</div><div class="meter"><i style="width:${a.n / ALL.n * 100}%"></i></div>
    <div class="facts"><div><span>Applications</span><b>${fInt(a.n)}</b></div><div><span>Funded</span><b>${fM(a.funded)}</b></div>
    <div><span>Received</span><b>${fM(a.recv)}</b></div>${extra || ""}</div></div>`;
  $("#goodCard").innerHTML = card("good", "Good loans · Fully Paid + Current", good, `<div><span>Net result</span><b>+${fM(good.recv - good.funded)}</b></div>`);
  const b = agg(i => bad[i]);
  $("#badCard").innerHTML = card("bad", "Bad loans · Charged Off", b, `<div><span>Net capital loss</span><b>−${fM(b.funded - b.recv)}</b></div><div><span>Recovery rate</span><b>${fP(b.recv / b.funded * 100, 1)}</b></div>`);

  const st = group2(i => D.loan_status[i]);
  const order = ["Fully Paid", "Current", "Charged Off"];
  $("#statusTable").innerHTML = `<thead><tr><th class="l">Loan status</th><th>Applications</th><th>Funded</th><th>Received</th><th>Avg rate</th><th>Avg DTI</th></tr></thead><tbody>` +
    order.map(k => { const a = st.get(k); return `<tr><td class="l">${badge(k)}</td><td>${fInt(a.n)}</td><td>${fM(a.funded)}</td><td>${fM(a.recv)}</td><td>${fP(a.avgRate)}</td><td>${fP(a.avgDti)}</td></tr>`; }).join("") + `</tbody>`;
}
function group2(keyFn) { // full aggregates per key
  const keys = new Set(); for (let i = 0; i < N; i++) keys.add(keyFn(i));
  const m = new Map(); keys.forEach(k => m.set(k, agg(i => keyFn(i) === k))); return m;
}
function badge(s) {
  const c = s === "Fully Paid" ? "b-good" : s === "Charged Off" ? "b-bad" : "b-cur";
  return `<span class="badge ${c}">${esc(s)}</span>`;
}

// ======================= OVERVIEW =======================
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }

function drawTrend() {
  const el = $("#trend"), metric = $("#trendMetric").value;
  const mon = []; for (let m = 1; m <= 12; m++) mon.push(agg(i => mo[i] === m));
  let series;
  if (metric === "money") series = [{name:"Funded", color:C.blue, v:mon.map(a => a.funded / 1e6), f:v => "$" + v.toFixed(2) + "M"},
                                    {name:"Received", color:C.violet, v:mon.map(a => a.recv / 1e6), f:v => "$" + v.toFixed(2) + "M"}];
  else if (metric === "apps") series = [{name:"Applications", color:C.blue, v:mon.map(a => a.n), f:fInt}];
  else series = [{name:"Charge-off rate", color:C.bad, v:mon.map(a => a.coRate), f:v => fP(v)}];
  const W = Math.max(el.clientWidth, 320), H = 270, L = 52, R = 16, T = 12, B = 28;
  const max = niceMax(Math.max(...series.flatMap(s => s.v)) * 1.05);
  const x = i => L + i * (W - L - R) / 11, y = v => T + (1 - v / max) * (H - T - B);
  let g = "";
  for (let k = 0; k <= 5; k++) { const v = max * k / 5; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#22304d"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${metric === "money" ? v.toFixed(0) : metric === "rate" ? v.toFixed(0) + "%" : fInt(v)}</text>`; }
  MONTHS.forEach((m, i) => g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${m}</text>`);
  series.forEach(s => g += `<path d="${s.v.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join("")}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"/>`);
  g += `<line id="xh" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="#8fa1bf" stroke-dasharray="3 3" visibility="hidden"/><g id="dots"></g>`;
  const legend = series.length > 1 ? `<div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join("")}</div>` : "";
  el.innerHTML = legend + `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly trend chart">${g}<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" id="hit"/></svg>`;
  const svg = el.querySelector("svg"), xh = svg.querySelector("#xh"), dots = svg.querySelector("#dots");
  svg.querySelector("#hit").addEventListener("mousemove", e => {
    const r = svg.getBoundingClientRect(); const i = Math.max(0, Math.min(11, Math.round((e.clientX - r.left - L) / ((W - L - R) / 11))));
    xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i)); xh.setAttribute("visibility", "visible");
    dots.innerHTML = series.map(s => `<circle cx="${x(i)}" cy="${y(s.v[i])}" r="4.5" fill="${s.color}" stroke="#0b1220" stroke-width="2"/>`).join("");
    const rows = series.map(s => [s.name, s.f(s.v[i])]); if (metric === "money") rows.push(["Applications", fInt(mon[i].n)]);
    showTip(tipRows(MONTHS[i] + " 2021", rows), e);
  });
  svg.querySelector("#hit").addEventListener("mouseleave", () => { xh.setAttribute("visibility", "hidden"); dots.innerHTML = ""; hideTip(); });
}

function drawColumns(el, rows, refVal) { // vertical bars, charge-off rate
  const W = Math.max(el.clientWidth, 280), H = 230, L = 36, R = 8, T = 18, B = 26;
  const max = niceMax(Math.max(...rows.map(r => r.v), refVal) * 1.1), bw = (W - L - R) / rows.length;
  const y = v => T + (1 - v / max) * (H - T - B);
  let g = ""; for (let k = 0; k <= 5; k++) { const v = max * k / 5; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#22304d"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(0)}%</text>`; }
  rows.forEach((r, i) => {
    const bx = L + i * bw + bw * .2, w = bw * .6, top = y(r.v);
    g += `<g class="bar" data-i="${i}"><rect x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent"/><path d="M${bx} ${H - B}V${top + 4}Q${bx} ${top} ${bx + 4} ${top}H${bx + w - 4}Q${bx + w} ${top} ${bx + w} ${top + 4}V${H - B}Z" fill="${C.bad}"/>
      <text x="${bx + w / 2}" y="${top - 5}" text-anchor="middle" style="fill:#e6edf7">${r.v.toFixed(1)}</text><text x="${bx + w / 2}" y="${H - 8}" text-anchor="middle">${esc(r.label)}</text></g>`;
  });
  g += `<line x1="${L}" x2="${W - R}" y1="${y(refVal)}" y2="${y(refVal)}" stroke="#cbd5e1" stroke-dasharray="4 4"/>`;
  el.innerHTML = `<svg width="${W}" height="${H}" role="img" aria-label="Charge-off rate by grade">${g}</svg>`;
  el.querySelectorAll(".bar").forEach(b => {
    const r = rows[+b.dataset.i];
    b.addEventListener("mousemove", e => showTip(r.tip, e)); b.addEventListener("mouseleave", hideTip);
  });
}

function drawHBars(el, rows, o) { // rows [{label,value,text,tip}]
  const max = o.max || Math.max(...rows.map(r => r.value), 1e-9);
  el.innerHTML = rows.map((r, i) => `<div class="hbar" data-i="${i}"><div class="nm" title="${esc(r.label)}">${esc(r.label)}</div>
    <div class="tr"><div class="fl" style="width:${Math.max(0, r.value / max * 100)}%;background:${o.color}"></div>${o.ref != null ? `<div class="ref" style="left:${o.ref / max * 100}%"></div>` : ""}</div>
    <div class="vl">${esc(r.text)}</div></div>`).join("") || `<p class="hint">No segments meet the minimum volume.</p>`;
  el.querySelectorAll(".hbar").forEach(b => { const r = rows[+b.dataset.i]; b.addEventListener("mousemove", e => showTip(r.tip, e)); b.addEventListener("mouseleave", hideTip); });
}
const segTip = (name, a) => tipRows(name, [["Applications", fInt(a.n)], ["Funded", fM(a.funded)], ["Charged off", fInt(a.bad)], ["Charge-off rate", fP(a.coRate)], ["Net loss", fM(a.netLoss)]]);

function drawDonut() {
  const el = $("#termChart"), g = group(i => D.term[i]), parts = [[36, C.blue], [60, C.violet]];
  const R = 62, Cc = 2 * Math.PI * R; let off = 0;
  const arcs = parts.map(([t, col]) => { const a = g.get(t), f = a.n / N, s = `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${col}" stroke-width="22" stroke-dasharray="${f * Cc - 2} ${Cc}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)" data-t="${t}"/>`; off += f * Cc; return s; }).join("");
  el.innerHTML = `<svg width="160" height="160" role="img" aria-label="Share of applications by term">${arcs}<text x="80" y="76" text-anchor="middle" style="fill:#e6edf7;font-size:18px;font-weight:600">${fInt(N)}</text><text x="80" y="94" text-anchor="middle">applications</text></svg>
    <div class="lg">${parts.map(([t, col]) => { const a = g.get(t); return `<div><i class="legend" style="display:inline"><i style="background:${col};height:10px;width:10px;border-radius:50%"></i></i><b>${t} months</b> · ${fP(a.n / N * 100, 1)} of loans<span>${fInt(a.n)} loans · charge-off rate <b style="color:${C.bad}">${fP(a.coRate)}</b></span></div>`; }).join("")}</div>`;
  el.querySelectorAll("circle").forEach(c => { const t = +c.dataset.t; c.addEventListener("mousemove", e => showTip(segTip(t + " months", g.get(t)), e)); c.addEventListener("mouseleave", hideTip); });
}

function drawOverview() {
  $("#portAvg").textContent = fP(ALL.coRate);
  drawTrend();
  const ref = ALL.coRate;
  const gr = group(i => D.grade[i]), gk = [...gr.keys()].sort();
  drawColumns($("#gradeChart"), gk.map(k => ({label:k, v:gr.get(k).coRate, tip:segTip("Grade " + k, gr.get(k))})), ref);
  drawDonut();
  // purpose
  const pm = $("#purposeMetric").value, pg = group(i => D.purpose[i]), totalLoss = ALL.netLoss;
  let pr = [...pg.entries()].map(([k, a]) => ({label:k, a, value: pm === "rate" ? a.coRate : pm === "loss" ? a.netLoss / totalLoss * 100 : a.n}));
  pr.sort((x, y) => y.value - x.value);
  drawHBars($("#purposeChart"), pr.map(r => ({label:r.label, value:r.value, text: pm === "rate" ? fP(r.value) : pm === "loss" ? fP(r.value, 1) : fInt(r.value), tip:segTip(r.label, r.a)})),
    {color: pm === "loans" ? C.blue : C.bad, ref: pm === "rate" ? ref : null});
  // state
  const sm = $("#stateMetric").value, min = +$("#stateMin").value || 0, sg = group(i => D.address_state[i]);
  let sr = [...sg.entries()].filter(([k, a]) => a.n >= min).map(([k, a]) => ({label:k, a, value: sm === "rate" ? a.coRate : sm === "loss" ? a.netLoss : a.n}));
  sr.sort((x, y) => y.value - x.value); sr = sr.slice(0, 15);
  drawHBars($("#stateChart"), sr.map(r => ({label:r.label, value:r.value, text: sm === "rate" ? fP(r.value) : sm === "loss" ? fM(r.value) : fInt(r.value), tip:segTip(r.label, r.a)})),
    {color: sm === "loans" ? C.blue : C.bad, ref: sm === "rate" ? ref : null});
  // home + verification
  const hg = group(i => D.home_ownership[i]);
  drawHBars($("#homeChart"), [...hg.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, a]) => ({label:k + (a.n < 200 ? " (n=" + a.n + ")" : ""), value:a.coRate, text:fP(a.coRate), tip:segTip(k, a)})), {color:C.bad, ref});
  const vg = group(i => D.verification_status[i]);
  drawHBars($("#verifChart"), [...vg.entries()].sort((a, b) => b[1].coRate - a[1].coRate).map(([k, a]) => ({label:k, value:a.coRate, text:fP(a.coRate), tip:segTip(k, a)})), {color:C.bad, ref});
}
["trendMetric", "purposeMetric", "stateMetric", "stateMin"].forEach(id => $("#" + id).addEventListener("input", drawOverview));
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (!$("#tab-overview").hidden) drawOverview(); }, 150); });

// ======================= DETAILS =======================
const COLS = [
  ["id","Loan ID",true], ["issue_date","Issued",true], ["purpose","Purpose",true], ["grade","Grade",true], ["address_state","State",true],
  ["term","Term",true], ["loan_status","Status",true], ["loan_amount","Funded",true], ["total_payment","Received",true], ["int_rate","Rate",true], ["dti","DTI",true]
];
const F = {grade:"", purpose:"", address_state:"", loan_status:"", term:"", verification_status:"", q:""};
const FDEF = [["grade","Grade"],["purpose","Purpose"],["address_state","State"],["loan_status","Status"],["term","Term"],["verification_status","Verification"]];
const uniq = c => [...new Set(D[c])].sort((a, b) => (typeof a === "number" ? a - b : String(a).localeCompare(String(b))));
$("#filters").innerHTML = FDEF.map(([c, l]) => `<label>${l}<select data-f="${c}"><option value="">All</option>${uniq(c).map(v => `<option>${esc(v)}</option>`).join("")}</select></label>`).join("") +
  `<label>Loan ID<input data-f="q" placeholder="search id…" inputmode="numeric"></label>`;
document.querySelectorAll("#filters [data-f]").forEach(el => el.addEventListener("input", () => { F[el.dataset.f] = el.value.trim(); page = 0; drawDetails(); }));
let sortCol = "id", sortDir = 1, page = 0, idx = [];
const PS = 25;
function filtered() {
  const out = [];
  for (let i = 0; i < N; i++) {
    if (F.grade && D.grade[i] !== F.grade) continue; if (F.purpose && D.purpose[i] !== F.purpose) continue;
    if (F.address_state && D.address_state[i] !== F.address_state) continue; if (F.loan_status && D.loan_status[i] !== F.loan_status) continue;
    if (F.term && String(D.term[i]) !== F.term) continue; if (F.verification_status && D.verification_status[i] !== F.verification_status) continue;
    if (F.q && !String(D.id[i]).includes(F.q)) continue;
    out.push(i);
  }
  const c = D[sortCol]; out.sort((a, b) => (c[a] < c[b] ? -1 : c[a] > c[b] ? 1 : 0) * sortDir); return out;
}
function drawDetails() {
  idx = filtered(); const pages = Math.max(1, Math.ceil(idx.length / PS)); page = Math.min(page, pages - 1);
  const fmt = {issue_date:v => v, term:v => v + " mo", loan_status:badge, loan_amount:fUSD, total_payment:fUSD, int_rate:v => fP(v * 100), dti:v => fP(v * 100), id:v => v};
  $("#detTable").innerHTML = `<thead><tr>${COLS.map(([c, l]) => `<th class="sortable${["purpose","loan_status","grade","address_state","issue_date"].includes(c) ? " l" : ""}" data-c="${c}" aria-sort="${sortCol === c ? (sortDir > 0 ? "ascending" : "descending") : "none"}">${l}${sortCol === c ? (sortDir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>` +
    idx.slice(page * PS, page * PS + PS).map(i => `<tr>${COLS.map(([c]) => `<td class="${["purpose","loan_status","grade","address_state","issue_date"].includes(c) ? "l" : ""}">${fmt[c] ? fmt[c](D[c][i]) : esc(D[c][i])}</td>`).join("")}</tr>`).join("") + `</tbody>`;
  document.querySelectorAll("#detTable th").forEach(th => th.addEventListener("click", () => { const c = th.dataset.c; sortDir = sortCol === c ? -sortDir : 1; sortCol = c; page = 0; drawDetails(); }));
  const sub = idx.reduce((s, i) => s + D.loan_amount[i], 0);
  $("#detCount").textContent = `${fInt(idx.length)} loans · ${fM(sub)} funded`;
  $("#pageInfo").textContent = `Page ${page + 1} of ${fInt(pages)}`;
  $("#prevBtn").disabled = page === 0; $("#nextBtn").disabled = page >= pages - 1;
}
$("#prevBtn").addEventListener("click", () => { page--; drawDetails(); });
$("#nextBtn").addEventListener("click", () => { page++; drawDetails(); });
$("#exportBtn").addEventListener("click", () => {
  const keys = Object.keys(D), q = v => /[",\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : v;
  const csv = [keys.join(",")].concat(idx.map(i => keys.map(k => q(D[k][i])).join(","))).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"})); a.download = "filtered_loans.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// ======================= SQL RUNNER =======================
const P = window.SQL_PRESETS || {}, sel = $("#presetSel"), box = $("#sqlBox"), status = $("#sqlStatus");
sel.innerHTML = Object.keys(P).map(k => `<option value="${k}">${P[k].file.replace(".sql","")} · ${k}</option>`).join("");
const setPreset = () => { box.value = P[sel.value] ? P[sel.value].sql : ""; };
sel.addEventListener("change", setPreset); setPreset();
let dbPromise = null;
function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("Could not load " + src)); document.head.appendChild(s); }); }
function getDb() {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const base = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
    status.textContent = "Loading SQL engine…";
    await loadScript(base + "sql-wasm.js");
    const SQL = await initSqlJs({locateFile: f => base + f});
    const db = new SQL.Database(), keys = Object.keys(D), num = new Set(["id","term","annual_income","dti","installment","int_rate","loan_amount","total_payment"]);
    db.run(`CREATE TABLE loans (${keys.map(k => k + (num.has(k) ? " NUMERIC" : " TEXT")).join(",")})`);
    status.textContent = "Loading data…";
    db.run("BEGIN"); const st = db.prepare(`INSERT INTO loans VALUES (${keys.map(() => "?").join(",")})`);
    for (let i = 0; i < N; i++) st.run(keys.map(k => D[k][i])); st.free(); db.run("COMMIT");
    db.run(`CREATE VIEW vw_loans AS SELECT *, CAST(strftime('%m',issue_date) AS INTEGER) AS issue_month, CAST(strftime('%Y',issue_date) AS INTEGER) AS issue_year,
            CASE WHEN loan_status='Charged Off' THEN 'Bad Loan' ELSE 'Good Loan' END AS loan_class FROM loans`);
    status.textContent = "Ready"; return db;
  })().catch(e => { dbPromise = null; status.innerHTML = `<span class="err">${esc(e.message)}. The SQL Runner needs internet access to load sql.js from cdnjs.</span>`; throw e; });
  return dbPromise;
}
async function runSql() {
  const out = $("#sqlResult"); $("#runBtn").disabled = true;
  try {
    const db = await getDb(), t0 = performance.now(), res = db.exec(box.value), ms = (performance.now() - t0).toFixed(0);
    if (!res.length) { out.innerHTML = `<tbody><tr><td class="l hint">Statement ran, no rows returned.</td></tr></tbody>`; status.textContent = `Done in ${ms} ms`; return; }
    const r = res[res.length - 1], shown = r.values.slice(0, 1000);
    out.innerHTML = `<thead><tr>${r.columns.map((c, i) => `<th class="${i ? "" : "l"}">${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
      shown.map(row => `<tr>${row.map((v, i) => `<td class="${i ? "" : "l"}">${v == null ? "∅" : typeof v === "number" ? (Number.isInteger(v) ? v.toLocaleString("en-US") : v) : esc(v)}</td>`).join("")}</tr>`).join("") + `</tbody>`;
    status.textContent = `${r.values.length.toLocaleString()} row(s) in ${ms} ms` + (r.values.length > 1000 ? " (first 1,000 shown)" : "");
  } catch (e) { if (dbPromise) { out.innerHTML = ""; status.innerHTML = `<span class="err">${esc(e.message)}</span>`; } }
  finally { $("#runBtn").disabled = false; }
}
$("#runBtn").addEventListener("click", runSql);
box.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runSql(); });

// ---------- init ----------
drawSummary(); drawDetails();
})();
