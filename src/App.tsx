"use client";
import { useState, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// 🔮 ORACLE v9 — FULLY CORRECTED MULTI-SYSTEM ENGINE
// 17 prediction systems · Meeus positions · Real Gene Keys
// Birth time + place · Current location · Houses · Progressions
// Cazimi · Nodes · Solar Arc · Antiscia · Eclipse sensitivity
// ═══════════════════════════════════════════════════════════════

// ── PLANET DATA ────────────────────────────────────────────────
const PLANETS = [
  {name:"Sun",    sym:"☉",c:"#f6ad3c",nature:"benefic", sect:"day",   domicile:["Leo"],             exalt:["Aries"],     detriment:["Aquarius"],          fall:["Libra"]     },
  {name:"Moon",   sym:"☽",c:"#c4cdd4",nature:"benefic", sect:"night", domicile:["Cancer"],          exalt:["Taurus"],    detriment:["Capricorn"],         fall:["Scorpio"]   },
  {name:"Mercury",sym:"☿",c:"#45d0c8",nature:"neutral", sect:"either",domicile:["Gemini","Virgo"],  exalt:["Virgo"],     detriment:["Sagittarius","Pisces"],fall:["Pisces"]   },
  {name:"Venus",  sym:"♀",c:"#e879a0",nature:"benefic", sect:"night", domicile:["Taurus","Libra"],  exalt:["Pisces"],    detriment:["Aries","Scorpio"],   fall:["Virgo"]     },
  {name:"Mars",   sym:"♂",c:"#e55050",nature:"malefic", sect:"night", domicile:["Aries","Scorpio"], exalt:["Capricorn"], detriment:["Taurus","Libra"],    fall:["Cancer"]    },
  {name:"Jupiter",sym:"♃",c:"#9b7fe6",nature:"benefic", sect:"day",   domicile:["Sagittarius","Pisces"],exalt:["Cancer"],detriment:["Gemini","Virgo"],  fall:["Capricorn"] },
  {name:"Saturn", sym:"♄",c:"#7a8594",nature:"malefic", sect:"day",   domicile:["Capricorn","Aquarius"],exalt:["Libra"], detriment:["Cancer","Leo"],      fall:["Aries"]     },
  {name:"Uranus", sym:"♅",c:"#38d6f5",nature:"neutral", sect:"either",domicile:["Aquarius"],        exalt:[],           detriment:["Leo"],               fall:[]            },
  {name:"Neptune",sym:"♆",c:"#7c8cf5",nature:"neutral", sect:"either",domicile:["Pisces"],          exalt:[],           detriment:["Virgo"],             fall:[]            },
  {name:"Pluto",  sym:"♇",c:"#b366e0",nature:"malefic", sect:"either",domicile:["Scorpio"],         exalt:[],           detriment:["Taurus"],            fall:[]            },
];

const SIGNS = [
  {name:"Aries",      sym:"♈",el:"fire", mod:"cardinal",start:0,  c:"#e55050",trait:"Initiative, courage",        tripl:["Sun","Jupiter","Saturn"]    },
  {name:"Taurus",     sym:"♉",el:"earth",mod:"fixed",   start:30, c:"#3dbd7d",trait:"Stability, persistence",     tripl:["Venus","Moon","Mars"]       },
  {name:"Gemini",     sym:"♊",el:"air",  mod:"mutable", start:60, c:"#f6c23c",trait:"Curiosity, adaptability",    tripl:["Saturn","Mercury","Jupiter"]},
  {name:"Cancer",     sym:"♋",el:"water",mod:"cardinal",start:90, c:"#c4cdd4",trait:"Nurturing, emotional depth",  tripl:["Venus","Mars","Moon"]       },
  {name:"Leo",        sym:"♌",el:"fire", mod:"fixed",   start:120,c:"#f6ad3c",trait:"Creativity, self-expression",tripl:["Sun","Jupiter","Saturn"]    },
  {name:"Virgo",      sym:"♍",el:"earth",mod:"mutable", start:150,c:"#45d0c8",trait:"Analysis, refinement",       tripl:["Venus","Moon","Mars"]       },
  {name:"Libra",      sym:"♎",el:"air",  mod:"cardinal",start:180,c:"#e879a0",trait:"Balance, harmony",           tripl:["Saturn","Mercury","Jupiter"]},
  {name:"Scorpio",    sym:"♏",el:"water",mod:"fixed",   start:210,c:"#b366e0",trait:"Intensity, transformation",  tripl:["Venus","Mars","Moon"]       },
  {name:"Sagittarius",sym:"♐",el:"fire", mod:"mutable", start:240,c:"#9b7fe6",trait:"Adventure, wisdom",          tripl:["Sun","Jupiter","Saturn"]    },
  {name:"Capricorn",  sym:"♑",el:"earth",mod:"cardinal",start:270,c:"#7a8594",trait:"Ambition, mastery",          tripl:["Venus","Moon","Mars"]       },
  {name:"Aquarius",   sym:"♒",el:"air",  mod:"fixed",   start:300,c:"#38d6f5",trait:"Innovation, freedom",        tripl:["Saturn","Mercury","Jupiter"]},
  {name:"Pisces",     sym:"♓",el:"water",mod:"mutable", start:330,c:"#7c8cf5",trait:"Intuition, compassion",      tripl:["Venus","Mars","Moon"]       },
];

const ASPECTS = [
  {name:"Conjunction",   angle:0,  orb:8,  sym:"☌", power:10,nature:"fusion",     c:"#f6ad3c",tier:1},
  {name:"Opposition",    angle:180,orb:8,  sym:"☍", power:9, nature:"polarity",   c:"#e879a0",tier:1},
  {name:"Square",        angle:90, orb:7,  sym:"□", power:8, nature:"tension",    c:"#e55050",tier:1},
  {name:"Trine",         angle:120,orb:7,  sym:"△", power:7, nature:"flow",       c:"#3dbd7d",tier:1},
  {name:"Sextile",       angle:60, orb:5,  sym:"⚹", power:4, nature:"opportunity",c:"#45d0c8",tier:1},
  {name:"Quincunx",      angle:150,orb:3,  sym:"⚻", power:3, nature:"adjustment", c:"#9b7fe6",tier:2},
  {name:"Semi-square",   angle:45, orb:2,  sym:"∠", power:3, nature:"friction",   c:"#e5a0a0",tier:2},
  {name:"Sesquiquadrate",angle:135,orb:2,  sym:"⚼", power:3, nature:"agitation",  c:"#d0a0e0",tier:2},
  {name:"Semi-sextile",  angle:30, orb:2,  sym:"⊻", power:2, nature:"subtle",     c:"#a0d0c8",tier:2},
  {name:"Quintile",      angle:72, orb:1.5,sym:"Q", power:3, nature:"creative",   c:"#f6c23c",tier:2},
  {name:"Biquintile",    angle:144,orb:1.5,sym:"bQ",power:3, nature:"creative",   c:"#f6c23c",tier:2},
];

const DOMAINS = [
  {id:"career",   name:"Career & Business",     icon:"💼",rulers:["Sun","Saturn","Jupiter","Mars"],          weight:{Sun:1.4,Saturn:1.3,Jupiter:1.2,Mars:1.1},   sub:"Launches, promotions, ventures, authority"},
  {id:"love",     name:"Love & Relationships",  icon:"💕",rulers:["Venus","Moon","Jupiter"],                 weight:{Venus:1.5,Moon:1.3,Jupiter:1.1},             sub:"Commitments, proposals, deep connection"},
  {id:"contracts",name:"Contracts & Signing",   icon:"📜",rulers:["Mercury","Jupiter","Saturn"],            weight:{Mercury:1.6,Jupiter:1.2,Saturn:1.2},         sub:"Legal filings, negotiations, agreements"},
  {id:"travel",   name:"Travel & Relocation",   icon:"✈️",rulers:["Mercury","Jupiter","Moon"],              weight:{Mercury:1.3,Jupiter:1.4,Moon:1.2},           sub:"Moving, journeys, new environments"},
  {id:"health",   name:"Health & Body",          icon:"🌿",rulers:["Mars","Sun","Moon"],                    weight:{Mars:1.4,Sun:1.2,Moon:1.3},                  sub:"Surgery timing, regimens, recovery"},
  {id:"creative", name:"Creative Projects",      icon:"🎨",rulers:["Venus","Neptune","Sun","Mercury"],      weight:{Venus:1.4,Neptune:1.3,Sun:1.2,Mercury:1.1},  sub:"Art, writing, launches, performance"},
  {id:"learning", name:"Learning & Growth",      icon:"📚",rulers:["Mercury","Jupiter","Saturn"],           weight:{Mercury:1.5,Jupiter:1.3,Saturn:1.1},         sub:"Courses, exams, study, certification"},
  {id:"spiritual",name:"Spiritual & Inner Work", icon:"🧘",rulers:["Neptune","Moon","Pluto"],               weight:{Neptune:1.5,Moon:1.3,Pluto:1.2},             sub:"Retreats, therapy, meditation, healing"},
  {id:"financial",name:"Major Purchases",        icon:"💰",rulers:["Venus","Jupiter","Saturn","Pluto"],     weight:{Venus:1.3,Jupiter:1.4,Saturn:1.3,Pluto:1.2}, sub:"Property, vehicles, investments, salary"},
];

// ── GENE KEYS (Real Rudd Solar Longitude Mapping) ─────────────
// Each GK spans 5.625° of ecliptic. Sequence starts at 0° Aries = GK25
const GK_SEQUENCE = [
  25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,
  7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,
  10,58,38,54,61,60,41,19,13,49,30,55,37,63,22,36
];
const GK_DATA: Record<number,{shadow:string,gift:string,siddhi:string}> = {
  1:{shadow:"Entropy",gift:"Freshness",siddhi:"Beauty"}, 2:{shadow:"Dislocation",gift:"Resourcefulness",siddhi:"Unity"},
  3:{shadow:"Chaos",gift:"Innovation",siddhi:"Innocence"}, 4:{shadow:"Intolerance",gift:"Understanding",siddhi:"Forgiveness"},
  5:{shadow:"Impatience",gift:"Patience",siddhi:"Timelessness"}, 6:{shadow:"Conflict",gift:"Diplomacy",siddhi:"Peace"},
  7:{shadow:"Division",gift:"Guidance",siddhi:"Virtue"}, 8:{shadow:"Mediocrity",gift:"Style",siddhi:"Exquisiteness"},
  9:{shadow:"Inertia",gift:"Perspective",siddhi:"Invincibility"}, 10:{shadow:"Self-Obsession",gift:"Naturalness",siddhi:"Being"},
  11:{shadow:"Obscurity",gift:"Idealism",siddhi:"Light"}, 12:{shadow:"Vanity",gift:"Discrimination",siddhi:"Purity"},
  13:{shadow:"Discord",gift:"Discernment",siddhi:"Empathy"}, 14:{shadow:"Compromise",gift:"Competence",siddhi:"Bounteousness"},
  15:{shadow:"Dullness",gift:"Magnetism",siddhi:"Florescence"}, 16:{shadow:"Indifference",gift:"Versatility",siddhi:"Mastery"},
  17:{shadow:"Opinion",gift:"Astuteness",siddhi:"Omniscience"}, 18:{shadow:"Judgment",gift:"Integrity",siddhi:"Perfection"},
  19:{shadow:"Co-dependence",gift:"Sensitivity",siddhi:"Sacrifice"}, 20:{shadow:"Superficiality",gift:"Self-Assurance",siddhi:"Presence"},
  21:{shadow:"Control",gift:"Authority",siddhi:"Valour"}, 22:{shadow:"Dishonour",gift:"Graciousness",siddhi:"Grace"},
  23:{shadow:"Complexity",gift:"Simplicity",siddhi:"Quintessence"}, 24:{shadow:"Addiction",gift:"Invention",siddhi:"Silence"},
  25:{shadow:"Constriction",gift:"Acceptance",siddhi:"Universal Love"}, 26:{shadow:"Pride",gift:"Artfulness",siddhi:"Invisibility"},
  27:{shadow:"Selfishness",gift:"Altruism",siddhi:"Selflessness"}, 28:{shadow:"Purposelessness",gift:"Totality",siddhi:"Immortality"},
  29:{shadow:"Half-heartedness",gift:"Commitment",siddhi:"Devotion"}, 30:{shadow:"Desire",gift:"Lightness",siddhi:"Rapture"},
  31:{shadow:"Arrogance",gift:"Leadership",siddhi:"Humility"}, 32:{shadow:"Failure",gift:"Preservation",siddhi:"Veneration"},
  33:{shadow:"Forgetting",gift:"Mindfulness",siddhi:"Revelation"}, 34:{shadow:"Force",gift:"Strength",siddhi:"Majesty"},
  35:{shadow:"Hunger",gift:"Adventure",siddhi:"Boundlessness"}, 36:{shadow:"Turbulence",gift:"Humanity",siddhi:"Compassion"},
  37:{shadow:"Weakness",gift:"Equality",siddhi:"Tenderness"}, 38:{shadow:"Struggle",gift:"Perseverance",siddhi:"Honor"},
  39:{shadow:"Provocation",gift:"Dynamic Energy",siddhi:"Liberation"}, 40:{shadow:"Exhaustion",gift:"Resolve",siddhi:"Divine Will"},
  41:{shadow:"Fantasy",gift:"Anticipation",siddhi:"Emanation"}, 42:{shadow:"Expectation",gift:"Detachment",siddhi:"Celebration"},
  43:{shadow:"Deafness",gift:"Insight",siddhi:"Epiphany"}, 44:{shadow:"Interference",gift:"Teamwork",siddhi:"Synarchy"},
  45:{shadow:"Dominance",gift:"Synergy",siddhi:"Communion"}, 46:{shadow:"Seriousness",gift:"Delight",siddhi:"Ecstasy"},
  47:{shadow:"Oppression",gift:"Transmutation",siddhi:"Transfiguration"}, 48:{shadow:"Inadequacy",gift:"Resourcefulness",siddhi:"Wisdom"},
  49:{shadow:"Reaction",gift:"Revolution",siddhi:"Rebirth"}, 50:{shadow:"Corruption",gift:"Harmony",siddhi:"Enlightenment"},
  51:{shadow:"Agitation",gift:"Initiative",siddhi:"Awakening"}, 52:{shadow:"Stress",gift:"Restraint",siddhi:"Stillness"},
  53:{shadow:"Immaturity",gift:"Expansion",siddhi:"Superabundance"}, 54:{shadow:"Greed",gift:"Aspiration",siddhi:"Ascension"},
  55:{shadow:"Victimization",gift:"Freedom",siddhi:"Freedom"}, 56:{shadow:"Distraction",gift:"Enrichment",siddhi:"Intoxication"},
  57:{shadow:"Unease",gift:"Intuition",siddhi:"Clarity"}, 58:{shadow:"Dissatisfaction",gift:"Vitality",siddhi:"Bliss"},
  59:{shadow:"Dishonesty",gift:"Intimacy",siddhi:"Transparency"}, 60:{shadow:"Limitation",gift:"Realism",siddhi:"Justice"},
  61:{shadow:"Psychosis",gift:"Inspiration",siddhi:"Sanctity"}, 62:{shadow:"Intellectualism",gift:"Precision",siddhi:"Impeccability"},
  63:{shadow:"Doubt",gift:"Inquiry",siddhi:"Truth"}, 64:{shadow:"Confusion",gift:"Imagination",siddhi:"Illumination"},
};

const gkFromLng = (lng: number) => GK_SEQUENCE[Math.floor(((lng%360)+360)%360 / 5.625) % 64];
const gkHarmonic = (k1:number,k2:number): "harmonic"|"tension"|"neutral" => {
  const diff = Math.min(Math.abs(k1-k2), 64-Math.abs(k1-k2));
  return diff<=3||diff===32?"harmonic":diff>=28&&diff<=36?"tension":"neutral";
};

// ── MATH HELPERS ───────────────────────────────────────────────
const mod360 = (v:number) => ((v%360)+360)%360;
const toRad = (d:number) => d*Math.PI/180;
const toDeg = (r:number) => r*180/Math.PI;

const jcent = (d:Date, timeStr?:string) => {
  const y=d.getFullYear(),m=d.getMonth()+1,da=d.getDate();
  const a=Math.floor((14-m)/12),y1=y+4800-a,m1=m+12*a-3;
  let JD = da+Math.floor((153*m1+2)/5)+365*y1+Math.floor(y1/4)-Math.floor(y1/100)+Math.floor(y1/400)-32045;
  if(timeStr){const [hh,mm]=(timeStr||"12:00").split(":").map(Number); JD+=(hh+(mm||0)/60)/24-0.5;}
  else JD+=0.5; // noon default
  return (JD-2451545.0)/36525;
};

// ── MEEUS PLANETARY POSITIONS ─────────────────────────────────
type PlanetPos = {
  name:string, lng:number, sign:typeof SIGNS[0], degree:number,
  planet:typeof PLANETS[0]|undefined, retro:boolean, speed:number,
  dignity:string, combustion:string,
};

const getPlanetPositions = (date:Date, timeStr?:string): PlanetPos[] => {
  const T=jcent(date,timeStr), T2=T*T, T3=T2*T;

  // Sun (Meeus Ch22, ±0.01°)
  const L0=mod360(280.46646+36000.76983*T+0.0003032*T2);
  const M_sun=mod360(357.52911+35999.05029*T-0.0001537*T2);
  const Mr=toRad(M_sun);
  const C_sun=(1.914602-0.004817*T-0.000014*T2)*Math.sin(Mr)+(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);
  const sunLng=mod360(L0+C_sun);

  // Moon (Meeus Ch47 main terms, ±0.3°)
  const D =mod360(297.85036+445267.111480*T-0.0019142*T2+T3/189474);
  const M_m=mod360(357.52772+35999.050340*T-0.0001603*T2);
  const Mp=mod360(134.96298+477198.867398*T+0.0086972*T2+T3/56250);
  const F =mod360(93.27191 +483202.017538*T-0.0036825*T2+T3/327270);
  const moonLng=mod360(
    218.3165+481267.8813*T
    +6.289*Math.sin(toRad(Mp))
    -1.274*Math.sin(toRad(2*D-Mp))
    +0.658*Math.sin(toRad(2*D))
    -0.186*Math.sin(toRad(M_m))
    -0.059*Math.sin(toRad(2*D-2*Mp))
    -0.057*Math.sin(toRad(2*D-M_m-Mp))
    +0.053*Math.sin(toRad(2*D+Mp))
    +0.046*Math.sin(toRad(2*D-M_m))
    +0.041*Math.sin(toRad(Mp-M_m))
    -0.035*Math.sin(toRad(D))
    -0.031*Math.sin(toRad(Mp+M_m))
    -0.015*Math.sin(toRad(2*F-2*D))
    +0.011*Math.sin(toRad(2*D-2*M_m+Mp))
  );

  // Lunar nodes (mean, ±0.5°)
  const nNodeLng=mod360(125.0445222-1934.1362608*T+0.0020708*T2+T3/450000);
  const sNodeLng=mod360(nNodeLng+180);

  // Inner/outer planets (VSOP87 abbreviated)
  const mercLng=mod360(252.250906+149472.6746358*T+2.0*Math.sin(toRad(174.7948+4452671.1948*T)));
  const venusLng=mod360(181.979801+58517.8156760*T+0.5*Math.sin(toRad(5.9893+1221669.1*T)));
  const marsLng=mod360(355.433+19140.2993039*T+0.6569*Math.sin(toRad(19.373+38071.264*T))+0.1340*Math.sin(toRad(150.740+14146.010*T)));
  const jupLng=mod360(34.351519+3034.9056606*T+0.4981*Math.sin(toRad(20.9366+1221.4806*T))+0.1563*Math.sin(toRad(45.0830+2443.0*T)));
  const satLng=mod360(50.077444+1222.1138488*T+0.4116*Math.sin(toRad(14.4444+613.0*T))+0.1963*Math.sin(toRad(45.0830+2443.0*T)));
  const uranLng=mod360(314.055005+428.4669983*T+0.1122*Math.sin(toRad(190.4917+427.1*T)));
  const neptLng=mod360(304.348665+218.4862002*T+0.0324*Math.sin(toRad(231.1+218.6*T)));
  const plutLng=mod360(238.92881+145.2078*T);

  const raw:Record<string,number> = {
    Sun:sunLng,Moon:moonLng,Mercury:mercLng,Venus:venusLng,
    Mars:marsLng,Jupiter:jupLng,Saturn:satLng,Uranus:uranLng,
    Neptune:neptLng,Pluto:plutLng,NNode:nNodeLng,SNode:sNodeLng
  };

  // Speed via yesterday comparison
  const d2=new Date(date); d2.setDate(d2.getDate()-1);
  const T2d=jcent(d2,timeStr);
  const prevLng=(name:string)=>{
    switch(name){
      case"Sun":{const M=mod360(357.52911+35999.05029*T2d);return mod360(280.46646+36000.76983*T2d+(1.914602-0.004817*T2d)*Math.sin(toRad(M)));}
      case"Moon":return mod360(218.3165+481267.8813*T2d);
      case"Mercury":return mod360(252.250906+149472.6746358*T2d);
      case"Venus":return mod360(181.979801+58517.8156760*T2d);
      case"Mars":return mod360(355.433+19140.2993039*T2d);
      case"Jupiter":return mod360(34.351519+3034.9056606*T2d);
      case"Saturn":return mod360(50.077444+1222.1138488*T2d);
      case"Uranus":return mod360(314.055005+428.4669983*T2d);
      case"Neptune":return mod360(304.348665+218.4862002*T2d);
      case"Pluto":return mod360(238.92881+145.2078*T2d);
      case"NNode":return mod360(125.0445222-1934.1362608*T2d);
      case"SNode":return mod360(mod360(125.0445222-1934.1362608*T2d)+180);
      default:return 0;
    }
  };

  return Object.entries(raw).map(([name,lng])=>{
    const l=mod360(lng);
    const sign=SIGNS[Math.floor(l/30)];
    const planet=PLANETS.find(p=>p.name===name);
    let speed=l-prevLng(name); if(speed>180)speed-=360; if(speed<-180)speed+=360;
    const retro=speed<0;
    // Dignity
    let dignity="peregrine";
    if(planet?.domicile?.includes(sign.name)) dignity="domicile";
    else if(planet?.exalt?.includes(sign.name)) dignity="exaltation";
    else if(planet?.detriment?.includes(sign.name)) dignity="detriment";
    else if(planet?.fall?.includes(sign.name)) dignity="fall";
    else if(sign.tripl?.includes(name)) dignity="triplicity";
    // Combustion
    let combustion="none";
    if(name!=="Sun"&&name!=="NNode"&&name!=="SNode"){
      let diff=Math.abs(l-sunLng); if(diff>180)diff=360-diff;
      if(diff<0.2833) combustion="cazimi";
      else if(diff<8.5) combustion="combust";
      else if(diff<17) combustion="under_beams";
    }
    return {name,lng:l,sign,degree:l%30,planet,retro,speed,dignity,combustion};
  });
};

// ── ASCENDANT + HOUSES (Whole Sign, requires birth time & place) ─
const getAscendant = (date:Date, timeStr:string, lat:number, lon:number): {asc:number,mc:number,ascSign:typeof SIGNS[0]} => {
  const T=jcent(date,timeStr);
  // Greenwich Sidereal Time
  const JD=T*36525+2451545.0;
  const GST=mod360(280.46061837+360.98564736629*(JD-2451545.0)+0.000387933*T*T-T*T*T/38710000);
  // Local Sidereal Time
  const LST=mod360(GST+lon);
  const RAMC=toRad(LST);
  // Obliquity
  const eps=toRad(23.4392911-0.0130042*T);
  // MC (Midheaven) = RAMC converted to ecliptic longitude
  const mc=mod360(toDeg(Math.atan2(Math.sin(RAMC),Math.cos(RAMC)*Math.cos(eps)+Math.tan(toRad(0))*Math.sin(eps))));
  // Ascendant
  const latR=toRad(lat);
  const asc=mod360(toDeg(Math.atan2(Math.cos(RAMC),-Math.sin(RAMC)*Math.cos(eps)-Math.tan(latR)*Math.sin(eps)))+180);
  const ascSign=SIGNS[Math.floor(asc/30)];
  return {asc,mc,ascSign};
};

// Whole Sign houses: 1st house starts at ASC sign, each sign = one house
const getHouseNum = (planetLng:number, ascLng:number): number => {
  const ascSignStart=Math.floor(ascLng/30)*30;
  const rel=mod360(planetLng-ascSignStart);
  return Math.floor(rel/30)+1;
};

// ── SUNRISE/SUNSET for proper sect & planetary hours ──────────
const getSunriseSunset = (date:Date, lat:number, lon:number): {sunrise:number,sunset:number} => {
  // Spencer's formula — accurate to ~1 min
  const JD=jcent(date)*36525+2451545.0;
  const n=Math.floor(JD-2451545.0+0.0008);
  const Jstar=n-lon/360;
  const M=mod360(357.5291+0.98560028*Jstar);
  const C=1.9148*Math.sin(toRad(M))+0.02*Math.sin(toRad(2*M))+0.0003*Math.sin(toRad(3*M));
  const lam=mod360(M+C+180+102.9372);
  const Jtransit=2451545.0+Jstar+0.0053*Math.sin(toRad(M))-0.0069*Math.sin(toRad(2*lam));
  const sinD=Math.sin(toRad(lam))*Math.sin(toRad(23.45));
  const cosH0=(Math.sin(toRad(-0.8333))-sinD*Math.sin(toRad(lat)))/(Math.cos(Math.asin(sinD))*Math.cos(toRad(lat)));
  if(Math.abs(cosH0)>1) return{sunrise:6,sunset:18}; // polar
  const H0=toDeg(Math.acos(cosH0))/360;
  // Convert JD fraction to hour
  const jdToHour=(jd:number)=>((jd-Math.floor(jd)+0.5)*24)%24;
  return {sunrise:jdToHour(Jtransit-H0), sunset:jdToHour(Jtransit+H0)};
};

// Chaldean planetary hour based on actual sunrise
const getPlanetaryHour = (date:Date, sunrise:number, sunset:number): string => {
  const hrs=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
  const dayRulers=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
  const dayRuler=dayRulers[date.getDay()];
  const now=date.getHours()+(date.getMinutes()/60);
  const isDay=now>=sunrise&&now<sunset;
  const dayLen=sunset-sunrise, nightLen=24-dayLen;
  let hourNum:number;
  if(isDay) hourNum=Math.floor((now-sunrise)/(dayLen/12));
  else {
    const nightStart=now<sunrise?now+24-sunset:now-sunset;
    hourNum=12+Math.floor(nightStart/(nightLen/12));
  }
  return hrs[(hrs.indexOf(dayRuler)+hourNum)%7];
};

// ── ASPECTS WITH APPLYING/SEPARATING ─────────────────────────
type Aspect={p1:PlanetPos,p2:PlanetPos,asp:typeof ASPECTS[0],orb:number,strength:number,exact:number,applying:boolean};

const getAspects=(p1:PlanetPos[],p2:PlanetPos[],minor=true):Aspect[]=>{
  const f:Aspect[]=[],seen=new Set<string>();
  const list=minor?ASPECTS:ASPECTS.filter(a=>a.tier===1);
  for(const a of p1) for(const b of p2){
    if(a.name===b.name) continue;
    let d=Math.abs(a.lng-b.lng); if(d>180)d=360-d;
    for(const asp of list){
      const orb=Math.abs(d-asp.angle);
      if(orb<=asp.orb){
        const k=[a.name,b.name].sort().join("-")+asp.name;
        if(!seen.has(k)){
          seen.add(k);
          // Applying: faster planet moving toward exact contact
          const applying=Math.abs(a.speed)>Math.abs(b.speed) ? a.speed>0 ? d>asp.angle-0.5 : d<asp.angle+0.5 : false;
          f.push({p1:a,p2:b,asp,orb:+orb.toFixed(1),strength:1-orb/asp.orb,exact:+((1-orb/asp.orb)*100).toFixed(0),applying});
        }
      }
    }
  }
  return f.sort((a,b)=>b.strength-a.strength);
};

// ── MOON PHASE ────────────────────────────────────────────────
const getMoonPhase=(pos:PlanetPos[])=>{
  const m=pos.find(p=>p.name==="Moon"),s=pos.find(p=>p.name==="Sun");
  if(!m||!s)return{name:"?",icon:"🌑",power:0,energy:"",angle:0};
  const a=mod360(m.lng-s.lng);
  if(a<22.5)  return{name:"New Moon",        icon:"🌑",power:8,energy:"Set intentions. Plant seeds. Begin.",               angle:a};
  if(a<67.5)  return{name:"Waxing Crescent", icon:"🌒",power:6,energy:"Building momentum. Take first steps.",             angle:a};
  if(a<112.5) return{name:"First Quarter",   icon:"🌓",power:5,energy:"Decision point. Commit or pivot.",                 angle:a};
  if(a<157.5) return{name:"Waxing Gibbous",  icon:"🌔",power:7,energy:"Refine and push. Almost peak.",                    angle:a};
  if(a<202.5) return{name:"Full Moon",        icon:"🌕",power:9,energy:"Culmination. Harvest. Heightened emotion.",        angle:a};
  if(a<247.5) return{name:"Waning Gibbous",  icon:"🌖",power:4,energy:"Gratitude. Share. Distribute.",                   angle:a};
  if(a<292.5) return{name:"Last Quarter",    icon:"🌗",power:3,energy:"Release. Let go. Forgive.",                        angle:a};
  return            {name:"Balsamic Moon",    icon:"🌘",power:2,energy:"Rest. Surrender. Prepare for renewal.",            angle:a};
};

// ── PROPER VOID OF COURSE (forward scan) ─────────────────────
const isVoidOfCourse=(pos:PlanetPos[]):boolean=>{
  const moon=pos.find(p=>p.name==="Moon"); if(!moon)return false;
  const degsLeft=30-moon.degree;
  const majorAngles=[0,60,90,120,180];
  for(const planet of pos.filter(p=>p.name!=="Moon"&&!["NNode","SNode"].includes(p.name))){
    const diff=mod360(planet.lng-moon.lng);
    for(const angle of majorAngles){
      const needed=mod360(angle-diff+360);
      if(needed>0.5&&needed<degsLeft+2) return false;
    }
  }
  return true;
};

// ── MUTUAL RECEPTION ─────────────────────────────────────────
const getMutualReceptions=(positions:PlanetPos[])=>{
  const result:{a:string,b:string}[]=[];
  for(let i=0;i<positions.length;i++) for(let j=i+1;j<positions.length;j++){
    const pA=positions[i],pB=positions[j];
    if(pA.planet?.domicile.includes(pB.sign.name)&&pB.planet?.domicile.includes(pA.sign.name))
      result.push({a:pA.name,b:pB.name});
  }
  return result;
};

// ── STELLIUMS ────────────────────────────────────────────────
const getStelliums=(positions:PlanetPos[])=>{
  const bySign:Record<string,string[]>={};
  positions.filter(p=>!["NNode","SNode"].includes(p.name)).forEach(p=>{
    if(!bySign[p.sign.name])bySign[p.sign.name]=[];
    bySign[p.sign.name].push(p.name);
  });
  return Object.entries(bySign).filter(([,ps])=>ps.length>=3)
    .map(([sign,planets])=>({sign,planets,power:planets.length*3}));
};

// ── MIDPOINTS ────────────────────────────────────────────────
type Midpoint={natalA:string,natalB:string,midpoint:number,transit:string,orb:number,nature:"benefic"|"malefic"|"neutral"};
const getMidpoints=(natal:PlanetPos[],transit:PlanetPos[]):Midpoint[]=>{
  const results:Midpoint[]=[];
  const BENEFICS=["Venus","Jupiter","Sun"], MALEFICS=["Saturn","Mars","Pluto"];
  for(let i=0;i<natal.length;i++) for(let j=i+1;j<natal.length;j++){
    const mp=mod360((natal[i].lng+natal[j].lng)/2);
    for(const m of [mp,mod360(mp+180)]){
      for(const t of transit.filter(p=>!["NNode","SNode"].includes(p.name))){
        let diff=Math.abs(t.lng-m); if(diff>180)diff=360-diff;
        if(diff<1.5){
          const nature:Midpoint["nature"]=BENEFICS.includes(t.name)?"benefic":MALEFICS.includes(t.name)?"malefic":"neutral";
          results.push({natalA:natal[i].name,natalB:natal[j].name,midpoint:m,transit:t.name,orb:+diff.toFixed(2),nature});
        }
      }
    }
  }
  return results.sort((a,b)=>a.orb-b.orb).slice(0,8);
};

// ── ANTISCIA (mirror points across 0° Cancer/Capricorn axis) ──
const getAntiscia=(natal:PlanetPos[],transit:PlanetPos[])=>{
  const results:{natal:string,transit:string,orb:number}[]=[];
  for(const n of natal) for(const t of transit){
    if(n.name===t.name) continue;
    // Antiscion of a planet: 30-(lng%30) + (sign mapped across solstice axis)
    const nAntiscion=mod360(180-(n.lng));
    let diff=Math.abs(t.lng-nAntiscion); if(diff>180)diff=360-diff;
    if(diff<3) results.push({natal:n.name,transit:t.name,orb:+diff.toFixed(1)});
  }
  return results.sort((a,b)=>a.orb-b.orb).slice(0,5);
};

// ── SOLAR ARC DIRECTIONS ─────────────────────────────────────
// Age = (targetDate - birthDate) / 365.25, then add that many degrees to all natal planets
const getSolarArcs=(natal:PlanetPos[],birthDate:Date,targetDate:Date)=>{
  const ageYears=(targetDate.getTime()-birthDate.getTime())/(365.25*24*60*60*1000);
  const arcDegrees=ageYears; // 1°/year — solar arc rate
  return natal.map(p=>({...p,lng:mod360(p.lng+arcDegrees),arcDeg:+arcDegrees.toFixed(2)}));
};

// ── SECONDARY PROGRESSIONS ───────────────────────────────────
// Day-for-a-year: natal + N days of ephemeris movement = N years progressed
const getProgressedPositions=(birthDate:Date,targetDate:Date,birthTime?:string)=>{
  const ageYears=(targetDate.getTime()-birthDate.getTime())/(365.25*24*60*60*1000);
  const progDate=new Date(birthDate.getTime()+ageYears*24*60*60*1000); // add N days
  return getPlanetPositions(progDate,birthTime);
};

// ── PART OF FORTUNE ──────────────────────────────────────────
const getPartOfFortune=(pos:PlanetPos[],asc:number,isDay:boolean):number=>{
  const sun=pos.find(p=>p.name==="Sun")?.lng||0;
  const moon=pos.find(p=>p.name==="Moon")?.lng||0;
  return isDay ? mod360(asc+moon-sun) : mod360(asc+sun-moon);
};

// ── SOLAR RETURN SENSITIVITY ─────────────────────────────────
const getSolarReturnSensitivity=(natal:PlanetPos[],transit:PlanetPos[])=>{
  const nSun=natal.find(p=>p.name==="Sun")?.lng||0;
  const tSun=transit.find(p=>p.name==="Sun")?.lng||0;
  let diff=Math.abs(tSun-nSun); if(diff>180)diff=360-diff;
  return diff<0.5?3:diff<5?2:diff<15?1:0;
};

// ── ECLIPSE SENSITIVITY ──────────────────────────────────────
// Known recent eclipses (within engine range). We check if natal planet is near an eclipse degree
const RECENT_ECLIPSES=[
  {date:"2024-03-25",lng:5.1,type:"lunar"},{date:"2024-04-08",lng:19.2,type:"solar"},
  {date:"2024-09-17",lng:356.0,type:"lunar"},{date:"2024-10-02",lng:10.7,type:"solar"},
  {date:"2025-03-14",lng:354.4,type:"lunar"},{date:"2025-03-29",lng:9.2,type:"solar"},
  {date:"2025-09-07",lng:345.4,type:"lunar"},{date:"2025-09-21",lng:178.6,type:"solar"},
];
const getEclipseSensitivity=(natal:PlanetPos[],targetDate:Date)=>{
  const hits:{planet:string,eclipseDeg:number,type:string,orb:number}[]=[];
  const sixMonthsAgo=new Date(targetDate); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);
  const recentEclipses=RECENT_ECLIPSES.filter(e=>new Date(e.date)>=sixMonthsAgo&&new Date(e.date)<=targetDate);
  for(const e of recentEclipses) for(const p of natal.filter(p=>!["NNode","SNode"].includes(p.name))){
    let diff=Math.abs(p.lng-e.lng); if(diff>180)diff=360-diff;
    if(diff<10) hits.push({planet:p.name,eclipseDeg:e.lng,type:e.type,orb:+diff.toFixed(1)});
  }
  return hits.sort((a,b)=>a.orb-b.orb).slice(0,4);
};

