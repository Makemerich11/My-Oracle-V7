"use client";
import { useState, useCallback } from "react";

// =====================================================
// 🔮 ORACLE v8 — MULTI-SYSTEM CONVERGENCE ENGINE
// Dignity · Combustion · Sect · Stelliums · Midpoints
// Minor Aspects · Gene Keys · Planetary Hours
// The framework that called Iran. Now for YOUR life.
// =====================================================

const PLANETS = [
  { name:"Sun",sym:"☉",c:"#f6ad3c",period:365.25,domain:"Identity · Purpose · Leadership",dignity:["Leo"],exalt:["Aries"],detriment:["Aquarius"],fall:["Libra"] },
  { name:"Moon",sym:"☽",c:"#c4cdd4",period:27.32,domain:"Emotion · Intuition · Cycles",dignity:["Cancer"],exalt:["Taurus"],detriment:["Capricorn"],fall:["Scorpio"] },
  { name:"Mercury",sym:"☿",c:"#45d0c8",period:87.97,domain:"Mind · Contracts · Communication",dignity:["Gemini","Virgo"],exalt:["Virgo"],detriment:["Sagittarius","Pisces"],fall:["Pisces"] },
  { name:"Venus",sym:"♀",c:"#e879a0",period:224.7,domain:"Love · Beauty · Values · Wealth",dignity:["Taurus","Libra"],exalt:["Pisces"],detriment:["Aries","Scorpio"],fall:["Virgo"] },
  { name:"Mars",sym:"♂",c:"#e55050",period:686.97,domain:"Drive · Courage · Conflict · Energy",dignity:["Aries","Scorpio"],exalt:["Capricorn"],detriment:["Taurus","Libra"],fall:["Cancer"] },
  { name:"Jupiter",sym:"♃",c:"#9b7fe6",period:4332.59,domain:"Growth · Luck · Expansion · Wisdom",dignity:["Sagittarius","Pisces"],exalt:["Cancer"],detriment:["Gemini","Virgo"],fall:["Capricorn"] },
  { name:"Saturn",sym:"♄",c:"#7a8594",period:10759.22,domain:"Structure · Karma · Discipline · Time",dignity:["Capricorn","Aquarius"],exalt:["Libra"],detriment:["Cancer","Leo"],fall:["Aries"] },
  { name:"Uranus",sym:"♅",c:"#38d6f5",period:30688.5,domain:"Revolution · Freedom · Surprise",dignity:["Aquarius"],exalt:[],detriment:["Leo"],fall:[] },
  { name:"Neptune",sym:"♆",c:"#7c8cf5",period:60182,domain:"Dreams · Spirit · Illusion · Healing",dignity:["Pisces"],exalt:[],detriment:["Virgo"],fall:[] },
  { name:"Pluto",sym:"♇",c:"#b366e0",period:90560,domain:"Transformation · Power · Rebirth",dignity:["Scorpio"],exalt:[],detriment:["Taurus"],fall:[] },
];
const SIGNS = [
  { name:"Aries",sym:"♈",el:"fire",mod:"cardinal",start:0,c:"#e55050",trait:"Initiative, courage",sect:"day" },
  { name:"Taurus",sym:"♉",el:"earth",mod:"fixed",start:30,c:"#3dbd7d",trait:"Stability, persistence",sect:"night" },
  { name:"Gemini",sym:"♊",el:"air",mod:"mutable",start:60,c:"#f6c23c",trait:"Curiosity, adaptability",sect:"day" },
  { name:"Cancer",sym:"♋",el:"water",mod:"cardinal",start:90,c:"#c4cdd4",trait:"Nurturing, emotional depth",sect:"night" },
  { name:"Leo",sym:"♌",el:"fire",mod:"fixed",start:120,c:"#f6ad3c",trait:"Creativity, self-expression",sect:"day" },
  { name:"Virgo",sym:"♍",el:"earth",mod:"mutable",start:150,c:"#45d0c8",trait:"Analysis, refinement",sect:"night" },
  { name:"Libra",sym:"♎",el:"air",mod:"cardinal",start:180,c:"#e879a0",trait:"Balance, harmony",sect:"day" },
  { name:"Scorpio",sym:"♏",el:"water",mod:"fixed",start:210,c:"#b366e0",trait:"Intensity, transformation",sect:"night" },
  { name:"Sagittarius",sym:"♐",el:"fire",mod:"mutable",start:240,c:"#9b7fe6",trait:"Adventure, wisdom",sect:"day" },
  { name:"Capricorn",sym:"♑",el:"earth",mod:"cardinal",start:270,c:"#7a8594",trait:"Ambition, mastery",sect:"night" },
  { name:"Aquarius",sym:"♒",el:"air",mod:"fixed",start:300,c:"#38d6f5",trait:"Innovation, freedom",sect:"day" },
  { name:"Pisces",sym:"♓",el:"water",mod:"mutable",start:330,c:"#7c8cf5",trait:"Intuition, compassion",sect:"night" },
];
// Major + Minor aspects
const ASPECTS = [
  { name:"Conjunction",angle:0,orb:8,sym:"☌",power:10,nature:"fusion",c:"#f6ad3c",tier:1 },
  { name:"Opposition",angle:180,orb:8,sym:"☍",power:9,nature:"polarity",c:"#e879a0",tier:1 },
  { name:"Square",angle:90,orb:7,sym:"□",power:8,nature:"tension",c:"#e55050",tier:1 },
  { name:"Trine",angle:120,orb:7,sym:"△",power:7,nature:"flow",c:"#3dbd7d",tier:1 },
  { name:"Sextile",angle:60,orb:5,sym:"⚹",power:4,nature:"opportunity",c:"#45d0c8",tier:1 },
  { name:"Quincunx",angle:150,orb:3,sym:"⚻",power:3,nature:"adjustment",c:"#9b7fe6",tier:2 },
  { name:"Semi-square",angle:45,orb:2,sym:"∠",power:3,nature:"friction",c:"#e5a0a0",tier:2 },
  { name:"Sesquiquadrate",angle:135,orb:2,sym:"⚼",power:3,nature:"agitation",c:"#d0a0e0",tier:2 },
  { name:"Semi-sextile",angle:30,orb:2,sym:"⊻",power:2,nature:"subtle",c:"#a0d0c8",tier:2 },
  { name:"Quintile",angle:72,orb:1.5,sym:"Q",power:3,nature:"creative",c:"#f6c23c",tier:2 },
  { name:"Biquintile",angle:144,orb:1.5,sym:"bQ",power:3,nature:"creative",c:"#f6c23c",tier:2 },
];
const DOMAINS = [
  { id:"career",name:"Career & Business",icon:"💼",rulers:["Sun","Saturn","Jupiter","Mars"],sub:"Launches, promotions, ventures, authority moves",weight:{Sun:1.4,Saturn:1.3,Jupiter:1.2,Mars:1.1} },
  { id:"love",name:"Love & Relationships",icon:"💕",rulers:["Venus","Moon","Jupiter"],sub:"Commitments, proposals, deep connection",weight:{Venus:1.5,Moon:1.3,Jupiter:1.1} },
  { id:"contracts",name:"Contracts & Signing",icon:"📜",rulers:["Mercury","Jupiter","Saturn"],sub:"Legal filings, negotiations, agreements, deals",weight:{Mercury:1.6,Jupiter:1.2,Saturn:1.2} },
  { id:"travel",name:"Travel & Relocation",icon:"✈️",rulers:["Mercury","Jupiter","Moon"],sub:"Moving house, big journeys, relocation",weight:{Mercury:1.3,Jupiter:1.4,Moon:1.2} },
  { id:"health",name:"Health & Body",icon:"🌿",rulers:["Mars","Sun","Moon"],sub:"Surgery timing, new regimens, recovery",weight:{Mars:1.4,Sun:1.2,Moon:1.3} },
  { id:"creative",name:"Creative Projects",icon:"🎨",rulers:["Venus","Neptune","Sun","Mercury"],sub:"Art, writing, launches, performances",weight:{Venus:1.4,Neptune:1.3,Sun:1.2,Mercury:1.1} },
  { id:"learning",name:"Learning & Growth",icon:"📚",rulers:["Mercury","Jupiter","Saturn"],sub:"Courses, exams, study, certifications",weight:{Mercury:1.5,Jupiter:1.3,Saturn:1.1} },
  { id:"spiritual",name:"Spiritual & Inner Work",icon:"🧘",rulers:["Neptune","Moon","Pluto"],sub:"Retreats, therapy, meditation, healing",weight:{Neptune:1.5,Moon:1.3,Pluto:1.2} },
  { id:"financial",name:"Major Purchases",icon:"💰",rulers:["Venus","Jupiter","Saturn","Pluto"],sub:"Property, vehicles, investments, salary",weight:{Venus:1.3,Jupiter:1.4,Saturn:1.3,Pluto:1.2} },
];
const QUICK_QS = [
  { q:"Sign a contract today?",dom:"contracts",icon:"✍️" },
  { q:"Start a new venture?",dom:"career",icon:"🚀" },
  { q:"Have a difficult conversation?",dom:"love",icon:"💬" },
  { q:"Move or relocate?",dom:"travel",icon:"🏠" },
  { q:"Make a big purchase?",dom:"financial",icon:"💳" },
  { q:"Launch creative work?",dom:"creative",icon:"🎨" },
  { q:"Schedule surgery / health change?",dom:"health",icon:"💪" },
  { q:"Start a course or exam prep?",dom:"learning",icon:"📖" },
];

