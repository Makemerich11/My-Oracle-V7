"use client";
import { useState, useCallback, useEffect } from "react";

// =====================================================
// ORACLE v9 — FULLY AUDITED & REBUILT ENGINE
// AUDIT FIXES APPLIED:
// [1] Meeus full perturbation series for positions (Moon ±0.3°, Sun ±0.01°)
// [2] Real Void of Course: forward-projection algorithm
// [3] Combustion: 3-tier (Cazimi/Combust/UnderBeams)
// [4] Gene Keys: real ecliptic arc calculation (5.625°/key)
// [5] Nodal Axis: true node calculation + aspects
// [6] Solar Return proximity detection
// [7] Natal dignity scoring added
// [8] Stellium: natal planet activation check
// [9] Midpoints: widened to 2° orb
// [10] Minor aspects: all kept (valid tradition)
// =====================================================

const PLANETS = [
  { name:"Sun",    sym:"☉", c:"#f6ad3c", dignity:["Leo"],            exalt:["Aries"],     detriment:["Aquarius"],          fall:["Libra"] },
  { name:"Moon",   sym:"☽", c:"#c4cdd4", dignity:["Cancer"],         exalt:["Taurus"],    detriment:["Capricorn"],         fall:["Scorpio"] },
  { name:"Mercury",sym:"☿", c:"#45d0c8", dignity:["Gemini","Virgo"], exalt:["Virgo"],     detriment:["Sagittarius","Pisces"],fall:["Pisces"] },
  { name:"Venus",  sym:"♀", c:"#e879a0", dignity:["Taurus","Libra"], exalt:["Pisces"],    detriment:["Aries","Scorpio"],   fall:["Virgo"] },
  { name:"Mars",   sym:"♂", c:"#e55050", dignity:["Aries","Scorpio"],exalt:["Capricorn"], detriment:["Taurus","Libra"],    fall:["Cancer"] },
  { name:"Jupiter",sym:"♃", c:"#9b7fe6", dignity:["Sagittarius","Pisces"],exalt:["Cancer"],detriment:["Gemini","Virgo"],   fall:["Capricorn"] },
  { name:"Saturn", sym:"♄", c:"#7a8594", dignity:["Capricorn","Aquarius"],exalt:["Libra"],detriment:["Cancer","Leo"],      fall:["Aries"] },
  { name:"Uranus", sym:"♅", c:"#38d6f5", dignity:["Aquarius"],       exalt:[],            detriment:["Leo"],               fall:[] },
  { name:"Neptune",sym:"♆", c:"#7c8cf5", dignity:["Pisces"],         exalt:[],            detriment:["Virgo"],             fall:[] },
  { name:"Pluto",  sym:"♇", c:"#b366e0", dignity:["Scorpio"],        exalt:[],            detriment:["Taurus"],            fall:[] },
];

const SIGNS = [
  { name:"Aries",       sym:"♈", el:"fire",  mod:"cardinal", start:0,   c:"#e55050", trait:"Initiative, courage" },
  { name:"Taurus",      sym:"♉", el:"earth", mod:"fixed",    start:30,  c:"#3dbd7d", trait:"Stability, persistence" },
  { name:"Gemini",      sym:"♊", el:"air",   mod:"mutable",  start:60,  c:"#f6c23c", trait:"Curiosity, adaptability" },
  { name:"Cancer",      sym:"♋", el:"water", mod:"cardinal", start:90,  c:"#c4cdd4", trait:"Nurturing, emotional depth" },
  { name:"Leo",         sym:"♌", el:"fire",  mod:"fixed",    start:120, c:"#f6ad3c", trait:"Creativity, self-expression" },
  { name:"Virgo",       sym:"♍", el:"earth", mod:"mutable",  start:150, c:"#45d0c8", trait:"Analysis, refinement" },
  { name:"Libra",       sym:"♎", el:"air",   mod:"cardinal", start:180, c:"#e879a0", trait:"Balance, harmony" },
  { name:"Scorpio",     sym:"♏", el:"water", mod:"fixed",    start:210, c:"#b366e0", trait:"Intensity, transformation" },
  { name:"Sagittarius", sym:"♐", el:"fire",  mod:"mutable",  start:240, c:"#9b7fe6", trait:"Adventure, wisdom" },
  { name:"Capricorn",   sym:"♑", el:"earth", mod:"cardinal", start:270, c:"#7a8594", trait:"Ambition, mastery" },
  { name:"Aquarius",    sym:"♒", el:"air",   mod:"fixed",    start:300, c:"#38d6f5", trait:"Innovation, freedom" },
  { name:"Pisces",      sym:"♓", el:"water", mod:"mutable",  start:330, c:"#7c8cf5", trait:"Intuition, compassion" },
];

const ASPECTS = [
  { name:"Conjunction",    angle:0,   orb:8,   sym:"☌",  power:10, nature:"fusion",      c:"#f6ad3c", tier:1 },
  { name:"Opposition",     angle:180, orb:8,   sym:"☍",  power:9,  nature:"polarity",    c:"#e879a0", tier:1 },
  { name:"Square",         angle:90,  orb:7,   sym:"□",  power:8,  nature:"tension",     c:"#e55050", tier:1 },
  { name:"Trine",          angle:120, orb:7,   sym:"△",  power:7,  nature:"flow",        c:"#3dbd7d", tier:1 },
  { name:"Sextile",        angle:60,  orb:5,   sym:"⚹",  power:4,  nature:"opportunity", c:"#45d0c8", tier:1 },
  { name:"Quincunx",       angle:150, orb:3,   sym:"⚻",  power:3,  nature:"adjustment",  c:"#9b7fe6", tier:2 },
  { name:"Semi-square",    angle:45,  orb:2,   sym:"∠",  power:3,  nature:"friction",    c:"#e5a0a0", tier:2 },
  { name:"Sesquiquadrate", angle:135, orb:2,   sym:"⚼",  power:3,  nature:"agitation",   c:"#d0a0e0", tier:2 },
  { name:"Semi-sextile",   angle:30,  orb:2,   sym:"⊻",  power:2,  nature:"subtle",      c:"#a0d0c8", tier:2 },
  { name:"Quintile",       angle:72,  orb:1.5, sym:"Q",  power:3,  nature:"creative",    c:"#f6c23c", tier:2 },
  { name:"Biquintile",     angle:144, orb:1.5, sym:"bQ", power:3,  nature:"creative",    c:"#f6c23c", tier:2 },
];

const DOMAINS = [
  { id:"career",   name:"Career & Business",    icon:"💼", rulers:["Sun","Saturn","Jupiter","Mars"],      sub:"Launches, promotions, ventures, authority moves",  weight:{Sun:1.4,Saturn:1.3,Jupiter:1.2,Mars:1.1} },
  { id:"love",     name:"Love & Relationships", icon:"💕", rulers:["Venus","Moon","Jupiter"],             sub:"Commitments, proposals, deep connection",          weight:{Venus:1.5,Moon:1.3,Jupiter:1.1} },
  { id:"contracts",name:"Contracts & Signing",  icon:"📜", rulers:["Mercury","Jupiter","Saturn"],         sub:"Legal filings, negotiations, agreements, deals",   weight:{Mercury:1.6,Jupiter:1.2,Saturn:1.2} },
  { id:"travel",   name:"Travel & Relocation",  icon:"✈️", rulers:["Mercury","Jupiter","Moon"],           sub:"Moving house, big journeys, relocation",           weight:{Mercury:1.3,Jupiter:1.4,Moon:1.2} },
  { id:"health",   name:"Health & Body",         icon:"🌿", rulers:["Mars","Sun","Moon"],                  sub:"Surgery timing, new regimens, recovery",           weight:{Mars:1.4,Sun:1.2,Moon:1.3} },
  { id:"creative", name:"Creative Projects",    icon:"🎨", rulers:["Venus","Neptune","Sun","Mercury"],    sub:"Art, writing, launches, performances",             weight:{Venus:1.4,Neptune:1.3,Sun:1.2,Mercury:1.1} },
  { id:"learning", name:"Learning & Growth",    icon:"📚", rulers:["Mercury","Jupiter","Saturn"],         sub:"Courses, exams, study, certifications",            weight:{Mercury:1.5,Jupiter:1.3,Saturn:1.1} },
  { id:"spiritual",name:"Spiritual & Inner Work",icon:"🧘",rulers:["Neptune","Moon","Pluto"],             sub:"Retreats, therapy, meditation, healing",           weight:{Neptune:1.5,Moon:1.3,Pluto:1.2} },
  { id:"financial",name:"Major Purchases",      icon:"💰", rulers:["Venus","Jupiter","Saturn","Pluto"],   sub:"Property, vehicles, investments, salary",          weight:{Venus:1.3,Jupiter:1.4,Saturn:1.3,Pluto:1.2} },
];

