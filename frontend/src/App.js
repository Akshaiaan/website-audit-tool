import React, { useState, useEffect, useRef } from 'react';
import { auditWebsite } from './services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --purple:       #7c3aed;
    --purple-light: #a78bfa;
    --cyan:         #0891b2;
    --cyan-light:   #22d3ee;
    --grad:         linear-gradient(135deg, #7c3aed, #0891b2);
    --text-dark:    #0f0a24;
    --text-mid:     #3a3660;
    --text-muted:   #6b6898;
    --text-dim:     #a09cc0;
    --red:          #dc2626;
    --orange:       #ea580c;
    --green:        #059669;
    --radius:       12px;
    --radius-lg:    20px;
    --sans:         'Outfit', sans-serif;
    --mono:         'JetBrains Mono', monospace;
  }

  html { font-size: 16px; scroll-behavior: smooth; }

  body {
    background: #f0eeff;
    color: var(--text-dark);
    font-family: var(--sans);
    min-height: 100vh;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Hero ─────────────────────────────────────────────────────────── */
  .hero-wrapper {
    background: linear-gradient(160deg, #08051a 0%, #150b38 50%, #0a173a 100%);
    padding: 0 0 72px;
    position: relative; overflow: hidden;
  }
  .hero-wrapper::after {
    content: ''; position: absolute; top: -200px; right: -150px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-wrapper::before {
    content: ''; position: absolute; bottom: -100px; left: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(8,145,178,0.22) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner { width: 100%; padding: 0 60px; }

  .navbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 32px 0 28px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 80px; position: relative; z-index: 1;
  }
  .nav-logo { font-family: var(--sans); font-size: 1.5rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .nav-logo .grad-text { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .nav-badge { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); padding: 9px 20px; border: 1px solid rgba(255,255,255,0.14); border-radius: 100px; background: rgba(255,255,255,0.05); }

  .hero { margin-bottom: 56px; position: relative; z-index: 1; max-width: 780px; }
  .hero-eyebrow { font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--cyan-light); margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
  .hero-eyebrow::before { content: ''; display: block; width: 32px; height: 1px; background: var(--cyan-light); opacity: 0.6; }
  .hero h1 { font-size: clamp(3rem, 5.5vw, 4.5rem); font-weight: 300; line-height: 1.06; letter-spacing: -0.03em; color: #fff; margin-bottom: 24px; }
  .hero h1 strong { font-weight: 700; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { font-size: 1.1rem; font-weight: 300; color: rgba(255,255,255,0.6); max-width: 580px; line-height: 1.8; }

  .input-section { position: relative; z-index: 1; }
  .input-wrapper { display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: var(--radius-lg); padding: 10px 10px 10px 26px; max-width: 780px; transition: border-color 0.25s, box-shadow 0.25s; backdrop-filter: blur(10px); }
  .input-wrapper:focus-within { border-color: rgba(124,58,237,0.6); box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }
  .url-input { flex: 1; background: transparent; border: none; color: #fff; font-family: var(--mono); font-size: 0.9rem; font-weight: 300; outline: none; padding: 8px 0; }
  .url-input::placeholder { color: rgba(255,255,255,0.28); }
  .audit-btn { background: var(--grad); color: #fff; border: none; border-radius: 14px; padding: 16px 32px; font-family: var(--sans); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s; white-space: nowrap; }
  .audit-btn:hover:not(:disabled) { opacity: 0.85; }
  .audit-btn:active:not(:disabled) { transform: scale(0.98); }
  .audit-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .error-msg { margin-top: 14px; padding: 14px 20px; background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25); border-radius: var(--radius); color: #fca5a5; font-size: 0.88rem; font-family: var(--mono); max-width: 780px; }

  /* ── Sticky nav ───────────────────────────────────────────────────── */
  .results-nav { position: sticky; top: 0; z-index: 100; background: rgba(240,238,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(124,58,237,0.12); }
  .results-nav-inner { padding: 0 60px; display: flex; gap: 4px; align-items: center; height: 58px; justify-content: space-between; }
  .nav-links { display: flex; gap: 4px; }
  .nav-link { font-family: var(--sans); font-size: 0.88rem; font-weight: 500; color: var(--text-muted); padding: 8px 22px; border-radius: 100px; border: none; background: transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .nav-link:hover { background: rgba(124,58,237,0.09); color: var(--purple); }
  .nav-link.active { background: rgba(124,58,237,0.12); color: var(--purple); font-weight: 700; }

  .pdf-btn { display: flex; align-items: center; gap: 8px; background: var(--grad); color: #fff; border: none; border-radius: 100px; padding: 9px 22px; font-family: var(--sans); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s; white-space: nowrap; }
  .pdf-btn:hover { opacity: 0.88; }
  .pdf-btn:active { transform: scale(0.97); }
  .pdf-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Page body ────────────────────────────────────────────────────── */
  .page-content { padding: 48px 60px 120px; }

  .loading { display: flex; align-items: center; gap: 16px; padding: 36px 0; color: var(--text-muted); font-family: var(--mono); font-size: 0.85rem; }
  .spinner { width: 22px; height: 22px; border: 2px solid rgba(124,58,237,0.18); border-top-color: var(--purple); border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Audit meta ───────────────────────────────────────────────────── */
  .audit-meta { display: flex; align-items: center; gap: 16px; padding: 16px 24px; background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(8,145,178,0.05)); border: 1px solid rgba(124,58,237,0.18); border-radius: var(--radius); margin-bottom: 32px; flex-wrap: wrap; }
  .meta-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--grad); flex-shrink: 0; }
  .meta-url { font-family: var(--mono); font-size: 0.85rem; color: var(--purple); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
  .meta-time { font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); }

  /* ── Score card ───────────────────────────────────────────────────── */
  .scorecard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .score-item {
    background: #ffffff;
    border: 1px solid rgba(124,58,237,0.15);
    border-radius: var(--radius-lg);
    padding: 24px 22px;
    box-shadow: 0 4px 24px rgba(124,58,237,0.08);
    position: relative; overflow: hidden;
  }
  .score-item::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .score-item.seo::before   { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
  .score-item.ux::before    { background: linear-gradient(90deg, #0891b2, #22d3ee); }
  .score-item.content::before { background: linear-gradient(90deg, #059669, #34d399); }
  .score-item.perf::before  { background: linear-gradient(90deg, #ea580c, #fb923c); }

  .score-label { font-family: var(--sans); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px; }

  .score-gauge { position: relative; margin-bottom: 14px; }
  .gauge-track { height: 8px; background: rgba(124,58,237,0.1); border-radius: 100px; overflow: hidden; }
  .gauge-fill  { height: 100%; border-radius: 100px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
  .score-item.seo   .gauge-fill { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
  .score-item.ux    .gauge-fill { background: linear-gradient(90deg, #0891b2, #22d3ee); }
  .score-item.content .gauge-fill { background: linear-gradient(90deg, #059669, #34d399); }
  .score-item.perf  .gauge-fill { background: linear-gradient(90deg, #ea580c, #fb923c); }

  .score-number { font-family: var(--sans); font-size: 2.4rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1; }
  .score-item.seo     .score-number { color: #7c3aed; }
  .score-item.ux      .score-number { color: #0891b2; }
  .score-item.content .score-number { color: #059669; }
  .score-item.perf    .score-number { color: #ea580c; }

  .score-out { font-family: var(--mono); font-size: 0.75rem; color: var(--text-dim); margin-left: 4px; }
  .score-verdict { font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; font-weight: 400; }

  /* ── Section ──────────────────────────────────────────────────────── */
  .section { margin-bottom: 24px; border: 1px solid rgba(124,58,237,0.15); border-radius: var(--radius-lg); overflow: hidden; background: #ffffff; box-shadow: 0 4px 24px rgba(124,58,237,0.08); }
  .section-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; background: linear-gradient(135deg, #faf8ff, #f0ecff); border-bottom: 1px solid rgba(124,58,237,0.1); cursor: pointer; user-select: none; transition: background 0.15s; }
  .section-header:hover { background: linear-gradient(135deg, #f0ecff, #e8e2ff); }
  .section-title { font-family: var(--sans); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); display: flex; align-items: center; gap: 12px; }
  .s-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: var(--grad); }
  .s-dot.orange { background: linear-gradient(135deg, #ea580c, #c026d3); }
  .s-dot.green  { background: linear-gradient(135deg, #059669, #0891b2); }
  .chevron { font-size: 0.65rem; color: var(--text-dim); transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }
  .section-body { padding: 28px; background: #ffffff; }

  /* ── Metrics grid ─────────────────────────────────────────────────── */
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .metric-card { background: linear-gradient(135deg, #faf8ff, #f5f2ff); border: 1px solid rgba(124,58,237,0.13); border-radius: var(--radius); padding: 20px 18px; transition: border-color 0.2s, transform 0.15s, box-shadow 0.15s; }
  .metric-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124,58,237,0.12); }
  .metric-value { font-family: var(--sans); font-size: 2.1rem; font-weight: 700; color: var(--text-dark); line-height: 1; margin-bottom: 10px; letter-spacing: -0.02em; }
  .metric-value.warn { color: var(--orange); }
  .metric-value.bad  { color: var(--red); }
  .metric-value.good { color: var(--green); }
  .metric-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  .cta-pill { display: inline-block; font-family: var(--mono); font-size: 0.75rem; padding: 5px 14px; background: rgba(124,58,237,0.07); border: 1px solid rgba(124,58,237,0.18); border-radius: 100px; color: var(--purple); }
  .serp-box { margin-top: 22px; padding: 20px 22px; background: linear-gradient(135deg,#faf8ff,#f5f2ff); border: 1px solid rgba(124,58,237,0.12); border-radius: var(--radius); }
  .serp-label { font-family: var(--mono); font-size: 0.65rem; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
  .serp-title { color: #1a73e8; font-size: 1rem; font-weight: 500; margin-bottom: 5px; }
  .serp-desc  { color: #4d5156; font-size: 0.88rem; line-height: 1.6; }

  /* ── Insights ─────────────────────────────────────────────────────── */
  .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 800px) { .insights-grid { grid-template-columns: 1fr; } }
  .insight-card { background: linear-gradient(135deg,#faf8ff,#f5f2ff); border: 1px solid rgba(124,58,237,0.13); border-radius: var(--radius); padding: 22px; transition: border-color 0.2s, box-shadow 0.15s; }
  .insight-card:hover { border-color: rgba(124,58,237,0.28); box-shadow: 0 6px 18px rgba(124,58,237,0.09); }
  .insight-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .insight-card p { font-size: 0.95rem; color: var(--text-mid); line-height: 1.75; font-weight: 400; }

  /* ── Recommendations ──────────────────────────────────────────────── */
  .rec-list { display: flex; flex-direction: column; gap: 16px; }
  .rec-card { background: linear-gradient(135deg,#faf8ff,#f5f2ff); border: 1px solid rgba(124,58,237,0.13); border-radius: var(--radius); padding: 22px 26px; display: grid; grid-template-columns: 52px 1fr; gap: 20px; align-items: start; transition: border-color 0.2s, transform 0.15s, box-shadow 0.15s; }
  .rec-card:hover { border-color: rgba(124,58,237,0.28); transform: translateX(4px); box-shadow: 0 6px 18px rgba(124,58,237,0.09); }
  .rec-num { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
  .rec-num.p1 { background: rgba(220,38,38,0.09);  color: var(--red);    border: 1px solid rgba(220,38,38,0.22);  }
  .rec-num.p2 { background: rgba(234,88,12,0.09);  color: var(--orange); border: 1px solid rgba(234,88,12,0.22);  }
  .rec-num.p3 { background: rgba(124,58,237,0.09); color: var(--purple); border: 1px solid rgba(124,58,237,0.22); }
  .rec-num.p4 { background: rgba(5,150,105,0.09);  color: var(--green);  border: 1px solid rgba(5,150,105,0.22);  }
  .rec-num.p5 { background: #f5f2ff; color: var(--text-muted); border: 1px solid rgba(124,58,237,0.13); }
  .rec-title     { font-size: 1rem; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
  .rec-reasoning { font-size: 0.92rem; color: var(--text-mid); line-height: 1.7; margin-bottom: 12px; font-weight: 400; }
  .rec-action    { font-size: 0.85rem; color: var(--cyan); font-family: var(--mono); padding: 12px 16px; background: rgba(8,145,178,0.07); border-radius: 8px; border-left: 2px solid var(--cyan); font-weight: 400; line-height: 1.6; }

  .app-wrapper { min-height: 100vh; }

  /* ── PDF styles (applied during print) ───────────────────────────── */
  @media print {
    body { background: #fff !important; }
    .hero-wrapper, .results-nav { display: none !important; }
    .page-content { padding: 20px !important; }
    .section { box-shadow: none !important; break-inside: avoid; }
    .metric-card, .insight-card, .rec-card { break-inside: avoid; }
    .pdf-print-header { display: block !important; }
  }
  .pdf-print-header { display: none; padding: 20px 0 32px; border-bottom: 2px solid #7c3aed; margin-bottom: 32px; }
  .pdf-print-header h2 { font-size: 1.8rem; font-weight: 700; color: #0f0a24; }
  .pdf-print-header p  { font-size: 0.9rem; color: #6b6898; margin-top: 6px; }
`;

// ── Score calculator ─────────────────────────────────────────────────────────
function calculateScores(metrics, ai) {
  // SEO score
  let seo = 100;
  if (!metrics.metaTitle)       seo -= 20;
  if (!metrics.metaDescription) seo -= 20;
  if (metrics.h1Count === 0)    seo -= 20;
  if (metrics.h1Count > 1)      seo -= 10;
  if (metrics.h2Count === 0)    seo -= 10;
  if (metrics.wordCount < 300)  seo -= 15;
  if (metrics.wordCount < 100)  seo -= 10;
  seo = Math.max(0, Math.min(100, seo));

  // UX score
  let ux = 100;
  if (metrics.ctaCount === 0)          ux -= 25;
  if (metrics.ctaCount === 1)          ux -= 10;
  if (metrics.missingAltPercent > 50)  ux -= 20;
  if (metrics.missingAltPercent > 20)  ux -= 10;
  if (metrics.imageCount === 0)        ux -= 10;
  if (metrics.internalLinks < 3)       ux -= 15;
  ux = Math.max(0, Math.min(100, ux));

  // Content score
  let content = 100;
  if (metrics.wordCount < 100)  content -= 40;
  else if (metrics.wordCount < 300) content -= 25;
  else if (metrics.wordCount < 600) content -= 10;
  if (metrics.h2Count === 0)    content -= 15;
  if (metrics.h3Count === 0)    content -= 10;
  if (metrics.externalLinks === 0) content -= 10;
  content = Math.max(0, Math.min(100, content));

  // Performance score based on page load time
  let perf = 100;
  const ms = metrics.pageLoadMs || 0;
  if (ms > 5000)      perf -= 50;
  else if (ms > 3000) perf -= 30;
  else if (ms > 2000) perf -= 15;
  else if (ms > 1000) perf -= 5;
  perf = Math.max(0, Math.min(100, perf));

  const verdict = (score) => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Needs work';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return [
    { key: 'seo',     label: 'SEO',         score: seo,     verdict: verdict(seo) },
    { key: 'ux',      label: 'UX',          score: ux,      verdict: verdict(ux) },
    { key: 'content', label: 'Content',     score: content, verdict: verdict(content) },
    { key: 'perf',    label: 'Performance', score: perf,    verdict: verdict(perf) },
  ];
}

// ── ScoreCard component ──────────────────────────────────────────────────────
function ScoreCard({ metrics, ai }) {
  const [animated, setAnimated] = useState(false);
  const scores = calculateScores(metrics, ai);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="scorecard">
      {scores.map(s => (
        <div key={s.key} className={`score-item ${s.key}`}>
          <div className="score-label">{s.label} Score</div>
          <div className="score-gauge">
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: animated ? `${s.score}%` : '0%' }} />
            </div>
          </div>
          <div>
            <span className="score-number">{s.score}</span>
            <span className="score-out">/100</span>
          </div>
          <div className="score-verdict">{s.verdict}</div>
        </div>
      ))}
    </div>
  );
}

// ── Section component ────────────────────────────────────────────────────────
function Section({ id, title, dotColor, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section" id={id}>
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className={`s-dot ${dotColor || ''}`} />
          {title}
        </div>
        <span className={`chevron ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

function MetricCard({ label, value, colorClass }) {
  return (
    <div className="metric-card">
      <div className={`metric-value ${colorClass || ''}`}>{value ?? '—'}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('scores');
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const sections = ['scores','metrics','insights','recommendations'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom > 80) { setActiveNav(id); break; }
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      setResult(await auditWebsite(url.trim()));
      setTimeout(() => scrollTo('scores'), 300);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      window.print();
      setExportingPdf(false);
    }, 300);
  };

  const metrics = result?.metrics;
  const ai      = result?.ai;
  const altPct   = metrics?.missingAltPercent ?? 0;
  const altColor = altPct > 50 ? 'bad' : altPct > 20 ? 'warn' : 'good';
  const h1Color  = metrics?.h1Count === 0 ? 'bad' : metrics?.h1Count > 1 ? 'warn' : '';
  const pageLoadColor = !metrics?.pageLoadMs ? '' :
    metrics.pageLoadMs > 3000 ? 'bad' :
    metrics.pageLoadMs > 1500 ? 'warn' : 'good';

  const insights = ai ? [
    { label: 'SEO Structure',     text: ai.seoAnalysis },
    { label: 'Messaging Clarity', text: ai.messagingClarity },
    { label: 'CTA Analysis',      text: ai.ctaAnalysis },
    { label: 'Content Depth',     text: ai.contentDepth },
    { label: 'UX Concerns',       text: ai.uxConcerns },
  ].filter(i => i.text) : [];

  const cls = p => ['p1','p2','p3','p4','p5'][p - 1] || 'p5';

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">

        {/* Dark hero */}
        <div className="hero-wrapper">
          <div className="hero-inner">
            <nav className="navbar">
              <div className="nav-logo">eight<span className="grad-text">25</span> audit</div>
              <div className="nav-badge">Internal Tool · AI-Powered</div>
            </nav>
            <div className="hero">
              <div className="hero-eyebrow">Website Intelligence</div>
              <h1>Audit any page.<br /><strong>Instantly.</strong></h1>
              <p className="hero-sub">Extract factual metrics and generate AI-powered insights grounded in real data — SEO, messaging, CTAs, UX, and prioritized recommendations.</p>
            </div>
            <div className="input-section">
              <div className="input-wrapper">
                <input
                  className="url-input"
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="https://yourwebsite.com"
                  disabled={loading}
                  spellCheck={false}
                />
                <button className="audit-btn" onClick={handleSubmit} disabled={loading || !url.trim()}>
                  {loading ? 'Analysing...' : 'Run Audit →'}
                </button>
              </div>
              {error && <div className="error-msg">⚠ {error}</div>}
            </div>
          </div>
        </div>

        {/* Sticky nav */}
        {result && (
          <div className="results-nav">
            <div className="results-nav-inner">
              <div className="nav-links">
                {[
                  { id: 'scores',          label: 'Scores' },
                  { id: 'metrics',         label: 'Metrics' },
                  { id: 'insights',        label: 'AI Insights' },
                  { id: 'recommendations', label: 'Recommendations' },
                ].map(n => (
                  <button key={n.id} className={`nav-link ${activeNav === n.id ? 'active' : ''}`} onClick={() => scrollTo(n.id)}>
                    {n.label}
                  </button>
                ))}
              </div>
              <button className="pdf-btn" onClick={handleExportPdf} disabled={exportingPdf}>
                {exportingPdf ? 'Preparing...' : '↓ Download Report'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="page-content">

          {/* PDF print header (hidden on screen, visible on print) */}
          {result && (
            <div className="pdf-print-header">
              <h2>Website Audit Report</h2>
              <p>{result.url} · Completed in {(result.processingTimeMs / 1000).toFixed(1)}s · eight25 audit</p>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner" />
              <span>Scraping page · extracting metrics · generating AI insights…</span>
            </div>
          )}

          {result && (
            <>
              {/* Meta bar */}
              <div className="audit-meta">
                <div className="meta-dot" />
                <div className="meta-url">{result.url}</div>
                <div className="meta-time">Completed in {(result.processingTimeMs / 1000).toFixed(1)}s</div>
              </div>

              {/* Score card */}
              <div id="scores">
                <ScoreCard metrics={metrics} ai={ai} />
              </div>

              {/* Metrics */}
              {metrics && (
                <Section id="metrics" title="Factual Metrics">
                  <div className="metrics-grid">
                    <MetricCard label="Word Count"       value={metrics.wordCount?.toLocaleString()} />
                    <MetricCard label="H1 Tags"          value={metrics.h1Count}  colorClass={h1Color} />
                    <MetricCard label="H2 Tags"          value={metrics.h2Count} />
                    <MetricCard label="H3 Tags"          value={metrics.h3Count} />
                    <MetricCard label="CTAs Found"       value={metrics.ctaCount} colorClass={metrics.ctaCount === 0 ? 'bad' : ''} />
                    <MetricCard label="Internal Links"   value={metrics.internalLinks} />
                    <MetricCard label="External Links"   value={metrics.externalLinks} />
                    <MetricCard label="Images"           value={metrics.imageCount} />
                    <MetricCard label="Missing Alt Text" value={`${metrics.missingAltCount} (${altPct}%)`} colorClass={altColor} />
                    <MetricCard label="Page Load Time"   value={metrics.pageLoadMs ? `${metrics.pageLoadMs}ms` : '—'} colorClass={pageLoadColor} />
                    <MetricCard label="Meta Title"       value={metrics.metaTitle ? '✓ Present' : '✗ Missing'} colorClass={metrics.metaTitle ? 'good' : 'bad'} />
                    <MetricCard label="Meta Description" value={metrics.metaDescription ? '✓ Present' : '✗ Missing'} colorClass={metrics.metaDescription ? 'good' : 'bad'} />
                  </div>
                  {metrics.ctaSamples?.length > 0 && (
                    <div style={{ marginTop: 22 }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:10, fontWeight:600 }}>CTA Text Samples</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {metrics.ctaSamples.map((cta, i) => <span key={i} className="cta-pill">{cta}</span>)}
                      </div>
                    </div>
                  )}
                  {(metrics.metaTitle || metrics.metaDescription) && (
                    <div className="serp-box">
                      <div className="serp-label">SERP Preview</div>
                      {metrics.metaTitle      && <div className="serp-title">{metrics.metaTitle}</div>}
                      {metrics.metaDescription && <div className="serp-desc">{metrics.metaDescription}</div>}
                    </div>
                  )}
                </Section>
              )}

              {/* AI Insights */}
              {insights.length > 0 && (
                <Section id="insights" title="AI Insights" dotColor="orange">
                  <div className="insights-grid">
                    {insights.map((ins, i) => (
                      <div className="insight-card" key={i}>
                        <div className="insight-label">{ins.label}</div>
                        <p>{ins.text}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Recommendations */}
              {ai?.recommendations?.length > 0 && (
                <Section id="recommendations" title="Recommendations" dotColor="green">
                  <div className="rec-list">
                    {ai.recommendations.map((rec, i) => (
                      <div className="rec-card" key={i}>
                        <div className={`rec-num ${cls(rec.priority)}`}>P{rec.priority}</div>
                        <div>
                          <div className="rec-title">{rec.title}</div>
                          <div className="rec-reasoning">{rec.reasoning}</div>
                          <div className="rec-action">→ {rec.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}