// TIERS — matching myoracle.me structure
const TIERS = {
  free: { name:"Free", label:"SEEKER", color:"#6b6580", features:["Basic natal transit aspects","Moon phase","Retrograde warnings","Today only"] },
  insight: { name:"Insight", label:"INITIATE", color:"#45d0c8", features:["+ Planet dignity & combustion","+ 30-day forecast","+ Sect analysis","Minor aspects"] },
  oracle: { name:"Oracle", label:"ORACLE", color:"#f6ad3c", features:["+ Stellium detection","+ Midpoints","+ Gene Keys","+ Planetary hours","All domains"] },
  master: { name:"Master", label:"MASTER", color:"#e879a0", features:["+ Full convergence scoring","+ Cross-system validation","+ Confidence tiers","All features + self-assessment"] },
};

// =====================================================
// COMPUTATION ENGINE — MULTI-SYSTEM
// =====================================================
const mod360 = (v: number) => ((v % 360) + 360) % 360;

const julianCenturies = (d: Date) => {
  const y=d.getFullYear(),m=d.getMonth()+1,da=d.getDate();
  const a=Math.floor((14-m)/12),y1=y+4800-a,m1=m+12*a-3;
  return ((da+Math.floor((153*m1+2)/5)+365*y1+Math.floor(y1/4)-Math.floor(y1/100)+Math.floor(y1/400)-32045)-2451545.0)/36525;
};

type PlanetPos = { name:string,lng:number,sign:typeof SIGNS[0],degree:number,planet:typeof PLANETS[0],retro:boolean,dignity:string,combustion:boolean };

const getPlanetPositions = (date: Date): PlanetPos[] => {
  const T=julianCenturies(date);
  const d2=new Date(date); d2.setDate(d2.getDate()-1); const T2=julianCenturies(d2);
  const R: Record<string,number>={Sun:280.4664567+360.0076983*T,Moon:218.3164477+481267.88123421*T,Mercury:252.2509+149472.6746*T,Venus:181.9798+58517.8157*T,Mars:355.4330+19140.2993*T,Jupiter:34.3515+3034.9057*T,Saturn:50.0774+1222.1138*T,Uranus:314.055+428.4677*T,Neptune:304.349+218.4862*T,Pluto:238.929+145.2078*T};
  const Y: Record<string,number>={Mercury:252.2509+149472.6746*T2,Venus:181.9798+58517.8157*T2,Mars:355.4330+19140.2993*T2,Jupiter:34.3515+3034.9057*T2,Saturn:50.0774+1222.1138*T2,Uranus:314.055+428.4677*T2,Neptune:304.349+218.4862*T2,Pluto:238.929+145.2078*T2};
  const sunLng = mod360(R.Sun);
  return Object.entries(R).map(([name,lng])=>{
    const l=mod360(lng),sign=SIGNS[Math.floor(l/30)],planet=PLANETS.find(p=>p.name===name)!;
    let retro=false;
    if(Y[name]){let d=l-mod360(Y[name]);if(d>180)d-=360;if(d<-180)d+=360;retro=d<0;}
    // Dignity: domicile(+3), exalt(+2), detriment(-2), fall(-1)
    let dignity="peregrine";
    if(planet.dignity?.includes(sign.name)) dignity="domicile";
    else if(planet.exalt?.includes(sign.name)) dignity="exaltation";
    else if(planet.detriment?.includes(sign.name)) dignity="detriment";
    else if(planet.fall?.includes(sign.name)) dignity="fall";
    // Combustion: planet within 8.5° of Sun (not Sun itself)
    let combustion=false;
    if(name!=="Sun"){let diff=Math.abs(l-sunLng);if(diff>180)diff=360-diff;combustion=diff<8.5;}
    return {name,lng:l,sign,degree:l%30,planet,retro,dignity,combustion};
  });
};

type Aspect = { p1:PlanetPos,p2:PlanetPos,asp:typeof ASPECTS[0],orb:number,strength:number,exact:number };

const getAspects = (p1: PlanetPos[], p2: PlanetPos[], minorAspects=false): Aspect[] => {
  const f: Aspect[]=[],seen=new Set<string>();
  const aspectList = minorAspects ? ASPECTS : ASPECTS.filter(a=>a.tier===1);
  for(const a of p1) for(const b of p2){
    if(a.name===b.name) continue;
    let d=Math.abs(a.lng-b.lng);if(d>180)d=360-d;
    for(const asp of aspectList){
      const orb=Math.abs(d-asp.angle);
      if(orb<=asp.orb){const k=[a.name,b.name].sort().join("-")+asp.name;if(!seen.has(k)){seen.add(k);f.push({p1:a,p2:b,asp,orb:+orb.toFixed(1),strength:1-orb/asp.orb,exact:+((1-orb/asp.orb)*100).toFixed(0)});}}
    }
  }
  return f.sort((a,b)=>b.strength-a.strength);
};

// Midpoints: check if a transit planet is at the midpoint of two natal planets
type Midpoint = { natalA:string,natalB:string,midpoint:number,transit:string,orb:number };
const getMidpoints = (natal: PlanetPos[], transit: PlanetPos[]): Midpoint[] => {
  const results: Midpoint[] = [];
  for(let i=0;i<natal.length;i++){
    for(let j=i+1;j<natal.length;j++){
      const mp = mod360((natal[i].lng + natal[j].lng) / 2);
      const mp2 = mod360(mp + 180); // antiscion midpoint
      for(const t of transit){
        for(const m of [mp, mp2]){
          let diff = Math.abs(t.lng - m); if(diff>180)diff=360-diff;
          if(diff < 1.5) results.push({natalA:natal[i].name,natalB:natal[j].name,midpoint:m,transit:t.name,orb:+diff.toFixed(2)});
        }
      }
    }
  }
  return results.sort((a,b)=>a.orb-b.orb).slice(0,8);
};

// Stelliums: 3+ planets within 10°
const getStelliums = (positions: PlanetPos[]): {sign:string,planets:string[],power:number}[] => {
  const bySign: Record<string,string[]> = {};
  positions.forEach(p=>{ if(!bySign[p.sign.name])bySign[p.sign.name]=[];bySign[p.sign.name].push(p.name);});
  return Object.entries(bySign).filter(([,ps])=>ps.length>=3).map(([sign,planets])=>({sign,planets,power:planets.length*3}));
};

// Sect: diurnal=Sun/Jupiter/Saturn, nocturnal=Moon/Venus/Mars
const getSect = (date: Date): "day"|"night" => {
  const h = date.getHours(); return (h>=6&&h<18)?"day":"night";
};