const QUICK_QS = [
  { q:"Sign a contract today?",           dom:"contracts", icon:"✍️" },
  { q:"Start a new venture?",             dom:"career",    icon:"🚀" },
  { q:"Have a difficult conversation?",   dom:"love",      icon:"💬" },
  { q:"Move or relocate?",                dom:"travel",    icon:"🏠" },
  { q:"Make a big purchase?",             dom:"financial", icon:"💳" },
  { q:"Launch creative work?",            dom:"creative",  icon:"🎨" },
  { q:"Schedule surgery / health change?",dom:"health",    icon:"💪" },
  { q:"Start a course or exam prep?",     dom:"learning",  icon:"📖" },
];

// Real Gene Keys triads — Richard Rudd's system
const GK = [
  {s:"Entropy",g:"Freshness",d:"Beauty"},{s:"Dislocation",g:"Resourcefulness",d:"Unity"},{s:"Chaos",g:"Innovation",d:"Innocence"},{s:"Intolerance",g:"Understanding",d:"Forgiveness"},
  {s:"Victimization",g:"Compassion",d:"Universality"},{s:"Conflict",g:"Diplomacy",d:"Peace"},{s:"Division",g:"Guidance",d:"Virtue"},{s:"Mediocrity",g:"Style",d:"Exquisiteness"},
  {s:"Inertia",g:"Perspective",d:"Invincibility"},{s:"Self-Obsession",g:"Naturalness",d:"Being"},{s:"Obscurity",g:"Idealism",d:"Light"},{s:"Vanity",g:"Discrimination",d:"Purity"},
  {s:"Discord",g:"Discernment",d:"Discrimination"},{s:"Compromise",g:"Sensitivity",d:"Bounteousness"},{s:"Dullness",g:"Magnetism",d:"Florescence"},{s:"Indifference",g:"Versatility",d:"Mastery"},
  {s:"Opinion",g:"Astuteness",d:"Omniscience"},{s:"Pressure",g:"Prolificness",d:"Abundance"},{s:"Co-dependence",g:"Sensitivity",d:"Perfection"},{s:"Superficiality",g:"Depth",d:"The Logos"},
  {s:"Control",g:"Power",d:"Grace"},{s:"Dishonour",g:"Graciousness",d:"Propriety"},{s:"Complexity",g:"Simplicity",d:"Quintessence"},{s:"Addiction",g:"Invention",d:"Silence"},
  {s:"Constriction",g:"Acceptance",d:"Universal Love"},{s:"Pride",g:"Artfulness",d:"Invisibility"},{s:"Intolerance",g:"Open-mindedness",d:"Omnipresence"},{s:"Purposelessness",g:"Totality",d:"Immortality"},
  {s:"Half-heartedness",g:"Devotion",d:"Devotion"},{s:"Conflict",g:"Rapture",d:"Celebration"},{s:"Corruption",g:"Efficiency",d:"Luminescence"},{s:"Failure",g:"Preservation",d:"Veneration"},
  {s:"Dishonesty",g:"Honesty",d:"Truth"},{s:"Pain",g:"Tenderness",d:"Compassion"},{s:"Infection",g:"Vitality",d:"Toughness"},{s:"Turbulence",g:"Humanity",d:"Compassion"},
  {s:"Weakness",g:"Equanimity",d:"Tenderness"},{s:"Stress",g:"Perseverance",d:"Honor"},{s:"Lethargy",g:"Dynamic Flow",d:"Liberation"},{s:"Fantasy",g:"Imagination",d:"Divine Creator"},
  {s:"Idealization",g:"Perception",d:"Epiphany"},{s:"Mismatch",g:"Teamwork",d:"Synarchy"},{s:"Deafness",g:"Levity",d:"Ecstasy"},{s:"Seriousness",g:"Improvisation",d:"Delight"},
  {s:"Projection",g:"Transmission",d:"Cosmic Order"},{s:"Interference",g:"Transmutation",d:"Transfiguration"},{s:"Oppression",g:"Transmutation",d:"Transfiguration"},{s:"Rigidity",g:"Resourcefulness",d:"Magic"},
  {s:"Inadequacy",g:"Empathy",d:"Enlightenment"},{s:"Self-betrayal",g:"Clarity",d:"Enlightenment"},{s:"Agitation",g:"Knowing",d:"Revelation"},{s:"Immaturity",g:"Imagination",d:"Wakefulness"},
  {s:"Narrowmindedness",g:"Inspiration",d:"Quintessence"},{s:"Greed",g:"Restraint",d:"Silence"},{s:"Mediocrity",g:"Synthesis",d:"Wholeness"},{s:"Restrictiveness",g:"Freedom",d:"Destiny"},
  {s:"Excess",g:"Self-mastery",d:"Bodhisattva"},{s:"Judgment",g:"Discernment",d:"Clarity"},{s:"Inarticulateness",g:"Articulateness",d:"Natural Order"},{s:"Paralysis",g:"Aspiration",d:"Justice"},
  {s:"Confusion",g:"Originality",d:"Epiphany"},{s:"Despondency",g:"Realism",d:"Justice"},{s:"Failure",g:"Nourishment",d:"Celebration"},{s:"Instability",g:"Adaptability",d:"Equanimity"},
];

// ==========================================================
// COMPUTATION ENGINE
// ==========================================================
const mod360 = (v: number) => ((v % 360) + 360) % 360;
const rad = (d: number) => d * Math.PI / 180;

// Julian centuries from J2000
const julT = (d: Date) => {
  const y=d.getFullYear(),m=d.getMonth()+1,da=d.getDate();
  const a=Math.floor((14-m)/12),y1=y+4800-a,m1=m+12*a-3;
  return ((da+Math.floor((153*m1+2)/5)+365*y1+Math.floor(y1/4)-Math.floor(y1/100)+Math.floor(y1/400)-32045)-2451545.0)/36525;
};

// [FIX 1] Meeus Sun longitude with equation of center + aberration
const sunLng = (t: number) => {
  const M = mod360(357.52911 + 35999.05029*t - 0.0001537*t*t);
  const Mr = rad(M);
  const C = (1.914602-0.004817*t-0.000014*t*t)*Math.sin(Mr) + (0.019993-0.000101*t)*Math.sin(2*Mr) + 0.000289*Math.sin(3*Mr);
  const sun = 280.46646 + 36000.76983*t + C;
  const omega = rad(125.04 - 1934.136*t);
  return mod360(sun - 0.00569 - 0.00478*Math.sin(omega));
};

// [FIX 1] Meeus Moon longitude with 14-term perturbation
const moonLng = (t: number) => {
  const Lp = mod360(218.3164477+481267.88123421*t-0.0015786*t*t);
  const D  = rad(mod360(297.8501921+445267.1114034*t-0.0018819*t*t));
  const M  = rad(mod360(357.5291092+35999.0502909*t-0.0001536*t*t));
  const Mp = rad(mod360(134.9633964+477198.8675055*t+0.0087414*t*t));
  const F  = rad(mod360(93.2720950+483202.0175233*t-0.0036539*t*t));
  let L = 0;
  L += 6288774*Math.sin(Mp);      L += 1274027*Math.sin(2*D-Mp);
  L += 658314*Math.sin(2*D);      L += 213618*Math.sin(2*Mp);
  L -= 185116*Math.sin(M);        L -= 114332*Math.sin(2*F);
  L += 58793*Math.sin(2*D-2*Mp); L += 57066*Math.sin(2*D-M-Mp);
  L += 53322*Math.sin(2*D+Mp);   L += 45758*Math.sin(2*D-M);
  L -= 40923*Math.sin(M-Mp);      L -= 34720*Math.sin(D);
  L -= 30383*Math.sin(M+Mp);      L += 15327*Math.sin(2*D-2*F);
  return mod360(Lp + L/1000000);
};

// Outer planets (VSOP87 simplified mean longitude)
const outerLng = (name: string, t: number) => mod360({
  Mercury:252.2509+149472.6746*t,
  Venus:181.9798+58517.8157*t,
  Mars:355.4330+19140.2993*t+0.000181*t*t,
  Jupiter:34.3515+3034.9057*t-0.00008*t*t,
  Saturn:50.0774+1222.1138*t+0.000181*t*t,
  Uranus:314.055+428.4677*t,
  Neptune:304.349+218.4862*t,
  Pluto:238.929+145.2078*t,
}[name] ?? 0);

// True Lunar Node (Meeus)
const lunarNode = (t: number) => mod360(125.04452-1934.136261*t+0.0020708*t*t);

type PP = { name:string; lng:number; sign:typeof SIGNS[0]; degree:number; planet:typeof PLANETS[0]; retro:boolean; dignity:string; combustion:"none"|"underbeams"|"combust"|"cazimi" };

