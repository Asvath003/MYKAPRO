'use client';

import { useMemo, useState } from 'react';

const initial = {
  goals: { primary: 'Increase patient capacity while maintaining safe care', targetCapacity: 500, currentCapacity: 380, planningPeriod: 90, serviceLevel: 95 },
  resources: { hospitalBeds: 250, icuBeds: 40, doctors: 60, nurses: 120, supportStaff: 45, operatingRooms: 8, budget: 50, hours: 8, occupancy: 82 },
  operations: { patientCapacity: 380, serviceTime: 28, cost: 1250, workload: 78, risk: 24 },
  constraints: { maxBudget: 75, maxOccupancy: 90, maxNurseWorkload: 85, bedsToAdd: 50, hiringLimit: 20, horizon: 90 },
  decisions: { doctors: 5, nurses: 10, beds: 20, icuBeds: 5, hours: 1, budget: 8, operatingRooms: 1 },
};

type State = typeof initial;
const clamp = (n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const money = (n:number)=>`₹${n.toFixed(1)}L`;

export default function HealthcarePage(){
  const [data,setData]=useState<State>(initial);
  const [ran,setRan]=useState(false);
  const [scenario,setScenario]=useState(1);
  const set=(group:keyof State,key:string,value:number|string)=>setData(d=>({...d,[group]:{...d[group], [key]:value}}));

  const result=useMemo(()=>{
    const r=data.resources,d=data.decisions,c=data.constraints,o=data.operations,g=data.goals;
    const addedStaff=d.doctors+d.nurses+d.supportStaff;
    const capacity=Math.round(r.patientCapacity?0:0) + Math.round(o.patientCapacity + d.nurses*2.2+d.doctors*3+d.beds*1.3+d.icuBeds*1.8+d.operatingRooms*7+(d.hours*o.patientCapacity*.035));
    const service=Math.max(12,Math.round(o.serviceTime-(d.nurses*.35+d.doctors*.25+d.hours*1.5)));
    const workload=clamp(Math.round(o.workload+d.nurses*.18+d.doctors*.08-d.hours*2),35,120);
    const occupancy=clamp(Math.round(r.occupancy+(capacity-o.patientCapacity)/Math.max(r.hospitalBeds+d.beds,1)*25),40,110);
    const cost=o.cost + d.doctors*70+d.nurses*32+d.supportStaff*18+d.beds*0.08+d.icuBeds*0.18+d.operatingRooms*120+d.budget*2;
    const risk=clamp(Math.round(o.risk-(d.nurses*.35+d.doctors*.2+d.icuBeds*.3+d.operatingRooms*.5)+(workload>c.maxNurseWorkload?8:0)+(occupancy>c.maxOccupancy?10:0)),3,95);
    const score=clamp(Math.round(55+(capacity/g.targetCapacity)*25+(g.serviceLevel/service)*8+(100-risk)*.15+(100-Math.max(0,workload-75))*0.08),35,98);
    const feasible=d.beds<=c.bedsToAdd && d.doctors+d.nurses+d.supportStaff<=c.hiringLimit && d.budget<=c.maxBudget && workload<=c.maxNurseWorkload && occupancy<=c.maxOccupancy;
    return {capacity,service,workload,occupancy,cost,risk,score,feasible,addedStaff};
  },[data]);

  const reset=()=>{setData(initial);setRan(false);};
  const run=()=>{setRan(true);setScenario(s=>s+1);};
  const decisionFields=[['doctors','Doctors','staff',0,20],['nurses','Nurses','staff',0,30],['beds','Beds','beds',0,50],['icuBeds','ICU beds','beds',0,20],['hours','Working hours','hrs/day',0,4],['budget','Budget allocation','₹L',0,75],['operatingRooms','Operating rooms','rooms',0,3]] as const;

  return <main style={{minHeight:'100vh',background:'#071018',color:'#e8f0f4',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{height:72,borderBottom:'1px solid #20313a',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'#0a141b',position:'sticky',top:0,zIndex:5}}>
      <div style={{display:'flex',gap:14,alignItems:'center'}}><div style={{width:38,height:38,borderRadius:10,display:'grid',placeItems:'center',background:'#b7f34a',color:'#071018',fontWeight:900}}>DS</div><div><b style={{fontSize:18}}>DecisionSphere</b><div style={{fontSize:11,color:'#81929b'}}>Healthcare scenario intelligence</div></div></div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}><span style={{fontSize:12,color:'#b7f34a'}}>● Simulation engine active</span><span style={{border:'1px solid #30434d',borderRadius:20,padding:'7px 12px',fontSize:12}}>Healthcare</span></div>
    </header>
    <div style={{maxWidth:1400,margin:'0 auto',padding:'34px 28px 60px'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'end',marginBottom:28}}><div><div style={{fontSize:11,letterSpacing:2,color:'#b7f34a',textTransform:'uppercase'}}>Healthcare · Decision workspace</div><h1 style={{fontSize:38,margin:'8px 0 8px'}}>Configure the hospital decision</h1><p style={{margin:0,color:'#8ea0a9',maxWidth:760}}>Define the current state, guardrails and controllable levers. The simulator converts them into a measurable capacity, cost, workload and risk trade-off.</p></div><div style={{display:'flex',gap:10}}><button onClick={reset} style={btn(false)}>Reset</button><button onClick={run} style={btn(true)}>Run simulation →</button></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1.35fr .85fr',gap:18}}>
        <section style={card}><SectionTitle n="01" title="Goals" sub="What success looks like"/><div style={grid(2)}><Field label="Primary goal" value={data.goals.primary} onChange={v=>set('goals','primary',v)} full/><Field label="Target patient capacity / day" value={data.goals.targetCapacity} onChange={v=>set('goals','targetCapacity',+v)}/><Field label="Current capacity / day" value={data.goals.currentCapacity} onChange={v=>set('goals','currentCapacity',+v)}/><Field label="Planning period (days)" value={data.goals.planningPeriod} onChange={v=>set('goals','planningPeriod',+v)}/><Field label="Target service level (%)" value={data.goals.serviceLevel} onChange={v=>set('goals','serviceLevel',+v)}/></div></section>
        <section style={card}><SectionTitle n="02" title="Operational data" sub="Baseline performance"/><div style={grid(2)}><MetricInput label="Patient capacity" value={data.operations.patientCapacity} unit="patients/day"/><MetricInput label="Service time" value={data.operations.serviceTime} unit="min"/><MetricInput label="Cost / patient" value={data.operations.cost} unit="₹"/><MetricInput label="Staff workload" value={data.operations.workload} unit="%"/><MetricInput label="Operational risk" value={data.operations.risk} unit="%"/></div></section>
        <section style={card}><SectionTitle n="03" title="Current resources" sub="Available today"/><div style={grid(3)}><Field label="Hospital beds" value={data.resources.hospitalBeds} onChange={v=>set('resources','hospitalBeds',+v)}/><Field label="ICU beds" value={data.resources.icuBeds} onChange={v=>set('resources','icuBeds',+v)}/><Field label="Doctors" value={data.resources.doctors} onChange={v=>set('resources','doctors',+v)}/><Field label="Nurses" value={data.resources.nurses} onChange={v=>set('resources','nurses',+v)}/><Field label="Support staff" value={data.resources.supportStaff} onChange={v=>set('resources','supportStaff',+v)}/><Field label="Operating rooms" value={data.resources.operatingRooms} onChange={v=>set('resources','operatingRooms',+v)}/><Field label="Available budget (₹L)" value={data.resources.budget} onChange={v=>set('resources','budget',+v)}/><Field label="Working hours / day" value={data.resources.hours} onChange={v=>set('resources','hours',+v)}/><Field label="Current occupancy (%)" value={data.resources.occupancy} onChange={v=>set('resources','occupancy',+v)}/></div></section>
        <section style={card}><SectionTitle n="04" title="Constraints" sub="Hard guardrails the model must respect"/><div style={grid(2)}><Field label="Maximum budget (₹L)" value={data.constraints.maxBudget} onChange={v=>set('constraints','maxBudget',+v)}/><Field label="Maximum occupancy (%)" value={data.constraints.maxOccupancy} onChange={v=>set('constraints','maxOccupancy',+v)}/><Field label="Maximum nurse workload (%)" value={data.constraints.maxNurseWorkload} onChange={v=>set('constraints','maxNurseWorkload',+v)}/><Field label="Available beds to add" value={data.constraints.bedsToAdd} onChange={v=>set('constraints','bedsToAdd',+v)}/><Field label="Hiring limit (people)" value={data.constraints.hiringLimit} onChange={v=>set('constraints','hiringLimit',+v)}/><Field label="Planning horizon (days)" value={data.constraints.horizon} onChange={v=>set('constraints','horizon',+v)}/></div></section>
        <section style={{...card,gridColumn:'1 / -1'}}><SectionTitle n="05" title="Decision variables" sub="Only these levers change between scenarios"/><div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:12}}>{decisionFields.map(([key,label,unit,min,max])=><div key={key}><label style={labelStyle}>{label}<small style={{display:'block',color:'#647780',marginTop:3}}>{unit}</small></label><input type="number" min={min} max={max} value={(data.decisions as any)[key]} onChange={e=>set('decisions',key,+e.target.value)} style={input}/><input type="range" min={min} max={max} value={(data.decisions as any)[key]} onChange={e=>set('decisions',key,+e.target.value)} style={{width:'100%',accentColor:'#b7f34a'}}/></div>)}</div></section>
      </div>

      <section style={{...card,marginTop:18,border:'1px solid #2b3d46'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div><SectionTitle n="06" title={ran?`Scenario ${String(scenario-1).padStart(2,'0')} · Simulation result`:'Simulation preview'} sub="Derived from the inputs above"/></div><span style={{padding:'8px 12px',borderRadius:20,fontSize:12,background:result.feasible?'#14251a':'#321a1a',color:result.feasible?'#b7f34a':'#ff9d9d'}}>{result.feasible?'✓ Within constraints':'⚠ Constraint violation'}</span></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10}}>{[['Capacity',`${result.capacity}`,'patients/day'],['Service time',`${result.service}`,'min'],['Workload',`${result.workload}%`,'nursing'],['Occupancy',`${result.occupancy}%`,'beds'],['Cost / patient',`₹${Math.round(result.cost)}`,'estimated'],['Risk',`${result.risk}%`,'operational']].map(([a,b,c])=><div key={a} style={{padding:16,borderRadius:12,background:'#0c181f',border:'1px solid #20313a'}}><div style={{fontSize:11,color:'#71838c'}}>{a}</div><strong style={{fontSize:25,display:'block',marginTop:8}}>{b}</strong><span style={{fontSize:10,color:'#647780'}}>{c}</span></div>)}</div>
        <div style={{marginTop:16,padding:18,borderRadius:12,background:'#0c181f'}}><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,color:'#83959e'}}>Decision score</span><strong style={{fontSize:24,color:'#b7f34a'}}>{result.score}/100</strong></div><div style={{height:7,background:'#1b2a31',borderRadius:10,marginTop:10}}><div style={{height:'100%',width:`${result.score}%`,background:'#b7f34a',borderRadius:10}}/></div><p style={{margin:'12px 0 0',color:'#a8b6bc',fontSize:13}}>{result.capacity>=data.goals.targetCapacity?'Target capacity is achievable under the current decision mix.':'Capacity remains below target; increase the highest-impact staffing or bed levers.'} {result.workload>data.constraints.maxNurseWorkload?' Nursing workload breaches the guardrail, so hiring or reallocation should be considered.':''} {result.occupancy>data.constraints.maxOccupancy?' Occupancy is above the safe ceiling; bed capacity must be addressed.':''}</p></div>
      </section>
    </div>
  </main>;
}