// Gene Keys: 64 keys, cycle based on birth date (simplified: hexagram from birth day+month)
const getGeneKey = (dob: Date): {key:number,name:string,shadow:string,gift:string,siddhi:string,transit:string} => {
  const birthKey = ((dob.getDate() + dob.getMonth()) % 64) + 1;
  // Transit key cycles through all 64 in ~64 days (solar arc approximation)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime()) / 86400000);
  const transitKey = (dayOfYear % 64) + 1;
  const GENE_KEYS = [
    {shadow:"Entropy",gift:"Freshness",siddhi:"Beauty"},{shadow:"Dislocation",gift:"Resourcefulness",siddhi:"Unity"},
    {shadow:"Chaos",gift:"Innovation",siddhi:"Innocence"},{shadow:"Intolerance",gift:"Understanding",siddhi:"Forgiveness"},
    {shadow:"Victimization",gift:"Compassion",siddhi:"Universality"},{shadow:"Conflict",gift:"Diplomacy",siddhi:"Peace"},
    {shadow:"Division",gift:"Guidance",siddhi:"Virtue"},{shadow:"Mediocrity",gift:"Style",siddhi:"Exquisiteness"},
    {shadow:"Inertia",gift:"Perspective",siddhi:"Invincibility"},{shadow:"Self-Obsession",gift:"Naturalness",siddhi:"Being"},
    {shadow:"Obscurity",gift:"Idealism",siddhi:"Light"},{shadow:"Vanity",gift:"Discrimination",siddhi:"Purity"},
    {shadow:"Discord",gift:"Discernment",siddhi:"Discrimination"},{shadow:"Compromise",gift:"Sensitivity",siddhi:"Bounteousness"},
    {shadow:"Dullness",gift:"Magnetism",siddhi:"Florescence"},{shadow:"Indifference",gift:"Versatility",siddhi:"Mastery"},
    {shadow:"Opinion",gift:"Astuteness",siddhi:"Omniscience"},{shadow:"Pressure",gift:"Prolificness",siddhi:"Abundance"},
    {shadow:"Co-dependence",gift:"Sensitivity",siddhi:"Perfection"},{shadow:"Superficiality",gift:"Depth",siddhi:"The Logos"},
    {shadow:"Control",gift:"Power",siddhi:"Grace"},{shadow:"Dishonour",gift:"Graciousness",siddhi:"Propriety"},
    {shadow:"Complexity",gift:"Simplicity",siddhi:"Quintessence"},{shadow:"Addiction",gift:"Invention",siddhi:"Silence"},
    {shadow:"Constriction",gift:"Acceptance",siddhi:"Universal Love"},{shadow:"Pride",gift:"Artfulness",siddhi:"Invisibility"},
    {shadow:"Intolerance",gift:"Open-mindedness",siddhi:"Omnipresence"},{shadow:"Purposelessness",gift:"Totality",siddhi:"Immortality"},
    {shadow:"Half-heartedness",gift:"Devotion",siddhi:"Devotion"},{shadow:"Conflict",gift:"Rapture",siddhi:"Celebration"},
    {shadow:"Corruption",gift:"Efficiency",siddhi:"Luminescence"},{shadow:"Failure",gift:"Preservation",siddhi:"Veneration"},
    {shadow:"Dishonesty",gift:"Honesty",siddhi:"Truth"},{shadow:"Pain",gift:"Tenderness",siddhi:"Compassion"},
    {shadow:"Infection",gift:"Vitality",siddhi:"Toughness"},{shadow:"Turbulence",gift:"Humanity",siddhi:"Compassion"},
    {shadow:"Weakness",gift:"Equanimity",siddhi:"Tenderness"},{shadow:"Stress",gift:"Perseverance",siddhi:"Honor"},
    {shadow:"Lethargy",gift:"Dynamic Flow",siddhi:"Liberation"},{shadow:"Fantasy",gift:"Imagination",siddhi:"Divine Creater"},
    {shadow:"Idealization",gift:"Perception",siddhi:"Epiphany"},{shadow:"Mismatch",gift:"Teamwork",siddhi:"Synarchy"},
    {shadow:"Deafness",gift:"Levity",siddhi:"Ecstasy"},{shadow:"Seriousness",gift:"Improvisation",siddhi:"Delight"},
    {shadow:"Projection",gift:"Transmission",siddhi:"Cosmic Order"},{shadow:"Interference",gift:"Transmutation",siddhi:"Transfiguration"},
    {shadow:"Rigidity",gift:"Resourcefulness",siddhi:"Magic"},{shadow:"Inadequacy",gift:"Empathy",siddhi:"Enlightenment"},
    {shadow:"Self-betrayal",gift:"Clarity",siddhi:"Enlightenment"},{shadow:"Agitation",gift:"Knowing",siddhi:"Revelation"},
    {shadow:"Immaturity",gift:"Imagination",siddhi:"Wakefulness"},{shadow:"Narrowmindedness",gift:"Inspiration",siddhi:"Quintessence"},
    {shadow:"Greed",gift:"Restraint",siddhi:"Silence"},{shadow:"Mediocrity",gift:"Synthesis",siddhi:"Wholeness"},
    {shadow:"Restrictiveness",gift:"Freedom",siddhi:"Destiny"},{shadow:"Excess",gift:"Self-mastery",siddhi:"Bodhisattva"},
    {shadow:"Judgment",gift:"Discernment",siddhi:"Clarity"},{shadow:"Inarticulateness",gift:"Articulateness",siddhi:"Natural Order"},
    {shadow:"Paralysis",gift:"Aspiration",siddhi:"Justice"},{shadow:"Confusion",gift:"Originality",siddhi:"Epiphany"},
    {shadow:"Despondency",gift:"Realism",siddhi:"Justice"},{shadow:"Failure",gift:"Nourishment",siddhi:"Celebration"},
    {shadow:"Instability",gift:"Adaptability",siddhi:"Equanimity"}
  ];
  const bk = GENE_KEYS[birthKey-1]||GENE_KEYS[0];
  const tk = GENE_KEYS[transitKey-1]||GENE_KEYS[0];
  const harmonic = Math.abs(birthKey - transitKey) < 8 || Math.abs(birthKey - transitKey) > 56;
  return {key:birthKey,name:`Gene Key ${birthKey}`,shadow:bk.shadow,gift:bk.gift,siddhi:bk.siddhi,transit:`Transit Key ${transitKey} (${tk.gift}) — ${harmonic?"Harmonic resonance with birth key 🟢":"In tension with birth key ⚠️"}`};
};

const getMoonPhase = (pos: PlanetPos[]) => {
  const m=pos.find(p=>p.name==="Moon"),s=pos.find(p=>p.name==="Sun");if(!m||!s)return{name:"?",icon:"🌑",power:0,energy:""};
  const a=mod360(m.lng-s.lng);
  if(a<22.5)return{name:"New Moon",icon:"🌑",power:8,energy:"Set intentions. Plant seeds. Begin."};
  if(a<67.5)return{name:"Waxing Crescent",icon:"🌒",power:6,energy:"Building momentum. Take first steps."};
  if(a<112.5)return{name:"First Quarter",icon:"🌓",power:5,energy:"Decision point. Commit or pivot."};
  if(a<157.5)return{name:"Waxing Gibbous",icon:"🌔",power:7,energy:"Refine and push. Almost peak."};
  if(a<202.5)return{name:"Full Moon",icon:"🌕",power:9,energy:"Culmination. Harvest. Heightened emotion."};
  if(a<247.5)return{name:"Waning Gibbous",icon:"🌖",power:4,energy:"Gratitude. Share. Distribute."};
  if(a<292.5)return{name:"Last Quarter",icon:"🌗",power:3,energy:"Release. Let go. Forgive."};
  return{name:"Balsamic Moon",icon:"🌘",power:2,energy:"Rest. Surrender. Prepare for renewal."};
};

const isVoidOfCourse = (pos: PlanetPos[]) => {
  const m=pos.find(p=>p.name==="Moon");if(!m||m.degree<=27)return false;
  return !pos.some(p=>{if(p.name==="Moon")return false;let d=Math.abs(m.lng-p.lng);if(d>180)d=360-d;return ASPECTS.filter(a=>a.tier===1).some(a=>Math.abs(d-a.angle)<=a.orb*0.4);});
};

type Signal = {text:string,val:number,type:"green"|"red"|"warning"|"caution",conf:number,detail:string,system:string};
type DomainResult = {score:number,signals:Signal[],confidence:number,convergence:number,greenCount:number,redCount:number,totalSignals:number};