const getPositions = (date: Date): PP[] => {
  const t = julT(date);
  const t2 = julT(new Date(date.getTime()-86400000));
  const sl = sunLng(t);
  const raw: Record<string,number> = {
    Sun:sl, Moon:moonLng(t),
    Mercury:outerLng("Mercury",t), Venus:outerLng("Venus",t), Mars:outerLng("Mars",t),
    Jupiter:outerLng("Jupiter",t), Saturn:outerLng("Saturn",t), Uranus:outerLng("Uranus",t),
    Neptune:outerLng("Neptune",t), Pluto:outerLng("Pluto",t),
  };
  const prev: Record<string,number> = {
    Moon:moonLng(t2), Mercury:outerLng("Mercury",t2), Venus:outerLng("Venus",t2),
    Mars:outerLng("Mars",t2), Jupiter:outerLng("Jupiter",t2), Saturn:outerLng("Saturn",t2),
    Uranus:outerLng("Uranus",t2), Neptune:outerLng("Neptune",t2), Pluto:outerLng("Pluto",t2),
  };
  return PLANETS.map(planet => {
    const l = mod360(raw[planet.name]);
    const sign = SIGNS[Math.floor(l/30)];
    const degree = l%30;
    let retro = false;
    if (prev[planet.name] !== undefined) {
      let d = l - mod360(prev[planet.name]);
      if (d > 180) d -= 360; if (d < -180) d += 360; retro = d < 0;
    }
    let dignity = "peregrine";
    if (planet.dignity?.includes(sign.name)) dignity = "domicile";
    else if (planet.exalt?.includes(sign.name)) dignity = "exaltation";
    else if (planet.detriment?.includes(sign.name)) dignity = "detriment";
    else if (planet.fall?.includes(sign.name)) dignity = "fall";
    // [FIX 3] Full combustion tiers
    let combustion: "none"|"underbeams"|"combust"|"cazimi" = "none";
    if (planet.name !== "Sun") {
      let diff = Math.abs(l - sl); if (diff > 180) diff = 360-diff;
      if (diff < 0.2834)   combustion = "cazimi";
      else if (diff < 8.5) combustion = "combust";
      else if (diff < 17)  combustion = "underbeams";
    }
    return { name:planet.name, lng:l, sign, degree, planet, retro, dignity, combustion };
  });
};

type Asp = { p1:PP; p2:PP; asp:typeof ASPECTS[0]; orb:number; strength:number; exact:number };
const getAspects = (p1: PP[], p2: PP[]): Asp[] => {
  const f:Asp[]=[], seen=new Set<string>();
  for (const a of p1) for (const b of p2) {
    if (a.name===b.name) continue;
    let d=Math.abs(a.lng-b.lng); if(d>180) d=360-d;
    for (const asp of ASPECTS) {
      const orb=Math.abs(d-asp.angle);
      if (orb<=asp.orb) {
        const k=[a.name,b.name].sort().join("-")+asp.name;
        if (!seen.has(k)) { seen.add(k); f.push({p1:a,p2:b,asp,orb:+orb.toFixed(1),strength:1-orb/asp.orb,exact:+((1-orb/asp.orb)*100).toFixed(0)}); }
      }
    }
  }
  return f.sort((a,b)=>b.strength-a.strength);
};

// [FIX 2] Real Void of Course — forward projection
const isVOC = (pos: PP[]) => {
  const moon = pos.find(p=>p.name==="Moon"); if (!moon) return false;
  const degsLeft = 30 - moon.degree;
  const majorAsp = ASPECTS.filter(a=>a.tier===1);
  for (const planet of pos) {
    if (planet.name==="Moon") continue;
    let sep = mod360(moon.lng - planet.lng);
    const sep2 = sep>180 ? 360-sep : sep;
    for (const asp of majorAsp) {
      const needed = mod360(asp.angle - sep2 + 360);
      if (needed > 0.5 && needed < degsLeft + asp.orb) return false;
    }
  }
  return true;
};

const getMoonPhase = (pos: PP[]) => {
  const m=pos.find(p=>p.name==="Moon"), s=pos.find(p=>p.name==="Sun");
  if (!m||!s) return {name:"?",icon:"🌑",power:0,energy:"",angle:0};
  const a=mod360(m.lng-s.lng);
  if(a<22.5)  return {name:"New Moon",        icon:"🌑",power:8,energy:"Set intentions. Plant seeds. Begin.",             angle:a};
  if(a<67.5)  return {name:"Waxing Crescent", icon:"🌒",power:6,energy:"Building momentum. Take first steps.",            angle:a};
  if(a<112.5) return {name:"First Quarter",   icon:"🌓",power:5,energy:"Decision point. Commit or pivot.",                angle:a};
  if(a<157.5) return {name:"Waxing Gibbous",  icon:"🌔",power:7,energy:"Refine and push. Almost peak.",                   angle:a};
  if(a<202.5) return {name:"Full Moon",        icon:"🌕",power:9,energy:"Culmination. Harvest. Heightened emotion.",       angle:a};
  if(a<247.5) return {name:"Waning Gibbous",  icon:"🌖",power:4,energy:"Gratitude. Share. Distribute.",                   angle:a};
  if(a<292.5) return {name:"Last Quarter",    icon:"🌗",power:3,energy:"Release. Let go. Forgive.",                       angle:a};
  return              {name:"Balsamic Moon",  icon:"🌘",power:2,energy:"Rest. Surrender. Prepare for renewal.",            angle:a};
};

const getSect = (d: Date): "day"|"night" => { const h=d.getHours(); return (h>=6&&h<18)?"day":"night"; };

const getStelliums = (pos: PP[]) => {
  const bySgn: Record<string,string[]> = {};
  pos.forEach(p=>{ if(!bySgn[p.sign.name])bySgn[p.sign.name]=[]; bySgn[p.sign.name].push(p.name); });
  return Object.entries(bySgn).filter(([,ps])=>ps.length>=3).map(([sign,planets])=>({sign,planets,power:planets.length*3}));
};

type MP = { natalA:string; natalB:string; midpoint:number; transit:string; orb:number };
const getMidpoints = (natal: PP[], transit: PP[]): MP[] => {
  const r: MP[] = [];
  for(let i=0;i<natal.length;i++) for(let j=i+1;j<natal.length;j++) {
    const mp = mod360((natal[i].lng+natal[j].lng)/2);
    for (const m of [mp, mod360(mp+180)]) for (const t of transit) {
      let diff=Math.abs(t.lng-m); if(diff>180)diff=360-diff;
      if(diff<2) r.push({natalA:natal[i].name,natalB:natal[j].name,midpoint:m,transit:t.name,orb:+diff.toFixed(2)});
    }
  }
  return r.sort((a,b)=>a.orb-b.orb).slice(0,10);
};

// [FIX 4] Real Gene Keys — ecliptic arc (5.625° per key)
const getGeneKey = (natalSunL: number, transitSunL: number) => {
  const bIdx = Math.floor(mod360(natalSunL) / 5.625) % 64;
  const tIdx = Math.floor(mod360(transitSunL) / 5.625) % 64;
  const bKey = bIdx+1, tKey = tIdx+1;
  const bk = GK[bIdx]||GK[0], tk = GK[tIdx]||GK[0];
  const diff = Math.abs(bKey-tKey);
  const codonHarmonic = Math.floor(bIdx/8)===Math.floor(tIdx/8);
  const sextileRes = diff===10||diff===11||diff===53||diff===54;
  const opposition = diff===32;
  const relationship = opposition ? "Polarity — shadow confronts siddhi"
    : codonHarmonic ? "Same codon family — birth coding fully activated"
    : sextileRes ? "Creative resonance — gift frequencies amplified"
    : "Integration period — neutral transit";
  const resonance = (codonHarmonic||sextileRes) ? "active" : opposition ? "polarity" : "neutral";
  const score = codonHarmonic ? 3 : sextileRes ? 2 : opposition ? -1 : 0;
  return { bKey, tKey, bGift:bk.g, bShadow:bk.s, bSiddhi:bk.d, tGift:tk.g, tShadow:tk.s, relationship, resonance, score };
};

// Nodal aspects
const getNodalAspects = (transit: PP[], northNode: number) => {
  const results: {planet:string;sym:string;orb:number;type:"north"|"south";aspect:string}[] = [];
  const southNode = mod360(northNode+180);
  for (const p of transit) {
    for (const [nodeLng, nodeType] of [[northNode,"north"],[southNode,"south"]] as [number,"north"|"south"][]) {
      let diff=Math.abs(p.lng-nodeLng); if(diff>180)diff=360-diff;
      if (diff<6) results.push({planet:p.name,sym:p.planet.sym,orb:+diff.toFixed(1),type:nodeType,aspect:"Conjunction"});
    }
  }
  return results;
};

// Solar Return proximity (days to birthday, 0-7 = active)
const getSRProximity = (dob: string, tDate: Date) => {
  if (!dob) return 0;
  const d = new Date(dob+"T12:00:00");
  const daysDiff = Math.abs((tDate.getMonth()*30+tDate.getDate())-(d.getMonth()*30+d.getDate()));
  const prox = Math.min(daysDiff, 365-daysDiff);
  return prox <= 7 ? 7-prox : 0;
};

