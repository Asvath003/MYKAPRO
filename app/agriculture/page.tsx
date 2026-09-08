'use client';

import { useMemo, useState } from 'react';

type FormState = {
  primaryGoal: string;
  landAvailable: string;
  planningPeriod: string;
  targetProfit: string;
  riskTolerance: string;
  land: string;
  labour: string;
  budget: string;
  water: string;
  seed: string;
  fertilizer: string;
  equipment: string;
  profit: number;
  waterEfficiency: number;
  yield: number;
  sustainability: number;
  risk: number;
  maxLand: string;
  maxWater: string;
  maxBudget: string;
  maxFoodCropArea: string;
  labourAvailability: string;
  season: string;
  waterAllocation: string;
  fertilizerAllocation: string;
  labourAllocation: string;
};

const initial: FormState = {
  primaryGoal: 'Maximize profit while maintaining sustainable production',
  landAvailable: '500', planningPeriod: '120', targetProfit: '1000000', riskTolerance: 'Moderate',
  land: '500', labour: '48', budget: '3200000', water: '70', seed: '1000', fertilizer: '500', equipment: '10',
  profit: 80, waterEfficiency: 85, yield: 90, sustainability: 75, risk: 70,
  maxLand: '700', maxWater: '80', maxBudget: '4000000', maxFoodCropArea: '500', labourAvailability: '60', season: 'Kharif',
  waterAllocation: '60', fertilizerAllocation: '350', labourAllocation: '40',
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

function Field({ label, value, onChange, type = 'text', placeholder, suffix }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><div className="relative"><input className={inputClass + (suffix ? ' pr-16' : '')} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>{suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>}</div></label>;
}

function Priority({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 flex justify-between text-sm font-semibold"><span>{label}</span><span className="text-emerald-700">{value}%</span></div><input className="w-full accent-emerald-600" type="range" min="0" max="100" value={value} onChange={e => onChange(Number(e.target.value))}/><div className="mt-1 flex justify-between text-xs text-slate-400"><span>Low</span><span>High</span></div></div>;
}

export default function AgriculturePage() {
  const [form, setForm] = useState(initial);
  const set = (key: keyof FormState, value: string) => setForm(f => ({ ...f, [key]: value }));
  const priorities = [form.profit, form.waterEfficiency, form.yield, form.sustainability, form.risk];
  const score = useMemo(() => Math.round(priorities.reduce((a, b) => a + b, 0) / priorities.length), [priorities]);
  const waterUse = Number(form.waterAllocation) || 0;
  const waterLimit = Number(form.maxWater) || 1;
  const budgetUse = Number(form.budget) || 0;
  const budgetLimit = Number(form.maxBudget) || 1;
  const landUse = Number(form.land) || 0;
  const landLimit = Number(form.maxLand) || 1;
  const feasible = waterUse <= waterLimit && budgetUse <= budgetLimit && landUse <= landLimit;

  const simulate = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  const reset = () => setForm(initial);

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><a href="/" className="text-sm font-semibold text-emerald-700">← Back to sectors</a><h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Agriculture Decision Simulation</h1><p className="mt-2 max-w-3xl text-slate-600">Enter your farm's current situation, priorities and limits. These inputs become the baseline for scenario simulation and trade-off analysis.</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4"><div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Input completeness</div><div className="mt-1 text-2xl font-bold text-emerald-900">Ready to simulate</div></div>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6"><span className="text-sm font-bold text-emerald-700">01</span><h2 className="mt-1 text-2xl font-bold">Goals</h2><p className="mt-1 text-sm text-slate-500">Define what you want the farm to achieve during this planning period.</p></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="lg:col-span-3"><Field label="Primary goal" value={form.primaryGoal} onChange={v => set('primaryGoal', v)} placeholder="e.g. Increase profit without exceeding water limits"/></div><Field label="Land available" value={form.landAvailable} onChange={v => set('landAvailable', v)} type="number" suffix="acres"/><Field label="Planning period" value={form.planningPeriod} onChange={v => set('planningPeriod', v)} type="number" suffix="days"/><Field label="Target profit" value={form.targetProfit} onChange={v => set('targetProfit', v)} type="number" suffix="₹"/><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Risk tolerance</span><select className={inputClass} value={form.riskTolerance} onChange={e => set('riskTolerance', e.target.value)}><option>Low</option><option>Moderate</option><option>High</option></select></label></div></section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6"><span className="text-sm font-bold text-emerald-700">02</span><h2 className="mt-1 text-2xl font-bold">Current resources</h2><p className="mt-1 text-sm text-slate-500">Use the farm's actual available resources as the baseline. Do not enter the maximum you could obtain.</p></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"><Field label="Land" value={form.land} onChange={v => set('land', v)} type="number" suffix="acres"/><Field label="Labour" value={form.labour} onChange={v => set('labour', v)} type="number" suffix="workers"/><Field label="Budget" value={form.budget} onChange={v => set('budget', v)} type="number" suffix="₹"/><Field label="Available water" value={form.water} onChange={v => set('water', v)} type="number" suffix="%"/><Field label="Seed available" value={form.seed} onChange={v => set('seed', v)} type="number" suffix="kg"/><Field label="Fertilizer" value={form.fertilizer} onChange={v => set('fertilizer', v)} type="number" suffix="kg"/><Field label="Equipment" value={form.equipment} onChange={v => set('equipment', v)} type="number" suffix="units"/></div></section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6"><span className="text-sm font-bold text-emerald-700">03</span><h2 className="mt-1 text-2xl font-bold">Priorities</h2><p className="mt-1 text-sm text-slate-500">Tell the simulator what matters most when objectives conflict.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Priority label="Profit" value={form.profit} onChange={v => setForm(f => ({...f, profit:v}))}/><Priority label="Water efficiency" value={form.waterEfficiency} onChange={v => setForm(f => ({...f, waterEfficiency:v}))}/><Priority label="Yield" value={form.yield} onChange={v => setForm(f => ({...f, yield:v}))}/><Priority label="Sustainability" value={form.sustainability} onChange={v => setForm(f => ({...f, sustainability:v}))}/><Priority label="Risk" value={form.risk} onChange={v => setForm(f => ({...f, risk:v}))}/></div></section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6"><span className="text-sm font-bold text-emerald-700">04</span><h2 className="mt-1 text-2xl font-bold">Constraints</h2><p className="mt-1 text-sm text-slate-500">These are hard boundaries the simulator should respect when generating recommendations.</p></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><Field label="Maximum land" value={form.maxLand} onChange={v => set('maxLand', v)} type="number" suffix="acres"/><Field label="Maximum water" value={form.maxWater} onChange={v => set('maxWater', v)} type="number" suffix="%"/><Field label="Maximum budget" value={form.maxBudget} onChange={v => set('maxBudget', v)} type="number" suffix="₹"/><Field label="Maximum food crop area" value={form.maxFoodCropArea} onChange={v => set('maxFoodCropArea', v)} type="number" suffix="acres"/><Field label="Labour availability" value={form.labourAvailability} onChange={v => set('labourAvailability', v)} type="number" suffix="workers"/><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Season</span><select className={inputClass} value={form.season} onChange={e => set('season', e.target.value)}><option>Kharif</option><option>Rabi</option><option>Zaid</option><option>Year-round</option></select></label></div></section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6"><span className="text-sm font-bold text-emerald-700">05</span><h2 className="mt-1 text-2xl font-bold">Decision variables</h2><p className="mt-1 text-sm text-slate-500">These are the levers the simulation can change between scenarios.</p></div><div className="grid gap-5 md:grid-cols-3"><Field label="Water allocation" value={form.waterAllocation} onChange={v => set('waterAllocation', v)} type="number" suffix="%"/><Field label="Fertilizer allocation" value={form.fertilizerAllocation} onChange={v => set('fertilizerAllocation', v)} type="number" suffix="kg"/><Field label="Labour allocation" value={form.labourAllocation} onChange={v => set('labourAllocation', v)} type="number" suffix="workers"/></div><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><strong>Future decision variables:</strong> crop mix, crop area, seed allocation, equipment allocation, irrigation timing and input purchasing.</div></section>

      <div className="mb-8 flex flex-wrap gap-3"><button onClick={simulate} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700">Simulate scenario</button><button onClick={reset} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">Reset inputs</button></div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><span className="text-sm font-bold text-emerald-700">06</span><h2 className="mt-1 text-2xl font-bold">Baseline simulation check</h2><p className="mt-1 text-sm text-slate-500">A lightweight prototype check. The full engine can later plug in crop, weather, market and historical farm models.</p></div><div className="text-3xl font-bold text-emerald-700">{score}/100</div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-5"><div className="text-sm text-slate-500">Resource feasibility</div><div className="mt-1 text-xl font-bold">{feasible ? 'Within limits' : 'Constraint exceeded'}</div></div><div className="rounded-2xl bg-slate-50 p-5"><div className="text-sm text-slate-500">Water allocation</div><div className="mt-1 text-xl font-bold">{waterUse}% / {waterLimit}%</div></div><div className="rounded-2xl bg-slate-50 p-5"><div className="text-sm text-slate-500">Budget</div><div className="mt-1 text-xl font-bold">₹{budgetUse.toLocaleString()} / ₹{budgetLimit.toLocaleString()}</div></div></div><div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="font-semibold text-emerald-900">How these inputs will drive the decision engine</div><p className="mt-2 text-sm leading-6 text-emerald-900/80">Goals define the outcome, resources define the current state, priorities define the objective weights, constraints define what cannot be violated, and decision variables define what can change. The simulator can then compare scenarios such as increasing irrigation, shifting fertilizer, reallocating labour or changing crop area.</p></div></section>
    </div>
  </main>;
}