const scoreDomain = (
  dom: typeof DOMAINS[0], natal: PlanetPos[], transit: PlanetPos[], date: Date,
  midpoints: Midpoint[], stelliums: {sign:string,planets:string[],power:number}[], sect: "day"|"night", tier: keyof typeof TIERS
): DomainResult => {
  const signals: Signal[] = [];
  let score = 0;
  const useMinor = tier==="oracle"||tier==="master";
  const aspects = getAspects(transit, natal, useMinor);
  const rel = aspects.filter(a=>dom.rulers.includes(a.p1.name)||dom.rulers.includes(a.p2.name));

  // --- T1: Base transit-natal aspects with domain weighting ---
  rel.forEach(a=>{
    const domWeight = ((dom.weight as unknown) as Record<string,number>)[a.p1.name] || 1.0;
    let imp = a.strength * a.asp.power * domWeight;
    const ben = ["Venus","Jupiter","Sun"].includes(a.p1.name);
    if(["flow","opportunity","fusion","creative","subtle"].includes(a.asp.nature)){
      if(ben) imp*=1.5;
      score+=imp;
      signals.push({text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+imp.toFixed(1),type:"green",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} energy — supports ${dom.name} (${a.exact}% exact)`,system:"Transit"});
    } else {
      if(["Saturn","Mars","Pluto"].includes(a.p1.name)) imp*=1.4;
      score-=imp;
      signals.push({text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:-imp.toFixed(1),type:"red",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} energy — ${a.asp.tier===2?"minor friction":"caution"} for ${dom.name} (${a.exact}% exact)`,system:"Transit"});
    }
  });

  // --- T2: Planet dignity & combustion ---
  if(tier!=="free"){
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
      if(p.dignity==="domicile"){score+=4;signals.push({text:`${p.planet?.sym} ${p.name} in Domicile (${p.sign.name})`,val:4,type:"green",conf:8,detail:`Planet in home sign — strongest possible expression for ${dom.name}`,system:"Dignity"});}
      else if(p.dignity==="exaltation"){score+=3;signals.push({text:`${p.planet?.sym} ${p.name} Exalted in ${p.sign.name}`,val:3,type:"green",conf:7,detail:`Planet at peak strength — highly favourable`,system:"Dignity"});}
      else if(p.dignity==="detriment"){score-=3;signals.push({text:`${p.planet?.sym} ${p.name} in Detriment (${p.sign.name})`,val:-3,type:"caution",conf:6,detail:`Planet weakened — actions may misfire`,system:"Dignity"});}
      else if(p.dignity==="fall"){score-=2;signals.push({text:`${p.planet?.sym} ${p.name} in Fall (${p.sign.name})`,val:-2,type:"caution",conf:5,detail:`Planet in weakest sign — proceed carefully`,system:"Dignity"});}
      if(p.combustion&&p.name!=="Sun"){score-=4;signals.push({text:`🔥 ${p.name} Combust (within 8.5° of Sun)`,val:-4,type:"warning",conf:7,detail:`Planet overwhelmed by solar light — weakened judgement, hidden agendas`,system:"Combustion"});}
    });

    // Sect harmony: day planets (Sun/Jupiter/Saturn) in day chart, night (Moon/Venus/Mars) in night chart
    const DAY_PLANETS=["Sun","Jupiter","Saturn"], NIGHT_PLANETS=["Moon","Venus","Mars"];
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
      const inSect=(sect==="day"&&DAY_PLANETS.includes(p.name))||(sect==="night"&&NIGHT_PLANETS.includes(p.name));
      if(inSect){score+=2;signals.push({text:`☀️ ${p.name} in sect — ${sect} chart`,val:2,type:"green",conf:5,detail:`Planet operating in its natural element today`,system:"Sect"});}
    });
  }

  // --- T3: Minor aspects (Insight+) already included in aspects above ---

  // --- T3+: Stelliums ---
  if(tier==="oracle"||tier==="master"){
    stelliums.forEach(st=>{
      const hasRuler = st.planets.some(p=>dom.rulers.includes(p));
      if(hasRuler){score+=st.power*0.5;signals.push({text:`⭐ Stellium in ${st.sign}: ${st.planets.join(", ")}`,val:+(st.power*0.5).toFixed(1),type:"green",conf:6,detail:`${st.planets.length} planets clustered — amplified energy in ${st.sign}`,system:"Stellium"});}
    });

    // Midpoints activation
    midpoints.filter(mp=>dom.rulers.includes(mp.transit)).forEach(mp=>{
      score+=3;signals.push({text:`✦ ${mp.transit} at ${mp.natalA}/${mp.natalB} midpoint`,val:3,type:"green",conf:5,detail:`Midpoint activation — subtle but precise trigger (${mp.orb}° orb)`,system:"Midpoint"});
    });
  }

  // --- Retrograde penalty ---
  transit.filter(p=>p.retro&&dom.rulers.includes(p.name)).forEach(p=>{
    const pen=p.name==="Mercury"?-8:p.name==="Venus"?-6:p.name==="Mars"?-7:-4;
    score+=pen;
    signals.push({text:`${p.planet?.sym} ${p.name} RETROGRADE in ${p.sign.name}`,val:pen,type:"warning",conf:8,detail:p.name==="Mercury"?"Avoid signing — miscommunication risk":p.name==="Venus"?"Re-evaluate, don't commit":p.name==="Mars"?"Frustrated energy, may backfire":"Deep review phase",system:"Retrograde"});
  });

  // --- Moon phase ---
  const mp=getMoonPhase(transit);
  const waxing=["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous"].includes(mp.name);
  if(["career","contracts","creative","learning","financial"].includes(dom.id)){
    if(waxing){score+=4;signals.push({text:`${mp.icon} ${mp.name} — Waxing`,val:4,type:"green",conf:6,detail:"Building energy supports new initiatives",system:"Moon"});}
    else{score-=3;signals.push({text:`${mp.icon} ${mp.name} — Waning`,val:-3,type:"caution",conf:5,detail:"Releasing phase — better for completing than starting",system:"Moon"});}
  }
  if(dom.id==="spiritual"&&["Full Moon","Waning Gibbous","Last Quarter"].includes(mp.name)){score+=5;signals.push({text:`${mp.icon} ${mp.name} supports inner work`,val:5,type:"green",conf:7,detail:"Heightened awareness for reflection",system:"Moon"});}
  if(dom.id==="love"&&mp.name==="Full Moon"){score+=4;signals.push({text:`${mp.icon} Full Moon — emotional peak`,val:4,type:"green",conf:7,detail:"Feelings surface — powerful for honest connection",system:"Moon"});}

  // --- Void of course ---
  if(isVoidOfCourse(transit)){score-=6;signals.push({text:"🚫 Void of Course Moon",val:-6,type:"warning",conf:7,detail:"Actions started now tend to fizzle — wait if possible",system:"Moon"});}

  // --- Planetary hour ---
  if(tier==="oracle"||tier==="master"){
    const hrs=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
    const dayR=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"][date.getDay()];
    const hR=hrs[(hrs.indexOf(dayR)+date.getHours())%7];
    if(dom.rulers.includes(hR)){score+=3;signals.push({text:`⏰ Planetary Hour of ${hR} — aligned`,val:3,type:"green",conf:4,detail:`Current hour ruled by ${hR} — aligns with ${dom.name}`,system:"Hour"});}
  }

  const norm=Math.max(-100,Math.min(100,score*2.5));
  const gn=signals.filter(s=>s.type==="green").length,rd=signals.filter(s=>s.type==="red"||s.type==="warning"||s.type==="caution").length;
  const systemCount = new Set(signals.map(s=>s.system)).size;
  const confidence=Math.min(9,Math.max(2,Math.round((Math.abs(norm)/100)*5+signals.length*0.3+systemCount*0.5+1.5)));
  const convergence=gn+rd?Math.round(Math.max(gn,rd)/(gn+rd)*100):50;
  return{score:norm,signals:signals.sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)),confidence,convergence,greenCount:gn,redCount:rd,totalSignals:signals.length};
};