// ── DOMAIN SCORING ENGINE ────────────────────────────────────
type Signal={text:string,val:number,type:"green"|"red"|"warning"|"caution",conf:number,detail:string,system:string};

const scoreDomain=(
  dom:typeof DOMAINS[0],
  natal:PlanetPos[], transit:PlanetPos[],
  date:Date, birthDate:Date,
  midpoints:Midpoint[],
  stelliums:{sign:string,planets:string[],power:number}[],
  natalStelliums:{sign:string,planets:string[],power:number}[],
  mutualReceptions:{a:string,b:string}[],
  antiscia:{natal:string,transit:string,orb:number}[],
  solarArcs:PlanetPos[],
  progressed:PlanetPos[],
  solarReturnBonus:number,
  eclipseHits:{planet:string,eclipseDeg:number,type:string,orb:number}[],
  planetaryHour:string,
  ascLng:number|null,
  partOfFortune:number|null,
  isDay:boolean,
  houses:Record<string,number>,
)=>{
  const signals:Signal[]=[];
  let score=0;
  const aspects=getAspects(transit,natal,true);
  const rel=aspects.filter(a=>dom.rulers.includes(a.p1.name)||dom.rulers.includes(a.p2.name));
  const BENEFICS=["Venus","Jupiter","Sun"], MALEFICS=["Saturn","Mars","Pluto"];

  // ── S1: Transit-natal aspects (applying = 1.4x) ──
  rel.forEach(a=>{
    const domW=(dom.weight as Record<string,number>)[a.p1.name]||1.0;
    let imp=a.strength*a.asp.power*domW*(a.applying?1.4:0.8);
    const positive=["flow","opportunity","fusion","creative","subtle"].includes(a.asp.nature);
    if(positive){
      if(BENEFICS.includes(a.p1.name))imp*=1.5;
      score+=imp;
      signals.push({text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+imp.toFixed(1),type:"green",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} · ${a.applying?"applying ↑":"separating ↓"} · ${a.exact}% exact`,system:"Transit"});
    } else {
      if(MALEFICS.includes(a.p1.name))imp*=1.4;
      score-=imp;
      signals.push({text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:-imp.toFixed(1),type:"red",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} · ${a.applying?"applying pressure ↑":"separating"} · ${a.exact}% exact`,system:"Transit"});
    }
  });

  // ── S2: Dignity (transit rulers) ──
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    if(p.dignity==="domicile")    {score+=4;signals.push({text:`${p.planet?.sym} ${p.name} Domicile (${p.sign.name})`,val:4,type:"green",conf:8,detail:"Planet in home sign — maximum natural strength",system:"Dignity"});}
    else if(p.dignity==="exaltation"){score+=3;signals.push({text:`${p.planet?.sym} ${p.name} Exalted in ${p.sign.name}`,val:3,type:"green",conf:7,detail:"Planet at peak potency — highly favourable",system:"Dignity"});}
    else if(p.dignity==="triplicity"){score+=1;signals.push({text:`${p.planet?.sym} ${p.name} Triplicity (${p.sign.name})`,val:1,type:"green",conf:5,detail:"Planet in compatible element — moderate strength",system:"Dignity"});}
    else if(p.dignity==="detriment") {score-=3;signals.push({text:`${p.planet?.sym} ${p.name} Detriment (${p.sign.name})`,val:-3,type:"caution",conf:6,detail:"Planet weakened — actions may misfire",system:"Dignity"});}
    else if(p.dignity==="fall")      {score-=2;signals.push({text:`${p.planet?.sym} ${p.name} Fall (${p.sign.name})`,val:-2,type:"caution",conf:5,detail:"Planet at minimum strength — extra care needed",system:"Dignity"});}
  });

  // ── S3: Combustion / Cazimi / Under Beams ──
  transit.filter(p=>dom.rulers.includes(p.name)&&p.name!=="Sun").forEach(p=>{
    if(p.combustion==="cazimi")     {score+=8;signals.push({text:`✨ ${p.name} CAZIMI — heart of Sun`,val:8,type:"green",conf:9,detail:"Rarest condition: planet at exact solar degree = divine empowerment",system:"Combustion"});}
    else if(p.combustion==="combust"){score-=4;signals.push({text:`🔥 ${p.name} Combust (within 8.5° Sun)`,val:-4,type:"warning",conf:7,detail:"Planet overwhelmed by solar light — judgement clouded",system:"Combustion"});}
    else if(p.combustion==="under_beams"){score-=2;signals.push({text:`🌤 ${p.name} Under Beams (8.5-17° Sun)`,val:-2,type:"caution",conf:5,detail:"Planet mildly weakened by solar proximity",system:"Combustion"});}
  });

  // ── S4: Sect ──
  const DAY_PLANETS=["Sun","Jupiter","Saturn"], NIGHT_PLANETS=["Moon","Venus","Mars"];
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    const inSect=(isDay&&DAY_PLANETS.includes(p.name))||(!isDay&&NIGHT_PLANETS.includes(p.name));
    if(inSect){score+=2;signals.push({text:`${isDay?"☀️":"🌙"} ${p.name} in sect (${isDay?"day":"night"} chart)`,val:2,type:"green",conf:5,detail:`Planet in natural ${isDay?"day":"night"}-time element`,system:"Sect"});}
  });

  // ── S5: Retrograde ──
  transit.filter(p=>p.retro&&dom.rulers.includes(p.name)).forEach(p=>{
    const pen=p.name==="Mercury"?-8:p.name==="Venus"?-6:p.name==="Mars"?-7:-4;
    score+=pen;
    signals.push({text:`${p.planet?.sym} ${p.name} RETROGRADE in ${p.sign.name}`,val:pen,type:"warning",conf:8,detail:p.name==="Mercury"?"Avoid signing — miscommunication & contract errors":p.name==="Venus"?"Re-evaluate, don't start new relationships/purchases":p.name==="Mars"?"Frustrated energy — action may backfire or stall":"Deep review phase, not initiation",system:"Retrograde"});
  });

  // ── S6: Moon Phase ──
  const mp=getMoonPhase(transit);
  const waxing=["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous"].includes(mp.name);
  if(["career","contracts","creative","learning","financial"].includes(dom.id)){
    if(waxing){score+=4;signals.push({text:`${mp.icon} ${mp.name} — Waxing`,val:4,type:"green",conf:6,detail:"Building lunar energy supports new initiatives",system:"Moon"});}
    else      {score-=3;signals.push({text:`${mp.icon} ${mp.name} — Waning`,val:-3,type:"caution",conf:5,detail:"Releasing phase — better for completing than starting",system:"Moon"});}
  }
  if(dom.id==="spiritual"&&["Full Moon","Waning Gibbous","Last Quarter","Balsamic Moon"].includes(mp.name)){score+=5;signals.push({text:`${mp.icon} ${mp.name} — supports inner work`,val:5,type:"green",conf:7,detail:"Heightened awareness and introspective energy",system:"Moon"});}
  if(dom.id==="love"&&mp.name==="Full Moon"){score+=4;signals.push({text:`🌕 Full Moon — emotional peak`,val:4,type:"green",conf:7,detail:"Feelings surface — powerful for honest connection",system:"Moon"});}

  // ── S7: Void of Course ──
  if(isVoidOfCourse(transit)){score-=6;signals.push({text:"🚫 Void of Course Moon",val:-6,type:"warning",conf:7,detail:"Moon makes no more aspects before sign change — actions tend to fizzle",system:"Moon"});}

  // ── S8: Lunar Nodes ──
  const nNode=transit.find(p=>p.name==="NNode"),sNode=transit.find(p=>p.name==="SNode");
  if(nNode&&sNode){
    natal.filter(p=>dom.rulers.includes(p.name)).forEach(nP=>{
      let dN=Math.abs(nNode.lng-nP.lng); if(dN>180)dN=360-dN;
      let dS=Math.abs(sNode.lng-nP.lng); if(dS>180)dS=360-dS;
      if(dN<8){score+=6;signals.push({text:`☊ North Node conjunct natal ${nP.name}`,val:6,type:"green",conf:8,detail:"Fate activation — this life area is opening for major growth. Powerful timing.",system:"Nodes"});}
      else if(dN<12){const majorA=[60,90,120,180];if(majorA.some(a=>Math.abs(dN-a)<5)){score+=2;signals.push({text:`☊ North Node aspect natal ${nP.name}`,val:2,type:"green",conf:5,detail:"Node in aspect — evolutionary momentum in this domain",system:"Nodes"});}}
      if(dS<8){score-=4;signals.push({text:`☋ South Node conjunct natal ${nP.name}`,val:-4,type:"caution",conf:7,detail:"Past karma releasing — familiar but draining patterns may surface",system:"Nodes"});}
    });
  }

  // ── S9: Stelliums ──
  stelliums.forEach(st=>{
    if(st.planets.some(p=>dom.rulers.includes(p))){score+=st.power*0.5;signals.push({text:`⭐ Stellium in ${st.sign}: ${st.planets.join(", ")}`,val:+(st.power*0.5).toFixed(1),type:"green",conf:6,detail:`${st.planets.length} planets clustered — amplified concentrated energy`,system:"Stellium"});}
  });
  natalStelliums.forEach(nst=>{
    const activator=transit.filter(t=>t.sign.name===nst.sign&&dom.rulers.includes(t.name)&&!t.retro);
    if(activator.length>0){score+=5;signals.push({text:`🌟 Natal stellium in ${nst.sign} ACTIVATED by ${activator[0].name}`,val:5,type:"green",conf:8,detail:`Transit ${activator[0].name} enters your natal ${nst.sign} stellium (${nst.planets.join("/")}) — major activation`,system:"Stellium"});}
  });

  // ── S10: Midpoints ──
  midpoints.filter(mp=>dom.rulers.includes(mp.transit)).forEach(mp=>{
    const val=mp.nature==="benefic"?3:mp.nature==="malefic"?-3:1;
    const type:Signal["type"]=mp.nature==="benefic"?"green":"red";
    score+=val;
    signals.push({text:`✦ ${mp.transit} at ${mp.natalA}/${mp.natalB} midpoint`,val,type,conf:5,detail:`${mp.nature} midpoint activation · ${mp.orb}° orb`,system:"Midpoint"});
  });

  // ── S11: Mutual Reception ──
  mutualReceptions.filter(mr=>dom.rulers.includes(mr.a)||dom.rulers.includes(mr.b)).forEach(mr=>{
    score+=3;signals.push({text:`🔄 Mutual Reception: ${mr.a} ↔ ${mr.b}`,val:3,type:"green",conf:7,detail:"Planets in each other's signs — mutually strengthened and cooperative",system:"Dignity"});
  });

  // ── S12: Solar Return ──
  if(solarReturnBonus>0&&["career","love","spiritual","financial"].includes(dom.id)){
    const v=solarReturnBonus*2;
    score+=v;
    signals.push({text:`☀️ Solar Return ${solarReturnBonus>=3?"exact":"approaching"}`,val:v,type:"green",conf:7,detail:solarReturnBonus>=3?"Sun at birth degree — peak annual reset. Major decisions carry extra weight.":"Approaching solar return — heightened sensitivity, major themes activating.",system:"SolarReturn"});
  }

  // ── S13: Gene Keys ──
  const nSun=natal.find(p=>p.name==="Sun"),tSun=transit.find(p=>p.name==="Sun");
  if(nSun&&tSun){
    const bGK=gkFromLng(nSun.lng),tGK=gkFromLng(tSun.lng),rel2=gkHarmonic(bGK,tGK);
    if(rel2==="harmonic"&&["creative","spiritual","love"].includes(dom.id)){score+=3;signals.push({text:`🔑 Gene Key ${tGK} harmonizes with birth GK ${bGK}`,val:3,type:"green",conf:5,detail:`Solar Gene Key resonance — ${GK_DATA[tGK]?.gift} energy aligned with your natal ${GK_DATA[bGK]?.gift}`,system:"GeneKeys"});}
    else if(rel2==="tension"&&["contracts","career","financial"].includes(dom.id)){score-=2;signals.push({text:`🔑 Gene Key ${tGK} challenges birth GK ${bGK}`,val:-2,type:"caution",conf:4,detail:`Solar GK friction — ${GK_DATA[tGK]?.shadow} energy may create resistance`,system:"GeneKeys"});}
  }

  // ── S14: Planetary Hour ──
  if(dom.rulers.includes(planetaryHour)){score+=3;signals.push({text:`⏰ Planetary Hour of ${planetaryHour} — aligned`,val:3,type:"green",conf:5,detail:`Current hour ruled by ${planetaryHour} — domain-aligned timing window`,system:"Hour"});}

  // ── S15: Solar Arc Directions ──
  const solarArcAspects=getAspects(solarArcs,natal,false);
  solarArcAspects.filter(a=>dom.rulers.includes(a.p1.name)&&a.orb<2).forEach(a=>{
    const positive=["flow","opportunity","fusion"].includes(a.asp.nature);
    const v=a.strength*a.asp.power*(positive?1:-1)*0.8;
    score+=v;
    signals.push({text:`🌀 Solar Arc ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+v.toFixed(1),type:positive?"green":"red",conf:7,detail:`Solar Arc direction (1°/year) — ${a.orb}° orb, ${positive?"supportive":"challenging"} life chapter theme`,system:"SolarArc"});
  });

  // ── S16: Secondary Progressions ──
  const progAspects=getAspects(progressed,natal,false);
  progAspects.filter(a=>dom.rulers.includes(a.p1.name)&&a.orb<1.5).forEach(a=>{
    const positive=["flow","opportunity","fusion"].includes(a.asp.nature);
    const v=a.strength*a.asp.power*(positive?1:-1)*0.7;
    score+=v;
    signals.push({text:`📈 Progressed ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+v.toFixed(1),type:positive?"green":"red",conf:6,detail:`Secondary progression — ${a.orb}° orb, ${positive?"opening":"challenging"} theme`,system:"Progression"});
  });

  // ── S17: Eclipse Sensitivity ──
  eclipseHits.filter(e=>dom.rulers.includes(e.planet)).forEach(e=>{score+=3;signals.push({text:`🌑 ${e.type==="solar"?"Solar":"Lunar"} eclipse activated natal ${e.planet}`,val:3,type:"green",conf:6,detail:`Eclipse at ${e.eclipseDeg.toFixed(1)}° within ${e.orb}° of your natal ${e.planet} — eclipse degrees stay "hot" for 6 months`,system:"Eclipse"});});

  // ── House weight (if we have houses) ──
  if(Object.keys(houses).length>0){
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
      const h=houses[p.name];
      if([1,4,7,10].includes(h)){score+=3;signals.push({text:`🏠 ${p.name} in angular house (${h}th)`,val:3,type:"green",conf:6,detail:"Angular house placement — planet at maximum strength and visibility",system:"Houses"});}
      else if([3,6,9,12].includes(h)){score-=1;signals.push({text:`🏠 ${p.name} in cadent house (${h}th)`,val:-1,type:"caution",conf:4,detail:"Cadent house — planet has reduced influence and expression",system:"Houses"});}
    });
    // Aspect to Ascendant/MC
    if(ascLng!==null){
      const angles=[{name:"ASC",lng:ascLng},{name:"MC",lng:mod360(ascLng+90)}];
      angles.forEach(angle=>{
        transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
          let diff=Math.abs(p.lng-angle.lng); if(diff>180)diff=360-diff;
          if(diff<5){score+=4;signals.push({text:`📍 ${p.name} conjunct ${angle.name}`,val:4,type:"green",conf:8,detail:`Transit ${p.name} on your ${angle.name} — major personal activation point`,system:"Houses"});}
        });
      });
    }
  }

  // ── Part of Fortune ──
  if(partOfFortune!==null&&["love","financial","career"].includes(dom.id)){
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
      let diff=Math.abs(p.lng-partOfFortune); if(diff>180)diff=360-diff;
      if(diff<8&&BENEFICS.includes(p.name)){score+=3;signals.push({text:`🍀 ${p.name} conjunct Part of Fortune`,val:3,type:"green",conf:6,detail:"Benefic planet at your fortune point — material and life luck activated",system:"ArabicParts"});}
    });
  }

  const norm=Math.max(-100,Math.min(100,score*2.2));
  const gn=signals.filter(s=>s.type==="green").length;
  const rd=signals.filter(s=>["red","warning","caution"].includes(s.type)).length;
  const systemCount=new Set(signals.map(s=>s.system)).size;
  const confidence=Math.min(9,Math.max(2,Math.round((Math.abs(norm)/100)*5+signals.length*0.22+systemCount*0.5+1.5)));
  const convergence=gn+rd?Math.round(Math.max(gn,rd)/(gn+rd)*100):50;
  return {score:norm,signals:signals.sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)),confidence,convergence,greenCount:gn,redCount:rd,totalSignals:signals.length};
};