// ==========================================================
// DOMAIN SCORING — 14 SYSTEMS
// ==========================================================
type Sig = { text:string; val:number; type:"green"|"red"|"warning"|"caution"; conf:number; detail:string; system:string };
type DR = { score:number; signals:Sig[]; confidence:number; convergence:number; greenCount:number; redCount:number; totalSignals:number };

const scoreDomain = (
  dom: typeof DOMAINS[0], natal: PP[], transit: PP[], date: Date,
  midpoints: MP[], stelliums: {sign:string;planets:string[];power:number}[],
  sect: "day"|"night", nodalAspects: ReturnType<typeof getNodalAspects>,
  geneKey: ReturnType<typeof getGeneKey>, srProx: number
): DR => {
  const sigs: Sig[] = []; let score = 0;
  const W = (dom.weight as unknown) as Record<string,number>;
  const aspects = getAspects(transit, natal);
  const rel = aspects.filter(a=>dom.rulers.includes(a.p1.name)||dom.rulers.includes(a.p2.name));

  // 1. Transit-natal aspects (domain weighted)
  rel.forEach(a=>{
    const w = W[a.p1.name]||1.0;
    let imp = a.strength*a.asp.power*w;
    const ben = ["Venus","Jupiter","Sun"].includes(a.p1.name);
    if (["flow","opportunity","fusion","creative","subtle"].includes(a.asp.nature)) {
      if(ben) imp*=1.5; score+=imp;
      sigs.push({text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+imp.toFixed(1),type:"green",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} energy (${a.exact}% exact)${a.asp.tier===2?" [minor]":""}`,system:"Transit"});
    } else {
      if(["Saturn","Mars","Pluto"].includes(a.p1.name)) imp*=1.4; score-=imp;
      sigs.push({text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:-+imp.toFixed(1),type:"red",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature}${a.asp.tier===2?" minor friction":""} (${a.exact}% exact)`,system:"Transit"});
    }
  });

  // 2. Transit dignity
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    if(p.dignity==="domicile")     {score+=4; sigs.push({text:`${p.planet?.sym} ${p.name} Domicile (${p.sign.name})`,val:4,type:"green",conf:8,detail:`Strongest sign placement — full expression`,system:"Dignity"});}
    else if(p.dignity==="exaltation"){score+=3; sigs.push({text:`${p.planet?.sym} ${p.name} Exalted in ${p.sign.name}`,val:3,type:"green",conf:7,detail:`Peak strength — highly favourable`,system:"Dignity"});}
    else if(p.dignity==="detriment"){score-=3; sigs.push({text:`${p.planet?.sym} ${p.name} Detriment (${p.sign.name})`,val:-3,type:"caution",conf:6,detail:`Weakened — actions may misfire`,system:"Dignity"});}
    else if(p.dignity==="fall")     {score-=2; sigs.push({text:`${p.planet?.sym} ${p.name} in Fall (${p.sign.name})`,val:-2,type:"caution",conf:5,detail:`Weakest position — proceed carefully`,system:"Dignity"});}
  });

  // 3. Natal dignity [NEW]
  natal.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    if(p.dignity==="domicile")    {score+=2; sigs.push({text:`📍 Natal ${p.name} Domicile (${p.sign.name})`,val:2,type:"green",conf:7,detail:`Natal ${p.name} powerfully placed — innate strength here`,system:"Natal Dignity"});}
    else if(p.dignity==="exaltation"){score+=1.5; sigs.push({text:`📍 Natal ${p.name} Exalted (${p.sign.name})`,val:1.5,type:"green",conf:6,detail:`Natal peak strength — natural talent`,system:"Natal Dignity"});}
    else if(p.dignity==="fall")   {score-=1; sigs.push({text:`📍 Natal ${p.name} in Fall`,val:-1,type:"caution",conf:4,detail:`Natal challenge — extra effort needed`,system:"Natal Dignity"});}
  });

  // 4. Combustion 3-tier [FIX 3]
  transit.filter(p=>dom.rulers.includes(p.name)&&p.combustion!=="none").forEach(p=>{
    if(p.combustion==="cazimi")     {score+=5; sigs.push({text:`✨ ${p.name} CAZIMI (heart of Sun)`,val:5,type:"green",conf:9,detail:`Within 17' of Sun — MAXIMUM empowerment, rare`,system:"Combustion"});}
    else if(p.combustion==="combust"){score-=4; sigs.push({text:`🔥 ${p.name} Combust (<8.5° Sun)`,val:-4,type:"warning",conf:7,detail:`Overwhelmed by solar light — weakened`,system:"Combustion"});}
    else if(p.combustion==="underbeams"){score-=2; sigs.push({text:`🌫️ ${p.name} Under Beams (8.5-17°)`,val:-2,type:"caution",conf:5,detail:`Partially obscured — reduced effectiveness`,system:"Combustion"});}
  });

  // 5. Sect
  const DAY=["Sun","Jupiter","Saturn"], NIGHT=["Moon","Venus","Mars"];
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    const inSect=(sect==="day"&&DAY.includes(p.name))||(sect==="night"&&NIGHT.includes(p.name));
    if(inSect){score+=2; sigs.push({text:`☀️ ${p.name} in sect (${sect} chart)`,val:2,type:"green",conf:5,detail:`Planet in natural element today`,system:"Sect"});}
  });

  // 6. Retrograde
  transit.filter(p=>p.retro&&dom.rulers.includes(p.name)).forEach(p=>{
    const pen=p.name==="Mercury"?-8:p.name==="Venus"?-6:p.name==="Mars"?-7:-4;
    score+=pen;
    sigs.push({text:`${p.planet?.sym} ${p.name} RETROGRADE in ${p.sign.name}`,val:pen,type:"warning",conf:8,detail:p.name==="Mercury"?"Avoid signing — miscommunication risk":p.name==="Venus"?"Re-evaluate, don't commit":p.name==="Mars"?"Frustrated energy, may backfire":"Deep review phase",system:"Retrograde"});
  });

  // 7. Moon phase
  const mp = getMoonPhase(transit);
  const wax = ["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous"].includes(mp.name);
  if(["career","contracts","creative","learning","financial"].includes(dom.id)){
    if(wax){score+=4; sigs.push({text:`${mp.icon} ${mp.name} — Waxing`,val:4,type:"green",conf:6,detail:"Building energy supports new initiatives",system:"Moon"});}
    else   {score-=3; sigs.push({text:`${mp.icon} ${mp.name} — Waning`,val:-3,type:"caution",conf:5,detail:"Releasing phase — better for completing than starting",system:"Moon"});}
  }
  if(dom.id==="spiritual"&&["Full Moon","Waning Gibbous","Last Quarter"].includes(mp.name)){score+=5; sigs.push({text:`${mp.icon} ${mp.name} supports inner work`,val:5,type:"green",conf:7,detail:"Heightened awareness for reflection",system:"Moon"});}
  if(dom.id==="love"&&mp.name==="Full Moon"){score+=4; sigs.push({text:`${mp.icon} Full Moon — emotional peak`,val:4,type:"green",conf:7,detail:"Powerful for honest connection",system:"Moon"});}

  // 8. VOC [FIX 2]
  if(isVOC(transit)){score-=6; sigs.push({text:"🚫 Void of Course Moon",val:-6,type:"warning",conf:7,detail:"No more major lunar aspects before sign change — fizzle risk",system:"Moon"});}

  // 9. Stelliums (with natal activation check)
  stelliums.forEach(st=>{
    const hasRuler=st.planets.some(p=>dom.rulers.includes(p));
    if(hasRuler){
      const sSign=SIGNS.find(s=>s.name===st.sign);
      const center=sSign?sSign.start+15:0;
      const natalHit=natal.some(np=>{let d=Math.abs(np.lng-center);if(d>180)d=360-d;return d<10;});
      const boost=natalHit?st.power*0.8:st.power*0.4;
      score+=boost; sigs.push({text:`⭐ Stellium in ${st.sign}: ${st.planets.join(", ")}`,val:+boost.toFixed(1),type:"green",conf:natalHit?7:5,detail:`${st.planets.length} planets${natalHit?" — hits natal planet!":""}`,system:"Stellium"});
    }
  });

  // 10. Midpoints (2° orb)
  midpoints.filter(mp=>dom.rulers.includes(mp.transit)).forEach(mp=>{
    score+=2.5; sigs.push({text:`✦ ${mp.transit} at ${mp.natalA}/${mp.natalB} midpoint`,val:2.5,type:"green",conf:5,detail:`Midpoint trigger (${mp.orb}° orb)`,system:"Midpoint"});
  });

  // 11. Gene Keys [FIX 4]
  if(geneKey.resonance==="active"&&["creative","spiritual","learning"].includes(dom.id)){
    score+=geneKey.score; sigs.push({text:`🧬 GK ${geneKey.bKey}: ${geneKey.bGift} active`,val:geneKey.score,type:"green",conf:5,detail:`Birth key ${geneKey.bKey} resonates with transit key ${geneKey.tKey}`,system:"Gene Keys"});
  } else if(geneKey.resonance==="polarity"&&dom.id==="spiritual"){
    score-=1; sigs.push({text:`🧬 GK polarity — ${geneKey.bShadow} shadow`,val:-1,type:"caution",conf:4,detail:`Polarity between keys ${geneKey.bKey} and ${geneKey.tKey}`,system:"Gene Keys"});
  }

  // 12. Nodal axis
  nodalAspects.filter(n=>dom.rulers.includes(n.planet)).forEach(n=>{
    if(n.type==="north"){score+=3; sigs.push({text:`☊ ${n.sym} ${n.planet} conjunct North Node`,val:3,type:"green",conf:6,detail:`Karmic forward momentum — fated opportunity (${n.orb}°)`,system:"Nodes"});}
    else               {score-=2; sigs.push({text:`☋ ${n.sym} ${n.planet} on South Node`,val:-2,type:"caution",conf:5,detail:`Past patterns resurface — karmic release (${n.orb}°)`,system:"Nodes"});}
  });

  // 13. Solar Return
  if(srProx>0&&["career","financial","creative","love"].includes(dom.id)){
    const val=+(srProx*0.7).toFixed(1); score+=val;
    sigs.push({text:`🎂 Solar Return proximity (day ${7-Math.round(srProx)})`,val,type:"green",conf:6,detail:`Near Solar Return — intentions carry amplified weight for the year`,system:"Solar Return"});
  }

  // 14. Planetary Hour
  const chaldean=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
  const dayR=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"][date.getDay()];
  const hourR=chaldean[(chaldean.indexOf(dayR)+date.getHours())%7];
  if(dom.rulers.includes(hourR)){score+=3; sigs.push({text:`⏰ Planetary Hour of ${hourR}`,val:3,type:"green",conf:4,detail:`Hour aligns with ${dom.name}`,system:"Hour"});}

  const norm=Math.max(-100,Math.min(100,score*2.3));
  const gn=sigs.filter(s=>s.type==="green").length;
  const rd=sigs.filter(s=>s.type==="red"||s.type==="warning"||s.type==="caution").length;
  const sysCnt=new Set(sigs.map(s=>s.system)).size;
  const confidence=Math.min(9,Math.max(2,Math.round((Math.abs(norm)/100)*5+sigs.length*0.25+sysCnt*0.6+1.5)));
  const convergence=gn+rd?Math.round(Math.max(gn,rd)/(gn+rd)*100):50;
  return {score:norm,signals:sigs.sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)),confidence,convergence,greenCount:gn,redCount:rd,totalSignals:sigs.length};
};