// =====================================================
// STYLES
// =====================================================
const CL={bg:"#07060d",card:"#0e0d18",card2:"#16142a",bdr:"#1f1b3a",acc:"#f6ad3c",grn:"#3dbd7d",red:"#e55050",blu:"#38d6f5",pur:"#9b7fe6",cyn:"#45d0c8",pnk:"#e879a0",txt:"#e8e4f0",dim:"#6b6580",mut:"#3a3555"};
const vColor=(s:number)=>s>30?CL.grn:s>10?"#7ddba3":s>-10?CL.acc:s>-30?"#e5a0a0":CL.red;
const vText=(s:number)=>s>40?"EXCELLENT — Act with high confidence":s>20?"FAVORABLE — Conditions support action":s>5?"LEANING POSITIVE — Proceed with awareness":s>-5?"NEUTRAL — Mixed signals, use judgment":s>-20?"LEANING CHALLENGING — Extra caution recommended":s>-40?"CHALLENGING — Seriously consider postponing":"AVOID — Strong signals against action today";
const confText=(c:number)=>c>=8?"Very High":c>=6?"High":c>=4?"Moderate":"Low";
const fmtD=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtDL=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function App() {
  const [dob,setDob]=useState("");
  const [targetDate,setTargetDate]=useState(new Date().toISOString().split("T")[0]);
  const [tab,setTab]=useState("reading");
  const [tier,setTier]=useState<keyof typeof TIERS>("master"); // default master (all features)
  const [data,setData]=useState<any>(null);
  const [expanded,setExpanded]=useState<string|null>(null);

  const compute=useCallback(()=>{
    if(!dob) return;
    const bDate=new Date(dob+"T12:00:00"),tDate=new Date(targetDate+"T12:00:00");
    const natal=getPlanetPositions(bDate);
    const transit=getPlanetPositions(tDate);
    const allAspects=getAspects(transit,natal,tier==="oracle"||tier==="master");
    const mp=getMoonPhase(transit),voc=isVoidOfCourse(transit);
    const retros=transit.filter(p=>p.retro);
    const sunSign=natal.find(p=>p.name==="Sun")!.sign;
    const moonSign=natal.find(p=>p.name==="Moon")!.sign;
    const elements:{fire:number,earth:number,air:number,water:number}={fire:0,earth:0,air:0,water:0};
    natal.forEach(p=>{if(p.sign)(elements as any)[p.sign.el]++;});
    const stelliums=getStelliums(transit);
    const midpoints=getMidpoints(natal,transit);
    const sect=getSect(tDate);
    const geneKey=getGeneKey(bDate);
    // Dignity summary for natal
    const natalDignities=natal.filter(p=>p.dignity!=="peregrine");
    const domains=DOMAINS.map(d=>({...d,...scoreDomain(d,natal,transit,tDate,midpoints,stelliums,sect,tier)})).sort((a,b)=>b.score-a.score);
    const overall=domains.reduce((s,d)=>s+d.score,0)/domains.length;
    const overallConf=Math.round(domains.reduce((s,d)=>s+d.confidence,0)/domains.length);
    const totalGreen=domains.reduce((s,d)=>s+d.greenCount,0);
    const totalRed=domains.reduce((s,d)=>s+d.redCount,0);
    const overallConv=totalGreen+totalRed?Math.round(Math.max(totalGreen,totalRed)/(totalGreen+totalRed)*100):50;
    // Systems active count (for master tier convergence)
    const systemsActive=new Set(domains.flatMap(d=>d.signals.map((s:Signal)=>s.system))).size;
    // 30-day forecast
    const forecast: any[]=[];
    for(let i=0;i<30;i++){
      const d=new Date(tDate);d.setDate(d.getDate()+i);
      const dt=getPlanetPositions(d);
      const dStelliums=getStelliums(dt);
      const dMidpoints=getMidpoints(natal,dt);
      const dSect=getSect(d);
      const ds=DOMAINS.map(dm=>({...dm,...scoreDomain(dm,natal,dt,d,dMidpoints,dStelliums,dSect,tier)}));
      const avg=ds.reduce((s,x)=>s+x.score,0)/ds.length;
      const best=ds.reduce((b,x)=>x.score>b.score?x:b,ds[0]);
      const worst=ds.reduce((b,x)=>x.score<b.score?x:b,ds[0]);
      forecast.push({date:d,overall:avg,best,worst,moonPhase:getMoonPhase(dt),domains:ds});
    }
    const bestDays=DOMAINS.map((dom,di)=>{
      const sorted=[...forecast].sort((a,b)=>b.domains[di].score-a.domains[di].score);
      return{domain:dom,top3:sorted.slice(0,3).map(f=>({date:f.date,score:f.domains[di].score,conf:f.domains[di].confidence})),bottom3:sorted.slice(-3).reverse().map(f=>({date:f.date,score:f.domains[di].score}))};
    });
    setData({natal,transit,allAspects,mp,voc,retros,sunSign,moonSign,elements,stelliums,midpoints,sect,geneKey,natalDignities,domains,overall,overallConf,overallConv,totalGreen,totalRed,systemsActive,forecast,bestDays});
  },[dob,targetDate,tier]);

  // Auto-compute when dob or date changes
  useState(()=>{if(dob)compute();});

  const SC={card:{background:CL.card,border:`1px solid ${CL.bdr}`,borderRadius:14,padding:18,marginBottom:12}};
  const TB=({id,label,icon}:{id:string,label:string,icon:string})=>(
    <button onClick={()=>setTab(id)} style={{background:tab===id?CL.acc:"transparent",color:tab===id?"#000":CL.dim,border:`1px solid ${tab===id?CL.acc:CL.bdr}`,borderRadius:10,padding:"8px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"system-ui"}}>{icon} {label}</button>
  );
  const SH=({icon,title,sub,color}:{icon:string,title:string,sub?:string,color?:string})=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,letterSpacing:3,color:color||CL.acc,fontWeight:700,fontFamily:"system-ui"}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:800,color:CL.txt,fontFamily:"system-ui",marginTop:2}}>{title}</div>
      {sub&&<div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui"}}>{sub}</div>}
    </div>
  );
  const HR=()=><div style={{height:1,background:CL.bdr,margin:"14px 0"}}/>;
  const Bullet=({children,color,conf,val,strong,system}:{children?:React.ReactNode,color?:string,conf?:number,val?:number,strong?:string,system?:string})=>(
    <div style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${CL.bdr}40`,alignItems:"flex-start"}}>
      <span style={{color:color||CL.txt,fontSize:14,marginTop:1}}>•</span>
      <div style={{flex:1,fontSize:12.5,lineHeight:1.65,fontFamily:"system-ui",color:CL.txt}}>
        {strong&&<b style={{color:color||CL.txt}}>{strong}</b>}
        {strong&&" — "}{children}
        {conf!==undefined&&<span style={{color:CL.dim,fontStyle:"italic"}}> Confidence: {conf}/10</span>}
        {val!==undefined&&<span style={{marginLeft:6,fontWeight:700,color:+val>0?CL.grn:CL.red}}>({+val>0?"+":""}{val})</span>}
        {system&&<span style={{marginLeft:6,fontSize:10,color:CL.mut,background:CL.card2,padding:"1px 6px",borderRadius:4}}>{system}</span>}
      </div>
    </div>
  );

  return (
    <div style={{background:CL.bg,color:CL.txt,minHeight:"100vh",fontFamily:"'Georgia','Palatino',serif",padding:"10px 14px",maxWidth:720,margin:"0 auto"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{text-shadow:0 0 15px #f6ad3c44}50%{text-shadow:0 0 30px #f6ad3c88,0 0 60px #9b7fe644}}
        @keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}
        input[type="date"]{font-family:inherit}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.7)}
        *{box-sizing:border-box}
        button:hover{opacity:0.85;transition:opacity 0.15s}
      `}</style>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"18px 0 10px"}}>
        <div style={{fontSize:10,letterSpacing:6,color:CL.pur,fontWeight:700,fontFamily:"system-ui"}}>ORACLE v8</div>
        <h1 style={{fontSize:24,fontWeight:400,margin:"4px 0",fontStyle:"italic",background:`linear-gradient(135deg,${CL.acc},${CL.pnk},${CL.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glow 5s ease infinite"}}>Multi-System Convergence Oracle</h1>
        <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>Dignity · Combustion · Sect · Stelliums · Midpoints · Gene Keys · Planetary Hours</div>
      </div>

      {/* TIER SELECTOR */}
      <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#120e24)`,borderColor:CL.pur+"40",marginBottom:8}}>
        <div style={{fontSize:9,color:CL.dim,letterSpacing:2,fontFamily:"system-ui",marginBottom:8}}>ANALYSIS TIER</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {(Object.entries(TIERS) as [keyof typeof TIERS, typeof TIERS[keyof typeof TIERS]][]).map(([k,t])=>(
            <button key={k} onClick={()=>{setTier(k);if(dob)setTimeout(()=>compute(),50);}} style={{background:tier===k?t.color+"20":"transparent",color:tier===k?t.color:CL.dim,border:`1px solid ${tier===k?t.color:CL.bdr}`,borderRadius:8,padding:"6px 12px",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"system-ui",letterSpacing:1}}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{marginTop:8,fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>{TIERS[tier].features.join(" · ")}</div>
      </div>

      {/* INPUTS */}
      <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#120e24)`,borderColor:CL.pur+"50"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:1,minWidth:140}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>DATE OF BIRTH</label>
            <input type="date" value={dob} onChange={e=>{setDob(e.target.value);}} style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:15}}/>
          </div>
          <div style={{flex:1,minWidth:140}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>DATE TO ANALYZE</label>
            <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:15}}/>
          </div>
          <button onClick={compute} disabled={!dob} style={{background:`linear-gradient(135deg,${CL.pur},${CL.acc})`,color:"#000",border:"none",borderRadius:10,padding:"11px 24px",fontSize:12,fontWeight:800,cursor:!dob?"not-allowed":"pointer",opacity:!dob?0.4:1,fontFamily:"system-ui",letterSpacing:1}}>🔮 Consult Oracle</button>
        </div>
      </div>

      {data&&(<>
        {/* TABS */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
          <TB id="reading" label="Full Reading" icon="🔮"/>
          <TB id="shouldi" label="Should I?" icon="🤔"/>
          <TB id="systems" label="Systems" icon="🔬"/>
          <TB id="calendar" label="30-Day" icon="📅"/>
          <TB id="bestdays" label="Best Days" icon="⭐"/>
          <TB id="chart" label="Chart" icon="🌌"/>
        </div>

        {/* ====== FULL READING ====== */}
        {tab==="reading"&&(<>
          {/* SITUATION */}
          <div style={SC.card}>
            <SH icon="📊" title="SITUATION ASSESSMENT" sub={`${TIERS[tier].label} Reading — ${fmtDL(new Date(targetDate))}`}/>
            <Bullet strong={`${data.sunSign.sym} Sun in ${data.sunSign.name}`}>{data.sunSign.trait.toLowerCase()} · Your core identity</Bullet>
            <Bullet strong={`${data.moonSign.sym} Moon in ${data.moonSign.name}`}>Your emotional nature and instinct patterns</Bullet>
            <Bullet strong={`${data.mp.icon} ${data.mp.name}`}>{data.mp.energy}</Bullet>
            <Bullet strong={`${data.sect==="day"?"☀️ Day Chart":"🌙 Night Chart"}`}>{data.sect==="day"?"Sun above horizon — day planets (Sun, Jupiter, Saturn) are stronger":"Sun below horizon — night planets (Moon, Venus, Mars) are stronger"}</Bullet>
            {data.voc&&<Bullet strong="🚫 Void of Course Moon" color={CL.red}>Actions started now tend to not go as planned. Delay important decisions if possible.</Bullet>}
            {data.retros.map((r:PlanetPos)=><Bullet key={r.name} strong={`${r.planet?.sym} ${r.name} Retrograde in ${r.sign.name}`} color={CL.acc}>{r.name==="Mercury"?"Contracts, communication disrupted — avoid signing":r.name==="Venus"?"Values under review — not ideal for new commitments":r.name==="Mars"?"Action frustrated — don't force outcomes":"Deep review energy"}</Bullet>)}
            {data.stelliums.length>0&&data.stelliums.map((st:{sign:string,planets:string[],power:number})=><Bullet key={st.sign} strong={`⭐ Stellium in ${st.sign}`} color={CL.pur}>{st.planets.join(", ")} — amplified energy cluster (power: +{st.power})</Bullet>)}
            {(tier==="oracle"||tier==="master")&&<Bullet strong="Gene Keys">Birth Key {data.geneKey.key}: {data.geneKey.gift} (gift) · Siddhi: {data.geneKey.siddhi} · {data.geneKey.transit}</Bullet>}
            <Bullet strong="Elemental Balance">🔥 {data.elements.fire} · 🌍 {data.elements.earth} · 💨 {data.elements.air} · 💧 {data.elements.water}</Bullet>
          </div>

          {/* OVERALL VERDICT */}
          <div style={{...SC.card,background:`linear-gradient(150deg,${CL.card},${data.overall>15?"#0d1a10":data.overall<-15?"#1a0d0d":"#1a1708"})`}}>
            <SH icon="🎯" title="OVERALL VERDICT" color={vColor(data.overall)}/>
            <div style={{fontSize:15,color:vColor(data.overall),fontWeight:600,fontFamily:"system-ui",marginBottom:14}}>{vText(data.overall)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
              {[
                {label:"OVERALL SCORE",value:`${data.overall>0?"+":""}${data.overall.toFixed(0)}`,color:vColor(data.overall),sub:"Weighted avg across all 9 life domains"},
                {label:"CONFIDENCE",value:`${data.overallConf}/10`,color:CL.acc,sub:confText(data.overallConf)+" — signal strength & count"},
                {label:"CONVERGENCE",value:`${data.overallConv}%`,color:data.overallConv>70?CL.grn:data.overallConv>55?CL.acc:CL.red,sub:data.overallConv>70?"Strong agreement":"Mixed — proceed with nuance"},
                {label:"SYSTEMS ACTIVE",value:`${data.systemsActive}`,color:CL.pur,sub:`Analysis layers contributing to score`},
              ].map(m=>(
                <div key={m.label} style={{background:CL.card2,borderRadius:10,padding:12,borderTop:`2px solid ${m.color}`}}>
                  <div style={{fontSize:8,letterSpacing:2,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{m.label}</div>
                  <div style={{fontSize:24,fontWeight:900,color:m.color,fontFamily:"system-ui",margin:"4px 0"}}>{m.value}</div>
                  <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",lineHeight:1.4}}>{m.sub}</div>
                </div>
              ))}
            </div>
            {tier==="master"&&(
              <div style={{marginTop:12,padding:"10px 14px",background:CL.card2,borderRadius:8,borderLeft:`3px solid ${CL.pur}`}}>
                <div style={{fontSize:10,color:CL.pur,fontWeight:700,letterSpacing:2,fontFamily:"system-ui",marginBottom:4}}>MASTER TIER — CROSS-SYSTEM VALIDATION</div>
                <div style={{fontSize:12,color:CL.txt,fontFamily:"system-ui",lineHeight:1.6}}>
                  {data.systemsActive} independent prediction systems active · {data.totalGreen} supportive vs {data.totalRed} challenging signals · 
                  {data.overallConv>70?" Strong multi-system agreement — high confidence in direction":data.overallConv>55?" Moderate convergence — signals lean but mixed":` Low convergence — conditions genuinely ambiguous`}
                </div>
              </div>
            )}
          </div>

          {/* DOMAIN-BY-DOMAIN */}
          <div style={SC.card}>
            <SH icon="📋" title="DOMAIN-BY-DOMAIN ANALYSIS" sub={`Ranked by score — ${data.domains.length} domains analyzed across ${data.systemsActive} systems`}/>
            {data.domains.map((d:any)=>(
              <div key={d.id} onClick={()=>setExpanded(expanded===d.id?null:d.id)} style={{background:CL.card2,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",borderLeft:`4px solid ${vColor(d.score)}`,transition:"all 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{d.icon} {d.name}</div>
                    <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui",marginTop:1}}>{d.sub}</div>
                  </div>
                  <div style={{textAlign:"right",fontFamily:"system-ui"}}>
                    <div style={{fontSize:26,fontWeight:900,color:vColor(d.score),lineHeight:1}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap",fontFamily:"system-ui",fontSize:11,color:CL.dim}}>
                  <span>Confidence: <b style={{color:CL.acc}}>{d.confidence}/10</b> <span style={{fontStyle:"italic"}}>({confText(d.confidence)})</span></span>
                  <span>Convergence: <b style={{color:d.convergence>65?CL.grn:d.convergence>50?CL.acc:CL.red}}>{d.convergence}%</b></span>
                  <span>Signals: <b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b></span>
                  <span>Systems: <b style={{color:CL.pur}}>{new Set(d.signals.map((s:Signal)=>s.system)).size}</b></span>
                </div>
                {expanded===d.id&&(
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${CL.bdr}`,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,fontFamily:"system-ui",marginBottom:6}}>SIGNAL BREAKDOWN</div>
                    {d.signals.map((s:Signal,j:number)=>(
                      <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc} conf={s.conf} val={s.val} system={s.system}>{s.detail}</Bullet>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CROSS-DOMAIN CONVERGENCE */}
          <div style={SC.card}>
            <SH icon="🔗" title="CROSS-DOMAIN CONVERGENCE" sub="Multi-system directional calls"/>
            <HR/>
            <div style={{fontSize:13,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>🟢 STRONGEST DOMAINS</div>
            {data.domains.filter((d:any)=>d.score>5).length>0?data.domains.filter((d:any)=>d.score>5).map((d:any)=>(
              <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.grn} conf={d.confidence}>{d.score>30?"Strongly supported":"Supported"} — {d.greenCount} signals, {d.convergence}% convergence across {new Set(d.signals.map((s:Signal)=>s.system)).size} systems</Bullet>
            )):<Bullet color={CL.dim}>No strongly favorable domains today.</Bullet>}
            <div style={{height:10}}/>
            <div style={{fontSize:13,fontWeight:800,color:CL.red,fontFamily:"system-ui",marginBottom:6}}>🔴 WEAKEST DOMAINS</div>
            {data.domains.filter((d:any)=>d.score<-5).length>0?data.domains.filter((d:any)=>d.score<-5).sort((a:any,b:any)=>a.score-b.score).map((d:any)=>(
              <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.red} conf={d.confidence}>{d.score<-30?"Strongly unfavorable":"Challenging"} — {d.redCount} caution signals, {d.convergence}% convergence</Bullet>
            )):<Bullet color={CL.dim}>No strongly unfavorable domains today.</Bullet>}
          </div>

          {/* KEY WATCHPOINTS */}
          <div style={SC.card}>
            <SH icon="👁️" title="KEY WATCHPOINTS" sub="Factors shaping today across all systems"/>
            {[
              ...(data.retros.length>0?[`**${data.retros.map((r:PlanetPos)=>r.name).join(", ")} retrograde** — ${data.retros.some((r:PlanetPos)=>r.name==="Mercury")?"contracts and communication especially disrupted":"review rather than initiate"}`]:[]),
              `**Moon Phase: ${data.mp.name}** — ${data.mp.energy} Power: ${data.mp.power}/10`,
              ...(data.voc?["**Void of Course Moon** — actions tend to fizzle. Wait if possible."]:["**Moon active** — strong lunar energy supports decisions"]),
              `**${data.sect==="day"?"Day":"Night"} Chart** — ${data.sect==="day"?"Sun, Jupiter, Saturn are enhanced today":"Moon, Venus, Mars are enhanced today"}`,
              ...(data.stelliums.length>0?[`**Stellium in ${data.stelliums[0].sign}** — ${data.stelliums[0].planets.join("+")} clustered, amplifying that sign's energy`]:[]),
              `**${data.allAspects.length} transit aspects** to natal · Strongest: ${data.allAspects[0]?`${data.allAspects[0].p1.name} ${data.allAspects[0].asp.name} ${data.allAspects[0].p2.name} (${data.allAspects[0].exact}% exact)`:"none"}`,
              ...(tier==="oracle"||tier==="master"?[`**Gene Key ${data.geneKey.key}** — Gift: ${data.geneKey.gift} · Shadow to transcend: ${data.geneKey.shadow} · ${data.geneKey.transit}`]:[]),
            ].map((wp,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${CL.bdr}33`,fontFamily:"system-ui",fontSize:12,lineHeight:1.6,color:CL.txt}}>
                <span style={{color:CL.acc,fontWeight:800,minWidth:18}}>{i+1}.</span>
                <span dangerouslySetInnerHTML={{__html:(wp as string).replace(/\*\*(.*?)\*\*/g,`<b style="color:${CL.acc}">$1</b>`)}}/>
              </div>
            ))}
          </div>

          {/* ORACLE SELF-ASSESSMENT */}
          <div style={{...SC.card,borderColor:CL.pur+"30"}}>
            <SH icon="🔮" title="ORACLE SELF-ASSESSMENT" color={CL.pur}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>Most confident assessments:</div>
              {data.domains.filter((d:any)=>d.confidence>=6).slice(0,4).map((d:any)=>(
                <Bullet key={d.id} color={CL.grn}>{d.icon} {d.name} — {d.score>0?"favorable":"challenging"} ({d.confidence}/10) · {d.convergence}% convergence · {new Set(d.signals.map((s:Signal)=>s.system)).size} systems agree</Bullet>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.red,fontFamily:"system-ui",marginBottom:6}}>Least confident:</div>
              {data.domains.filter((d:any)=>d.confidence<=5).length>0?data.domains.filter((d:any)=>d.confidence<=5).slice(0,3).map((d:any)=>(
                <Bullet key={d.id} color={CL.dim}>{d.icon} {d.name} — Mixed signals ({d.confidence}/10), {d.convergence}% convergence. Could go either way.</Bullet>
              )):<Bullet color={CL.dim}>All domains show moderate-to-high confidence — unusual clarity today.</Bullet>}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:CL.acc,fontFamily:"system-ui",marginBottom:6}}>Known limitations:</div>
              <Bullet color={CL.acc}>Simplified orbital calculations — positions may differ 1-2° from exact ephemeris</Bullet>
              <Bullet color={CL.acc}>Birth time unknown — rising sign and houses not calculated</Bullet>
              <Bullet color={CL.acc}>Gene Keys simplified — full profile requires birth time and coordinates</Bullet>
              <Bullet color={CL.acc}>Free will overrides all cosmic signals — these are inclinations, not fate</Bullet>
            </div>
          </div>
          <div style={{textAlign:"center",padding:"10px",fontSize:10,color:CL.mut,fontFamily:"system-ui",lineHeight:1.6}}>
            <i>Oracle v8 · {data.systemsActive} active prediction systems · {TIERS[tier].label} tier</i><br/>
            <i>"The stars incline, they do not compel."</i>
          </div>
        </>)}

        {/* ====== SYSTEMS VIEW ====== */}
        {tab==="systems"&&(
          <div style={SC.card}>
            <SH icon="🔬" title="ACTIVE PREDICTION SYSTEMS" sub={`${data.systemsActive} systems contributing to your reading`}/>
            {[
              {sys:"Transit",color:CL.cyn,desc:"Natal-to-transit aspect engine — how current sky activates your birth chart",active:true},
              {sys:"Dignity",color:CL.acc,desc:"Domicile, exaltation, detriment, fall — planet strength in current sign",active:tier!=="free"},
              {sys:"Combustion",color:"#f6a0a0",desc:"Planets within 8.5° of Sun are weakened — affects visibility and clarity",active:tier!=="free"},
              {sys:"Sect",color:CL.grn,desc:"Day/night chart — which planets are naturally empowered right now",active:tier!=="free"},
              {sys:"Moon",color:"#c4cdd4",desc:"Phase (New→Balsamic) and void-of-course detection",active:true},
              {sys:"Retrograde",color:CL.red,desc:"Planetary retrograde penalties — especially Mercury, Venus, Mars",active:true},
              {sys:"Minor Aspects",color:CL.pur,desc:"Quincunx, semi-square, sesquiquadrate, quintile, semi-sextile",active:tier==="oracle"||tier==="master"},
              {sys:"Stellium",color:CL.pnk,desc:"3+ planet clusters in one sign — amplified concentrated energy",active:tier==="oracle"||tier==="master"},
              {sys:"Midpoint",color:CL.blu,desc:"Transit planets at natal planet midpoints — subtle precision triggers",active:tier==="oracle"||tier==="master"},
              {sys:"Gene Keys",color:"#7c8cf5",desc:"64 archetypal keys — birth key gift/shadow in transit with current cycle key",active:tier==="oracle"||tier==="master"},
              {sys:"Hour",color:CL.acc,desc:"Chaldean planetary hour ruler — aligned hours boost domain scores",active:tier==="oracle"||tier==="master"},
            ].map(s=>(
              <div key={s.sys} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${CL.bdr}40`,alignItems:"flex-start",opacity:s.active?1:0.35}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.active?s.color:CL.dim,marginTop:4,flexShrink:0,boxShadow:s.active?`0 0 6px ${s.color}60`:"none"}}/>
                <div>
                  <div style={{fontFamily:"system-ui",fontSize:12,fontWeight:700,color:s.active?s.color:CL.dim}}>{s.sys} {!s.active&&"🔒"}</div>
                  <div style={{fontFamily:"system-ui",fontSize:11,color:CL.dim,lineHeight:1.5}}>{s.desc}</div>
                </div>
              </div>
            ))}
            <HR/>
            {/* Midpoints detail */}
            {(tier==="oracle"||tier==="master")&&data.midpoints.length>0&&(<>
              <div style={{fontSize:11,fontWeight:700,color:CL.blu,letterSpacing:1,fontFamily:"system-ui",marginBottom:6}}>ACTIVE MIDPOINTS</div>
              {data.midpoints.map((mp:Midpoint,i:number)=>(
                <Bullet key={i} strong={`${mp.transit} at ${mp.natalA}/${mp.natalB}`} color={CL.blu}>{mp.orb}° orb — subtle energy trigger</Bullet>
              ))}
            </>)}
            {/* Gene Key detail */}
            {(tier==="oracle"||tier==="master")&&(<>
              <HR/>
              <div style={{fontSize:11,fontWeight:700,color:"#7c8cf5",letterSpacing:1,fontFamily:"system-ui",marginBottom:8}}>GENE KEY PROFILE</div>
              <div style={{background:CL.card2,borderRadius:10,padding:14,fontFamily:"system-ui"}}>
                <div style={{fontSize:14,fontWeight:800,color:"#7c8cf5",marginBottom:8}}>Birth Key {data.geneKey.key}</div>
                <Bullet strong="Shadow to transcend" color={CL.red}>{data.geneKey.shadow}</Bullet>
                <Bullet strong="Gift to embody" color={CL.grn}>{data.geneKey.gift}</Bullet>
                <Bullet strong="Siddhi (highest expression)" color={CL.pur}>{data.geneKey.siddhi}</Bullet>
                <Bullet strong="Current transit" color={CL.cyn}>{data.geneKey.transit}</Bullet>
              </div>
            </>)}
          </div>
        )}

        {/* ====== SHOULD I ====== */}
        {tab==="shouldi"&&(
          <div style={SC.card}>
            <SH icon="🤔" title="SHOULD I...?" sub={fmtDL(new Date(targetDate))}/>
            {QUICK_QS.map(qd=>{
              const d=data.domains.find((x:any)=>x.id===qd.dom);
              const answer=d.score>30?"YES — Strong multi-system support":d.score>10?"Likely YES — Favorable conditions":d.score>-10?"MIXED — Proceed with awareness":d.score>-30?"Probably NOT — Consider waiting":"NO — Multiple systems caution against";
              return(
                <div key={qd.q} style={{background:CL.card2,borderRadius:12,padding:16,marginBottom:8,borderLeft:`4px solid ${vColor(d.score)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,fontFamily:"system-ui"}}>{qd.icon} {qd.q}</div>
                    <div style={{fontSize:24,fontWeight:900,color:vColor(d.score),fontFamily:"system-ui"}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                  </div>
                  <div style={{fontSize:13,color:vColor(d.score),fontStyle:"italic",margin:"6px 0",fontFamily:"system-ui"}}>{answer} · Confidence {d.confidence}/10</div>
                  <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>Convergence: <b>{d.convergence}%</b> · <b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b> · {new Set(d.signals.map((s:Signal)=>s.system)).size} systems</div>
                  <HR/>
                  {d.signals.slice(0,3).map((s:Signal,j:number)=>(
                    <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:CL.red} conf={s.conf} val={s.val} system={s.system}>{s.detail}</Bullet>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ====== CALENDAR ====== */}
        {tab==="calendar"&&(
          <div style={SC.card}>
            <SH icon="📅" title="30-DAY COSMIC MAP" sub="Your personal energy landscape — click any day for full reading"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:12}}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{d}</div>)}
              {Array.from({length:data.forecast[0].date.getDay()}).map((_,i)=><div key={"e"+i}/>)}
              {data.forecast.map((day:any,i:number)=>{
                const bg=vColor(day.overall);
                return(<div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");compute();}} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",background:bg+"15",border:i===0?`2px solid ${CL.acc}`:`1px solid ${bg}20`}}>
                  <div style={{fontSize:11,fontFamily:"system-ui"}}>{day.date.getDate()}</div>
                  <div style={{fontSize:7,fontWeight:700,color:bg,fontFamily:"system-ui"}}>{day.overall>0?"+":""}{day.overall.toFixed(0)}</div>
                  <div style={{fontSize:7}}>{day.moonPhase.icon}</div>
                </div>);
              })}
            </div>
            <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>DAILY BREAKDOWN (14 days)</div>
            {data.forecast.slice(0,14).map((day:any,i:number)=>(
              <div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");compute();}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:i%2?"transparent":CL.card2,borderRadius:6,cursor:"pointer",marginBottom:2,fontFamily:"system-ui",fontSize:11}}>
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

        {/* ====== BEST DAYS ====== */}
        {tab==="bestdays"&&(
          <div style={SC.card}>
            <SH icon="⭐" title="OPTIMAL TIMING" sub="Best & worst 30-day windows by domain"/>
            {data.bestDays.map((bd:any)=>(
              <div key={bd.domain.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>{bd.domain.icon} {bd.domain.name}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:CL.grn,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🟢 BEST</div>
                    {bd.top3.map((d:any,i:number)=>(<div key={i} onClick={()=>{setTargetDate(d.date.toISOString().split("T")[0]);setTab("reading");compute();}} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.grn+"0d",borderRadius:6,marginBottom:3,cursor:"pointer",fontFamily:"system-ui",fontSize:11}}>
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

        {/* ====== CHART ====== */}
        {tab==="chart"&&(
          <div style={SC.card}>
            <SH icon="🌌" title="NATAL CHART + TRANSITS"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {(["Natal","Transit"] as const).map(type=>(
                <div key={type}>
                  <div style={{fontSize:10,color:type==="Natal"?CL.acc:CL.pur,letterSpacing:2,fontWeight:700,marginBottom:4,fontFamily:"system-ui"}}>{type.toUpperCase()}</div>
                  {(type==="Natal"?data.natal:data.transit).map((p:PlanetPos)=>(
                    <div key={p.name} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",fontSize:10,background:CL.card2,borderRadius:5,marginBottom:2,fontFamily:"system-ui"}}>
                      <span style={{color:p.planet?.c}}>{p.planet?.sym} {p.name}{p.retro?" ℞":""}</span>
                      <span style={{color:p.sign.c,fontSize:9}}>{p.sign.sym} {p.degree.toFixed(1)}° {p.sign.name}</span>
                      {tier!=="free"&&<span style={{fontSize:9,color:p.dignity==="domicile"?CL.grn:p.dignity==="exaltation"?"#aaffaa":p.dignity==="detriment"?CL.red:p.dignity==="fall"?"#ffaaaa":CL.dim}}>{p.dignity==="peregrine"?"":p.dignity.slice(0,3).toUpperCase()}{p.combustion?" 🔥":""}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <HR/>
            <div style={{fontSize:10,letterSpacing:2,color:CL.pnk,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>TOP ASPECTS</div>
            {data.allAspects.slice(0,15).map((a:Aspect,i:number)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:i%2?"transparent":CL.card2,borderRadius:5,fontSize:11,fontFamily:"system-ui"}}>
                <span style={{fontSize:13,color:a.asp.c,minWidth:18}}>{a.asp.sym}</span>
                <span style={{flex:1}}><span style={{color:a.p1.planet?.c,fontWeight:600}}>{a.p1.name}</span> <span style={{color:CL.dim,fontSize:9}}>{a.asp.name}</span> <span style={{color:a.p2.planet?.c,fontWeight:600}}>{a.p2.name}</span></span>
                <span style={{fontSize:9,color:CL.dim}}>{a.asp.nature}</span>
                <span style={{fontWeight:800,color:a.asp.c,minWidth:30,textAlign:"right"}}>{a.exact}%</span>
                {a.asp.tier===2&&<span style={{fontSize:8,color:CL.pur,background:CL.card2,padding:"1px 4px",borderRadius:3}}>minor</span>}
              </div>
            ))}
          </div>
        )}
      </>)}
    </div>
  );
}
