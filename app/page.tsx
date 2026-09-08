'use client';

import { useMemo, useState } from 'react';

type Resource = { name: string; value: number; min: number; max: number; unit: string };
type Constraint = { name: string; value: string };
type Metric = { name: string; base: number; unit: string; higherBetter: boolean };
type Sector = { id: string; icon: string; name: string; desc: string; resources: Resource[]; constraints: Constraint[]; priorities: { name: string; value: number }[]; metrics: Metric[]; insight: string; recommendation: string };
type Scenario = { label: string; resources: number[]; priorities: number[]; constraints: string[]; timestamp: string };
type View = 'dashboard' | 'debate' | 'history';

const sectors: Sector[] = [
  { id: 'health', icon: '✚', name: 'Healthcare', desc: 'Optimize resources, improve patient outcomes and balance costs.', resources: [{ name: 'Beds', value: 500, min: 100, max: 800, unit: 'beds' }, { name: 'Doctors', value: 80, min: 20, max: 150, unit: 'staff' }, { name: 'Nurses', value: 150, min: 30, max: 250, unit: 'staff' }, { name: 'Ambulances', value: 20, min: 5, max: 50, unit: 'units' }, { name: 'Budget', value: 50, min: 10, max: 100, unit: '₹ L' }], constraints: [{ name: 'Emergency reserve', value: '20%' }, { name: 'Max staff hours', value: '48 hrs/week' }, { name: 'Bed capacity', value: '600 beds' }], priorities: [{ name: 'Patient Care', value: 90 }, { name: 'Cost', value: 60 }, { name: 'Response Time', value: 80 }], metrics: [{ name: 'Primary Outcome', base: 1403, unit: 'patients', higherBetter: true }, { name: 'Avg. Response Time', base: 28, unit: 'min', higherBetter: false }, { name: 'Resource Utilization', base: 76, unit: '%', higherBetter: true }, { name: 'Total Cost', base: 50, unit: '₹ L', higherBetter: false }, { name: 'Operational Efficiency', base: 71, unit: '%', higherBetter: true }], insight: 'Nursing coverage and bed capacity are the dominant healthcare levers. The model favors patient throughput only when staffing and emergency reserve remain safe.', recommendation: 'Keep a clinical staffing buffer, protect emergency capacity and optimize cost without reducing frontline coverage.' },
  { id: 'agri', icon: '✦', name: 'Agriculture', desc: 'Optimize land, water, labour and inputs while balancing yield and sustainability.', resources: [{ name: 'Land', value: 500, min: 100, max: 1000, unit: 'acres' }, { name: 'Water', value: 70, min: 20, max: 100, unit: '%' }, { name: 'Labour', value: 48, min: 10, max: 100, unit: 'workers' }, { name: 'Equipment', value: 32, min: 5, max: 70, unit: 'units' }, { name: 'Budget', value: 32, min: 5, max: 80, unit: '₹ L' }], constraints: [{ name: 'Water reserve', value: '20%' }, { name: 'Season window', value: '120 days' }, { name: 'Land ceiling', value: '700 acres' }], priorities: [{ name: 'Yield', value: 90 }, { name: 'Profit', value: 80 }, { name: 'Water Efficiency', value: 85 }], metrics: [{ name: 'Expected Yield', base: 86, unit: '%', higherBetter: true }, { name: 'Water Efficiency', base: 74, unit: '%', higherBetter: true }, { name: 'Crop Coverage', base: 82, unit: '%', higherBetter: true }, { name: 'Input Cost', base: 32, unit: '₹ L', higherBetter: false }, { name: 'Sustainability', base: 78, unit: '%', higherBetter: true }], insight: 'Water availability has the strongest influence on yield. Labour becomes the next constraint once irrigation is stabilized.', recommendation: 'Maintain a water buffer, prioritize irrigation at high-value crop stages and avoid exhausting seasonal capacity.' },
  { id: 'university', icon: '⌘', name: 'University & Faculty', desc: 'Plan faculty, classrooms and teaching capacity around demand and workload.', resources: [{ name: 'Faculty', value: 80, min: 30, max: 150, unit: 'staff' }, { name: 'Classrooms', value: 42, min: 15, max: 80, unit: 'rooms' }, { name: 'Labs', value: 16, min: 5, max: 40, unit: 'labs' }, { name: 'Student Capacity', value: 75, min: 30, max: 100, unit: '%' }, { name: 'Budget', value: 40, min: 10, max: 100, unit: '₹ L' }], constraints: [{ name: 'Max faculty load', value: '18 hrs/week' }, { name: 'Room capacity', value: '60 students' }, { name: 'Timetable', value: '6 days/week' }], priorities: [{ name: 'Course Coverage', value: 92 }, { name: 'Faculty Wellbeing', value: 80 }, { name: 'Student Experience', value: 88 }], metrics: [{ name: 'Course Coverage', base: 94, unit: '%', higherBetter: true }, { name: 'Student Experience', base: 86, unit: '%', higherBetter: true }, { name: 'Faculty Utilization', base: 82, unit: '%', higherBetter: true }, { name: 'Operating Cost', base: 40, unit: '₹ L', higherBetter: false }, { name: 'Planning Risk', base: 22, unit: '%', higherBetter: false }], insight: 'Faculty availability drives course coverage. Classroom capacity becomes critical when demand spikes.', recommendation: 'Preserve a faculty buffer, balance teaching loads and reallocate rooms before adding fixed capacity.' },
  { id: 'banking', icon: '♜', name: 'Banking & Finance', desc: 'Balance capital allocation, liquidity, return and risk exposure.', resources: [{ name: 'Capital', value: 80, min: 20, max: 150, unit: '₹Cr' }, { name: 'Liquidity', value: 35, min: 10, max: 80, unit: '₹Cr' }, { name: 'Loan Pool', value: 55, min: 10, max: 100, unit: '₹Cr' }, { name: 'Advisors', value: 24, min: 5, max: 50, unit: 'staff' }, { name: 'Reserve', value: 15, min: 5, max: 35, unit: '%' }], constraints: [{ name: 'Liquidity floor', value: '₹25Cr' }, { name: 'Risk exposure', value: '≤ 35%' }, { name: 'Capital reserve', value: '15%' }], priorities: [{ name: 'Return', value: 88 }, { name: 'Risk', value: 90 }, { name: 'Liquidity', value: 82 }], metrics: [{ name: 'Projected Return', base: 13.6, unit: '%', higherBetter: true }, { name: 'Capital Adequacy', base: 14.2, unit: '%', higherBetter: true }, { name: 'Non-Performing Loans', base: 1.6, unit: '%', higherBetter: false }, { name: 'Liquidity Coverage', base: 130.8, unit: '%', higherBetter: true }, { name: 'Sustainable Finance', base: 63, unit: '/100', higherBetter: true }], insight: 'Liquidity is a hard guardrail. Higher-return allocation is rewarded only while risk exposure and reserves remain healthy.', recommendation: 'Increase productive allocation gradually while preserving the liquidity floor and capital reserve.' },
  { id: 'project', icon: '▦', name: 'Project Management', desc: 'Simulate workforce, budget and schedule decisions while protecting delivery.', resources: [{ name: 'Developers', value: 24, min: 5, max: 60, unit: 'people' }, { name: 'Designers', value: 8, min: 2, max: 20, unit: 'people' }, { name: 'Budget', value: 45, min: 10, max: 100, unit: '₹ L' }, { name: 'Time', value: 12, min: 4, max: 30, unit: 'weeks' }, { name: 'QA Capacity', value: 70, min: 30, max: 100, unit: '%' }], constraints: [{ name: 'Deadline', value: '12 weeks' }, { name: 'Team capacity', value: '40 hrs/week' }, { name: 'Budget ceiling', value: '₹50L' }], priorities: [{ name: 'Delivery Speed', value: 90 }, { name: 'Quality', value: 88 }, { name: 'Cost', value: 70 }], metrics: [{ name: 'Deadline Confidence', base: 89, unit: '%', higherBetter: true }, { name: 'Quality', base: 91, unit: '%', higherBetter: true }, { name: 'Team Utilization', base: 78, unit: '%', higherBetter: true }, { name: 'Budget Burn', base: 45, unit: '₹ L', higherBetter: false }, { name: 'Delivery Risk', base: 24, unit: '%', higherBetter: false }], insight: 'Developer capacity is the dominant schedule lever. Cutting the team near the deadline compounds delivery and quality risk.', recommendation: 'Protect critical engineering capacity, trade scope before people and keep QA capacity available near release.' },
  { id: 'allocation', icon: '⊞', name: 'Resource Allocation', desc: 'Allocate scarce resources across competing objectives with transparent trade-offs.', resources: [{ name: 'Resource A', value: 60, min: 10, max: 100, unit: 'units' }, { name: 'Resource B', value: 40, min: 10, max: 100, unit: 'units' }, { name: 'Budget', value: 50, min: 10, max: 100, unit: '₹ L' }, { name: 'Capacity', value: 75, min: 20, max: 100, unit: '%' }, { name: 'Reserve', value: 15, min: 5, max: 35, unit: '%' }], constraints: [{ name: 'Budget ceiling', value: '₹50L' }, { name: 'Capacity floor', value: '60%' }, { name: 'Reserve', value: '15%' }], priorities: [{ name: 'Performance', value: 90 }, { name: 'Efficiency', value: 85 }, { name: 'Risk', value: 80 }], metrics: [{ name: 'Performance', base: 88, unit: '%', higherBetter: true }, { name: 'Efficiency', base: 84, unit: '%', higherBetter: true }, { name: 'Resource Utilization', base: 81, unit: '%', higherBetter: true }, { name: 'Total Cost', base: 50, unit: '₹ L', higherBetter: false }, { name: 'Allocation Risk', base: 27, unit: '%', higherBetter: false }], insight: 'The model searches for bottlenecks and diminishing returns instead of maximizing one resource.', recommendation: 'Keep a reserve, fund the highest-impact bottleneck and avoid over-allocation to low-impact resources.' }
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function calculateImpacts(sector: Sector, resources: number[], priorities: number[], constraints: string[]) {
  const resourceRatio = resources.reduce((sum, value, i) => sum + value / Math.max(sector.resources[i].value, 1), 0) / resources.length;
  const priority = priorities.reduce((a, b) => a + b, 0) / Math.max(priorities.length, 1);
  const changed = constraints.reduce((sum, value, i) => sum + (value !== sector.constraints[i]?.value ? 1 : 0), 0);
  const factor = clamp((resourceRatio - 1) * 1.15 + (priority - 80) / 600 - changed * 0.018, -0.3, 0.3);
  return sector.metrics.map((metric, i) => {
    const direction = metric.higherBetter ? 1 : -1;
    const weight = [1.08, 0.72, 0.92, 0.65, 1][i % 5];
    return clamp(metric.base * (1 + factor * direction * weight), metric.higherBetter ? 0 : metric.base * 0.45, metric.base * 1.7);
  });
}

function formatMetric(metric: Metric, value: number) {
  const number = Math.abs(value) >= 100 ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value.toFixed(value < 20 ? 1 : 0);
  if (metric.unit.includes('₹')) return `₹ ${number}`;
  if (metric.unit === '%') return `${number}%`;
  if (metric.unit === 'min') return `${number} min`;
  if (metric.unit === '/100') return `${number} /100`;
  return `${number} ${metric.unit}`;
}

export default function Home() {
  const [selected, setSelected] = useState<Sector>(sectors[0]);
  const [resources, setResources] = useState(sectors[0].resources.map(r => r.value));
  const [priorities, setPriorities] = useState(sectors[0].priorities.map(p => p.value));
  const [constraints, setConstraints] = useState(sectors[0].constraints.map(c => c.value));
  const [view, setView] = useState<View>('dashboard');
  const [scenarioMode, setScenarioMode] = useState('Balanced');
  const [history, setHistory] = useState<Scenario[]>([]);
  const [debateMode, setDebateMode] = useState<'challenge' | 'support'>('challenge');
  const [aiText, setAiText] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const impacts = useMemo(() => calculateImpacts(selected, resources, priorities, constraints), [selected, resources, priorities, constraints]);
  const baseline = selected.metrics.map(m => m.base);
  const utilization = clamp(Math.round(55 + resources.reduce((sum, value, i) => sum + value / selected.resources[i].max, 0) / resources.length * 38), 35, 97);
  const trend = useMemo(() => history.length ? history.map(h => Math.round(calculateImpacts(selected, h.resources, h.priorities, h.constraints)[0])) : [Math.round(baseline[0] * 0.72), Math.round(baseline[0] * 0.82), Math.round(baseline[0] * 0.9), Math.round(impacts[0] * 0.96), Math.round(impacts[0])], [history, selected, baseline, impacts]);

  const switchSector = (sector: Sector) => {
    if (sector.id === 'health') {
      window.location.href = '/healthcare';
      return;
    }
    setSelected(sector); setResources(sector.resources.map(r => r.value)); setPriorities(sector.priorities.map(p => p.value)); setConstraints(sector.constraints.map(c => c.value));
    setHistory([]); setAiText(''); setAiError(''); setScenarioMode('Balanced'); setView('dashboard');
  };

  const reset = () => {
    setResources(selected.resources.map(r => r.value)); setPriorities(selected.priorities.map(p => p.value)); setConstraints(selected.constraints.map(c => c.value));
  };

  const saveScenario = (label = scenarioMode) => {
    setHistory(history => [...history, { label, resources: [...resources], priorities: [...priorities], constraints: [...constraints], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const askAI = async () => {
    setAiLoading(true); setAiError(''); setAiText('');
    const prompt = `You are the DecisionSphere decision intelligence agent. Analyze this ${selected.name} scenario.\nResources: ${selected.resources.map((r, i) => `${r.name}=${resources[i]} ${r.unit}`).join(', ')}\nPriorities: ${selected.priorities.map((p, i) => `${p.name}=${priorities[i]}%`).join(', ')}\nConstraints: ${selected.constraints.map((c, i) => `${c.name}=${constraints[i]}`).join(', ')}\nKey impact parameters: ${selected.metrics.map((m, i) => `${m.name}=${formatMetric(m, impacts[i])}`).join(', ')}\nTask: ${debateMode === 'challenge' ? 'Challenge the decision. Identify the strongest assumption, biggest risk, and what should be verified before acting.' : 'Support the decision. Explain why the evidence supports it, what condition must remain true, and the strongest recommended action.'}\nReturn plain text with exactly these headings: Verdict, Evidence, Risk, Action. Do not use markdown symbols, hashtags, bold markers, code fences or backslash escapes. Keep each section concise.`;
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, task: 'text' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI request failed');
      setAiText(data.text || 'No response returned.'); setAiModel(data.model || 'Gemini');
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI request failed');
    } finally { setAiLoading(false); }
  };

  const scenarioValues = [0.86, 1, 1.08].map(multiplier => selected.metrics.map(metric => metric.base * (metric.higherBetter ? multiplier : 1 / multiplier)));
  const chartMax = Math.max(...baseline, ...impacts, 1);
  const trendMax = Math.max(...trend, 1);
  const aiSections = aiText ? aiText.split(/\n(?=Verdict|Evidence|Risk|Action)/i).map(part => ({ title: part.split(/\n/)[0].replace(/[:#*]/g, '').trim(), body: part.split(/\n/).slice(1).join(' ').replace(/[*#_]/g, '').replace(/\s+/g, ' ').trim() })).filter(section => section.title) : [];

  return (
    <main className="dark-app">
      <header className="global-nav">
        <div className="brand"><div className="brand-mark">✦</div><div><strong>DecisionSphere</strong><small>Simulate. Compare. Decide Smarter.</small></div></div>
        <nav>{sectors.map(sector => <button key={sector.id} className={selected.id === sector.id ? 'nav-sector active' : 'nav-sector'} onClick={() => switchSector(sector)}><span>{sector.icon}</span>{sector.name}</button>)}</nav>
        <div className="profile">◐</div>
      </header>
      <div className="app-layout">
        <aside className="setup">
          <div className="setup-title"><h2>Scenario Setup</h2><p>Adjust parameters to simulate outcomes</p></div>
          <div className="sector-picker"><span>✦ Sector</span><strong>{selected.name}</strong><small>{selected.desc}</small></div>
          <button className={view === 'dashboard' ? 'side-link active' : 'side-link'} onClick={() => setView('dashboard')}>☷ <span>Input Parameters</span></button>
          <button className="side-link" onClick={() => setView('dashboard')}>▣ <span>Scenario Presets</span></button>
          <button className={view === 'debate' ? 'side-link active' : 'side-link'} onClick={() => setView('debate')}>✦ <span>AI Decision Debate</span></button>
          <button className={view === 'history' ? 'side-link active' : 'side-link'} onClick={() => setView('history')}>▤ <span>Saved Scenarios</span><b>{history.length}</b></button>
          {view === 'dashboard' && <div className="setup-scroll">
            <section><h3>⚙ Resources</h3>{selected.resources.map((resource, i) => <div className="input-row" key={resource.name}><div className="input-label"><span>{resource.name}</span><strong>{resources[i]} <small>{resource.unit}</small></strong></div><input type="range" min={resource.min} max={resource.max} value={resources[i]} onChange={e => setResources(values => values.map((value, j) => j === i ? Number(e.target.value) : value))} /></div>)}</section>
            <section><h3>🎯 Priorities</h3>{selected.priorities.map((priority, i) => <div className="input-row" key={priority.name}><div className="input-label"><span>{priority.name}</span><strong>{priorities[i]}%</strong></div><input className={`priority-${i}`} type="range" min="0" max="100" value={priorities[i]} onChange={e => setPriorities(values => values.map((value, j) => j === i ? Number(e.target.value) : value))} /></div>)}</section>
            <section className="preset-box"><h3>▣ Scenario Preset</h3>{['Cost Focus', 'Balanced', 'Performance Focus', 'Emergency Response'].map((preset, i) => <button key={preset} className={`preset ${scenarioMode === preset ? 'active' : ''}`} onClick={() => setScenarioMode(preset)}><span>{['▤', '⚖', '▰', '⚡'][i]}</span>{preset}</button>)}</section>
          </div>}
          <div className="setup-footer"><b>ⓘ About DecisionSphere</b><p>Data-driven decisions for a better tomorrow.</p></div>
        </aside>
        <section className="content">
          <div className="sector-header"><div className="sector-heading"><div className="big-icon">{selected.icon}</div><div><h1>{selected.name}</h1><p>{selected.desc}</p></div></div><div className="header-actions"><select value={scenarioMode} onChange={e => setScenarioMode(e.target.value)}><option>Cost Focus</option><option>Balanced</option><option>Performance Focus</option><option>Emergency Response</option></select><button className="primary-btn" onClick={() => saveScenario(`Run ${history.length + 1}`)}>▶ Run Simulation</button><button className="outline-btn" onClick={reset}>◌ Reset Baseline</button><button className="outline-btn" onClick={() => saveScenario()}>▣ Save Scenario</button><button className="commit-btn" onClick={() => setView('debate')}>✓ Commit Decision</button></div></div>
          {view === 'dashboard' && <>
            <div className="section-head"><div><h2>▰ Key Impact Parameters</h2><p>How this configuration impacts your {selected.name.toLowerCase()} system</p></div><span className="complete">● SIMULATION {history.length ? 'UPDATED' : 'READY'}</span></div>
            <div className="impact-grid">{selected.metrics.map((metric, i) => { const value = impacts[i]; const change = Math.round(((value - metric.base) / Math.max(Math.abs(metric.base), 1)) * 100); const good = metric.higherBetter ? change >= 0 : change <= 0; return <div className="impact-card" key={metric.name}><div className="impact-icon">{['♥', '◷', '▱', '◉', '✿'][i % 5]}</div><span>{metric.name}</span><strong>{formatMetric(metric, value)}</strong><em className={good ? 'good' : 'bad'}>{change >= 0 ? '↑' : '↓'} {Math.abs(change)}% <small>vs baseline</small></em></div>; })}</div>
            <div className="chart-grid">
              <div className="panel"><div className="panel-head"><div><h3>◔ Resource Utilization</h3><p>Distribution of allocated resources</p></div><span>Share of Total⌄</span></div><div className="donut-wrap"><div className="donut" style={{ background: 'conic-gradient(#3b82f6 0 42%,#20c997 42% 60%,#8b5cf6 60% 88%,#fb923c 88% 94%,#64748b 94% 100%)' }}><div><strong>{utilization}%</strong><small>Total<br />Utilization</small></div></div><div className="legend">{selected.resources.map((resource, i) => <div key={resource.name}><i className={`dot-${i}`} /><span>{resource.name}</span><b>{Math.round(resources[i] / Math.max(resources.reduce((a, v) => a + v, 0), 1) * 100)}%</b></div>)}</div></div></div>
              <div className="panel"><div className="panel-head"><div><h3>▥ Impact vs Previous Scenario</h3><p>Change in key impact parameters</p></div><div className="chart-key"><span>■ Previous</span><span>■ Current</span></div></div><div className="bar-chart">{selected.metrics.map((metric, i) => <div className="bar-group" key={metric.name}><div className="bars"><i style={{ height: `${Math.max(8, baseline[i] / chartMax * 100)}%` }} /><b style={{ height: `${Math.max(8, impacts[i] / chartMax * 100)}%` }} /></div><span>{metric.name.length > 15 ? `${metric.name.slice(0, 14)}…` : metric.name}</span></div>)}</div></div>
            </div>
            <div className="lower-grid">
              <div className="panel trend-panel"><div className="panel-head"><div><h3>⌁ Outcome Trends</h3><p>Performance over simulation runs</p></div><span>{selected.metrics[0].name}⌄</span></div><div className="line-chart"><div className="y-axis"><span>{trendMax.toLocaleString()}</span><span>{Math.round(trendMax * .75).toLocaleString()}</span><span>{Math.round(trendMax * .5).toLocaleString()}</span><span>{Math.round(trendMax * .25).toLocaleString()}</span><span>0</span></div><svg viewBox="0 0 520 220" preserveAspectRatio="none"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity=".38" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>{[25, 75, 125, 175, 210].map(y => <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="#24364f" />)}<polygon fill="url(#trendFill)" points={`${trend.map((value, i) => `${i * (520 / Math.max(trend.length - 1, 1))},${205 - (value / trendMax) * 180}`).join(' ')} 520,210 0,210`} /><polyline fill="none" stroke="#3b82f6" strokeWidth="4" points={trend.map((value, i) => `${i * (520 / Math.max(trend.length - 1, 1))},${205 - (value / trendMax) * 180}`).join(' ')} />{trend.map((value, i) => <circle key={i} cx={i * (520 / Math.max(trend.length - 1, 1))} cy={205 - (value / trendMax) * 180} r="5" fill="#3b82f6" stroke="#0c1728" strokeWidth="3" />)}</svg><div className="x-axis">{trend.map((_, i) => <span key={i}>Run {i + 1}</span>)}</div></div></div>
              <div className="panel comparison"><div className="panel-head"><div><h3>▥ Scenario Comparison</h3><p>Compare decision configurations</p></div><button onClick={() => saveScenario('Comparison Scenario')}>＋ Add Scenario</button></div><table><thead><tr><th>Metric</th><th>A<br /><small>Cost Focus</small></th><th className="recommended">B<br /><small>Balanced</small></th><th>C<br /><small>Performance</small></th></tr></thead><tbody>{selected.metrics.map((metric, i) => <tr key={metric.name}><td>{metric.name}</td><td>{formatMetric(metric, scenarioValues[0][i])}</td><td className="recommended">{formatMetric(metric, scenarioValues[1][i])}</td><td>{formatMetric(metric, scenarioValues[2][i])}</td></tr>)}</tbody></table></div>
            </div>
            <div className="recommendation"><div className="trophy">🏆</div><div><strong>Recommended Scenario</strong><p>{selected.recommendation}</p></div><button onClick={() => setView('debate')}>View Details →</button></div>
            <div className="insight-grid"><div className="insight"><div className="label">DECISION INTELLIGENCE</div><h3>{selected.insight}</h3></div><div className="recommendation"><div className="label">RECOMMENDED ACTION</div><h3>{selected.recommendation}</h3></div></div>
          </>}
          {view === 'debate' && <div className="debate-page"><div className="section-head"><div><h2>✦ AI Decision Debate</h2><p>Gemini challenges or supports the current configuration using the impact parameters above.</p></div><span className="complete">● GEMINI ROUTING ACTIVE</span></div><div className="debate-controls"><button className={debateMode === 'challenge' ? 'selected' : ''} onClick={() => setDebateMode('challenge')}>Challenge Decision</button><button className={debateMode === 'support' ? 'selected' : ''} onClick={() => setDebateMode('support')}>Support Decision</button><button className="primary-btn" onClick={askAI} disabled={aiLoading}>{aiLoading ? 'Asking Gemini…' : 'Ask Gemini ↗'}</button></div>{aiError && <div className="error-box">{aiError}</div>}<div className="ai-layout"><div className="ai-response"><div className="ai-top"><span>✦ GEMINI RESPONSE</span><small>{aiModel || 'Primary: Gemini 3.8 Flash'}</small></div>{aiSections.length ? <div className="ai-clean">{aiSections.map((section, i) => <div key={`${section.title}-${i}`}><h3>{section.title}</h3><p>{section.body || 'No additional detail returned.'}</p></div>)}</div> : <div className="ai-empty"><div>✦</div><h3>Generate an evidence-based decision review</h3><p>Gemini receives your resources, priorities, constraints and impact parameters, then automatically uses the configured fallback chain if the primary model fails.</p></div>}</div><div className="ai-side"><div className="mini-panel"><span>KEY IMPACT</span>{selected.metrics.slice(0, 4).map((metric, i) => <div key={metric.name}><b>{metric.name}</b><strong>{formatMetric(metric, impacts[i])}</strong></div>)}</div><div className="mini-panel"><span>ROUTING</span><p>Gemini 3.8 Flash → 3.7 Flash → 3.5 Flash → 3.1 Flash-Lite. TTS remains separately configured for voice output.</p></div></div></div></div>}
          {view === 'history' && <div className="history-page"><div className="section-head"><div><h2>▤ Saved Scenarios</h2><p>Review and reload your simulation evidence.</p></div></div>{history.length === 0 ? <div className="empty-panel"><h3>No saved scenarios yet</h3><p>Run a simulation or save the current configuration.</p><button className="primary-btn" onClick={() => setView('dashboard')}>Open Dashboard</button></div> : <div className="history-grid">{history.map((scenario, i) => <div className="history-card" key={`${scenario.label}-${i}`}><span>SCENARIO {String(i + 1).padStart(2, '0')}</span><h3>{scenario.label}</h3><p>{scenario.timestamp} · {scenario.resources.length} resources · {scenario.priorities.length} priorities</p><button className="outline-btn" onClick={() => { setResources([...scenario.resources]); setPriorities([...scenario.priorities]); setConstraints([...scenario.constraints]); setView('dashboard'); }}>Load Scenario</button></div>)}</div>}</div>}
        </section>
      </div>
    </main>
  );
}
