'use client';

import { useMemo, useState } from 'react';

const initial = {
  goal: 'Balanced portfolio growth with controlled risk',
  period: 12,
  capital: 100000000,
  retail: 40000000,
  housing: 30000000,
  sme: 20000000,
  branches: 25,
  officers: 80,
  labs: 4,
  teachingHours: 1200,
  budget: 15000000,
  riskReturn: 30,
  loanGrowth: 25,
  operationalGrowth: 15,
  riskReduction: 30,
  maxSme: 30,
  maxRetail: 50,
  maxDefault: 5,
  liquidity: 10,
  regulatory: 'Maintain all applicable capital, liquidity and exposure requirements',
  decisionSme: 25,
  decisionRetail: 45,
  decisionHousing: 30,
  approvalCapacity: 500,
  interestRate: 9.5,
  decisionLiquidity: 10,
};

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function BankingPlanning() {
  const [data, setData] = useState(initial);
  const [simulated, setSimulated] = useState(false);

  const update = (key: keyof typeof initial, value: string | number) =>
    setData((d) => ({ ...d, [key]: typeof value === 'number' ? value : value }));

  const result = useMemo(() => {
    const allocationTotal = data.decisionSme + data.decisionRetail + data.decisionHousing;
    const allocatedCapital = data.capital * Math.min(allocationTotal, 100) / 100;
    const liquidityReserve = data.capital * data.decisionLiquidity / 100;
    const usableCapital = Math.max(0, data.capital - liquidityReserve);
    const weightedExposure = Math.max(data.decisionSme, data.decisionRetail);
    const defaultRisk = 2.2 + data.decisionSme * 0.045 + Math.max(0, 9.5 - data.interestRate) * 0.15;
    const capacity = Math.min(data.approvalCapacity, data.officers * 12);
    const utilization = Math.min(100, (capacity / Math.max(1, data.approvalCapacity)) * 100);
    const constraintIssues: string[] = [];
    if (data.decisionSme > data.maxSme) constraintIssues.push('SME exposure exceeds the configured maximum.');
    if (data.decisionRetail > data.maxRetail) constraintIssues.push('Retail exposure exceeds the configured maximum.');
    if (defaultRisk > data.maxDefault) constraintIssues.push('Expected default rate is above the configured limit.');
    if (data.decisionLiquidity < data.liquidity) constraintIssues.push('Liquidity reserve is below the minimum requirement.');
    if (allocationTotal > 100) constraintIssues.push('Decision allocations exceed 100%.');
    if (allocatedCapital > usableCapital) constraintIssues.push('Allocated capital conflicts with the liquidity reserve.');
    const score = Math.max(0, Math.round(82 - constraintIssues.length * 12 + (data.riskReduction / 10) - Math.abs(allocationTotal - 100) * 0.4));
    return { allocationTotal, allocatedCapital, liquidityReserve, usableCapital, weightedExposure, defaultRisk, capacity, utilization, constraintIssues, score };
  }, [data]);

  const field = (label: string, key: keyof typeof initial, type: 'number' | 'text' = 'number', suffix?: string) => (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input type={type} value={data[key] as string | number} onChange={(e) => update(key, type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        {suffix && <span className="pointer-events-none absolute right-4 top-3 text-sm text-slate-400">{suffix}</span>}
      </div>
    </label>
  );

  const slider = (label: string, key: keyof typeof initial) => (
    <label className="block space-y-2">
      <div className="flex justify-between text-sm font-medium text-slate-700"><span>{label}</span><span>{data[key]}%</span></div>
      <input type="range" min="0" max="100" value={data[key] as number} onChange={(e) => update(key, Number(e.target.value))} className="w-full accent-indigo-600" />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-700 p-7 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-100">Decision Simulation • Banking & Finance</p>
          <h1 className="text-3xl font-bold md:text-4xl">Banking / Financial Planning</h1>
          <p className="mt-2 max-w-3xl text-indigo-100">Define the current banking state, priorities and constraints, then test lending-allocation decisions and understand their trade-offs.</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-1 text-xl font-bold">1. Goals</h2><p className="mb-5 text-sm text-slate-500">What is the institution trying to achieve?</p>
            <div className="grid gap-5 md:grid-cols-3">
              {field('Primary goal', 'goal', 'text')}
              {field('Planning period', 'period', 'number', 'months')}
              {field('Available lending capital', 'capital', 'number', '₹')}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-1 text-xl font-bold">2. Resources</h2><p className="mb-5 text-sm text-slate-500">Enter the current operational and financial resources.</p>
            <div className="grid gap-5 md:grid-cols-3">
              {field('Retail lending capital', 'retail', 'number', '₹')}
              {field('Housing lending capital', 'housing', 'number', '₹')}
              {field('SME lending capital', 'sme', 'number', '₹')}
              {field('Branches', 'branches')}
              {field('Loan officers', 'officers')}
              {field('Labs / analytics units', 'labs')}
              {field('Weekly teaching hours', 'teachingHours', 'number', 'hrs')}
              {field('Faculty / operations budget', 'budget', 'number', '₹')}
            </div>
            <p className="mt-4 text-xs text-slate-400">The last two fields are retained for compatibility with the broader multi-sector prototype; they can later be renamed to banking-specific operational capacity and support budget.</p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-1 text-xl font-bold">3. Priorities</h2><p className="mb-5 text-sm text-slate-500">Set the relative importance of each outcome.</p>
            <div className="grid gap-6 md:grid-cols-2">{slider('Risk-adjusted return', 'riskReturn')}{slider('Loan growth', 'loanGrowth')}{slider('Operational growth', 'operationalGrowth')}{slider('Risk reduction', 'riskReduction')}</div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-1 text-xl font-bold">4. Constraints</h2><p className="mb-5 text-sm text-slate-500">Rules the simulation should respect.</p>
            <div className="grid gap-5 md:grid-cols-3">
              {field('Maximum SME exposure', 'maxSme', 'number', '%')}
              {field('Maximum retail exposure', 'maxRetail', 'number', '%')}
              {field('Maximum expected default rate', 'maxDefault', 'number', '%')}
              {field('Minimum liquidity reserve', 'liquidity', 'number', '%')}
              {field('Regulatory requirements', 'regulatory', 'text')}
              {field('Planning period', 'period', 'number', 'months')}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-1 text-xl font-bold">5. Decision Variables</h2><p className="mb-5 text-sm text-slate-500">These are the levers the decision-maker can change between scenarios.</p>
            <div className="grid gap-5 md:grid-cols-3">
              {field('SME allocation', 'decisionSme', 'number', '%')}
              {field('Retail allocation', 'decisionRetail', 'number', '%')}
              {field('Housing allocation', 'decisionHousing', 'number', '%')}
              {field('Loan approval capacity', 'approvalCapacity', 'number', 'loans')}
              {field('Interest-rate assumption', 'interestRate', 'number', '%')}
              {field('Liquidity reserve', 'decisionLiquidity', 'number', '%')}
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><span className="font-semibold">Allocation check:</span> {result.allocationTotal}% of capital assigned across SME, retail and housing.</div>
          </section>

          <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-bold">6. Simulation Result</h2><p className="mt-1 text-sm text-slate-300">A prototype scenario calculation based on the inputs above.</p></div><button onClick={() => setSimulated(true)} className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100">Simulate scenario</button></div>
            {simulated && <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-white/10 p-4"><p className="text-xs text-slate-300">Scenario score</p><p className="mt-1 text-2xl font-bold">{result.score}/100</p></div>
              <div className="rounded-xl bg-white/10 p-4"><p className="text-xs text-slate-300">Expected default rate</p><p className="mt-1 text-2xl font-bold">{result.defaultRisk.toFixed(1)}%</p></div>
              <div className="rounded-xl bg-white/10 p-4"><p className="text-xs text-slate-300">Liquidity reserve</p><p className="mt-1 text-2xl font-bold">{money(result.liquidityReserve)}</p></div>
              <div className="rounded-xl bg-white/10 p-4"><p className="text-xs text-slate-300">Approval capacity utilization</p><p className="mt-1 text-2xl font-bold">{result.utilization.toFixed(0)}%</p></div>
              <div className="md:col-span-4 rounded-xl bg-white/10 p-4"><p className="font-semibold">Trade-off summary</p><p className="mt-1 text-sm text-slate-300">The selected mix allocates {result.allocationTotal}% of capital, with {result.weightedExposure}% as the highest single exposure. Higher SME allocation may improve growth potential but can increase modeled default risk.</p>{result.constraintIssues.length > 0 ? <div className="mt-3 text-sm text-amber-300"><span className="font-semibold">Constraint alerts:</span> {result.constraintIssues.join(' ')}</div> : <div className="mt-3 text-sm text-emerald-300">All configured prototype constraints are currently satisfied.</div>}</div>
            </div>}
          </section>
        </div>
      </div>
    </main>
  );
}