function SectionTitle({n,title,sub}:{n:string,title:string,sub:string}){return <div style={{marginBottom:18}}><div style={{fontSize:10,letterSpacing:2,color:'#b7f34a'}}>{n}</div><h2 style={{fontSize:20,margin:'5px 0'}}>{title}</h2><p style={{fontSize:12,color:'#71838c',margin:0}}>{sub}</p></div>}
function Field({label,value,onChange,full=false}:{label:string,value:number|string,onChange:(v:string)=>void,full?:boolean}){return <div style={{gridColumn:full?'1 / -1':undefined}}><label style={labelStyle}>{label}</label><input value={value} onChange={e=>onChange(e.target.value)} style={input}/></div>}
function MetricInput({label,value,unit}:{label:string,value:number,unit:string}){return <div style={{padding:'10px 0',borderBottom:'1px solid #1b2b33'}}><span style={{fontSize:11,color:'#81929b'}}>{label}</span><div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:5}}><b style={{fontSize:21}}>{value}</b><small style={{color:'#60727b'}}>{unit}</small></div></div>}
const card:React.CSSProperties={background:'#0b171e',border:'1px solid #20313a',borderRadius:16,padding:22};
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',marginTop:7,background:'#071018',color:'#e8f0f4',border:'1px solid #2a3d46',borderRadius:8,padding:'10px 11px',outline:'none'};
const labelStyle:React.CSSProperties={fontSize:11,color:'#9bacb4'};
const grid=(n:number):React.CSSProperties=>({display:'grid',gridTemplateColumns:`repeat(${n},minmax(0,1fr))`,gap:14});
const btn=(primary:boolean):React.CSSProperties=>({border:primary?'1px solid #b7f34a':'1px solid #30434d',background:primary?'#b7f34a':'transparent',color:primary?'#071018':'#dbe5e9',borderRadius:9,padding:'11px 16px',fontWeight:700,cursor:'pointer'});