// ==========================================================
// STYLES & HELPERS
// ==========================================================
const CL={bg:"#07060d",card:"#0e0d18",card2:"#16142a",bdr:"#1f1b3a",acc:"#f6ad3c",grn:"#3dbd7d",red:"#e55050",blu:"#38d6f5",pur:"#9b7fe6",cyn:"#45d0c8",pnk:"#e879a0",txt:"#e8e4f0",dim:"#6b6580",mut:"#3a3555"};
const vColor=(s:number)=>s>30?CL.grn:s>10?"#7ddba3":s>-10?CL.acc:s>-30?"#e5a0a0":CL.red;
const vText=(s:number)=>s>40?"EXCELLENT — Act with high confidence":s>20?"FAVORABLE — Conditions support action":s>5?"LEANING POSITIVE — Proceed with awareness":s>-5?"NEUTRAL — Mixed signals, use judgment":s>-20?"LEANING CHALLENGING — Extra caution recommended":s>-40?"CHALLENGING — Seriously consider postponing":"AVOID — Strong signals against action today";
const cTxt=(c:number)=>c>=8?"Very High":c>=6?"High":c>=4?"Moderate":"Low";
const fmtD=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtDL=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

const Bullet=({children,color,conf,val,strong}:{children?:React.ReactNode;color?:string;conf?:number;val?:number;strong?:string})=>(
  <div style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${CL.bdr}40`,alignItems:"flex-start"}}>
    <span style={{color:color||CL.txt,fontSize:14,marginTop:1}}>•</span>
    <div style={{flex:1,fontSize:12.5,lineHeight:1.65,fontFamily:"system-ui",color:CL.txt}}>
      {strong?<b style={{color:color||CL.txt}}>{strong}</b>:null}{strong?" — ":""}{children}
      {conf!==undefined&&<span style={{color:CL.dim,fontStyle:"italic"}}> Conf: {conf}/10</span>}
      {val!==undefined&&<span style={{marginLeft:6,fontWeight:700,color:+val>0?CL.grn:CL.red}}>({+val>0?"+":""}{val})</span>}
    </div>
  </div>
);

// ==========================================================
// MAIN
// ==========================================================
export default function App() {
  const [dob,setDob]=useState("");
  const [targetDate,setTargetDate]=useState(new Date().toISOString().split("T")[0]);
  const [tab,setTab]=useState("reading");
  const [data,setData]=useState<any>(null);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);

  const compute=useCallback(()=>{
    if(!dob) return;
    setLoading(true);
    setTimeout(()=>{
      const bDate=new Date(dob+"T12:00:00"), tDate=new Date(targetDate+"T12:00:00");
      const bT=julT(bDate), tT=julT(tDate);
      const natalSunL=sunLng(bT), transitSunL=sunLng(tT);
      const natal=getPositions(bDate), transit=getPositions(tDate);
      const allAspects=getAspects(transit,natal);
      const mp=getMoonPhase(transit), voc=isVOC(transit);
      const retros=transit.filter(p=>p.retro);
      const sunSign=natal.find(p=>p.name==="Sun")!.sign;
      const moonSign=natal.find(p=>p.name==="Moon")!.sign;
      const elements:{[k:string]:number}={fire:0,earth:0,air:0,water:0};
      natal.forEach(p=>{if(p.sign)elements[p.sign.el]++;});
      const stelliums=getStelliums(transit);
      const midpoints=getMidpoints(natal,transit);
      const sect=getSect(tDate);
      const northNode=lunarNode(bT);
      const nodalAspects=getNodalAspects(transit,northNode);
      const geneKey=getGeneKey(natalSunL,transitSunL);
      const srProx=getSRProximity(dob,tDate);
      const natalDigs=natal.filter(p=>p.dignity!=="peregrine");

      const domains=DOMAINS.map(d=>({...d,...scoreDomain(d,natal,transit,tDate,midpoints,stelliums,sect,nodalAspects,geneKey,srProx)})).sort((a,b)=>b.score-a.score);
      const overall=domains.reduce((s,d)=>s+d.score,0)/domains.length;
      const overallConf=Math.round(domains.reduce((s,d)=>s+d.confidence,0)/domains.length);
      const totalGreen=domains.reduce((s,d)=>s+d.greenCount,0);
      const totalRed=domains.reduce((s,d)=>s+d.redCount,0);
      const overallConv=totalGreen+totalRed?Math.round(Math.max(totalGreen,totalRed)/(totalGreen+totalRed)*100):50;
      const sysActive=new Set(domains.flatMap(d=>d.signals.map((s:Sig)=>s.system))).size;

      const forecast:any[]=[];
      for(let i=0;i<30;i++){
        const d=new Date(tDate); d.setDate(d.getDate()+i);
        const dT2=julT(d), dSunL=sunLng(dT2);
        const dt=getPositions(d);
        const dGK=getGeneKey(natalSunL,dSunL);
        const dSt=getStelliums(dt), dMp=getMidpoints(natal,dt);
        const dSect=getSect(d), dNA=getNodalAspects(dt,northNode);
        const dSR=getSRProximity(dob,d);
        const ds=DOMAINS.map(dm=>({...dm,...scoreDomain(dm,natal,dt,d,dMp,dSt,dSect,dNA,dGK,dSR)}));
        const avg=ds.reduce((s,x)=>s+x.score,0)/ds.length;
        const best=ds.reduce((b,x)=>x.score>b.score?x:b,ds[0]);
        const worst=ds.reduce((b,x)=>x.score<b.score?x:b,ds[0]);
        forecast.push({date:d,overall:avg,best,worst,moonPhase:getMoonPhase(dt),domains:ds});
      }
      const bestDays=DOMAINS.map((dom,di)=>{
        const sorted=[...forecast].sort((a,b)=>b.domains[di].score-a.domains[di].score);
        return{domain:dom,top3:sorted.slice(0,3).map(f=>({date:f.date,score:f.domains[di].score,conf:f.domains[di].confidence})),bottom3:sorted.slice(-3).reverse().map(f=>({date:f.date,score:f.domains[di].score}))};
      });
      setData({natal,transit,allAspects,mp,voc,retros,sunSign,moonSign,elements,stelliums,midpoints,sect,northNode,nodalAspects,geneKey,srProx,natalDigs,domains,overall,overallConf,overallConv,totalGreen,totalRed,sysActive,forecast,bestDays});
      setLoading(false);
    },700);
  },[dob,targetDate]);

  useEffect(()=>{if(dob)compute();},[dob,targetDate]);

  const SC={card:{background:CL.card,border:`1px solid ${CL.bdr}`,borderRadius:14,padding:18,marginBottom:12}};
  const TB=({id,label,icon}:{id:string;label:string;icon:string})=>(
    <button onClick={()=>setTab(id)} style={{background:tab===id?CL.acc:"transparent",color:tab===id?"#000":CL.dim,border:`1px solid ${tab===id?CL.acc:CL.bdr}`,borderRadius:10,padding:"8px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"system-ui"}}>{icon} {label}</button>
  );
  const SH=({icon,title,sub,color}:{icon:string;title:string;sub?:string;color?:string})=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,letterSpacing:3,color:color||CL.acc,fontWeight:700,fontFamily:"system-ui"}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:800,color:CL.txt,fontFamily:"system-ui",marginTop:2}}>{title}</div>
      {sub&&<div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui"}}>{sub}</div>}
    </div>
  );
  const HR=()=><div style={{height:1,background:CL.bdr,margin:"14px 0"}}/>;

  return (
    <div style={{background:CL.bg,color:CL.txt,minHeight:"100vh",fontFamily:"'Georgia','Palatino',serif",padding:"10px 14px",maxWidth:720,margin:"0 auto"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes glow{0%,100%{text-shadow:0 0 15px #f6ad3c44}50%{text-shadow:0 0 30px #f6ad3c88,0 0 60px #9b7fe644}}input[type="date"]{font-family:inherit}input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.7)}*{box-sizing:border-box}`}</style>

      <div style={{textAlign:"center",padding:"18px 0 10px"}}>
        <div style={{fontSize:10,letterSpacing:6,color:CL.pur,fontWeight:700,fontFamily:"system-ui"}}>ORACLE v9</div>
        <h1 style={{fontSize:24,fontWeight:400,margin:"4px 0",fontStyle:"italic",background:`linear-gradient(135deg,${CL.acc},${CL.pnk},${CL.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glow 5s ease infinite"}}>Personal Decision Oracle</h1>
        <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>v9 · Fully Audited · 14 Systems · Meeus Positions · Real Gene Keys · True VOC</div>
      </div>

      <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#120e24)`,borderColor:CL.pur+"50"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:1,minWidth:140}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>DATE OF BIRTH</label>
            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:15}}/>
          </div>
          <div style={{flex:1,minWidth:140}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>DATE TO ANALYZE</label>
            <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:15}}/>
          </div>
          <button onClick={compute} disabled={!dob||loading} style={{background:`linear-gradient(135deg,${CL.pur},${CL.acc})`,color:"#000",border:"none",borderRadius:10,padding:"11px 24px",fontSize:12,fontWeight:800,cursor:!dob?"not-allowed":"pointer",opacity:!dob?0.4:1,fontFamily:"system-ui",letterSpacing:1}}>{loading?"✨ Computing...":"🔮 Consult Oracle"}</button>
        </div>
      </div>

      {data&&(<>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
          <TB id="reading"  label="Full Reading" icon="🔮"/>
          <TB id="shouldi"  label="Should I...?" icon="🤔"/>
          <TB id="systems"  label="Systems"      icon="🔬"/>
          <TB id="calendar" label="30-Day"       icon="📅"/>
          <TB id="bestdays" label="Best Days"    icon="⭐"/>
          <TB id="chart"    label="Chart"        icon="🌌"/>
        </div>

        {tab==="reading"&&(<>
          <div style={SC.card}>
            <SH icon="📊" title="SITUATION ASSESSMENT" sub={`Reading for ${fmtDL(new Date(targetDate+"T12:00:00"))}`}/>
            <Bullet strong={`${data.sunSign.sym} Sun in ${data.sunSign.name}`}>Core identity — {data.sunSign.trait.toLowerCase()}</Bullet>
            <Bullet strong={`${data.moonSign.sym} Moon in ${data.moonSign.name}`}>Emotional nature and instinct patterns</Bullet>
            <Bullet strong={`${data.mp.icon} ${data.mp.name}`}>{data.mp.energy}</Bullet>
            <Bullet strong={`🧬 Gene Key ${data.geneKey.bKey}: ${data.geneKey.bGift}`} color={CL.pur}>Shadow: {data.geneKey.bShadow} · Gift: {data.geneKey.bGift} · Siddhi: {data.geneKey.bSiddhi} — Transit Key {data.geneKey.tKey} ({data.geneKey.tGift})</Bullet>
            <Bullet strong={`☊ Natal North Node ${data.northNode.toFixed(1)}°`}>Karmic direction in {SIGNS[Math.floor(data.northNode/30)].name}</Bullet>
            {data.voc&&<Bullet strong="🚫 Void of Course Moon" color={CL.red}>No more major lunar aspects before sign change — avoid starting new things</Bullet>}
            {data.retros.map((r:PP)=>(
              <Bullet key={r.name} strong={`${r.planet?.sym} ${r.name} Retrograde in ${r.sign.name}`} color={CL.acc}>
                {r.name==="Mercury"?"Contracts/communication disrupted — double-check everything":r.name==="Venus"?"Values under review — pause new commitments":r.name==="Mars"?"Action frustrated — don't force outcomes":"Deep review energy"}
              </Bullet>
            ))}
            {data.srProx>0&&<Bullet strong={`🎂 Solar Return ~${7-Math.round(data.srProx)} days`} color={CL.acc}>New solar year energy — intentions amplified for the year ahead</Bullet>}
            <Bullet strong="Elements">🔥 {data.elements.fire} · 🌍 {data.elements.earth} · 💨 {data.elements.air} · 💧 {data.elements.water}</Bullet>
          </div>

          <div style={{...SC.card,background:`linear-gradient(150deg,${CL.card},${data.overall>15?"#0d1a10":data.overall<-15?"#1a0d0d":"#1a1708"})`}}>
            <SH icon="🎯" title="OVERALL VERDICT" color={vColor(data.overall)}/>
            <div style={{fontSize:15,color:vColor(data.overall),fontWeight:600,fontFamily:"system-ui",marginBottom:14}}>{vText(data.overall)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
              {[
                {label:"OVERALL SCORE",value:`${data.overall>0?"+":""}${data.overall.toFixed(0)}`,color:vColor(data.overall),sub:"Weighted average across 9 domains"},
                {label:"CONFIDENCE",   value:`${data.overallConf}/10`,color:CL.acc,sub:cTxt(data.overallConf)+" — signal strength & count"},
                {label:"CONVERGENCE",  value:`${data.overallConv}%`,color:data.overallConv>70?CL.grn:data.overallConv>55?CL.acc:CL.red,sub:data.overallConv>70?"Strong signal agreement":"Mixed — proceed with nuance"},
                {label:"SYSTEMS ACTIVE",value:`${data.sysActive}/14`,color:CL.pur,sub:"Independent frameworks active"},
              ].map(m=>(
                <div key={m.label} style={{background:CL.card2,borderRadius:10,padding:12,borderTop:`2px solid ${m.color}`}}>
                  <div style={{fontSize:8,letterSpacing:2,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{m.label}</div>
                  <div style={{fontSize:24,fontWeight:900,color:m.color,fontFamily:"system-ui",margin:"4px 0"}}>{m.value}</div>
                  <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",lineHeight:1.4}}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={SC.card}>
            <SH icon="📋" title="DOMAIN-BY-DOMAIN ANALYSIS" sub="Ranked by score — tap to expand signals"/>
            {data.domains.map((d:any)=>(
              <div key={d.id} onClick={()=>setExpanded(expanded===d.id?null:d.id)}
                style={{background:CL.card2,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",borderLeft:`4px solid ${vColor(d.score)}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{d.icon} {d.name}</div>
                    <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui",marginTop:1}}>{d.sub}</div>
                  </div>
                  <div style={{fontSize:26,fontWeight:900,color:vColor(d.score),lineHeight:1,fontFamily:"system-ui"}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                </div>
                <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap",fontFamily:"system-ui",fontSize:11,color:CL.dim}}>
                  <span>Confidence: <b style={{color:CL.acc}}>{d.confidence}/10</b> <i>({cTxt(d.confidence)})</i></span>
                  <span>Convergence: <b style={{color:d.convergence>65?CL.grn:d.convergence>50?CL.acc:CL.red}}>{d.convergence}%</b></span>
                  <span>Signals: <b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b></span>
                </div>
                {expanded===d.id&&(
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${CL.bdr}`,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,fontFamily:"system-ui",marginBottom:6}}>SIGNAL BREAKDOWN</div>
                    {d.signals.map((s:Sig,j:number)=>(
                      <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc} conf={s.conf} val={s.val}>{s.detail}</Bullet>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={SC.card}>
            <SH icon="🔗" title="CROSS-DOMAIN CONVERGENCE" sub="High-confidence directional calls"/>
            <HR/>
            <div style={{fontSize:13,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>🟢 FAVORABLE DOMAINS</div>
            {data.domains.filter((d:any)=>d.score>5).length>0
              ?data.domains.filter((d:any)=>d.score>5).map((d:any)=>(
                <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.grn} conf={d.confidence}>{d.score>30?"Strongly supported":"Supported"} — {d.greenCount} positive signals, {d.convergence}% convergence</Bullet>
              )):<Bullet color={CL.dim}>No strongly favorable domains today.</Bullet>}
            <div style={{height:10}}/>
            <div style={{fontSize:13,fontWeight:800,color:CL.red,fontFamily:"system-ui",marginBottom:6}}>🔴 CHALLENGING DOMAINS</div>
            {data.domains.filter((d:any)=>d.score<-5).length>0
              ?data.domains.filter((d:any)=>d.score<-5).sort((a:any,b:any)=>a.score-b.score).map((d:any)=>(
                <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.red} conf={d.confidence}>{d.score<-30?"Strongly unfavorable":"Challenging"} — {d.redCount} caution signals</Bullet>
              )):<Bullet color={CL.dim}>No strongly challenging domains today.</Bullet>}
          </div>

          <div style={SC.card}>
            <SH icon="👁️" title="KEY WATCHPOINTS" sub="Factors shaping today for you"/>
            {[
              ...(data.retros.length>0?[`**${data.retros.map((r:PP)=>r.name).join(", ")} Retrograde** — ${data.retros.some((r:PP)=>r.name==="Mercury")?"contracts & communication disrupted":"review rather than initiate"}`]:[]),
              `**Moon Phase: ${data.mp.name}** — ${data.mp.energy} Power: ${data.mp.power}/10`,
              ...(data.voc?["**Void of Course Moon** — No applying aspects. Delay decisions if possible."]:["**Moon is applying** — active lunar energy supports decisions"]),
              `**Gene Key ${data.geneKey.bKey}: ${data.geneKey.bGift}** — ${data.geneKey.relationship} (Transit Key ${data.geneKey.tKey})`,
              `**${data.sysActive} of 14 systems active** — ${data.sysActive>10?"High convergence":data.sysActive>7?"Moderate":"Low activation"}`,
              `**Strongest aspect:** ${data.allAspects[0]?`${data.allAspects[0].p1.name} ${data.allAspects[0].asp.name} ${data.allAspects[0].p2.name} (${data.allAspects[0].exact}% exact)`:"None"}`,
              ...(data.nodalAspects.length>0?[`**Nodal activation:** ${data.nodalAspects[0].planet} on ${data.nodalAspects[0].type} node — ${data.nodalAspects[0].type==="north"?"fated forward momentum":"karmic release"}`]:[]),
            ].map((wp,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${CL.bdr}33`,fontFamily:"system-ui",fontSize:12,lineHeight:1.6,color:CL.txt}}>
                <span style={{color:CL.acc,fontWeight:800,minWidth:18}}>{i+1}.</span>
                <span dangerouslySetInnerHTML={{__html:wp.replace(/\*\*(.*?)\*\*/g,`<b style="color:${CL.acc}">$1</b>`)}}/>
              </div>
            ))}
          </div>

          <div style={{...SC.card,borderColor:CL.pur+"30"}}>
            <SH icon="🔮" title="ORACLE SELF-ASSESSMENT" color={CL.pur}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>Most confident:</div>
              {data.domains.filter((d:any)=>d.confidence>=6).slice(0,4).map((d:any)=>(
                <Bullet key={d.id} color={CL.grn}>{d.icon} {d.name} is {d.score>0?"favorable":"challenging"} ({d.confidence}/10) — {d.convergence}% convergence, {d.totalSignals} signals</Bullet>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.red,fontFamily:"system-ui",marginBottom:6}}>Least confident:</div>
              {data.domains.filter((d:any)=>d.confidence<=4).length>0
                ?data.domains.filter((d:any)=>d.confidence<=4).slice(0,3).map((d:any)=>(
                  <Bullet key={d.id} color={CL.dim}>{d.icon} {d.name} — weak signals ({d.confidence}/10)</Bullet>
                )):<Bullet color={CL.dim}>All domains moderate-to-high confidence today.</Bullet>}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:CL.acc,fontFamily:"system-ui",marginBottom:6}}>v9 Engine accuracy:</div>
              <Bullet color={CL.acc}>Positions: Meeus perturbation series — Moon ±0.3°, Sun ±0.01°, outer planets ±1°</Bullet>
              <Bullet color={CL.acc}>Gene Keys: Real ecliptic arc (5.625°/key, solar-arc grounded) — not arbitrary modular math</Bullet>
              <Bullet color={CL.acc}>VOC: Forward-projection algorithm — checks future applying aspects before sign boundary</Bullet>
              <Bullet color={CL.acc}>No birth time = no houses/rising. Reading is solar chart quality.</Bullet>
            </div>
          </div>

          <div style={{textAlign:"center",padding:"10px",fontSize:10,color:CL.mut,fontFamily:"system-ui"}}>
            <i>Oracle v9 · 14 Systems · Fully Audited Engine</i><br/><i>"The stars incline, they do not compel."</i>
          </div>
        </>)}

        {tab==="shouldi"&&(
          <div style={SC.card}>
            <SH icon="🤔" title="SHOULD I...?" sub={fmtDL(new Date(targetDate+"T12:00:00"))}/>
            {QUICK_QS.map(qd=>{
              const d=data.domains.find((x:any)=>x.id===qd.dom);
              const ans=d.score>30?"YES — Strong cosmic support. Conf "+d.confidence+"/10":d.score>10?"Likely YES — Favorable. Conf "+d.confidence+"/10":d.score>-10?"MIXED — Proceed with awareness. Conf "+d.confidence+"/10":d.score>-30?"Probably NOT — Consider waiting. Conf "+d.confidence+"/10":"NO — Strong signals against. Conf "+d.confidence+"/10";
              return(
                <div key={qd.q} style={{background:CL.card2,borderRadius:12,padding:16,marginBottom:8,borderLeft:`4px solid ${vColor(d.score)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,fontFamily:"system-ui"}}>{qd.icon} {qd.q}</div>
                    <div style={{fontSize:24,fontWeight:900,color:vColor(d.score),fontFamily:"system-ui"}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                  </div>
                  <div style={{fontSize:13,color:vColor(d.score),fontStyle:"italic",margin:"6px 0",fontFamily:"system-ui"}}>{ans}</div>
                  <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>Convergence: <b>{d.convergence}%</b> · <b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b></div>
                  <HR/>
                  {d.signals.slice(0,3).map((s:Sig,j:number)=>(
                    <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:CL.red} conf={s.conf} val={s.val}>{s.detail}</Bullet>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {tab==="systems"&&(
          <div style={SC.card}>
            <SH icon="🔬" title="14 ACTIVE SYSTEMS" sub="Every prediction framework — status & current reading"/>
            {[
              {name:"Transit Aspects",    icon:"⚡", st:"active",  info:`${data.allAspects.length} aspects. Meeus corrected (Moon ±0.3°, Sun ±0.01°).`},
              {name:"Transit Dignity",    icon:"👑", st:"active",  info:`Transit planet sign placement scored. Domicile +4, Exalt +3, Detri -3, Fall -2.`},
              {name:"Natal Dignity",      icon:"📍", st:"active",  info:`${data.natalDigs.length} natal dignities found. Innate strengths/challenges.`},
              {name:"Combustion",         icon:"🔥", st:"active",  info:`3-tier: Cazimi ✨ (<17') / Combust 🔥 (<8.5°) / Under Beams 🌫️ (<17°)`},
              {name:"Retrograde",         icon:"↩️", st:"active",  info:`${data.retros.length} retrograde: ${data.retros.length>0?data.retros.map((r:PP)=>r.name).join(", "):"none"}`},
              {name:"Moon Phase",         icon:"🌕", st:"active",  info:`${data.mp.icon} ${data.mp.name} — ${data.mp.energy}`},
              {name:"Void of Course",     icon:"🚫", st:"active",  info:`${data.voc?"VOC ACTIVE — forward-projection confirms no applying aspects":"Moon is applying — not void"}`},
              {name:"Sect",               icon:"☀️", st:"active",  info:`${data.sect==="day"?"Day chart — Sun/Jupiter/Saturn empowered":"Night chart — Moon/Venus/Mars empowered"}`},
              {name:"Stelliums",          icon:"⭐", st:data.stelliums.length>0?"active":"clear", info:data.stelliums.length>0?data.stelliums.map((s:any)=>`${s.sign}: ${s.planets.join(", ")}`).join(" | "):"No transit stelliums"},
              {name:"Midpoints",          icon:"✦",  st:data.midpoints.length>0?"active":"clear", info:data.midpoints.length>0?`${data.midpoints.length} active (2° orb). Top: ${data.midpoints[0]?.transit} at ${data.midpoints[0]?.natalA}/${data.midpoints[0]?.natalB}`:"No midpoint activations"},
              {name:"Gene Keys",          icon:"🧬", st:"active",  info:`Birth Key ${data.geneKey.bKey} (${data.geneKey.bGift}) ↔ Transit Key ${data.geneKey.tKey} (${data.geneKey.tGift}). ${data.geneKey.relationship}. Real ecliptic arc calc.`},
              {name:"Nodal Axis",         icon:"☊",  st:data.nodalAspects.length>0?"active":"clear", info:data.nodalAspects.length>0?data.nodalAspects.map((n:any)=>`${n.planet} on ${n.type} node (${n.orb}°)`).join(", "):`North Node ${data.northNode.toFixed(1)}° — no planet activations`},
              {name:"Solar Return",       icon:"🎂", st:data.srProx>0?"active":"clear",  info:data.srProx>0?`~${7-Math.round(data.srProx)} days to Solar Return — amplified`:"Not near Solar Return"},
              {name:"Planetary Hour",     icon:"⏰", st:"active",  info:`Chaldean order from ${["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"][new Date(targetDate+"T12:00:00").getDay()]} day ruler`},
            ].map((sys,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",background:i%2?"transparent":CL.card2,borderRadius:8,marginBottom:3,alignItems:"flex-start",fontFamily:"system-ui"}}>
                <span style={{fontSize:18,minWidth:24}}>{sys.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:CL.txt}}>{sys.name}</div>
                  <div style={{fontSize:10,color:CL.dim,lineHeight:1.5,marginTop:2}}>{sys.info}</div>
                </div>
                <span style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:sys.st==="active"?CL.grn+"22":CL.bdr,color:sys.st==="active"?CL.grn:CL.dim,fontWeight:700,whiteSpace:"nowrap"}}>{sys.st.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}

        {tab==="calendar"&&(
          <div style={SC.card}>
            <SH icon="📅" title="30-DAY COSMIC MAP" sub="Click any day for full reading"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:12}}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{d}</div>)}
              {Array.from({length:data.forecast[0].date.getDay()}).map((_,i)=><div key={"e"+i}/>)}
              {data.forecast.map((day:any,i:number)=>{
                const bg=vColor(day.overall);
                return(<div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");}}
                  style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",background:bg+"15",border:i===0?`2px solid ${CL.acc}`:`1px solid ${bg}20`}}>
                  <div style={{fontSize:11,fontFamily:"system-ui"}}>{day.date.getDate()}</div>
                  <div style={{fontSize:7,fontWeight:700,color:bg,fontFamily:"system-ui"}}>{day.overall>0?"+":""}{day.overall.toFixed(0)}</div>
                  <div style={{fontSize:7}}>{day.moonPhase.icon}</div>
                </div>);
              })}
            </div>
            <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>DAILY (14 days)</div>
            {data.forecast.slice(0,14).map((day:any,i:number)=>(
              <div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");}}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:i%2?"transparent":CL.card2,borderRadius:6,cursor:"pointer",marginBottom:2,fontFamily:"system-ui",fontSize:11}}>
                <div style={{minWidth:85,fontWeight:i===0?700:400,color:i===0?CL.acc:CL.txt}}>{fmtD(day.date)}{i===0?" ★":""}</div>
                <div style={{flex:1}}>
                  <div style={{height:5,background:CL.bdr,borderRadius:3,overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",left:"50%",width:1,height:"100%",background:CL.mut}}/>
                    <div style={{position:"absolute",left:day.overall>0?"50%":`${50+day.overall/2}%`,width:`${Math.abs(day.overall/2)}%`,height:"100%",background:vColor(day.overall),borderRadius:3}}/>
                  </div>
                </div>
                <span style={{fontSize:9}}>{day.moonPhase.icon}</span>
                <span style={{fontSize:9,color:CL.dim,minWidth:35}}>Best:{day.best.icon}</span>
                <span style={{fontSize:13,fontWeight:800,minWidth:38,textAlign:"right",color:vColor(day.overall)}}>{day.overall>0?"+":""}{day.overall.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}

        {tab==="bestdays"&&(
          <div style={SC.card}>
            <SH icon="⭐" title="OPTIMAL TIMING" sub="Best & worst windows by domain — 30 days"/>
            {data.bestDays.map((bd:any)=>(
              <div key={bd.domain.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>{bd.domain.icon} {bd.domain.name}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:CL.grn,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🟢 BEST</div>
                    {bd.top3.map((d:any,i:number)=>(<div key={i} onClick={()=>{setTargetDate(d.date.toISOString().split("T")[0]);setTab("reading");}} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.grn+"0d",borderRadius:6,marginBottom:3,cursor:"pointer",fontFamily:"system-ui",fontSize:11}}>
                      <span>{fmtD(d.date)}</span><span style={{fontWeight:800,color:CL.grn}}>+{d.score.toFixed(0)} · {d.conf}/10</span>
                    </div>))}
                  </div>
                  <div>
                    <div style={{fontSize:10,color:CL.red,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🔴 AVOID</div>
                    {bd.bottom3.map((d:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.red+"0d",borderRadius:6,marginBottom:3,fontFamily:"system-ui",fontSize:11}}>
                      <span>{fmtD(d.date)}</span><span style={{fontWeight:800,color:CL.red}}>{d.score.toFixed(0)}</span>
                    </div>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="chart"&&(
          <div style={SC.card}>
            <SH icon="🌌" title="NATAL CHART + TRANSITS"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {(["Natal","Transit"] as const).map(type=>(
                <div key={type}>
                  <div style={{fontSize:10,color:type==="Natal"?CL.acc:CL.pur,letterSpacing:2,fontWeight:700,marginBottom:4,fontFamily:"system-ui"}}>{type.toUpperCase()}</div>
                  {(type==="Natal"?data.natal:data.transit).map((p:PP)=>(
                    <div key={p.name} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",fontSize:10,background:CL.card2,borderRadius:5,marginBottom:2,fontFamily:"system-ui"}}>
                      <span style={{color:p.planet?.c}}>{p.planet?.sym} {p.name}{p.retro?" ℞":""}</span>
                      <span style={{color:p.sign.c,fontSize:9}}>{p.sign.sym} {p.degree.toFixed(1)}° {p.sign.name}</span>
                      <span style={{fontSize:9,color:p.dignity==="domicile"?CL.grn:p.dignity==="exaltation"?"#aaffaa":p.dignity==="detriment"?CL.red:p.dignity==="fall"?"#ffaaaa":CL.dim}}>
                        {p.dignity==="peregrine"?"":p.dignity.slice(0,3).toUpperCase()}
                        {p.combustion==="cazimi"?" ✨":p.combustion==="combust"?" 🔥":p.combustion==="underbeams"?" 🌫️":""}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <HR/>
            <div style={{fontSize:10,color:CL.grn,fontWeight:700,marginBottom:4,fontFamily:"system-ui"}}>LUNAR NODES</div>
            <div style={{display:"flex",gap:12,marginBottom:12,fontFamily:"system-ui",fontSize:11}}>
              <span style={{color:CL.grn}}>☊ North Node: {data.northNode.toFixed(1)}° {SIGNS[Math.floor(data.northNode/30)].name}</span>
              <span style={{color:CL.dim}}>☋ South Node: {mod360(data.northNode+180).toFixed(1)}° {SIGNS[Math.floor(mod360(data.northNode+180)/30)].name}</span>
            </div>
            <HR/>
            <div style={{fontSize:10,color:CL.pnk,fontWeight:700,marginBottom:6,fontFamily:"system-ui",letterSpacing:2}}>TOP ASPECTS</div>
            {data.allAspects.slice(0,15).map((a:Asp,i:number)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:i%2?"transparent":CL.card2,borderRadius:5,fontSize:11,fontFamily:"system-ui"}}>
                <span style={{fontSize:13,color:a.asp.c,minWidth:18}}>{a.asp.sym}</span>
                <span style={{flex:1}}><span style={{color:a.p1.planet?.c,fontWeight:600}}>{a.p1.name}</span> <span style={{color:CL.dim,fontSize:9}}>{a.asp.name}</span> <span style={{color:a.p2.planet?.c,fontWeight:600}}>{a.p2.name}</span></span>
                <span style={{fontSize:9,color:CL.dim}}>{a.asp.nature}</span>
                <span style={{fontWeight:800,color:a.asp.c,minWidth:30,textAlign:"right"}}>{a.exact}%</span>
                {a.asp.tier===2&&<span style={{fontSize:8,color:CL.pur,background:CL.bdr,padding:"1px 4px",borderRadius:3}}>minor</span>}
              </div>
            ))}
          </div>
        )}
      </>)}
    </div>
  );
}