// ── STYLES ────────────────────────────────────────────────────
const CL={bg:"#07060d",card:"#0e0d18",card2:"#16142a",bdr:"#1f1b3a",acc:"#f6ad3c",grn:"#3dbd7d",red:"#e55050",blu:"#38d6f5",pur:"#9b7fe6",cyn:"#45d0c8",pnk:"#e879a0",txt:"#e8e4f0",dim:"#6b6580",mut:"#3a3555"};
const vColor=(s:number)=>s>30?CL.grn:s>10?"#7ddba3":s>-10?CL.acc:s>-30?"#e5a0a0":CL.red;
const vText=(s:number)=>s>40?"EXCELLENT — Act with high confidence":s>20?"FAVORABLE — Conditions support action":s>5?"LEANING POSITIVE — Proceed with awareness":s>-5?"NEUTRAL — Mixed signals, use judgment":s>-20?"LEANING CHALLENGING — Caution recommended":s>-40?"CHALLENGING — Consider postponing":"AVOID — Strong signals against action";
const confText=(c:number)=>c>=8?"Very High":c>=6?"High":c>=4?"Moderate":"Low";
const fmtD=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtDL=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

// ── BULLET ────────────────────────────────────────────────────
const Bullet=({children,color,conf,val,strong}:{children?:React.ReactNode,color?:string,conf?:number,val?:number,strong?:string})=>(
  <div style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${CL.bdr}40`,alignItems:"flex-start"}}>
    <span style={{color:color||CL.txt,fontSize:14,marginTop:1}}>•</span>
    <div style={{flex:1,fontSize:12.5,lineHeight:1.65,fontFamily:"system-ui",color:CL.txt}}>
      {strong&&<b style={{color:color||CL.txt}}>{strong}</b>}{strong?" — ":""}{children}
      {conf!==undefined&&<span style={{color:CL.dim,fontStyle:"italic"}}> Conf: {conf}/10</span>}
      {val!==undefined&&<span style={{marginLeft:6,fontWeight:700,color:+val>0?CL.grn:CL.red}}>({+val>0?"+":""}{val})</span>}
    </div>
  </div>
);

// ── LOCATION SEARCH ───────────────────────────────────────────
const CITIES: Record<string,{lat:number,lon:number,tz:number}> = {
  "Sydney":{lat:-33.87,lon:151.21,tz:10},"Melbourne":{lat:-37.81,lon:144.96,tz:10},
  "Brisbane":{lat:-27.47,lon:153.03,tz:10},"Perth":{lat:-31.95,lon:115.86,tz:8},
  "London":{lat:51.51,lon:-0.13,tz:0},"New York":{lat:40.71,lon:-74.01,tz:-5},
  "Los Angeles":{lat:34.05,lon:-118.24,tz:-8},"Tokyo":{lat:35.68,lon:139.69,tz:9},
  "Paris":{lat:48.85,lon:2.35,tz:1},"Berlin":{lat:52.52,lon:13.41,tz:1},
  "Dubai":{lat:25.20,lon:55.27,tz:4},"Singapore":{lat:1.35,lon:103.82,tz:8},
  "Mumbai":{lat:19.08,lon:72.88,tz:5.5},"Toronto":{lat:43.65,lon:-79.38,tz:-5},
  "Chicago":{lat:41.88,lon:-87.63,tz:-6},"Amsterdam":{lat:52.37,lon:4.90,tz:1},
  "Auckland":{lat:-36.86,lon:174.77,tz:12},"Seoul":{lat:37.57,lon:126.98,tz:9},
  "Bangkok":{lat:13.75,lon:100.52,tz:7},"Johannesburg":{lat:-26.20,lon:28.04,tz:2},
};

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function App() {
  const [dob,setDob]=useState("");
  const [birthTime,setBirthTime]=useState("");
  const [birthCity,setBirthCity]=useState("");
  const [birthLat,setBirthLat]=useState<number|null>(null);
  const [birthLon,setBirthLon]=useState<number|null>(null);
  const [currentCity,setCurrentCity]=useState("");
  const [currentLat,setCurrentLat]=useState<number|null>(null);
  const [currentLon,setCurrentLon]=useState<number|null>(null);
  const [targetDate,setTargetDate]=useState(new Date().toISOString().split("T")[0]);
  const [targetTime,setTargetTime]=useState(new Date().toTimeString().slice(0,5));
  const [tab,setTab]=useState("reading");
  const [data,setData]=useState<any>(null);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [showAdvanced,setShowAdvanced]=useState(false);

  const handleCitySelect=(city:string, setter:(lat:number|null)=>void, setterLon:(lon:number|null)=>void)=>{
    const found=Object.entries(CITIES).find(([name])=>name.toLowerCase().includes(city.toLowerCase()));
    if(found){setter(found[1].lat);setterLon(found[1].lon);}
  };

  const getLocation=()=>{
    navigator.geolocation?.getCurrentPosition(pos=>{
      setCurrentLat(pos.coords.latitude);
      setCurrentLon(pos.coords.longitude);
      setCurrentCity(`${pos.coords.latitude.toFixed(2)},${pos.coords.longitude.toFixed(2)}`);
    });
  };

  const compute=useCallback(()=>{
    if(!dob)return;
    setLoading(true);
    setTimeout(()=>{
      const bDate=new Date(dob+"T12:00:00");
      const tDate=new Date(targetDate+"T12:00:00");
      const hasTime=!!birthTime, hasPlace=birthLat!==null&&birthLon!==null;
      const hasCurrent=currentLat!==null&&currentLon!==null;

      const natal=getPlanetPositions(bDate,birthTime||undefined);
      const transit=getPlanetPositions(tDate,targetTime||undefined);

      // Sun above horizon at analysis time/location → day chart
      let isDay=true;
      let sunrise=6,sunset=18;
      if(hasCurrent){
        const ss=getSunriseSunset(tDate,currentLat!,currentLon!);
        sunrise=ss.sunrise; sunset=ss.sunset;
        const nowH=parseInt(targetTime.split(":")[0])||12;
        isDay=nowH>=sunrise&&nowH<sunset;
      } else {
        const nowH=parseInt(targetTime.split(":")[0])||12;
        isDay=nowH>=6&&nowH<18;
      }

      // Ascendant + houses
      let ascLng:number|null=null, mcLng:number|null=null, ascSign:typeof SIGNS[0]|null=null;
      let houses:Record<string,number>={};
      let partOfFortune:number|null=null;
      if(hasTime&&hasPlace){
        const {asc,mc,ascSign:as}=getAscendant(bDate,birthTime,birthLat!,birthLon!);
        ascLng=asc; mcLng=mc; ascSign=as;
        // Whole sign houses
        natal.forEach(p=>{houses[p.name]=getHouseNum(p.lng,asc);});
        partOfFortune=getPartOfFortune(natal,asc,isDay);
      }

      const planetaryHour=hasCurrent?getPlanetaryHour(tDate,sunrise,sunset):
        (()=>{const hrs=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];const dayR=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"][tDate.getDay()];return hrs[(hrs.indexOf(dayR)+(parseInt(targetTime.split(":")[0])||12))%7];})();

      const allAspects=getAspects(transit,natal,true);
      const mp=getMoonPhase(transit);
      const voc=isVoidOfCourse(transit);
      const retros=transit.filter(p=>p.retro);
      const sunSign=natal.find(p=>p.name==="Sun")!.sign;
      const moonSign=natal.find(p=>p.name==="Moon")!.sign;
      const elements:{fire:number,earth:number,air:number,water:number}={fire:0,earth:0,air:0,water:0};
      natal.forEach(p=>{if(p.sign)(elements as any)[p.sign.el]++;});
      const stelliums=getStelliums(transit);
      const natalStelliums=getStelliums(natal);
      const midpoints=getMidpoints(natal,transit);
      const mutualReceptions=getMutualReceptions(transit);
      const antiscia=getAntiscia(natal,transit);
      const solarArcs=getSolarArcs(natal,bDate,tDate);
      const progressed=getProgressedPositions(bDate,tDate,birthTime||undefined);
      const solarReturnBonus=getSolarReturnSensitivity(natal,transit);
      const eclipseHits=getEclipseSensitivity(natal,tDate);
      const natalDignities=natal.filter(p=>p.dignity!=="peregrine");

      const nSun=natal.find(p=>p.name==="Sun")!;
      const tSun=transit.find(p=>p.name==="Sun")!;
      const birthGK=gkFromLng(nSun.lng), transitGK=gkFromLng(tSun.lng);

      const domains=DOMAINS.map(d=>({
        ...d,
        ...scoreDomain(d,natal,transit,tDate,bDate,midpoints,stelliums,natalStelliums,mutualReceptions,antiscia,solarArcs,progressed,solarReturnBonus,eclipseHits,planetaryHour,ascLng,partOfFortune,isDay,houses)
      })).sort((a,b)=>b.score-a.score);

      const overall=domains.reduce((s,d)=>s+d.score,0)/domains.length;
      const overallConf=Math.round(domains.reduce((s,d)=>s+d.confidence,0)/domains.length);
      const totalGreen=domains.reduce((s,d)=>s+d.greenCount,0);
      const totalRed=domains.reduce((s,d)=>s+d.redCount,0);
      const overallConv=totalGreen+totalRed?Math.round(Math.max(totalGreen,totalRed)/(totalGreen+totalRed)*100):50;
      const systemsActive=new Set(domains.flatMap((d:any)=>d.signals.map((s:Signal)=>s.system))).size;

      // 30-day forecast
      const forecast:any[]=[];
      for(let i=0;i<30;i++){
        const d=new Date(tDate); d.setDate(d.getDate()+i);
        const dt=getPlanetPositions(d,targetTime||undefined);
        let dayIsDay=true;
        if(hasCurrent){const ss=getSunriseSunset(d,currentLat!,currentLon!);const nowH=parseInt(targetTime.split(":")[0])||12;dayIsDay=nowH>=ss.sunrise&&nowH<ss.sunset;}
        const dStell=getStelliums(dt),dMid=getMidpoints(natal,dt),dMR=getMutualReceptions(dt);
        const dAnti=getAntiscia(natal,dt),dArcs=getSolarArcs(natal,bDate,d),dProg=getProgressedPositions(bDate,d,birthTime||undefined);
        const dSR=getSolarReturnSensitivity(natal,dt),dEcl=getEclipseSensitivity(natal,d);
        const dHour=hasCurrent?getPlanetaryHour(d,getSunriseSunset(d,currentLat!,currentLon!).sunrise,getSunriseSunset(d,currentLat!,currentLon!).sunset):planetaryHour;
        const ds=DOMAINS.map(dm=>({...dm,...scoreDomain(dm,natal,dt,d,bDate,dMid,dStell,natalStelliums,dMR,dAnti,dArcs,dProg,dSR,dEcl,dHour,ascLng,partOfFortune,dayIsDay,houses)}));
        const avg=ds.reduce((s,x)=>s+x.score,0)/ds.length;
        const best=ds.reduce((b,x)=>x.score>b.score?x:b,ds[0]);
        const worst=ds.reduce((b,x)=>x.score<b.score?x:b,ds[0]);
        forecast.push({date:d,overall:avg,best,worst,moonPhase:getMoonPhase(dt),domains:ds});
      }
      const bestDays=DOMAINS.map((dom,di)=>{
        const sorted=[...forecast].sort((a,b)=>b.domains[di].score-a.domains[di].score);
        return{domain:dom,top3:sorted.slice(0,3).map(f=>({date:f.date,score:f.domains[di].score,conf:f.domains[di].confidence})),bottom3:sorted.slice(-3).reverse().map(f=>({date:f.date,score:f.domains[di].score}))};
      });

      setData({natal,transit,allAspects,mp,voc,retros,sunSign,moonSign,elements,stelliums,natalStelliums,midpoints,mutualReceptions,antiscia,solarArcs,progressed,solarReturnBonus,eclipseHits,birthGK,transitGK,natalDignities,domains,overall,overallConf,overallConv,totalGreen,totalRed,systemsActive,forecast,bestDays,ascLng,mcLng,ascSign,partOfFortune,houses,planetaryHour,isDay,hasTime,hasPlace,hasCurrent});
      setLoading(false);
    },700);
  },[dob,birthTime,birthLat,birthLon,currentLat,currentLon,targetDate,targetTime]);

  useEffect(()=>{if(dob)compute();},[dob,birthTime,birthLat,birthLon,currentLat,currentLon,targetDate,targetTime]);

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
  const inputStyle={width:"100%",padding:"9px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:14,fontFamily:"system-ui"};
  const labelStyle={fontSize:9,color:CL.dim,display:"block" as const,marginBottom:3,fontFamily:"system-ui",letterSpacing:1};

  return (
    <div style={{background:CL.bg,color:CL.txt,minHeight:"100vh",fontFamily:"'Georgia','Palatino',serif",padding:"10px 14px",maxWidth:740,margin:"0 auto"}}>
      <style>{`@keyframes glow{0%,100%{text-shadow:0 0 15px #f6ad3c44}50%{text-shadow:0 0 30px #f6ad3c88,0 0 60px #9b7fe644}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}input[type=date],input[type=time]{font-family:inherit}input::-webkit-calendar-picker-indicator{filter:invert(0.7)}*{box-sizing:border-box}select{appearance:none}`}</style>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"16px 0 8px"}}>
        <div style={{fontSize:10,letterSpacing:6,color:CL.pur,fontWeight:700,fontFamily:"system-ui"}}>ORACLE v9</div>
        <h1 style={{fontSize:22,fontWeight:400,margin:"4px 0",fontStyle:"italic",background:`linear-gradient(135deg,${CL.acc},${CL.pnk},${CL.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glow 5s ease infinite"}}>Personal Decision Oracle</h1>
        <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>17 prediction systems · Birth time & place · Current location · Houses · Progressions · Solar Arc</div>
      </div>

      {/* ── INPUT PANEL ── */}
      <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#120e24)`,borderColor:CL.pur+"50"}}>
        {/* Row 1: DOB + Analysis date */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
          <div style={{flex:1,minWidth:130}}>
            <label style={labelStyle}>DATE OF BIRTH *</label>
            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={inputStyle}/>
          </div>
          <div style={{flex:1,minWidth:130}}>
            <label style={labelStyle}>ANALYSIS DATE *</label>
            <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} style={inputStyle}/>
          </div>
          <div style={{flex:1,minWidth:100}}>
            <label style={labelStyle}>ANALYSIS TIME</label>
            <input type="time" value={targetTime} onChange={e=>setTargetTime(e.target.value)} style={inputStyle}/>
          </div>
        </div>

        {/* Advanced toggle */}
        <button onClick={()=>setShowAdvanced(!showAdvanced)} style={{background:"transparent",border:`1px solid ${CL.bdr}`,borderRadius:8,color:CL.dim,fontSize:10,padding:"5px 12px",cursor:"pointer",fontFamily:"system-ui",marginBottom:showAdvanced?10:0}}>
          {showAdvanced?"▲ Hide":"▼ Add birth time, location & current city (more accurate reading)"}
        </button>

        {showAdvanced&&(<>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <div style={{flex:1,minWidth:130}}>
              <label style={labelStyle}>BIRTH TIME (optional)</label>
              <input type="time" value={birthTime} onChange={e=>setBirthTime(e.target.value)} style={inputStyle} placeholder="HH:MM"/>
            </div>
            <div style={{flex:2,minWidth:160}}>
              <label style={labelStyle}>BIRTH CITY (unlocks houses & rising)</label>
              <input type="text" value={birthCity} onChange={e=>{setBirthCity(e.target.value);handleCitySelect(e.target.value,setBirthLat,setBirthLon);}} style={inputStyle} placeholder="e.g. Sydney, London, New York..."/>
              {birthLat&&<div style={{fontSize:9,color:CL.grn,marginTop:2,fontFamily:"system-ui"}}>✓ {birthLat.toFixed(2)}°, {birthLon?.toFixed(2)}°</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:2,minWidth:160}}>
              <label style={labelStyle}>YOUR CURRENT CITY (for day/night, planetary hours)</label>
              <input type="text" value={currentCity} onChange={e=>{setCurrentCity(e.target.value);handleCitySelect(e.target.value,setCurrentLat,setCurrentLon);}} style={inputStyle} placeholder="e.g. Brisbane, Tokyo, Dubai..."/>
              {currentLat&&<div style={{fontSize:9,color:CL.grn,marginTop:2,fontFamily:"system-ui"}}>✓ {currentLat.toFixed(2)}°, {currentLon?.toFixed(2)}°</div>}
            </div>
            <button onClick={getLocation} style={{background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.cyn,fontSize:11,padding:"9px 14px",cursor:"pointer",fontFamily:"system-ui",whiteSpace:"nowrap"}}>📍 Use my location</button>
          </div>
          <div style={{fontSize:9,color:CL.mut,marginTop:6,fontFamily:"system-ui"}}>
            Supported cities include: {Object.keys(CITIES).join(", ")}
          </div>
        </>)}

        <button onClick={compute} disabled={!dob||loading} style={{marginTop:12,width:"100%",background:`linear-gradient(135deg,${CL.pur},${CL.acc})`,color:"#000",border:"none",borderRadius:10,padding:"12px",fontSize:13,fontWeight:800,cursor:!dob?"not-allowed":"pointer",opacity:!dob?0.4:1,fontFamily:"system-ui",letterSpacing:1,animation:loading?"pulse 1s ease infinite":"none"}}>
          {loading?"✨ Computing all 17 systems...":"🔮 Consult Oracle"}
        </button>
      </div>

      {data&&(<>
        {/* ACCURACY BADGE */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,justifyContent:"center"}}>
          {[
            {label:"📐 Meeus Positions",active:true},
            {label:"🏠 Houses",active:data.hasTime&&data.hasPlace},
            {label:"🌅 True Sect",active:data.hasCurrent},
            {label:"⏰ True Planetary Hours",active:data.hasCurrent},
            {label:"📍 Ascendant",active:data.hasTime&&data.hasPlace},
            {label:"🍀 Part of Fortune",active:data.partOfFortune!==null},
          ].map(b=>(
            <span key={b.label} style={{fontSize:9,padding:"3px 8px",borderRadius:10,background:b.active?CL.grn+"20":CL.mut+"30",color:b.active?CL.grn:CL.mut,fontFamily:"system-ui",fontWeight:700,border:`1px solid ${b.active?CL.grn+"40":CL.mut+"40"}`}}>{b.label} {b.active?"✓":"○"}</span>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
          <TB id="reading"  label="Full Reading" icon="🔮"/>
          <TB id="shouldi"  label="Should I?" icon="🤔"/>
          <TB id="systems"  label="Systems" icon="🔬"/>
          <TB id="calendar" label="30-Day" icon="📅"/>
          <TB id="bestdays" label="Best Days" icon="⭐"/>
          <TB id="chart"    label="Chart" icon="🌌"/>
        </div>

        {/* ═══════════════ FULL READING ═══════════════ */}
        {tab==="reading"&&(<>
          <div style={SC.card}>
            <SH icon="📊" title="SITUATION ASSESSMENT" sub={`${fmtDL(new Date(targetDate))} · ${data.isDay?"☀️ Day chart":"🌙 Night chart"}${data.hasCurrent?" (your local time)":""}`}/>
            <Bullet strong={`${data.sunSign.sym} Sun in ${data.sunSign.name}`}>Core identity — {data.sunSign.trait.toLowerCase()}</Bullet>
            <Bullet strong={`${data.moonSign.sym} Moon in ${data.moonSign.name}`}>Emotional nature and instinct patterns</Bullet>
            {data.ascSign&&<Bullet strong={`↑ Rising in ${data.ascSign.name}`} color={CL.cyn}>Your outward expression and how you meet the world — {data.ascSign.trait.toLowerCase()}</Bullet>}
            <Bullet strong={`${data.mp.icon} ${data.mp.name}`}>{data.mp.energy} · Power {data.mp.power}/10</Bullet>
            {data.voc&&<Bullet strong="🚫 Void of Course Moon" color={CL.red}>No more aspects before sign change — delay important decisions if possible</Bullet>}
            {data.retros.filter((r:PlanetPos)=>!["NNode","SNode"].includes(r.name)).map((r:PlanetPos)=>(
              <Bullet key={r.name} strong={`${r.planet?.sym} ${r.name} Retrograde`} color={CL.acc}>
                {r.name==="Mercury"?"Avoid signing — communication & contract errors":r.name==="Venus"?"Re-evaluate relationships/purchases":r.name==="Mars"?"Action may backfire — don't force":"Deep review phase, not initiation"}
              </Bullet>
            ))}
            {data.solarReturnBonus>0&&<Bullet strong="☀️ Solar Return Zone" color={CL.pnk}>{data.solarReturnBonus>=3?"Sun at exact birth degree — annual reset. Decisions made now carry extra weight.":"Approaching solar return — heightened sensitivity period."}</Bullet>}
            {data.eclipseHits.length>0&&<Bullet strong={`🌑 Eclipse Activated: ${data.eclipseHits[0].planet}`} color={CL.pur}>Recent {data.eclipseHits[0].type} eclipse within {data.eclipseHits[0].orb}° of your natal {data.eclipseHits[0].planet} — eclipse point stays active for 6 months</Bullet>}
            {data.mutualReceptions.length>0&&<Bullet strong={`🔄 Mutual Reception: ${data.mutualReceptions.map((m:any)=>`${m.a}↔${m.b}`).join(", ")}`} color={CL.cyn}>Planets in each other's signs — mutually strengthened today</Bullet>}
            <Bullet strong={`🔑 Gene Key ${data.birthGK} — ${GK_DATA[data.birthGK]?.siddhi}`} color={CL.pur}>Gift: {GK_DATA[data.birthGK]?.gift} · Shadow: {GK_DATA[data.birthGK]?.shadow} · Transit GK {data.transitGK} ({gkHarmonic(data.birthGK,data.transitGK)})</Bullet>
          </div>

          {/* OVERALL VERDICT */}
          <div style={{...SC.card,background:`linear-gradient(150deg,${CL.card},${data.overall>15?"#0d1a10":data.overall<-15?"#1a0d0d":"#1a1708"})`}}>
            <SH icon="🎯" title="OVERALL VERDICT" color={vColor(data.overall)}/>
            <div style={{fontSize:15,color:vColor(data.overall),fontWeight:600,fontFamily:"system-ui",marginBottom:14}}>{vText(data.overall)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
              {[
                {label:"OVERALL SCORE",value:`${data.overall>0?"+":""}${data.overall.toFixed(0)}`,color:vColor(data.overall),sub:"Average across all 9 life domains"},
                {label:"CONFIDENCE",value:`${data.overallConf}/10`,color:CL.acc,sub:confText(data.overallConf)+" — signal strength"},
                {label:"CONVERGENCE",value:`${data.overallConv}%`,color:data.overallConv>70?CL.grn:data.overallConv>55?CL.acc:CL.red,sub:data.overallConv>70?"Strong signal agreement":"Mixed signals"},
                {label:"SYSTEMS",value:`${data.systemsActive}/17`,color:CL.pur,sub:"Prediction systems active today"},
              ].map(m=>(
                <div key={m.label} style={{background:CL.card2,borderRadius:10,padding:12,borderTop:`2px solid ${m.color}`}}>
                  <div style={{fontSize:8,letterSpacing:2,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{m.label}</div>
                  <div style={{fontSize:24,fontWeight:900,color:m.color,fontFamily:"system-ui",margin:"4px 0"}}>{m.value}</div>
                  <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",lineHeight:1.4}}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DOMAIN-BY-DOMAIN */}
          <div style={SC.card}>
            <SH icon="📋" title="DOMAIN-BY-DOMAIN ANALYSIS" sub="Tap any domain to expand full signal breakdown"/>
            {data.domains.map((d:any)=>(
              <div key={d.id} onClick={()=>setExpanded(expanded===d.id?null:d.id)} style={{background:CL.card2,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",borderLeft:`4px solid ${vColor(d.score)}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{d.icon} {d.name}</div><div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui",marginTop:1}}>{d.sub}</div></div>
                  <div style={{fontSize:26,fontWeight:900,color:vColor(d.score),lineHeight:1,fontFamily:"system-ui"}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                </div>
                <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap",fontFamily:"system-ui",fontSize:11,color:CL.dim}}>
                  <span>Confidence: <b style={{color:CL.acc}}>{d.confidence}/10</b> <i>({confText(d.confidence)})</i></span>
                  <span>Conv: <b style={{color:d.convergence>65?CL.grn:d.convergence>50?CL.acc:CL.red}}>{d.convergence}%</b></span>
                  <span><b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b></span>
                </div>
                {expanded===d.id&&(
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${CL.bdr}`,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>SIGNAL BREAKDOWN</div>
                    {d.signals.map((s:Signal,j:number)=>(
                      <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc} conf={s.conf} val={s.val}>
                        {s.detail} <span style={{fontSize:9,color:CL.mut,fontFamily:"system-ui"}}>[{s.system}]</span>
                      </Bullet>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CROSS-DOMAIN THEMES */}
          <div style={SC.card}>
            <SH icon="🔗" title="CROSS-DOMAIN CONVERGENCE"/>
            <HR/>
            <div style={{fontSize:13,fontWeight:800,color:CL.grn,marginBottom:6,fontFamily:"system-ui"}}>🟢 STRONGEST DOMAINS</div>
            {data.domains.filter((d:any)=>d.score>5).length>0
              ?data.domains.filter((d:any)=>d.score>5).map((d:any)=>(
                <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.grn} conf={d.confidence}>{d.score>30?"Strongly supported":"Supported"} — {d.greenCount} positive signals, {d.convergence}% convergence</Bullet>
              )):<Bullet color={CL.dim}>No strongly favorable domains today.</Bullet>}
            <div style={{height:8}}/>
            <div style={{fontSize:13,fontWeight:800,color:CL.red,marginBottom:6,fontFamily:"system-ui"}}>🔴 WEAKEST DOMAINS</div>
            {data.domains.filter((d:any)=>d.score<-5).length>0
              ?data.domains.filter((d:any)=>d.score<-5).sort((a:any,b:any)=>a.score-b.score).map((d:any)=>(
                <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.red} conf={d.confidence}>{d.score<-30?"Strongly unfavorable":"Challenging"} — {d.redCount} caution signals</Bullet>
              )):<Bullet color={CL.dim}>No strongly unfavorable domains today.</Bullet>}
          </div>

          {/* WATCHPOINTS */}
          <div style={SC.card}>
            <SH icon="👁️" title="KEY WATCHPOINTS TODAY"/>
            {[
              data.retros.filter((r:PlanetPos)=>!["NNode","SNode"].includes(r.name)).length>0&&`**${data.retros.filter((r:PlanetPos)=>!["NNode","SNode"].includes(r.name)).map((r:PlanetPos)=>r.name).join("/")} retrograde** — ${data.retros.some((r:PlanetPos)=>r.name==="Mercury")?"Review before signing":"Review before initiating"}`,
              `**${data.mp.icon} ${data.mp.name}** — ${data.mp.energy} Power: ${data.mp.power}/10`,
              data.voc?"**Void of Course Moon** — Wait before major actions.":"**Moon is active** — Aspects forming, decisions supported.",
              data.solarReturnBonus>0&&`**Solar Return Zone** — ${data.solarReturnBonus>=3?"Exact return":"Approaching"} — heightened sensitivity for major decisions`,
              data.eclipseHits.length>0&&`**Eclipse activated natal ${data.eclipseHits[0].planet}** — Eclipse degrees stay hot for 6 months`,
              data.antiscia.length>0&&`**Antiscia: ${data.antiscia[0].transit} mirrors natal ${data.antiscia[0].natal}** — Mirror point connection, acts like a hidden conjunction (${data.antiscia[0].orb}° orb)`,
              `**${data.systemsActive}/17 prediction systems active** — ${data.systemsActive>=10?"High activation day":"Moderate activation"}`,
              `**Strongest aspect:** ${data.allAspects[0]?`${data.allAspects[0].p1.name} ${data.allAspects[0].asp.name} ${data.allAspects[0].p2.name} (${data.allAspects[0].exact}% exact${data.allAspects[0].applying?", applying↑":""})`:"-"}`,
            ].filter(Boolean).map((wp:any,i:number)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${CL.bdr}33`,fontFamily:"system-ui",fontSize:12,lineHeight:1.6,color:CL.txt}}>
                <span style={{color:CL.acc,fontWeight:800,minWidth:18}}>{i+1}.</span>
                <span dangerouslySetInnerHTML={{__html:wp.replace(/\*\*(.*?)\*\*/g,`<b style="color:${CL.acc}">$1</b>`)}}/>
              </div>
            ))}
          </div>

          {/* ORACLE SELF-ASSESSMENT */}
          <div style={{...SC.card,borderColor:CL.pur+"30"}}>
            <SH icon="🔮" title="ORACLE SELF-ASSESSMENT" color={CL.pur}/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>Most confident about:</div>
              {data.domains.filter((d:any)=>d.confidence>=6).slice(0,4).map((d:any)=>(
                <Bullet key={d.id} color={CL.grn}>{d.icon} {d.name} — {d.score>0?"favorable":"challenging"} ({d.confidence}/10) · {d.convergence}% convergence · {new Set(d.signals.map((s:Signal)=>s.system)).size} systems</Bullet>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.red,fontFamily:"system-ui",marginBottom:6}}>Least confident about:</div>
              {data.domains.filter((d:any)=>d.confidence<=4).length>0
                ?data.domains.filter((d:any)=>d.confidence<=4).slice(0,3).map((d:any)=>(
                  <Bullet key={d.id} color={CL.dim}>{d.icon} {d.name} — weak signals ({d.confidence}/10), {d.convergence}% convergence</Bullet>
                )):<Bullet color={CL.dim}>All domains showing moderate-high confidence today.</Bullet>}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:CL.acc,fontFamily:"system-ui",marginBottom:6}}>Known limitations:</div>
              <Bullet color={CL.acc}>Positions: Meeus truncated (Moon ±0.3°, planets ±0.5°) — not full VSOP87</Bullet>
              {!data.hasTime&&<Bullet color={CL.acc}>No birth time → no Rising sign, houses, or Part of Fortune</Bullet>}
              {!data.hasPlace&&<Bullet color={CL.acc}>No birth place → houses approximate, ASC unavailable</Bullet>}
              {!data.hasCurrent&&<Bullet color={CL.acc}>No current location → sect and planetary hours approximate</Bullet>}
              <Bullet color={CL.acc}>Free will overrides all cosmic signals — inclinations, not determinations</Bullet>
            </div>
          </div>
          <div style={{textAlign:"center",padding:"8px",fontSize:10,color:CL.mut,fontFamily:"system-ui"}}>
            <i>Oracle v9 · 17 systems · "The stars incline, they do not compel."</i>
          </div>
        </>)}

        {/* ═══════════════ SHOULD I? ═══════════════ */}
        {tab==="shouldi"&&(
          <div style={SC.card}>
            <SH icon="🤔" title="SHOULD I...?" sub={`${fmtDL(new Date(targetDate))} · ${data.isDay?"☀️ Day":"🌙 Night"}`}/>
            {DOMAINS.map(dom=>{
              const d=data.domains.find((x:any)=>x.id===dom.id);
              const answer=d.score>30?"YES — Strong support. Conf "+d.confidence+"/10":d.score>10?"Likely YES — Favorable. Conf "+d.confidence+"/10":d.score>-10?"MIXED — Proceed with awareness. Conf "+d.confidence+"/10":d.score>-30?"Probably NOT — Consider waiting. Conf "+d.confidence+"/10":"NO — Strong signals against. Conf "+d.confidence+"/10";
              return(
                <div key={dom.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${vColor(d.score)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{dom.icon} {dom.name}</div>
                    <div style={{fontSize:22,fontWeight:900,color:vColor(d.score),fontFamily:"system-ui"}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                  </div>
                  <div style={{fontSize:13,color:vColor(d.score),fontStyle:"italic",margin:"5px 0",fontFamily:"system-ui"}}>{answer}</div>
                  <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>Conv: <b>{d.convergence}%</b> · <b style={{color:CL.grn}}>▲{d.greenCount}</b>/<b style={{color:CL.red}}>▼{d.redCount}</b></div>
                  <HR/>
                  {d.signals.slice(0,3).map((s:Signal,j:number)=>(
                    <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:CL.red} conf={s.conf} val={s.val}>{s.detail}</Bullet>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════ SYSTEMS ═══════════════ */}
        {tab==="systems"&&(
          <div style={SC.card}>
            <SH icon="🔬" title="17 PREDICTION SYSTEMS" sub="Status and detail for each active system"/>

            {/* Gene Keys */}
            <div style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${CL.pur}`}}>
              <div style={{fontSize:13,fontWeight:800,color:CL.pur,fontFamily:"system-ui",marginBottom:6}}>🔑 Gene Keys (Real Solar Longitude Mapping)</div>
              <Bullet strong={`Birth GK ${data.birthGK} — ${GK_DATA[data.birthGK]?.siddhi}`} color={CL.pur}>Shadow: {GK_DATA[data.birthGK]?.shadow} → Gift: {GK_DATA[data.birthGK]?.gift} → Siddhi: {GK_DATA[data.birthGK]?.siddhi}</Bullet>
              <Bullet strong={`Transit GK ${data.transitGK} — ${GK_DATA[data.transitGK]?.siddhi}`} color={CL.cyn}>Shadow: {GK_DATA[data.transitGK]?.shadow} → Gift: {GK_DATA[data.transitGK]?.gift} (Sun at {data.transit.find((p:PlanetPos)=>p.name==="Sun")?.degree.toFixed(1)}° {data.transit.find((p:PlanetPos)=>p.name==="Sun")?.sign.name})</Bullet>
              <Bullet strong={`Relationship: ${gkHarmonic(data.birthGK,data.transitGK).toUpperCase()}`} color={gkHarmonic(data.birthGK,data.transitGK)==="harmonic"?CL.grn:gkHarmonic(data.birthGK,data.transitGK)==="tension"?CL.red:CL.dim}>Based on I Ching hexagram proximity — each GK spans 5.625° of ecliptic</Bullet>
            </div>

            {/* Antiscia */}
            {data.antiscia.length>0&&(
              <div style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${CL.pnk}`}}>
                <div style={{fontSize:13,fontWeight:800,color:CL.pnk,fontFamily:"system-ui",marginBottom:6}}>🪞 Antiscia (Mirror Points)</div>
                {data.antiscia.map((a:any,i:number)=>(
                  <Bullet key={i} strong={`Transit ${a.transit} mirrors natal ${a.natal}`} color={CL.pnk}>Acts like a hidden conjunction — {a.orb}° orb</Bullet>
                ))}
              </div>
            )}

            {/* Eclipse hits */}
            {data.eclipseHits.length>0&&(
              <div style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${CL.pur}`}}>
                <div style={{fontSize:13,fontWeight:800,color:CL.pur,fontFamily:"system-ui",marginBottom:6}}>🌑 Eclipse Sensitivity</div>
                {data.eclipseHits.map((e:any,i:number)=>(
                  <Bullet key={i} strong={`${e.type==="solar"?"Solar":"Lunar"} eclipse → natal ${e.planet}`} color={CL.pur}>Eclipse at {e.eclipseDeg.toFixed(1)}° within {e.orb}° — active for 6 months</Bullet>
                ))}
              </div>
            )}

            {/* Houses */}
            {data.hasTime&&data.hasPlace&&(
              <div style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${CL.cyn}`}}>
                <div style={{fontSize:13,fontWeight:800,color:CL.cyn,fontFamily:"system-ui",marginBottom:6}}>🏠 Houses (Whole Sign) · ASC: {data.ascSign?.name} {data.ascLng?.toFixed(1)}°</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {data.natal.filter((p:PlanetPos)=>!["NNode","SNode"].includes(p.name)).map((p:PlanetPos)=>(
                    <div key={p.name} style={{fontSize:11,fontFamily:"system-ui",color:CL.txt,padding:"3px 0"}}>
                      <span style={{color:p.planet?.c}}>{p.planet?.sym} {p.name}</span>
                      <span style={{color:CL.dim}}> → H{data.houses[p.name]}</span>
                      {[1,4,7,10].includes(data.houses[p.name])&&<span style={{color:CL.grn}}> ◈</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Midpoints */}
            {data.midpoints.length>0&&(
              <div style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${CL.cyn}`}}>
                <div style={{fontSize:13,fontWeight:800,color:CL.cyn,fontFamily:"system-ui",marginBottom:6}}>✦ Active Midpoints ({data.midpoints.length})</div>
                {data.midpoints.map((mp:Midpoint,i:number)=>(
                  <Bullet key={i} strong={`${mp.transit} at ${mp.natalA}/${mp.natalB}`} color={mp.nature==="benefic"?CL.grn:mp.nature==="malefic"?CL.red:CL.dim}>{mp.nature.toUpperCase()} · {mp.orb}° orb</Bullet>
                ))}
              </div>
            )}

            {/* System status grid */}
            <div style={{background:CL.card2,borderRadius:12,padding:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.txt,marginBottom:8,fontFamily:"system-ui"}}>All 17 Systems</div>
              {[
                {name:"Transit Aspects",icon:"🔭",active:true,note:"With applying/separating (±1.4x/0.8x)"},
                {name:"Planet Dignity",icon:"👑",active:true,note:"Domicile, Exalt, Triplicity, Detriment, Fall"},
                {name:"Combustion",icon:"☀️",active:true,note:"Cazimi +8, Combust -4, Under Beams -2"},
                {name:"Sect",icon:"🌗",active:true,note:data.hasCurrent?"True sunrise/sunset sect":"Clock-based approx"},
                {name:"Retrograde",icon:"℞",active:data.retros.filter((r:PlanetPos)=>!["NNode","SNode"].includes(r.name)).length>0,note:"Penalty by planet type"},
                {name:"Moon Phase",icon:"🌕",active:true,note:"Waxing/waning + 8 phases"},
                {name:"Void of Course",icon:"🚫",active:true,note:"Forward-scan (no 27° shortcut)"},
                {name:"Lunar Nodes",icon:"☊",active:true,note:"Rahu/Ketu conjunctions to natal planets"},
                {name:"Stelliums",icon:"⭐",active:data.stelliums.length>0||data.natalStelliums.length>0,note:"Transit + natal activation"},
                {name:"Midpoints",icon:"✦",active:data.midpoints.length>0,note:"Benefic/malefic scoring"},
                {name:"Mutual Reception",icon:"🔄",active:data.mutualReceptions.length>0,note:"Planets in each other's domicile"},
                {name:"Solar Return",icon:"🎂",active:data.solarReturnBonus>0,note:"Birthday proximity window"},
                {name:"Gene Keys",icon:"🔑",active:true,note:"Real I Ching hexagram solar mapping"},
                {name:"Planetary Hours",icon:"⏰",active:true,note:data.hasCurrent?"True sunrise-based hours":"Chaldean clock approx"},
                {name:"Solar Arc",icon:"🌀",active:true,note:"1°/year direction to natal planets"},
                {name:"Secondary Progressions",icon:"📈",active:true,note:"Day-for-a-year progressed aspects"},
                {name:"Eclipse Sensitivity",icon:"🌑",active:data.eclipseHits.length>0,note:"Natal planets near recent eclipse degrees"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${CL.bdr}22`,fontFamily:"system-ui",fontSize:11,alignItems:"center"}}>
                  <span style={{minWidth:20}}>{s.icon}</span>
                  <span style={{flex:1,fontWeight:600,color:CL.txt}}>{s.name}</span>
                  <span style={{fontSize:9,color:CL.dim,flex:2}}>{s.note}</span>
                  <span style={{fontSize:9,fontWeight:800,color:s.active?CL.grn:CL.mut,minWidth:48,textAlign:"right"}}>{s.active?"ACTIVE":"OFF"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════ 30-DAY CALENDAR ═══════════════ */}
        {tab==="calendar"&&(
          <div style={SC.card}>
            <SH icon="📅" title="30-DAY COSMIC MAP" sub="Click any day for full reading"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:12}}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{d}</div>)}
              {Array.from({length:data.forecast[0].date.getDay()}).map((_,i)=><div key={"e"+i}/>)}
              {data.forecast.map((day:any,i:number)=>{
                const bg=vColor(day.overall);
                return(
                  <div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");}} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",background:bg+"15",border:i===0?`2px solid ${CL.acc}`:`1px solid ${bg}20`}}>
                    <div style={{fontSize:11,fontFamily:"system-ui"}}>{day.date.getDate()}</div>
                    <div style={{fontSize:7,fontWeight:700,color:bg,fontFamily:"system-ui"}}>{day.overall>0?"+":""}{day.overall.toFixed(0)}</div>
                    <div style={{fontSize:7}}>{day.moonPhase.icon}</div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>DAILY BREAKDOWN</div>
            {data.forecast.slice(0,14).map((day:any,i:number)=>(
              <div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:i%2?"transparent":CL.card2,borderRadius:6,cursor:"pointer",marginBottom:2,fontFamily:"system-ui",fontSize:11}}>
                <div style={{minWidth:85,fontWeight:i===0?700:400,color:i===0?CL.acc:CL.txt}}>{fmtD(day.date)}{i===0?" ★":""}</div>
                <div style={{flex:1,position:"relative"}}>
                  <div style={{height:5,background:CL.bdr,borderRadius:3,overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",left:"50%",width:1,height:"100%",background:CL.mut}}/>
                    <div style={{position:"absolute",left:day.overall>0?"50%":`${50+day.overall/2}%`,width:`${Math.abs(day.overall/2)}%`,height:"100%",background:vColor(day.overall),borderRadius:3}}/>
                  </div>
                </div>
                <span style={{fontSize:9}}>{day.moonPhase.icon}</span>
                <span style={{fontSize:9,color:CL.dim,minWidth:30}}>↑{day.best.icon}</span>
                <span style={{fontSize:13,fontWeight:800,minWidth:38,textAlign:"right",color:vColor(day.overall)}}>{day.overall>0?"+":""}{day.overall.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ BEST DAYS ═══════════════ */}
        {tab==="bestdays"&&(
          <div style={SC.card}>
            <SH icon="⭐" title="OPTIMAL TIMING" sub="Best & worst 30-day windows by domain"/>
            {data.bestDays.map((bd:any)=>(
              <div key={bd.domain.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>{bd.domain.icon} {bd.domain.name}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:CL.grn,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🟢 BEST</div>
                    {bd.top3.map((d:any,i:number)=>(
                      <div key={i} onClick={()=>{setTargetDate(d.date.toISOString().split("T")[0]);setTab("reading");}} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.grn+"0d",borderRadius:6,marginBottom:3,cursor:"pointer",fontFamily:"system-ui",fontSize:11}}>
                        <span>{fmtD(d.date)}</span><span style={{fontWeight:800,color:CL.grn}}>+{d.score.toFixed(0)} · {d.conf}/10</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:10,color:CL.red,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🔴 AVOID</div>
                    {bd.bottom3.map((d:any,i:number)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.red+"0d",borderRadius:6,marginBottom:3,fontFamily:"system-ui",fontSize:11}}>
                        <span>{fmtD(d.date)}</span><span style={{fontWeight:800,color:CL.red}}>{d.score.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ CHART ═══════════════ */}
        {tab==="chart"&&(
          <div style={SC.card}>
            <SH icon="🌌" title="NATAL CHART + TRANSITS"/>
            {data.ascLng&&<div style={{fontSize:12,color:CL.cyn,fontFamily:"system-ui",marginBottom:8}}>↑ Ascendant: {data.ascSign?.name} {(data.ascLng%30).toFixed(1)}° · MC: {SIGNS[Math.floor(((data.mcLng||0)%360)/30)]?.name} {((data.mcLng||0)%30).toFixed(1)}°</div>}
            {data.partOfFortune&&<div style={{fontSize:11,color:CL.acc,fontFamily:"system-ui",marginBottom:8}}>🍀 Part of Fortune: {SIGNS[Math.floor(data.partOfFortune/30)]?.name} {(data.partOfFortune%30).toFixed(1)}°</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {(["Natal","Transit"] as const).map(type=>(
                <div key={type}>
                  <div style={{fontSize:10,color:type==="Natal"?CL.acc:CL.pur,letterSpacing:2,fontWeight:700,marginBottom:4,fontFamily:"system-ui"}}>{type.toUpperCase()}</div>
                  {(type==="Natal"?data.natal:data.transit).map((p:PlanetPos)=>(
                    <div key={p.name} style={{display:"flex",justifyContent:"space-between",padding:"3px 7px",fontSize:10,background:CL.card2,borderRadius:5,marginBottom:2,fontFamily:"system-ui"}}>
                      <span style={{color:p.planet?.c}}>{p.planet?.sym} {p.name}{p.retro?" ℞":""}</span>
                      <span style={{color:p.sign.c,fontSize:9}}>{p.sign.sym} {p.degree.toFixed(1)}°</span>
                      <span style={{fontSize:8,color:p.dignity==="domicile"?CL.grn:p.dignity==="exaltation"?"#aaffaa":p.dignity==="detriment"?CL.red:p.dignity==="fall"?"#ffaaaa":p.combustion==="cazimi"?CL.acc:p.combustion==="combust"?CL.red:CL.mut}}>
                        {p.dignity==="peregrine"?"":p.dignity.slice(0,3).toUpperCase()}{p.combustion==="cazimi"?"✨":p.combustion==="combust"?"🔥":p.combustion==="under_beams"?"🌤":""}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <HR/>
            <div style={{fontSize:10,letterSpacing:2,color:CL.pnk,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>TOP ASPECTS</div>
            {data.allAspects.slice(0,15).map((a:Aspect,i:number)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:i%2?"transparent":CL.card2,borderRadius:5,fontSize:11,fontFamily:"system-ui"}}>
                <span style={{fontSize:13,color:a.asp.c,minWidth:16}}>{a.asp.sym}</span>
                <span style={{flex:1}}><span style={{color:a.p1.planet?.c,fontWeight:600}}>{a.p1.name}</span> <span style={{color:CL.dim,fontSize:9}}>{a.asp.name}</span> <span style={{color:a.p2.planet?.c,fontWeight:600}}>{a.p2.name}</span></span>
                <span style={{fontSize:9,color:a.applying?CL.grn:CL.mut}}>{a.applying?"↑app":"↓sep"}</span>
                <span style={{fontWeight:800,color:a.asp.c,minWidth:28,textAlign:"right"}}>{a.exact}%</span>
              </div>
            ))}
          </div>
        )}
      </>)}
    </div>
  );
}
