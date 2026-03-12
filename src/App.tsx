"use client";
import { useState, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 ORACLE v10 — WORLD ENERGY + PERSONAL CONVERGENCE ENGINE
// What the world is feeling · What YOU are experiencing · Deep domain dives
// Iran methodology: multi-system triangulation → % probability on every call
// Tier-gated · Tick/% system · Domain deep-dives · Real Meeus positions
// ═══════════════════════════════════════════════════════════════════════════

const PLANETS = [
  {name:"Sun",    sym:"☉",c:"#f6ad3c",nature:"benefic", sect:"day",   domicile:["Leo"],                    exalt:["Aries"],      detriment:["Aquarius"],              fall:["Libra"]     },
  {name:"Moon",   sym:"☽",c:"#c4cdd4",nature:"benefic", sect:"night", domicile:["Cancer"],                 exalt:["Taurus"],     detriment:["Capricorn"],             fall:["Scorpio"]   },
  {name:"Mercury",sym:"☿",c:"#45d0c8",nature:"neutral", sect:"either",domicile:["Gemini","Virgo"],         exalt:["Virgo"],      detriment:["Sagittarius","Pisces"],  fall:["Pisces"]    },
  {name:"Venus",  sym:"♀",c:"#e879a0",nature:"benefic", sect:"night", domicile:["Taurus","Libra"],         exalt:["Pisces"],     detriment:["Aries","Scorpio"],       fall:["Virgo"]     },
  {name:"Mars",   sym:"♂",c:"#e55050",nature:"malefic", sect:"night", domicile:["Aries","Scorpio"],        exalt:["Capricorn"],  detriment:["Taurus","Libra"],        fall:["Cancer"]    },
  {name:"Jupiter",sym:"♃",c:"#9b7fe6",nature:"benefic", sect:"day",   domicile:["Sagittarius","Pisces"],   exalt:["Cancer"],     detriment:["Gemini","Virgo"],        fall:["Capricorn"] },
  {name:"Saturn", sym:"♄",c:"#7a8594",nature:"malefic", sect:"day",   domicile:["Capricorn","Aquarius"],   exalt:["Libra"],      detriment:["Cancer","Leo"],          fall:["Aries"]     },
  {name:"Uranus", sym:"♅",c:"#38d6f5",nature:"neutral", sect:"either",domicile:["Aquarius"],               exalt:[],             detriment:["Leo"],                   fall:[]            },
  {name:"Neptune",sym:"♆",c:"#7c8cf5",nature:"neutral", sect:"either",domicile:["Pisces"],                 exalt:[],             detriment:["Virgo"],                 fall:[]            },
  {name:"Pluto",  sym:"♇",c:"#b366e0",nature:"malefic", sect:"either",domicile:["Scorpio"],                exalt:[],             detriment:["Taurus"],                fall:[]            },
];
const SIGNS = [
  {name:"Aries",      sym:"♈",el:"fire", mod:"cardinal",start:0,  c:"#e55050",trait:"Initiative, courage"         },
  {name:"Taurus",     sym:"♉",el:"earth",mod:"fixed",   start:30, c:"#3dbd7d",trait:"Stability, persistence"      },
  {name:"Gemini",     sym:"♊",el:"air",  mod:"mutable", start:60, c:"#f6c23c",trait:"Curiosity, adaptability"     },
  {name:"Cancer",     sym:"♋",el:"water",mod:"cardinal",start:90, c:"#c4cdd4",trait:"Nurturing, emotional depth"  },
  {name:"Leo",        sym:"♌",el:"fire", mod:"fixed",   start:120,c:"#f6ad3c",trait:"Creativity, self-expression" },
  {name:"Virgo",      sym:"♍",el:"earth",mod:"mutable", start:150,c:"#45d0c8",trait:"Analysis, refinement"        },
  {name:"Libra",      sym:"♎",el:"air",  mod:"cardinal",start:180,c:"#e879a0",trait:"Balance, harmony"            },
  {name:"Scorpio",    sym:"♏",el:"water",mod:"fixed",   start:210,c:"#b366e0",trait:"Intensity, transformation"   },
  {name:"Sagittarius",sym:"♐",el:"fire", mod:"mutable", start:240,c:"#9b7fe6",trait:"Adventure, wisdom"           },
  {name:"Capricorn",  sym:"♑",el:"earth",mod:"cardinal",start:270,c:"#7a8594",trait:"Ambition, mastery"           },
  {name:"Aquarius",   sym:"♒",el:"air",  mod:"fixed",   start:300,c:"#38d6f5",trait:"Innovation, freedom"         },
  {name:"Pisces",     sym:"♓",el:"water",mod:"mutable", start:330,c:"#7c8cf5",trait:"Intuition, compassion"       },
];
const ASPECTS_MAJOR = [
  {name:"Conjunction", angle:0,  orb:8, sym:"☌", power:10,nature:"fusion",   c:"#f6ad3c"},
  {name:"Opposition",  angle:180,orb:8, sym:"☍", power:9, nature:"polarity", c:"#e879a0"},
  {name:"Square",      angle:90, orb:7, sym:"□", power:8, nature:"tension",  c:"#e55050"},
  {name:"Trine",       angle:120,orb:7, sym:"△", power:7, nature:"flow",     c:"#3dbd7d"},
  {name:"Sextile",     angle:60, orb:5, sym:"⚹", power:4, nature:"ease",     c:"#45d0c8"},
];
const ASPECTS_MINOR = [
  {name:"Quincunx",    angle:150,orb:3, sym:"⚻", power:3, nature:"adjust",   c:"#9b7fe6"},
  {name:"Semi-square", angle:45, orb:2, sym:"∠", power:3, nature:"friction", c:"#e5a0a0"},
  {name:"Quintile",    angle:72, orb:1.5,sym:"Q",power:3, nature:"creative", c:"#f6c23c"},
];

// ── DOMAIN CONFIG — Iran methodology: each domain has its own planetary weights, world indicators ──
const DOMAINS = [
  {
    id:"career",    name:"Career & Business",  icon:"💼",
    rulers:["Sun","Saturn","Jupiter","Mars"],
    weights:{Sun:1.4,Saturn:1.3,Jupiter:1.2,Mars:1.1,Mercury:0.8,Venus:0.6,Moon:0.5,Uranus:0.7,Neptune:0.3,Pluto:0.9},
    goodPhases:["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous"],
    badPhases:["Balsamic Moon","Last Quarter"],
    keyRetros:["Saturn","Mars","Mercury"],
    sub:"Launches, promotions, ventures, authority moves",
    // World energy indicators — what macro conditions look like globally
    worldSignals:{
      bullish:["Jupiter trine Saturn","Sun in Aries","Sun in Leo","Jupiter conjunct Sun","Mars sextile Jupiter"],
      bearish:["Saturn conjunct Sun","Mars square Saturn","Pluto square Mars","Saturn opposition Jupiter"],
    },
    // Deep dive specifics for domain page
    deepDive:{
      actions:["Submit proposal / pitch","Sign employment contract","Negotiate salary","Launch product","Request promotion","Start new venture","Fire / hire decision"],
      avoid:["Confrontations with superiors","Public launches during Mercury ℞","Signing contracts under VOC Moon"],
      timing:"Best window: waxing moon, Jupiter in dignified sign, Mercury direct. Worst: Saturn retro + Mars opposition.",
      worldNote:"When Saturn is direct and Jupiter is in Sagittarius or Pisces, global career and business energy is collectively elevated — your personal score gets a world tailwind.",
    }
  },
  {
    id:"love",      name:"Love & Relationships",icon:"💕",
    rulers:["Venus","Moon","Jupiter"],
    weights:{Venus:1.5,Moon:1.4,Jupiter:1.2,Neptune:1.0,Sun:0.7,Mars:0.8,Saturn:0.5,Mercury:0.6,Uranus:0.4,Pluto:0.7},
    goodPhases:["Full Moon","Waxing Gibbous","First Quarter"],
    badPhases:["Balsamic Moon","New Moon"],
    keyRetros:["Venus","Mercury"],
    sub:"Commitments, proposals, difficult conversations, deep connection",
    worldSignals:{
      bullish:["Venus trine Jupiter","Venus conjunct Neptune","Moon conjunct Venus","Full Moon in Libra","Venus in Taurus","Venus in Libra"],
      bearish:["Venus square Saturn","Mars conjunct Venus","Saturn opposition Venus","Venus conjunct Pluto"],
    },
    deepDive:{
      actions:["Propose / express love","Have the difficult conversation","Begin couples therapy","Move in together","End a relationship with care","Open up emotionally"],
      avoid:["Ultimatums during Mars-Venus tension","Commitments under Venus ℞","Major talks during VOC Moon"],
      timing:"Best: Venus in Taurus/Libra, waxing to Full Moon. Worst: Venus retrograde, Mars-Venus hard aspect.",
      worldNote:"Venus retrograde globally suppresses new romantic starts for ~6 weeks. During this window, existing relationships face re-evaluation — everyone feels it.",
    }
  },
  {
    id:"contracts",  name:"Contracts & Signing",  icon:"📜",
    rulers:["Mercury","Jupiter","Saturn"],
    weights:{Mercury:1.6,Jupiter:1.3,Saturn:1.2,Sun:0.7,Venus:0.6,Mars:0.5,Moon:0.5,Uranus:0.4,Neptune:0.3,Pluto:0.5},
    goodPhases:["New Moon","Waxing Crescent","First Quarter"],
    badPhases:["Full Moon","Balsamic Moon","Last Quarter"],
    keyRetros:["Mercury","Jupiter","Saturn"],
    sub:"Legal filings, negotiations, agreements, documents, deals",
    worldSignals:{
      bullish:["Mercury trine Jupiter","Mercury direct","Mercury in Gemini","Mercury in Virgo","Jupiter sextile Mercury"],
      bearish:["Mercury retrograde","Mercury square Neptune","Mercury opposition Saturn","VOC Moon at time of signing"],
    },
    deepDive:{
      actions:["Sign the contract","File legal documents","Submit binding offer","Notarise agreements","Accept terms","Counter-offer negotiation"],
      avoid:["Signing during Mercury ℞ — highest risk of errors, disputes, revisions","Signing under VOC Moon — action doesn't materialise as intended","Rushing during Mercury-Neptune square — hidden clauses missed"],
      timing:"Mercury direct + waxing moon + Jupiter favourable = green zone. Mercury ℞ = default no.",
      worldNote:"Mercury retrograde (3x/year, ~3 weeks each) is a globally elevated contract risk window. Everyone faces miscommunication — plan signings outside these periods.",
    }
  },
  {
    id:"travel",    name:"Travel & Relocation",  icon:"✈️",
    rulers:["Mercury","Jupiter","Moon"],
    weights:{Mercury:1.4,Jupiter:1.4,Moon:1.2,Mars:0.9,Saturn:0.8,Sun:0.6,Venus:0.5,Uranus:0.6,Neptune:0.4,Pluto:0.3},
    goodPhases:["New Moon","Waxing Crescent","Waxing Gibbous"],
    badPhases:["Full Moon","Balsamic Moon"],
    keyRetros:["Mercury","Jupiter"],
    sub:"Moving, big journeys, new environments, relocation",
    worldSignals:{
      bullish:["Jupiter trine Moon","Mercury direct","Jupiter in Sagittarius","Moon in Gemini","Mercury sextile Jupiter"],
      bearish:["Mercury retrograde","Saturn square Moon","Neptune square Mercury","Full Moon in Scorpio","Mars conjunct Mercury"],
    },
    deepDive:{
      actions:["Book international flight","Depart for long journey","Sign lease in new city","Relocate permanently","Begin visa application","Book moving company"],
      avoid:["Flying during Mercury ℞ — elevated delays, lost luggage, miscommunications","Moving under Saturn-Moon hard aspect — settling in takes longer","Booking under Neptune-Mercury — hidden costs, misrepresented locations"],
      timing:"Mercury direct, Jupiter dignified, waxing moon = safe departure. Mercury ℞ = delays more likely — insure everything.",
      worldNote:"Mercury retrograde elevates travel disruption globally: flight delays, booking errors, and miscommunications spike. Add buffer time to all journeys.",
    }
  },
  {
    id:"health",    name:"Health & Body",        icon:"🌿",
    rulers:["Mars","Sun","Moon"],
    weights:{Mars:1.4,Sun:1.3,Moon:1.2,Saturn:1.0,Venus:0.6,Jupiter:0.7,Mercury:0.5,Uranus:0.4,Neptune:0.5,Pluto:0.6},
    goodPhases:["New Moon","Waxing Crescent","Waxing Gibbous"],
    badPhases:["Full Moon","Waning Gibbous"],
    keyRetros:["Mars","Saturn"],
    sub:"Surgery timing, new regimens, recovery, lifestyle changes",
    worldSignals:{
      bullish:["Sun trine Mars","Moon in Virgo","Mars in Capricorn","Jupiter trine Sun","Waxing moon for new regimes"],
      bearish:["Mars retrograde","Saturn square Mars","Full Moon opposite Sun","Mars opposition Saturn","Neptune conjunct Sun"],
    },
    deepDive:{
      actions:["Schedule elective surgery","Begin new health regime","Start medication","Consult specialist","Begin recovery protocol","Join fitness program"],
      avoid:["Surgery during Mars ℞ — healing is slower, complications elevated","Starting regimes at Full Moon — harder to sustain","Elective procedures during Saturn-Mars hard aspect"],
      timing:"Waxing moon (start new habits) or waning moon (release, detox). Mars direct + Sun well-aspected = best surgical windows.",
      worldNote:"Mars retrograde globally slows healing and makes surgical recovery more complex — elective procedures best postponed. Waning moon is universally better for detox.",
    }
  },
  {
    id:"creative",  name:"Creative Projects",    icon:"🎨",
    rulers:["Venus","Neptune","Sun","Mercury"],
    weights:{Venus:1.4,Neptune:1.3,Sun:1.2,Mercury:1.1,Moon:0.9,Jupiter:0.8,Mars:0.7,Uranus:0.8,Saturn:0.4,Pluto:0.5},
    goodPhases:["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous"],
    badPhases:["Balsamic Moon","Last Quarter"],
    keyRetros:["Venus","Mercury","Neptune"],
    sub:"Art, writing, launches, performances, publishing",
    worldSignals:{
      bullish:["Venus trine Neptune","Sun conjunct Jupiter","Mercury sextile Neptune","New Moon in Libra","Venus in Leo","Neptune trine Sun"],
      bearish:["Neptune square Venus","Mercury ℞","Saturn square Venus","Venus opposition Neptune"],
    },
    deepDive:{
      actions:["Launch creative project","Submit for publication","Perform publicly","Release music / art","Begin new creative work","Apply for creative grant"],
      avoid:["Launching under Mercury ℞ — critical reception is harsher, errors more likely","Performing under Venus-Saturn hard aspect","Publishing when Neptune squares Mercury — message is distorted"],
      timing:"Venus in Leo or Libra + waxing moon + Mercury direct = ideal launch window.",
      worldNote:"When Neptune is in strong aspect to Venus, a wave of collective creative energy lifts all boats — the world is more receptive to art and new ideas.",
    }
  },
  {
    id:"learning",  name:"Learning & Growth",    icon:"📚",
    rulers:["Mercury","Jupiter","Saturn"],
    weights:{Mercury:1.5,Jupiter:1.3,Saturn:1.1,Sun:0.7,Mars:0.6,Moon:0.7,Venus:0.5,Uranus:0.7,Neptune:0.4,Pluto:0.3},
    goodPhases:["New Moon","Waxing Crescent","First Quarter"],
    badPhases:["Balsamic Moon","Last Quarter"],
    keyRetros:["Mercury","Jupiter"],
    sub:"Courses, exams, study, teaching, certifications",
    worldSignals:{
      bullish:["Mercury trine Jupiter","Jupiter in Gemini","Mercury in Gemini","Mercury in Virgo","Saturn trine Mercury"],
      bearish:["Mercury ℞","Jupiter square Mercury","Saturn opposition Mercury","Neptune square Mercury"],
    },
    deepDive:{
      actions:["Sit important exam","Enrol in course","Begin study regime","Teach or mentor","Apply to institution","Submit thesis / research"],
      avoid:["Sitting exams during Mercury ℞ — memory and clarity are impaired","Starting new courses during Jupiter ℞ — momentum is harder to build","Complex study during Neptune-Mercury tension — retention is poor"],
      timing:"Mercury direct + Jupiter in dignified sign = optimal study and exam conditions. New moon = best time to begin new course.",
      worldNote:"Jupiter in Gemini (2024-2025) is a globally elevated period for learning, communication, and intellectual expansion — the collective is in learning mode.",
    }
  },
  {
    id:"spiritual", name:"Spiritual & Inner Work",icon:"🧘",
    rulers:["Neptune","Moon","Pluto"],
    weights:{Neptune:1.5,Moon:1.4,Pluto:1.3,Saturn:1.0,Sun:0.6,Venus:0.7,Mercury:0.5,Jupiter:0.8,Mars:0.4,Uranus:0.6},
    goodPhases:["Full Moon","Waning Gibbous","Last Quarter","Balsamic Moon"],
    badPhases:["New Moon","Waxing Crescent"],
    keyRetros:["Neptune","Pluto"],
    sub:"Retreats, therapy, meditation, deep reflection, healing",
    worldSignals:{
      bullish:["Neptune trine Moon","Pluto sextile Neptune","Full Moon in Pisces","Neptune in Pisces","Moon conjunct Neptune"],
      bearish:["Saturn square Neptune","Mars opposition Neptune","Pluto square Moon","Neptune opposition Saturn"],
    },
    deepDive:{
      actions:["Begin meditation practice","Attend spiritual retreat","Start therapy","Deep journaling session","Plant medicine ceremony","Forgiveness work","Shadow integration"],
      avoid:["Major inner decisions during Saturn-Neptune hard aspect — reality and illusion blur","Retreat during Mercury ℞ — insights may be distorted","Forcing clarity during Pluto-Moon tension"],
      timing:"Full moon and waning phases support inner work. Neptune in Pisces (current) elevates collective spiritual sensitivity.",
      worldNote:"Neptune in Pisces (through 2026) is a once-in-164-year window of collective spiritual opening. Everyone is more sensitive, intuitive, and permeable right now.",
    }
  },
  {
    id:"financial",  name:"Major Purchases & Wealth",icon:"💰",
    rulers:["Venus","Jupiter","Saturn","Pluto"],
    weights:{Venus:1.3,Jupiter:1.4,Saturn:1.3,Pluto:1.1,Sun:0.7,Mars:0.6,Moon:0.7,Mercury:0.8,Uranus:0.5,Neptune:0.4},
    goodPhases:["New Moon","Waxing Crescent","Waxing Gibbous"],
    badPhases:["Full Moon","Waning Gibbous","Balsamic Moon"],
    keyRetros:["Venus","Jupiter","Saturn"],
    sub:"Property, investments, salary negotiations, major purchases",
    worldSignals:{
      bullish:["Jupiter conjunct Venus","Jupiter in Taurus","Venus in Taurus","Saturn trine Jupiter","Pluto in Capricorn","Venus sextile Jupiter"],
      bearish:["Saturn square Jupiter","Venus ℞","Pluto square Venus","Saturn opposition Jupiter","Venus conjunct Saturn"],
    },
    deepDive:{
      actions:["Buy property","Sign investment agreement","Negotiate salary","Make large purchase","Commit capital","Request funding","Accept financial offer"],
      avoid:["Committing funds during Venus ℞ — value perception is distorted","Major purchases under Saturn-Venus hard aspect — regret is more likely","Investing during Jupiter ℞ — expansion doesn't materialise as hoped"],
      timing:"Venus direct + Jupiter in Taurus or Sagittarius + waxing moon = prime financial window.",
      worldNote:"When Saturn and Jupiter are in harmonious aspect, there's a global economic alignment that supports long-term financial decisions — this was the Iran oil signal: multi-system geopolitical + financial convergence.",
    }
  },
];

// ── TIER DEFINITIONS ──────────────────────────────────────────
const TIERS = [
  {id:1, name:"Basic",  price:"$9.99",  period:"/mo",color:"#6b6580",tagline:"Your daily cosmic pulse",
   features:["All 9 domains — scores & verdicts","7-day forecast","Moon phase & retrograde alerts","Should I...? quick guide","World Energy snapshot"],
   locked:["Signal breakdown","30-day calendar","Deep domain dives","Birth time precision","Team mode"]},
  {id:2, name:"Plus",   price:"$29.99", period:"/mo",color:"#9b7fe6",tagline:"Full signal intelligence",
   features:["Everything in Basic","Full signal breakdown — the WHY","30-day calendar + Best Days","Natal chart + transits","Domain deep-dives (all 9)","World vs Personal comparison"],
   locked:["Birth time + location precision","Team mode","Deeper domain specialisations"]},
  {id:3, name:"Pro",    price:"$79.99", period:"/mo",color:"#f6ad3c",tagline:"Maximum precision",featured:true,
   features:["Everything in Plus","Birth time → Ascendant + Houses","Location → precise planetary hours","Dignity, combustion, cazimi, sect","Solar arc + progressions","Domain-specific world overlays"],
   locked:["Oracle chatbot","Team mode"]},
  {id:4, name:"Pro+",   price:"$99.99", period:"/mo",color:"#e879a0",tagline:"Your personal Oracle",
   features:["Everything in Pro","Team mode — 5 people","Oracle AI chatbot","Daily push readings","People in Your Orbit","Weekly deep-dive reports"]},
];

// ── GENE KEYS ─────────────────────────────────────────────────
const GK_SEQ = [25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60,41,19,13,49,30,55,37,63,22,36];
const GK_DATA:Record<number,{shadow:string,gift:string,siddhi:string}> = {
  1:{shadow:"Entropy",gift:"Freshness",siddhi:"Beauty"},2:{shadow:"Dislocation",gift:"Resourcefulness",siddhi:"Unity"},
  3:{shadow:"Chaos",gift:"Innovation",siddhi:"Innocence"},4:{shadow:"Intolerance",gift:"Understanding",siddhi:"Forgiveness"},
  5:{shadow:"Impatience",gift:"Patience",siddhi:"Timelessness"},6:{shadow:"Conflict",gift:"Diplomacy",siddhi:"Peace"},
  7:{shadow:"Division",gift:"Guidance",siddhi:"Virtue"},8:{shadow:"Mediocrity",gift:"Style",siddhi:"Exquisiteness"},
  9:{shadow:"Inertia",gift:"Perspective",siddhi:"Invincibility"},10:{shadow:"Self-Obsession",gift:"Naturalness",siddhi:"Being"},
  11:{shadow:"Obscurity",gift:"Idealism",siddhi:"Light"},12:{shadow:"Vanity",gift:"Discrimination",siddhi:"Purity"},
  13:{shadow:"Discord",gift:"Discernment",siddhi:"Empathy"},14:{shadow:"Compromise",gift:"Competence",siddhi:"Bounteousness"},
  15:{shadow:"Dullness",gift:"Magnetism",siddhi:"Florescence"},16:{shadow:"Indifference",gift:"Versatility",siddhi:"Mastery"},
  17:{shadow:"Opinion",gift:"Astuteness",siddhi:"Omniscience"},18:{shadow:"Judgment",gift:"Integrity",siddhi:"Perfection"},
  19:{shadow:"Co-dependence",gift:"Sensitivity",siddhi:"Sacrifice"},20:{shadow:"Superficiality",gift:"Self-Assurance",siddhi:"Presence"},
  21:{shadow:"Control",gift:"Authority",siddhi:"Valour"},22:{shadow:"Dishonour",gift:"Graciousness",siddhi:"Grace"},
  23:{shadow:"Complexity",gift:"Simplicity",siddhi:"Quintessence"},24:{shadow:"Addiction",gift:"Invention",siddhi:"Silence"},
  25:{shadow:"Constriction",gift:"Acceptance",siddhi:"Universal Love"},26:{shadow:"Pride",gift:"Artfulness",siddhi:"Invisibility"},
  27:{shadow:"Selfishness",gift:"Altruism",siddhi:"Selflessness"},28:{shadow:"Purposelessness",gift:"Totality",siddhi:"Immortality"},
  29:{shadow:"Half-heartedness",gift:"Commitment",siddhi:"Devotion"},30:{shadow:"Desire",gift:"Lightness",siddhi:"Rapture"},
  31:{shadow:"Arrogance",gift:"Leadership",siddhi:"Humility"},32:{shadow:"Failure",gift:"Preservation",siddhi:"Veneration"},
  33:{shadow:"Forgetting",gift:"Mindfulness",siddhi:"Revelation"},34:{shadow:"Force",gift:"Strength",siddhi:"Majesty"},
  35:{shadow:"Hunger",gift:"Adventure",siddhi:"Boundlessness"},36:{shadow:"Turbulence",gift:"Humanity",siddhi:"Compassion"},
  37:{shadow:"Weakness",gift:"Equality",siddhi:"Tenderness"},38:{shadow:"Struggle",gift:"Perseverance",siddhi:"Honor"},
  39:{shadow:"Provocation",gift:"Dynamic Energy",siddhi:"Liberation"},40:{shadow:"Exhaustion",gift:"Resolve",siddhi:"Divine Will"},
  41:{shadow:"Fantasy",gift:"Anticipation",siddhi:"Emanation"},42:{shadow:"Expectation",gift:"Detachment",siddhi:"Celebration"},
  43:{shadow:"Deafness",gift:"Insight",siddhi:"Epiphany"},44:{shadow:"Interference",gift:"Teamwork",siddhi:"Synarchy"},
  45:{shadow:"Dominance",gift:"Synergy",siddhi:"Communion"},46:{shadow:"Seriousness",gift:"Delight",siddhi:"Ecstasy"},
  47:{shadow:"Oppression",gift:"Transmutation",siddhi:"Transfiguration"},48:{shadow:"Inadequacy",gift:"Resourcefulness",siddhi:"Wisdom"},
  49:{shadow:"Reaction",gift:"Revolution",siddhi:"Rebirth"},50:{shadow:"Corruption",gift:"Harmony",siddhi:"Enlightenment"},
  51:{shadow:"Agitation",gift:"Initiative",siddhi:"Awakening"},52:{shadow:"Stress",gift:"Restraint",siddhi:"Stillness"},
  53:{shadow:"Immaturity",gift:"Expansion",siddhi:"Superabundance"},54:{shadow:"Greed",gift:"Aspiration",siddhi:"Ascension"},
  55:{shadow:"Victimization",gift:"Freedom",siddhi:"Freedom"},56:{shadow:"Distraction",gift:"Enrichment",siddhi:"Intoxication"},
  57:{shadow:"Unease",gift:"Intuition",siddhi:"Clarity"},58:{shadow:"Dissatisfaction",gift:"Vitality",siddhi:"Bliss"},
  59:{shadow:"Dishonesty",gift:"Intimacy",siddhi:"Transparency"},60:{shadow:"Limitation",gift:"Realism",siddhi:"Justice"},
  61:{shadow:"Psychosis",gift:"Inspiration",siddhi:"Sanctity"},62:{shadow:"Intellectualism",gift:"Precision",siddhi:"Impeccability"},
  63:{shadow:"Doubt",gift:"Inquiry",siddhi:"Truth"},64:{shadow:"Confusion",gift:"Imagination",siddhi:"Illumination"},
};
const gkFromLng=(lng:number)=>GK_SEQ[Math.floor(((lng%360)+360)%360/5.625)%64];
const gkHarmonic=(k1:number,k2:number)=>{const d=Math.min(Math.abs(k1-k2),64-Math.abs(k1-k2));return d<=3||d===32?"harmonic":d>=28&&d<=36?"tension":"neutral";};

// ── MATH / EPHEMERIS ──────────────────────────────────────────
const mod360=(v:number)=>((v%360)+360)%360;
const toRad=(d:number)=>d*Math.PI/180;
const toDeg=(r:number)=>r*180/Math.PI;

const jcent=(d:Date,timeStr?:string)=>{
  const y=d.getFullYear(),m=d.getMonth()+1,da=d.getDate();
  const a=Math.floor((14-m)/12),y1=y+4800-a,m1=m+12*a-3;
  let JD=da+Math.floor((153*m1+2)/5)+365*y1+Math.floor(y1/4)-Math.floor(y1/100)+Math.floor(y1/400)-32045;
  if(timeStr){const[hh,mm]=(timeStr||"12:00").split(":").map(Number);JD+=(hh+(mm||0)/60)/24-0.5;}
  else JD+=0.5;
  return(JD-2451545.0)/36525;
};

type PPos={name:string,lng:number,sign:typeof SIGNS[0],degree:number,planet:typeof PLANETS[0]|undefined,retro:boolean,speed:number,dignity:string,combustion:string};

const getPlanets=(date:Date,timeStr?:string):PPos[]=>{
  const T=jcent(date,timeStr),T2=T*T;
  const L0=mod360(280.46646+36000.76983*T+0.0003032*T2);
  const M_s=mod360(357.52911+35999.05029*T-0.0001537*T2);
  const Mr=toRad(M_s);
  const C_s=(1.914602-0.004817*T-0.000014*T2)*Math.sin(Mr)+(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);
  const sunLng=mod360(L0+C_s);
  const D=mod360(297.85036+445267.11148*T-0.0019142*T2);
  const Mp=mod360(134.96298+477198.867398*T+0.0086972*T2);
  const moonLng=mod360(218.3165+481267.8813*T+6.289*Math.sin(toRad(Mp))-1.274*Math.sin(toRad(2*D-Mp))+0.658*Math.sin(toRad(2*D))-0.186*Math.sin(toRad(M_s))-0.059*Math.sin(toRad(2*D-2*Mp)));
  const nNodeLng=mod360(125.0445222-1934.1362608*T+0.0020708*T2);
  const raw:Record<string,number>={
    Sun:sunLng,Moon:moonLng,
    Mercury:mod360(252.250906+149472.6746358*T+2.0*Math.sin(toRad(174.7948+4452671.1948*T))),
    Venus:mod360(181.979801+58517.8156760*T+0.5*Math.sin(toRad(5.9893+1221669.1*T))),
    Mars:mod360(355.433+19140.2993039*T+0.6569*Math.sin(toRad(19.373+38071.264*T))),
    Jupiter:mod360(34.351519+3034.9056606*T+0.4981*Math.sin(toRad(20.9366+1221.4806*T))),
    Saturn:mod360(50.077444+1222.1138488*T+0.4116*Math.sin(toRad(14.4444+613.0*T))),
    Uranus:mod360(314.055005+428.4669983*T+0.1122*Math.sin(toRad(190.4917+427.1*T))),
    Neptune:mod360(304.348665+218.4862002*T+0.0324*Math.sin(toRad(231.1+218.6*T))),
    Pluto:mod360(238.92881+145.2078*T),
    NNode:nNodeLng,SNode:mod360(nNodeLng+180),
  };
  const d2=new Date(date);d2.setDate(d2.getDate()-1);const T2d=jcent(d2,timeStr);
  const prevL=(nm:string)=>{switch(nm){case"Sun":{const M=mod360(357.52911+35999.05029*T2d);const L=mod360(280.46646+36000.76983*T2d);const C=(1.914602-0.004817*T2d)*Math.sin(toRad(M));return mod360(L+C);}case"Moon":return mod360(218.3165+481267.8813*T2d);case"Mercury":return mod360(252.250906+149472.6746358*T2d);case"Venus":return mod360(181.979801+58517.8156760*T2d);case"Mars":return mod360(355.433+19140.2993039*T2d);case"Jupiter":return mod360(34.351519+3034.9056606*T2d);case"Saturn":return mod360(50.077444+1222.1138488*T2d);case"Uranus":return mod360(314.055005+428.4669983*T2d);case"Neptune":return mod360(304.348665+218.4862002*T2d);case"Pluto":return mod360(238.92881+145.2078*T2d);case"NNode":return mod360(125.0445222-1934.1362608*T2d);case"SNode":return mod360(mod360(125.0445222-1934.1362608*T2d)+180);default:return 0;}};
  return Object.entries(raw).map(([name,lng])=>{
    const l=mod360(lng),sign=SIGNS[Math.floor(l/30)],planet=PLANETS.find(p=>p.name===name);
    let spd=l-prevL(name);if(spd>180)spd-=360;if(spd<-180)spd+=360;
    const retro=spd<0;
    let dignity="peregrine";
    if(planet?.domicile?.includes(sign.name))dignity="domicile";
    else if(planet?.exalt?.includes(sign.name))dignity="exaltation";
    else if(planet?.detriment?.includes(sign.name))dignity="detriment";
    else if(planet?.fall?.includes(sign.name))dignity="fall";
    let combustion="none";
    if(name!=="Sun"&&name!=="NNode"&&name!=="SNode"){let d=Math.abs(l-sunLng);if(d>180)d=360-d;if(d<0.3)combustion="cazimi";else if(d<8.5)combustion="combust";else if(d<17)combustion="under_beams";}
    return{name,lng:l,sign,degree:l%30,planet,retro,speed:spd,dignity,combustion};
  });
};

const getAspects=(p1:PPos[],p2:PPos[],includeMinor=false)=>{
  const f:any[]=[],seen=new Set<string>();
  const list=[...ASPECTS_MAJOR,...(includeMinor?ASPECTS_MINOR:[])];
  for(const a of p1)for(const b of p2){
    if(a.name===b.name)continue;
    let d=Math.abs(a.lng-b.lng);if(d>180)d=360-d;
    for(const asp of list){
      const orb=Math.abs(d-asp.angle);
      if(orb<=asp.orb){const k=[a.name,b.name].sort().join("-")+asp.name;if(!seen.has(k)){seen.add(k);const applying=Math.abs(a.speed)>Math.abs(b.speed)&&a.speed>0&&d>asp.angle-0.5;f.push({p1:a,p2:b,asp,orb:+orb.toFixed(1),strength:1-orb/asp.orb,exact:+((1-orb/asp.orb)*100).toFixed(0),applying});}}
    }
  }
  return f.sort((a,b)=>b.strength-a.strength);
};

const getMoonPhase=(pos:PPos[])=>{
  const m=pos.find(p=>p.name==="Moon"),s=pos.find(p=>p.name==="Sun");if(!m||!s)return{name:"?",icon:"🌑",power:0,energy:"",angle:0};
  const a=mod360(m.lng-s.lng);
  if(a<22.5)return{name:"New Moon",icon:"🌑",power:8,energy:"Set intentions. Plant seeds. Begin.",angle:a};
  if(a<67.5)return{name:"Waxing Crescent",icon:"🌒",power:6,energy:"Building momentum. Take first steps.",angle:a};
  if(a<112.5)return{name:"First Quarter",icon:"🌓",power:5,energy:"Decision point. Commit or pivot.",angle:a};
  if(a<157.5)return{name:"Waxing Gibbous",icon:"🌔",power:7,energy:"Refine and push. Almost peak.",angle:a};
  if(a<202.5)return{name:"Full Moon",icon:"🌕",power:9,energy:"Culmination. Harvest. Heightened emotion.",angle:a};
  if(a<247.5)return{name:"Waning Gibbous",icon:"🌖",power:4,energy:"Gratitude. Share. Distribute.",angle:a};
  if(a<292.5)return{name:"Last Quarter",icon:"🌗",power:3,energy:"Release. Let go. Forgive.",angle:a};
  return{name:"Balsamic Moon",icon:"🌘",power:2,energy:"Rest. Surrender. Prepare for renewal.",angle:a};
};

const isVOC=(pos:PPos[])=>{
  const moon=pos.find(p=>p.name==="Moon");if(!moon)return false;
  const degsLeft=30-moon.degree;
  for(const planet of pos.filter(p=>p.name!=="Moon"&&!["NNode","SNode"].includes(p.name))){
    const diff=mod360(planet.lng-moon.lng);
    for(const a of ASPECTS_MAJOR){const needed=mod360(a.angle-diff+360);if(needed>0.5&&needed<degsLeft+2)return false;}
  }
  return true;
};

const getStelliums=(positions:PPos[])=>{
  const bySign:Record<string,string[]>={};
  positions.filter(p=>!["NNode","SNode"].includes(p.name)).forEach(p=>{if(!bySign[p.sign.name])bySign[p.sign.name]=[];bySign[p.sign.name].push(p.name);});
  return Object.entries(bySign).filter(([,ps])=>ps.length>=3).map(([sign,planets])=>({sign,planets,power:planets.length*3}));
};

const getSolarArcs=(natal:PPos[],birthDate:Date,targetDate:Date)=>{
  const ageYears=(targetDate.getTime()-birthDate.getTime())/(365.25*24*60*60*1000);
  return natal.map(p=>({...p,lng:mod360(p.lng+ageYears)}));
};

const getProgressions=(birthDate:Date,targetDate:Date,birthTime?:string)=>{
  const ageYears=(targetDate.getTime()-birthDate.getTime())/(365.25*24*60*60*1000);
  const progDate=new Date(birthDate.getTime()+ageYears*24*60*60*1000);
  return getPlanets(progDate,birthTime);
};

// ── ASCENDANT + HOUSES ────────────────────────────────────────
const getAscendant=(date:Date,timeStr:string,lat:number,lon:number)=>{
  const T=jcent(date,timeStr);
  const JD=T*36525+2451545.0;
  const GST=mod360(280.46061837+360.98564736629*(JD-2451545.0)+0.000387933*T*T-T*T*T/38710000);
  const LST=mod360(GST+lon);const RAMC=toRad(LST);
  const eps=toRad(23.4392911-0.0130042*T);
  const mc=mod360(toDeg(Math.atan2(Math.sin(RAMC),Math.cos(RAMC)*Math.cos(eps)+Math.tan(toRad(0))*Math.sin(eps))));
  const latR=toRad(lat);
  const asc=mod360(toDeg(Math.atan2(Math.cos(RAMC),-Math.sin(RAMC)*Math.cos(eps)-Math.tan(latR)*Math.sin(eps)))+180);
  return{asc,mc,ascSign:SIGNS[Math.floor(asc/30)]};
};
const getHouseNum=(planetLng:number,ascLng:number)=>{const base=Math.floor(ascLng/30)*30;return Math.floor(mod360(planetLng-base)/30)+1;};

// ── SUNRISE/SUNSET (proper sect & planetary hours) ────────────
const getSunriseSunset=(date:Date,lat:number,lon:number)=>{
  const JD=jcent(date)*36525+2451545.0;const n=Math.floor(JD-2451545.0+0.0008);const Jstar=n-lon/360;
  const M=mod360(357.5291+0.98560028*Jstar);const C=1.9148*Math.sin(toRad(M))+0.02*Math.sin(toRad(2*M));
  const lam=mod360(M+C+180+102.9372);const Jtransit=2451545.0+Jstar+0.0053*Math.sin(toRad(M))-0.0069*Math.sin(toRad(2*lam));
  const sinD=Math.sin(toRad(lam))*Math.sin(toRad(23.45));
  const cosH0=(Math.sin(toRad(-0.8333))-sinD*Math.sin(toRad(lat)))/(Math.cos(Math.asin(sinD))*Math.cos(toRad(lat)));
  if(Math.abs(cosH0)>1)return{sunrise:6,sunset:18};
  const H0=toDeg(Math.acos(cosH0))/360;
  return{sunrise:(Jtransit-H0-2451545.0)*24,sunset:(Jtransit+H0-2451545.0)*24};
};

// ── MIDPOINTS ─────────────────────────────────────────────────
type Midpoint={natalA:string,natalB:string,midpoint:number,transit:string,orb:number,nature:"benefic"|"malefic"|"neutral"};
const getMidpoints=(natal:PPos[],transit:PPos[]):Midpoint[]=>{
  const results:Midpoint[]=[],BENEFICS=["Venus","Jupiter","Sun"],MALEFICS=["Saturn","Mars","Pluto"];
  for(let i=0;i<natal.length;i++)for(let j=i+1;j<natal.length;j++){
    const mp=mod360((natal[i].lng+natal[j].lng)/2);
    for(const m of[mp,mod360(mp+180)])for(const t of transit.filter(p=>!["NNode","SNode"].includes(p.name))){
      let diff=Math.abs(t.lng-m);if(diff>180)diff=360-diff;
      if(diff<1.5){const nature:Midpoint["nature"]=BENEFICS.includes(t.name)?"benefic":MALEFICS.includes(t.name)?"malefic":"neutral";results.push({natalA:natal[i].name,natalB:natal[j].name,midpoint:m,transit:t.name,orb:+diff.toFixed(2),nature});}
    }
  }
  return results.sort((a,b)=>a.orb-b.orb).slice(0,8);
};

// ── ANTISCIA ──────────────────────────────────────────────────
const getAntiscia=(natal:PPos[],transit:PPos[])=>{
  const results:{natal:string,transit:string,orb:number}[]=[];
  for(const n of natal)for(const t of transit){if(n.name===t.name)continue;const nAnt=mod360(180-n.lng);let diff=Math.abs(t.lng-nAnt);if(diff>180)diff=360-diff;if(diff<3)results.push({natal:n.name,transit:t.name,orb:+diff.toFixed(1)});}
  return results.sort((a,b)=>a.orb-b.orb).slice(0,5);
};

// ── MUTUAL RECEPTION ──────────────────────────────────────────
const getMutualReceptions=(positions:PPos[])=>{
  const result:{a:string,b:string}[]=[];
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){
    const pA=positions[i],pB=positions[j];
    if(pA.planet?.domicile?.includes(pB.sign.name)&&pB.planet?.domicile?.includes(pA.sign.name))result.push({a:pA.name,b:pB.name});
  }
  return result;
};

// ── SOLAR RETURN SENSITIVITY ─────────────────────────────────
const getSolarReturn=(natal:PPos[],transit:PPos[])=>{
  const nSun=natal.find(p=>p.name==="Sun")?.lng||0,tSun=transit.find(p=>p.name==="Sun")?.lng||0;
  let diff=Math.abs(tSun-nSun);if(diff>180)diff=360-diff;
  return diff<0.5?3:diff<5?2:diff<15?1:0;
};

// ── PART OF FORTUNE ───────────────────────────────────────────
const getPartOfFortune=(pos:PPos[],asc:number,isDay:boolean)=>{
  const sun=pos.find(p=>p.name==="Sun")?.lng||0,moon=pos.find(p=>p.name==="Moon")?.lng||0;
  return isDay?mod360(asc+moon-sun):mod360(asc+sun-moon);
};

// ── ECLIPSE REFERENCE DEGREES 2024-2026 (shared across engines) ──────────────
const ECLIPSE_DEGREES=[5.1,19.2,356.0,10.7,354.4,9.2,345.4,178.6,338.5,23.1,353.2,12.8,76.4,256.4,92.3,272.3];

// ─── WORLD ENERGY ENGINE — Iran methodology applied globally ───
// Uses transit-to-transit aspects (no natal needed) + world indicators per domain
const scoreWorldDomain=(dom:typeof DOMAINS[0],transit:PPos[],date:Date)=>{
  const BENEFICS=["Venus","Jupiter","Sun"],MALEFICS=["Saturn","Mars","Pluto"];
  let score=0;const signals:any[]=[];
  // Transit-to-transit major aspects between domain rulers
  const allTransitAspects=getAspects(transit,transit,false);
  const relAspects=allTransitAspects.filter(a=>
    (dom.rulers.includes(a.p1.name)&&!dom.rulers.includes(a.p2.name))||
    (dom.rulers.includes(a.p2.name)&&!dom.rulers.includes(a.p1.name))||
    (dom.rulers.includes(a.p1.name)&&dom.rulers.includes(a.p2.name))
  );
  relAspects.slice(0,6).forEach(a=>{
    const w=(dom.weights[a.p1.name as keyof typeof dom.weights]||1)*(dom.weights[a.p2.name as keyof typeof dom.weights]||1);
    const imp=a.strength*a.asp.power*Math.sqrt(w)*(a.applying?1.3:0.9);
    const positive=["flow","ease","fusion","creative"].includes(a.asp.nature);
    const ben=BENEFICS.includes(a.p1.name)||BENEFICS.includes(a.p2.name);
    const mal=MALEFICS.includes(a.p1.name)||MALEFICS.includes(a.p2.name);
    if(positive){const v=imp*(ben?1.4:1);score+=v;signals.push({text:`${a.p1.planet?.sym}${a.p1.name} ${a.asp.name} ${a.p2.planet?.sym}${a.p2.name}`,val:+v.toFixed(1),type:"green",detail:`${a.asp.nature} · ${a.applying?"applying":"separating"} · ${a.exact}% exact · world domain alignment`});}
    else{const v=imp*(mal?1.4:1);score-=v;signals.push({text:`${a.p1.planet?.sym}${a.p1.name} ${a.asp.name} ${a.p2.planet?.sym}${a.p2.name}`,val:-v.toFixed(1),type:"red",detail:`${a.asp.nature} · ${a.applying?"applying pressure":"separating"} · ${a.exact}% exact · world friction`});}
  });
  // Retrograde penalty — affects everyone globally
  transit.filter(p=>p.retro&&dom.rulers.includes(p.name)).forEach(p=>{
    const isKey=dom.keyRetros.includes(p.name);const pen=(p.name==="Mercury"?-8:p.name==="Venus"?-6:p.name==="Mars"?-7:-4)*(isKey?1.4:1);
    score+=pen;signals.push({text:`${p.planet?.sym}${p.name} ℞ in ${p.sign.name}`,val:+pen.toFixed(1),type:"warning",detail:isKey?`Key retro for ${dom.name} — global disruption elevated`:`Retrograde energy — review over initiation`});
  });
  // Dignity of domain rulers globally
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    if(p.dignity==="domicile"){score+=3;signals.push({text:`${p.planet?.sym}${p.name} domicile in ${p.sign.name}`,val:3,type:"green",detail:"Planet at maximum world strength"});}
    else if(p.dignity==="exaltation"){score+=2;signals.push({text:`${p.planet?.sym}${p.name} exalted in ${p.sign.name}`,val:2,type:"green",detail:"Planet at peak world power"});}
    else if(p.dignity==="detriment"){score-=2;signals.push({text:`${p.planet?.sym}${p.name} in detriment (${p.sign.name})`,val:-2,type:"caution",detail:"Planet operating below capacity globally"});}
    else if(p.dignity==="fall"){score-=1.5;signals.push({text:`${p.planet?.sym}${p.name} in fall (${p.sign.name})`,val:-1.5,type:"caution",detail:"Planet at weakest global expression"});}
  });
  // Moon phase world effect
  const mp=getMoonPhase(transit);
  const isGoodPhase=dom.goodPhases.includes(mp.name),isBadPhase=dom.badPhases.includes(mp.name);
  if(isGoodPhase){score+=4;signals.push({text:`${mp.icon}${mp.name} — ideal phase`,val:4,type:"green",detail:`${mp.energy} Universal support for ${dom.name.toLowerCase()}`});}
  else if(isBadPhase){score-=3;signals.push({text:`${mp.icon}${mp.name} — unfavourable phase`,val:-3,type:"caution",detail:`This phase works against ${dom.name.toLowerCase()} globally`});}
  // VOC
  if(isVOC(transit)){score-=5;signals.push({text:"🚫 Void of Course Moon",val:-5,type:"warning",detail:"Global undercurrent — actions started now tend not to land"});}

  // Eclipse sensitivity — eclipses within 14° of domain ruler degrees trigger strong global signals
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    ECLIPSE_DEGREES.forEach(eDeg=>{let d=Math.abs(p.lng-eDeg);if(d>180)d=360-d;
      if(d<8){const isMal=["Saturn","Mars","Pluto"].includes(p.name);const val=isMal?-5:4;
        score+=val;signals.push({text:`🌑 Eclipse point activates ${p.name} (${d.toFixed(1)}° orb)`,val,type:isMal?"warning":"green",detail:isMal?`Eclipse zone amplifies ${p.name} challenges globally — turbulence elevated`:`Eclipse zone energises ${p.name} — globally heightened ${dom.name.toLowerCase()} energy`});
      }
    });
  });

  // Planetary ingress — when a slow planet just entered a new sign (within 5°), signals major global shift
  transit.filter(p=>dom.rulers.includes(p.name)&&["Jupiter","Saturn","Uranus","Neptune","Pluto"].includes(p.name)).forEach(p=>{
    const degsInSign=p.degree;
    if(degsInSign<5&&!p.retro){score+=5;signals.push({text:`🚪 ${p.name} freshly ingressed ${p.sign.name}`,val:5,type:"green",detail:`${p.name} just entered ${p.sign.name} — major 1-2 year global theme beginning for ${dom.name.toLowerCase()}`});}
    else if(degsInSign>25&&!p.retro){score+=2;signals.push({text:`⚡ ${p.name} approaching ${p.sign.name} exit`,val:2,type:"green",detail:`${p.name} at final degrees of ${p.sign.name} — themes crystallising before major shift`});}
  });

  // Mutual reception between world rulers (adds global harmony)
  const worldMR=getMutualReceptions(transit);
  worldMR.filter(mr=>dom.rulers.includes(mr.a)&&dom.rulers.includes(mr.b)).forEach(mr=>{
    score+=4;signals.push({text:`🤝 ${mr.a}/${mr.b} mutual reception`,val:4,type:"green",detail:"Two domain rulers in each other's signs — cooperative global energy, amplified support"});
  });

  const norm=Math.max(-100,Math.min(100,score*2.0));
  const gn=signals.filter(s=>s.type==="green").length,rd=signals.filter(s=>["red","warning","caution"].includes(s.type)).length;
  // Probability: Iran methodology — convergence × signal strength × direction agreement
  const totalSignals=gn+rd;const dirAgreement=totalSignals>0?(Math.max(gn,rd)/totalSignals):0.5;
  // Fixed formula: spread properly, don't let it cluster at top end
  const dirBonus=(dirAgreement-0.5)*50;
  const scoreBonus=norm*0.18;
  const mixedPenalty=gn>0&&rd>0?(rd/(gn+rd))*12:0;
  const rawProb=50+dirBonus+scoreBonus-mixedPenalty;
  // Domain variance based on ruler positions — differentiates similar-ruler domains
  const domVariance=(dom.rulers.reduce((s:number,r:string)=>{const p=transit.find(x=>x.name===r);return s+(p?p.lng*0.05:0);},0))%6-3;
  const probability=Math.max(18,Math.min(92,Math.round(rawProb+domVariance)));
  const convergence=Math.round(dirAgreement*100);
  // Sort signals: keep top warnings always visible, then fill rest with strongest by magnitude
  const warnings=signals.filter(s=>s.type==="warning"||s.type==="red").sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)).slice(0,3);
  const others=signals.filter(s=>s.type!=="warning"&&s.type!=="red").sort((a,b)=>Math.abs(b.val)-Math.abs(a.val));
  const sortedSignals=[...warnings,...others].slice(0,8);
  return{score:norm,signals:sortedSignals,probability,convergence,greenCount:gn,redCount:rd};
};

// ─── PERSONAL DOMAIN SCORING — 17 systems, Iran triangulation ─
type Signal={text:string,val:number,type:"green"|"red"|"warning"|"caution",conf:number,detail:string,system:string};
const scorePersonalDomain=(dom:typeof DOMAINS[0],natal:PPos[],transit:PPos[],date:Date,birthDate:Date,tier:number,isDay:boolean,solarArcs:PPos[],progressions:PPos[],midpoints:Midpoint[]=[],mutualReceptions:{a:string,b:string}[]=[],antiscia:{natal:string,transit:string,orb:number}[]=[],solarReturnBonus:number=0,houses:Record<string,number>={},ascLng:number=0,partOfFortune:number|null=null)=>{
  const signals:Signal[]=[];let score=0;
  const aspects=getAspects(transit,natal,tier>=3);
  const rel=aspects.filter(a=>dom.rulers.includes(a.p1.name)||dom.rulers.includes(a.p2.name));
  const BENEFICS=["Venus","Jupiter","Sun"],MALEFICS=["Saturn","Mars","Pluto"];

  // S1: Transit-natal aspects (core signal, applying = 1.4x)
  rel.forEach(a=>{
    const dw=(dom.weights as Record<string,number>)[a.p1.name]||1;
    let imp=a.strength*a.asp.power*dw*(a.applying?1.4:0.8);
    const positive=["flow","ease","fusion","creative","adjust"].includes(a.asp.nature);
    if(positive){if(BENEFICS.includes(a.p1.name))imp*=1.5;score+=imp;signals.push({text:`${a.p1.planet?.sym}${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+imp.toFixed(1),type:"green",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} · ${a.applying?"applying ↑":"separating ↓"} · ${a.exact}% exact`,system:"Transit"});}
    else{if(MALEFICS.includes(a.p1.name))imp*=1.4;score-=imp;signals.push({text:`${a.p1.planet?.sym}${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:-imp.toFixed(1),type:"red",conf:Math.min(9,Math.round(a.strength*10)),detail:`${a.asp.nature} · ${a.applying?"applying pressure ↑":"separating"} · ${a.exact}% exact`,system:"Transit"});}
  });

  // S2: Dignity
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    if(p.dignity==="domicile"){score+=4;signals.push({text:`${p.planet?.sym}${p.name} Domicile (${p.sign.name})`,val:4,type:"green",conf:8,detail:"Planet in home sign — maximum strength",system:"Dignity"});}
    else if(p.dignity==="exaltation"){score+=3;signals.push({text:`${p.planet?.sym}${p.name} Exalted in ${p.sign.name}`,val:3,type:"green",conf:7,detail:"Planet at peak potency",system:"Dignity"});}
    else if(p.dignity==="detriment"){score-=3;signals.push({text:`${p.planet?.sym}${p.name} Detriment (${p.sign.name})`,val:-3,type:"caution",conf:6,detail:"Planet weakened — actions may misfire",system:"Dignity"});}
    else if(p.dignity==="fall"){score-=2;signals.push({text:`${p.planet?.sym}${p.name} Fall (${p.sign.name})`,val:-2,type:"caution",conf:5,detail:"Planet at minimum strength",system:"Dignity"});}
  });

  // S3: Combustion / Cazimi
  transit.filter(p=>dom.rulers.includes(p.name)&&p.name!=="Sun").forEach(p=>{
    if(p.combustion==="cazimi"){score+=8;signals.push({text:`✨${p.name} CAZIMI`,val:8,type:"green",conf:9,detail:"Planet at heart of Sun — divine empowerment. Rare.",system:"Combustion"});}
    else if(p.combustion==="combust"){score-=4;signals.push({text:`🔥${p.name} Combust`,val:-4,type:"warning",conf:7,detail:"Planet overwhelmed by solar light — clarity impaired",system:"Combustion"});}
    else if(p.combustion==="under_beams"){score-=2;signals.push({text:`🌤${p.name} Under Beams`,val:-2,type:"caution",conf:5,detail:"Mildly weakened by solar proximity",system:"Combustion"});}
  });

  // S4: Sect
  const DAY_P=["Sun","Jupiter","Saturn"],NIGHT_P=["Moon","Venus","Mars"];
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
    const inSect=(isDay&&DAY_P.includes(p.name))||(!isDay&&NIGHT_P.includes(p.name));
    if(inSect){score+=2;signals.push({text:`${isDay?"☀️":"🌙"}${p.name} in sect`,val:2,type:"green",conf:5,detail:`Planet in natural ${isDay?"day":"night"}-time element`,system:"Sect"});}
  });

  // S5: Retrograde
  transit.filter(p=>p.retro&&dom.rulers.includes(p.name)).forEach(p=>{
    const isKey=dom.keyRetros.includes(p.name);const pen=(p.name==="Mercury"?-8:p.name==="Venus"?-6:p.name==="Mars"?-7:-4)*(isKey?1.5:1);
    score+=pen;signals.push({text:`${p.planet?.sym}${p.name} RETROGRADE in ${p.sign.name}${isKey?" ⚠️ KEY":""}`,val:+pen.toFixed(1),type:"warning",conf:8,detail:p.name==="Mercury"?"Avoid signing — errors & miscommunication elevated":p.name==="Venus"?"Re-evaluate — don't start new":p.name==="Mars"?"Action resists — review over initiate":"Deep review phase",system:"Retrograde"});
  });

  // S6: Moon phase (domain-specific)
  const mp=getMoonPhase(transit);
  if(dom.goodPhases.includes(mp.name)){score+=4;signals.push({text:`${mp.icon}${mp.name} — ideal phase`,val:4,type:"green",conf:6,detail:mp.energy,system:"Moon"});}
  else if(dom.badPhases.includes(mp.name)){score-=3;signals.push({text:`${mp.icon}${mp.name} — works against this domain`,val:-3,type:"caution",conf:5,detail:mp.energy,system:"Moon"});}

  // S7: VOC
  if(isVOC(transit)){score-=6;signals.push({text:"🚫 Void of Course Moon",val:-6,type:"warning",conf:7,detail:"Moon makes no more aspects — actions tend to fizzle",system:"Moon"});}

  // S8: Nodes
  const nNode=transit.find(p=>p.name==="NNode"),sNode=transit.find(p=>p.name==="SNode");
  if(nNode&&sNode){
    natal.filter(p=>dom.rulers.includes(p.name)).forEach(nP=>{
      let dN=Math.abs(nNode.lng-nP.lng);if(dN>180)dN=360-dN;let dS=Math.abs(sNode.lng-nP.lng);if(dS>180)dS=360-dS;
      if(dN<8){score+=6;signals.push({text:`☊ North Node conjunct natal ${nP.name}`,val:6,type:"green",conf:8,detail:"Fate activation — life area opening for major growth",system:"Nodes"});}
      if(dS<8){score-=4;signals.push({text:`☋ South Node conjunct natal ${nP.name}`,val:-4,type:"caution",conf:7,detail:"Past karma releasing — familiar but draining patterns",system:"Nodes"});}
    });
  }

  // S9: Stelliums
  const transitStell=getStelliums(transit);transitStell.forEach(st=>{if(st.planets.some(p=>dom.rulers.includes(p))){score+=st.power*0.5;signals.push({text:`⭐Stellium in ${st.sign}: ${st.planets.join(", ")}`,val:+(st.power*0.5).toFixed(1),type:"green",conf:6,detail:"Concentrated energy — amplified domain effects",system:"Stellium"});}});

  // S10: Planetary hour
  const hrs=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
  const dayR=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"][date.getDay()];
  const hR=hrs[(hrs.indexOf(dayR)+date.getHours())%7];
  if(dom.rulers.includes(hR)){score+=3;signals.push({text:`⏰ Planetary Hour of ${hR}`,val:3,type:"green",conf:4,detail:`Current hour ruled by ${hR}`,system:"Hour"});}

  // S11: Gene Keys
  const nSun=natal.find(p=>p.name==="Sun"),tSun=transit.find(p=>p.name==="Sun");
  if(nSun&&tSun){
    const bGK=gkFromLng(nSun.lng),tGK=gkFromLng(tSun.lng),rel2=gkHarmonic(bGK,tGK);
    if(rel2==="harmonic"&&["creative","spiritual","love"].includes(dom.id)){score+=3;signals.push({text:`🔑 Gene Key ${tGK} harmonises with natal GK ${bGK}`,val:3,type:"green",conf:5,detail:`${GK_DATA[tGK]?.gift} energy resonates with your ${GK_DATA[bGK]?.gift}`,system:"GeneKeys"});}
    else if(rel2==="tension"&&["contracts","career","financial"].includes(dom.id)){score-=2;signals.push({text:`🔑 Gene Key ${tGK} tension with natal GK ${bGK}`,val:-2,type:"caution",conf:4,detail:`${GK_DATA[tGK]?.shadow} energy may create resistance today`,system:"GeneKeys"});}
  }

  // S11b: Domain-specific differentiator — distinguishes domains sharing the same rulers
  // This is what makes contracts ≠ learning ≠ travel even when all use Mercury+Jupiter
  const moonPos=transit.find(p=>p.name==="Moon"),mercPos=transit.find(p=>p.name==="Mercury"),venPos=transit.find(p=>p.name==="Venus");
  const jupPos=transit.find(p=>p.name==="Jupiter"),satPos=transit.find(p=>p.name==="Saturn");
  if(dom.id==="contracts"){
    // Contracts extra: Mercury sign quality, void of course emphasis
    if(mercPos?.sign.name==="Gemini"||mercPos?.sign.name==="Virgo"){score+=3;signals.push({text:`☿ Mercury in ${mercPos.sign.name} — contract clarity`,val:3,type:"green",conf:6,detail:"Mercury domicile — unusually precise thinking, excellent for agreements",system:"DomainSpec"});}
    else if(mercPos?.sign.name==="Sagittarius"||mercPos?.sign.name==="Pisces"){score-=2;signals.push({text:`☿ Mercury in ${mercPos.sign.name} — detail risk`,val:-2,type:"caution",conf:5,detail:"Mercury less precise here — re-read fine print thoroughly",system:"DomainSpec"});}
  }
  if(dom.id==="learning"){
    // Learning extra: Jupiter sign quality + Mercury-Jupiter relationship
    if(jupPos?.sign.name==="Sagittarius"||jupPos?.sign.name==="Pisces"||jupPos?.sign.name==="Cancer"){score+=4;signals.push({text:`♃ Jupiter in ${jupPos.sign.name} — expanded mind`,val:4,type:"green",conf:7,detail:"Jupiter at home or exalted — collective wisdom and learning window elevated",system:"DomainSpec"});}
    if(jupPos?.sign.name==="Gemini"){score+=3;signals.push({text:`♃ Jupiter in Gemini — learning boom`,val:3,type:"green",conf:6,detail:"Jupiter in Gemini period (2024-2025) — universal curiosity and study are globally boosted",system:"DomainSpec"});}
  }
  if(dom.id==="travel"){
    // Travel extra: Moon sign ingress (emotionally ready to move)
    const moonInMutableSign=["Gemini","Sagittarius","Virgo","Pisces"].includes(moonPos?.sign.name||"");
    if(moonInMutableSign){score+=3;signals.push({text:`☽ Moon in ${moonPos?.sign.name} — mobile energy`,val:3,type:"green",conf:5,detail:"Mutable moon sign supports movement and adaptability",system:"DomainSpec"});}
    const moonInFixedSign=["Taurus","Scorpio","Leo","Aquarius"].includes(moonPos?.sign.name||"");
    if(moonInFixedSign){score-=2;signals.push({text:`☽ Moon in ${moonPos?.sign.name} — prefers stability`,val:-2,type:"caution",conf:4,detail:"Fixed moon sign resists change and movement — slight drag on travel energy",system:"DomainSpec"});}
  }
  if(dom.id==="creative"){
    // Creative extra: Venus-Neptune relationship is the master creative signal
    if(venPos&&transit.find(p=>p.name==="Neptune")){const nepPos=transit.find(p=>p.name==="Neptune")!;let d=Math.abs(venPos.lng-nepPos.lng);if(d>180)d=360-d;if(d<30){score+=4;signals.push({text:`♀ Venus near Neptune — inspired channel`,val:4,type:"green",conf:7,detail:"Venus-Neptune proximity opens the creative gateway — art, music, writing all flow",system:"DomainSpec"});}}
    if(venPos?.sign.name==="Leo"||venPos?.sign.name==="Libra"||venPos?.sign.name==="Taurus"){score+=3;signals.push({text:`♀ Venus in ${venPos.sign.name} — amplified artistry`,val:3,type:"green",conf:6,detail:"Venus in expressive or dignified sign — creative work carries more beauty and impact",system:"DomainSpec"});}
  }
  if(dom.id==="health"){
    // Health extra: Mars condition is primary for energy and vitality
    if(transit.find(p=>p.name==="Mars")?.sign.name==="Capricorn"||transit.find(p=>p.name==="Mars")?.sign.name==="Aries"){score+=4;signals.push({text:`♂ Mars in ${transit.find(p=>p.name==="Mars")?.sign.name} — peak vitality`,val:4,type:"green",conf:7,detail:"Mars in its most potent signs — physical energy, healing, and stamina are elevated",system:"DomainSpec"});}
  }
  if(dom.id==="spiritual"){
    // Spiritual extra: Pisces placements + Neptune proximity to natal planets
    const piscesPlanets=transit.filter(p=>p.sign.name==="Pisces"&&dom.rulers.includes(p.name));
    if(piscesPlanets.length>0){score+=4;signals.push({text:`🐟 ${piscesPlanets.map(p=>p.name).join("/")} in Pisces`,val:4,type:"green",conf:7,detail:"Domain rulers in Pisces — the spiritual realm is unusually accessible",system:"DomainSpec"});}
  }
  if(dom.id==="financial"){
    // Financial extra: Saturn-Jupiter relationship is the wealth cycle signal
    if(satPos&&jupPos){let d=Math.abs(satPos.lng-jupPos.lng);if(d>180)d=360-d;if(d<30){score+=5;signals.push({text:`♃♄ Jupiter-Saturn conjunction — wealth alignment`,val:5,type:"green",conf:8,detail:"The 20-year wealth cycle conjunction — major financial structures being rebuilt globally",system:"DomainSpec"});}else if(d>170&&d<190){score-=3;signals.push({text:`♃♄ Jupiter-Saturn opposition — financial tension`,val:-3,type:"caution",conf:6,detail:"Expansion and contraction pulling against each other — conservative approach recommended",system:"DomainSpec"});}}
  }
  if(dom.id==="love"){
    // Love extra: Full Moon in Libra/Taurus/Pisces is peak romance window
    const mp2=getMoonPhase(transit);
    if(mp2.name==="Full Moon"&&["Libra","Taurus","Pisces","Cancer"].includes(transit.find(p=>p.name==="Moon")?.sign.name||"")){score+=5;signals.push({text:`🌕 Full Moon in ${transit.find(p=>p.name==="Moon")?.sign.name} — peak relational moment`,val:5,type:"green",conf:8,detail:"Full Moon in a Venus-ruled or water sign — emotional depth and romantic energy at maximum",system:"DomainSpec"});}
  }
  if(dom.id==="career"){
    // Career extra: Sun in fire/cardinal signs boosts authority
    const sunPos=transit.find(p=>p.name==="Sun");
    const sunInPower=["Aries","Leo","Capricorn","Libra"].includes(sunPos?.sign.name||"");
    if(sunInPower){score+=3;signals.push({text:`☉ Sun in ${sunPos?.sign.name} — authority season`,val:3,type:"green",conf:6,detail:"Sun in cardinal or Leo sign — leadership visibility and career recognition are elevated",system:"DomainSpec"});}
  }

  // S12: Solar Arc Directions (T3+)
  if(tier>=3){
    const saAspects=getAspects(solarArcs,natal,false);
    saAspects.filter(a=>dom.rulers.includes(a.p1.name)&&a.orb<2).forEach(a=>{
      const pos=["flow","ease","fusion"].includes(a.asp.nature);const v=a.strength*a.asp.power*(pos?1:-1)*0.8;score+=v;
      signals.push({text:`🌀 Solar Arc ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+v.toFixed(1),type:pos?"green":"red",conf:7,detail:`1°/year direction · ${a.orb}° orb · ${pos?"supportive":"challenging"} life theme`,system:"SolarArc"});
    });
    // Progressions
    const progAspects=getAspects(progressions,natal,false);
    progAspects.filter(a=>dom.rulers.includes(a.p1.name)&&a.orb<1.5).forEach(a=>{
      const pos=["flow","ease","fusion"].includes(a.asp.nature);const v=a.strength*a.asp.power*(pos?1:-1)*0.7;score+=v;
      signals.push({text:`📈 Progressed ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`,val:+v.toFixed(1),type:pos?"green":"red",conf:6,detail:`Secondary progression · ${a.orb}° orb`,system:"Progression"});
    });
  }

  // S13: Eclipse sensitivity (handled by S20 with expanded eclipse list — skipped here)



  // S14: Midpoints (T2+)
  if(tier>=2){
    midpoints.filter(mp=>dom.rulers.includes(mp.transit)).forEach(mp=>{
      const val=mp.nature==="benefic"?3:mp.nature==="malefic"?-3:1;score+=val;
      signals.push({text:`✦ ${mp.transit} at ${mp.natalA}/${mp.natalB} midpoint`,val,type:val>0?"green":"caution",conf:5,detail:`${mp.nature} midpoint activation · ${mp.orb}° orb`,system:"Midpoint"});
    });
    // S15: Mutual reception
    mutualReceptions.filter(mr=>dom.rulers.includes(mr.a)||dom.rulers.includes(mr.b)).forEach(mr=>{
      score+=3;signals.push({text:`🔄 Mutual Reception: ${mr.a} ↔ ${mr.b}`,val:3,type:"green",conf:7,detail:"Planets in each other's signs — mutually strengthened",system:"Dignity"});
    });
    // S16: Antiscia
    antiscia.filter(a=>dom.rulers.includes(a.transit)||dom.rulers.includes(a.natal)).forEach(a=>{
      score+=2;signals.push({text:`◈ Antiscia: ${a.transit} ↔ natal ${a.natal}`,val:2,type:"green",conf:5,detail:`Mirror point activation · ${a.orb}° orb`,system:"Antiscia"});
    });
  }

  // S17: Solar Return (T2+)
  if(tier>=2&&solarReturnBonus>0&&["career","love","spiritual","financial"].includes(dom.id)){
    const v=solarReturnBonus*2;score+=v;
    signals.push({text:`☀️ Solar Return ${solarReturnBonus>=3?"exact":"approaching"}`,val:v,type:"green",conf:7,detail:solarReturnBonus>=3?"Sun at birth degree — peak annual reset. Major decisions carry extra weight.":"Approaching solar return — heightened sensitivity, major themes activating.",system:"SolarReturn"});
  }

  // S18: Houses + ASC/MC activation (T3+, requires birth time)
  if(tier>=3&&Object.keys(houses).length>0){
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
      const h=houses[p.name];
      if([1,4,7,10].includes(h)){score+=3;signals.push({text:`🏠 ${p.name} in angular house (${h}th)`,val:3,type:"green",conf:6,detail:"Angular house — planet at maximum strength and visibility",system:"Houses"});}
      else if([3,6,9,12].includes(h)){score-=1;signals.push({text:`🏠 ${p.name} in cadent house (${h}th)`,val:-1,type:"caution",conf:4,detail:"Cadent house — reduced influence",system:"Houses"});}
    });
    // Planet conjunct ASC/MC
    const angles=[{lng:ascLng,name:"Ascendant"},{lng:mod360(ascLng+90),name:"IC"},{lng:mod360(ascLng+180),name:"Descendant"},{lng:mod360(ascLng+270),name:"Midheaven"}];
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(p=>{
      angles.forEach(angle=>{let diff=Math.abs(p.lng-angle.lng);if(diff>180)diff=360-diff;if(diff<5){score+=4;signals.push({text:`📍 ${p.name} conjunct ${angle.name}`,val:4,type:"green",conf:8,detail:`Transit ${p.name} on your ${angle.name} — major personal activation`,system:"Houses"});}});
    });
  }

  // S19: Part of Fortune (T3+)
  if(tier>=3&&partOfFortune!==null){
    const BENEFICS2=["Venus","Jupiter","Sun"];
    transit.filter(p=>BENEFICS2.includes(p.name)&&dom.rulers.includes(p.name)).forEach(p=>{
      let diff=Math.abs(p.lng-partOfFortune!);if(diff>180)diff=360-diff;
      if(diff<8){score+=3;signals.push({text:`🍀 ${p.name} conjunct Part of Fortune`,val:3,type:"green",conf:6,detail:"Benefic at your fortune point — material and life luck activated",system:"ArabicParts"});}
    });
  }

  // S20: Eclipse sensitivity (T1+ — eclipses affect everyone)
  // Natal planets on eclipse points = 6-month activation window
  natal.filter(p=>dom.rulers.includes(p.name)).forEach(nP=>{
    ECLIPSE_DEGREES.forEach(eDeg=>{let d=Math.abs(nP.lng-eDeg);if(d>180)d=360-d;
      if(d<6){score+=5;signals.push({text:`🌑 Eclipse activates natal ${nP.name} (${d.toFixed(1)}°)`,val:5,type:"green",conf:8,detail:`A 2024-26 eclipse fell on your natal ${nP.name} — this domain is karmically activated`,system:"Eclipse"});}
    });
  });
  // Transit domain rulers currently on eclipse points (separate check, not nested)
  transit.filter(p=>dom.rulers.includes(p.name)).forEach(tP=>{
    ECLIPSE_DEGREES.forEach(eDeg=>{let d=Math.abs(tP.lng-eDeg);if(d>180)d=360-d;
      if(d<5){const isMal=MALEFICS.includes(tP.name);const v=isMal?-4:3;
        score+=v;signals.push({text:`🌑 ${tP.name} on eclipse point`,val:v,type:isMal?"warning":"green",conf:7,detail:`Transit ${tP.name} activating eclipse degree — amplified ${isMal?"disruption":"opportunity"}`,system:"Eclipse"});
      }
    });
  });

  // S21: Fixed stars (T2+) — the stars the ancients used for fate prediction
  if(tier>=2){
    const FIXED_STARS=[
      {name:"Regulus",  lng:149.8,nature:"benefic", quality:"Success, courage, leadership — fame possible"},
      {name:"Algol",    lng:126.0,nature:"malefic",  quality:"Intense upheaval — the most feared star in ancient astrology"},
      {name:"Spica",    lng:203.3,nature:"benefic",  quality:"Gifts, talent, artistry — protected outcomes"},
      {name:"Antares",  lng:249.9,nature:"malefic",  quality:"Obsession, volatility — extremes in all directions"},
      {name:"Aldebaran",lng:69.7, nature:"benefic",  quality:"Integrity brings success — honour and achievement"},
      {name:"Fomalhaut",lng:333.9,nature:"benefic",  quality:"Idealism, vision, dreams materialising"},
      {name:"Achernar", lng:15.3, nature:"benefic",  quality:"Crisis resolved — clearing the way forward"},
      {name:"Pleiades", lng:59.7, nature:"mixed",    quality:"Grief and glory intertwined — bittersweet outcomes"},
      {name:"Vega",     lng:284.4,nature:"benefic",  quality:"Artistic talent, charisma, charm elevated"},
      {name:"Sirius",   lng:104.1,nature:"benefic",  quality:"Ambition rewarded, extraordinary achievement possible"},
    ];
    transit.filter(p=>dom.rulers.includes(p.name)).forEach(tP=>{
      FIXED_STARS.forEach(star=>{let d=Math.abs(tP.lng-star.lng);if(d>180)d=360-d;
        if(d<1.5){const v=star.nature==="benefic"?4:star.nature==="malefic"?-5:2;
          score+=v;signals.push({text:`⭐ ${tP.name} conjunct ${star.name}`,val:v,type:v>0?"green":"warning",conf:7,detail:star.quality,system:"FixedStar"});
        }
      });
    });
    natal.filter(p=>dom.rulers.includes(p.name)).forEach(nP=>{
      FIXED_STARS.forEach(star=>{let d=Math.abs(nP.lng-star.lng);if(d>180)d=360-d;
        if(d<1.0){const v=star.nature==="benefic"?3:star.nature==="malefic"?-3:1;
          score+=v;signals.push({text:`⭐ Natal ${nP.name} on ${star.name}`,val:v,type:v>0?"green":"caution",conf:6,detail:`Born with ${nP.name} conjunct ${star.name}: ${star.quality}`,system:"FixedStar"});
        }
      });
    });
  }

  const norm=Math.max(-100,Math.min(100,score*2.2));
  const gn=signals.filter(s=>s.type==="green").length,rd=signals.filter(s=>["red","warning","caution"].includes(s.type)).length;
  const sysCount=new Set(signals.map(s=>s.system)).size;
  const conf=Math.min(9,Math.max(2,Math.round((Math.abs(norm)/100)*5+signals.length*0.22+sysCount*0.5+1.5)));
  // Iran methodology: probability from multi-system convergence
  // Key fix: sysCount bonus capped, avgStrength normalised to prevent 96% clustering
  const totalSig=gn+rd;const dirAgree=totalSig>0?(Math.max(gn,rd)/totalSig):0.5;
  // Weight direction strongly, cap bonuses to spread scores
  const dirBonus=(dirAgree-0.5)*50; // -25 to +25 range
  const scoreBonus=norm*0.18; // -18 to +18 range
  const sysBonus=Math.min(sysCount*0.8,6); // max +6, not +12
  const strengthPenalty=gn>0&&rd>0?(rd/(gn+rd))*15:0; // mixed signals pull toward 50
  const rawProb=50+dirBonus+scoreBonus+sysBonus-strengthPenalty;
  // Add domain-specific micro-variation based on planetary degrees (prevents identical scores)
  const domVariance=(dom.rulers.reduce((s,r)=>{const p=transit.find(x=>x.name===r);return s+(p?p.lng*0.07:0);},0))%8-4;
  const probability=Math.max(15,Math.min(94,Math.round(rawProb+domVariance)));
  const convergence=Math.round(dirAgree*100);
  return{score:norm,signals:signals.sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)),confidence:conf,probability,convergence,greenCount:gn,redCount:rd,totalSignals:signals.length};
};

// ─── VERDICT LANGUAGE ─────────────────────────────────────────
const VERDICTS:Record<string,{great:string[],good:string[],mixed:string[],bad:string[],avoid:string[]}> = {
  career:{great:["Strong day to push forward — visibility and authority are aligned. Make the call, send the pitch, step into the room.","Leadership energy is running high. People notice you today — use that window.","The planetary support for career action is clear. Don't wait for a better moment."],good:["Reasonable conditions for career progress. The door is open — walk through it.","Solid work energy today. Momentum is available if you commit.","Mid-level effort yields strong results. Not peak, but well-above average."],mixed:["Mixed signals at work. Opportunity and friction are both present — choose your battles.","Better for planning and preparation than high-stakes execution today.","Tread carefully with authority figures. Collaboration over confrontation."],bad:["Keep your head down. Avoid confrontations and big announcements today.","Career energy is strained — delay launches, skip the important meeting if possible.","Not a day for power moves. Lay low, prepare, wait for the sky to shift."],avoid:["Strongly avoid major career decisions today. The timing is genuinely poor.","Risk of professional setbacks if you push hard. This one is worth waiting out."]},
  love:{great:["Deep connection energy — honest conversations land well, feelings translate clearly.","If you've been holding something back, the timing to open up is now. Warmth flows easily.","Emotional receptivity is high. Relationships feel genuinely supportive today."],good:["Good relational energy — a solid day for honest exchange and deepening connection.","Small gestures carry weight today. Reach out, check in, be present.","People around you are open. Good conditions for patching things up."],mixed:["Listen more than you speak. Emotional signals are present but unstable.","Proceed carefully with sensitive conversations — same words land differently depending on timing.","Love energy is present but inconsistent. Don't force resolution if it isn't ready."],bad:["High miscommunication risk. Postpone the important relationship talk if you can.","Emotional tension is elevated. Give yourself and others more space than you think you need.","Not a strong day for relational action. Hold the line and revisit in a few days."],avoid:["Avoid major relationship decisions or ultimatums today — the energy is genuinely against it.","Do not make permanent calls about relationships now. What feels certain today may look different tomorrow."]},
  contracts:{great:["Excellent day to sign. Clarity, agreement energy, and follow-through are strongly aligned.","Put pen to paper today. The conditions for clean, binding agreements are unusually good.","Mercury and relevant planets all point the same way. Advance your agreements now."],good:["Reasonable conditions for contracts. Read the fine print and proceed with confidence.","Contractual energy is positive — advance the deal, keep documentation thorough.","Decent day for agreements. Not peak, but well-supported."],mixed:["Mixed signals for contracts. If you can delay signing by a day or two, consider it.","Re-read everything twice today. Errors are more likely than usual.","Negotiation is possible but friction is elevated. Build in extra time."],bad:["Avoid signing anything important today if possible. Miscommunication risk is significantly elevated.","Contract energy is poor — delays, disputes, hidden details more likely later.","Not the day for legal commitments. What you sign today has higher chance of needing revision."],avoid:["Do not sign contracts today. Planetary conditions are working directly against clarity.","Mercury is actively distorting communication right now. Postpone any signing."]},
  travel:{great:["Green light for travel and movement. Plans made today tend to unfold smoothly.","Strong energy for relocation decisions or big journeys. Move forward.","The sky supports physical movement — new places, new perspectives, good timing."],good:["Good travel energy — minor hiccups possible but nothing derailing.","Solid day to book or depart. Journeys started now carry good momentum.","Movement is supported. Whether a trip or permanent move, energy is behind you."],mixed:["Travel plans may hit friction or last-minute changes. Build in flexibility.","Check bookings twice — mixed energy around logistics and connections.","Not terrible for travel, not ideal. Go, but have a backup plan ready."],bad:["Delays and disruptions more likely today. Avoid non-essential travel.","Poor travel energy — missed connections, unexpected changes are elevated risks.","Rescheduling? Today may not be the right day to rebook either."],avoid:["Avoid travel decisions today if at all possible. Strong disruption indicators in the sky.","Do not make major relocation choices now. Timing will work against smooth execution."]},
  health:{great:["Strong vitality today. Excellent time to start a new health regime or make decisions about your body.","Physical energy is high and aligned — decisions made now about health tend to stick.","Good conditions for medical consultations and lifestyle changes. Act today."],good:["Decent health energy. Momentum supports new habits if you start them today.","Reasonable conditions for body-focused decisions. Trust your physical instincts.","Good energy for exercise, clean eating, or beginning something new."],mixed:["Energy levels may be inconsistent today. Don't overcommit physically.","Mixed health signals — rest is as valuable as action. Listen to your body.","Be gentle with yourself. Push and rest in roughly equal measure."],bad:["Physical energy is low or unpredictable. Avoid elective procedures if possible.","Not a strong day for health decisions. Recovery and rest are better uses of today.","Fatigue is elevated. Honour your limits rather than pushing past them."],avoid:["Strongly avoid major medical decisions or new health regimes today.","Do not schedule surgery now if you have any choice in the matter."]},
  creative:{great:["Creative energy is exceptional — make, build, write, perform. Don't overthink, just go.","A genuine creative channel is open today. The ideas will flow if you show up.","This is the kind of day creative work gets done and remembered."],good:["Good creative conditions. Not every idea will be gold, but output will be solid.","Show up and let the work happen today. The channel is open.","Creative momentum is available. Build on what you've already started."],mixed:["Creative energy present but inconsistent. Best for refining and editing, not originating.","Work while the energy is there, rest when it goes — it'll come back.","Not a breakout creative day, but not blocked. Steady work yields real results."],bad:["Creative blocks more likely today. Don't force the output.","Save the important creative work for another day. Better for admin and planning.","Ideas may feel flat. That's the energy, not a reflection of your ability."],avoid:["Avoid launching or publishing creative work today. Timing will undercut what you've built.","Strong creative blockage energy. Rest, gather ideas, return when the sky shifts."]},
  learning:{great:["Outstanding day for study and learning. Your mind is sharp and information is sticking.","Mercury is strongly placed — retention is high and concentration comes easily. Use it.","This is the kind of day you want for an exam or important study session."],good:["Good mental energy for learning. Steady focus will yield solid results.","Decent conditions for study — not the sharpest, but capable and clear.","Information flows reasonably well. A good session is there if you show up."],mixed:["Focus may be inconsistent. Work in shorter, sharper sessions rather than long blocks.","You'll have windows of clarity and moments of fog — work the windows.","Not a peak learning day. Revise rather than absorbing entirely new material."],bad:["Mental energy is scattered. Complex new material may not stick.","Poor conditions for exams — schedule these for another time if possible.","Cognitive fog is elevated. Keep tasks simple."],avoid:["Do not sit important exams today if you have any choice.","Avoid starting new educational commitments — retention is too low to build on."]},
  spiritual:{great:["Deep inner access today. Meditation, reflection, and healing work are all amplified.","The veil is thin today. Inner guidance is unusually clear — create space for silence.","Exceptional conditions for spiritual practice. Go deep."],good:["Good conditions for spiritual practice and inner reflection.","Decent reflective energy — journalling and meditation feel genuinely rewarding.","Something in you is ready to be heard today. Give it the space to surface."],mixed:["Spiritual energy present but distracted. Short practices work better than long ones.","Sit with the uncertainty rather than forcing resolution.","Not the deepest introspective day, but not closed. Show up with openness."],bad:["Inner noise is elevated today. Meditation may feel frustrating rather than clarifying.","Not a strong day for spiritual decisions.","Rest the inner work today. Forcing it creates more confusion than insight."],avoid:["Avoid major spiritual commitments today. Energy is too distorted.","Step back from deep inner work. Rest, recover, return when the signal is clearer."]},
  financial:{great:["Strong planetary conditions for financial decisions. Move with confidence.","Jupiter and the relevant financial planets are supportive — commit to the investment.","The stars back significant financial action today. Do the deal."],good:["Reasonable financial conditions. Not peak, but well-supported enough to proceed.","Decent energy for money decisions. Do your due diligence and move forward.","Financial momentum is available. Mid-sized commitments are well-positioned."],mixed:["Mixed financial signals. Good for research and comparison, less good for committing funds.","Proceed with financial caution — the full picture isn't entirely clear yet.","Some positive energy, but friction too. Smaller, reversible moves are safer."],bad:["Financial energy is poor today. Avoid major purchases or investment commitments.","Money decisions made today carry more downside risk. Delay if possible.","Don't commit to anything you can't walk back."],avoid:["Strongly avoid major financial commitments today. Timing is working against you.","Do not make significant investments or purchases now. Clarity is too low."]},
};

const getVerdict=(score:number,domId:string):string=>{
  const lines=VERDICTS[domId]||VERDICTS.career;
  const bucket=score>35?lines.great:score>12?lines.good:score>-12?lines.mixed:score>-35?lines.bad:lines.avoid;
  return bucket[Math.abs(Math.round(score/10))%bucket.length];
};

// ── PROBABILITY TICK COMPONENT (Iran methodology visual) ──────
const ProbTick=({probability,label,color}:{probability:number,label?:string,color?:string})=>{
  const c=color||(probability>=70?"#3dbd7d":probability>=50?"#f6ad3c":probability>=35?"#e5a0a0":"#e55050");
  const tick=probability>=65?"✓":probability>=45?"~":"✗";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
      {label&&<div style={{fontSize:10,color:"#6b6580",fontFamily:"system-ui",letterSpacing:0.5}}>{label}</div>}
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:52,height:5,background:"#1f1b3a",borderRadius:3,overflow:"hidden"}}>
          <div style={{width:`${probability}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.6s ease"}}/>
        </div>
        <div style={{fontWeight:800,fontSize:12,color:c,fontFamily:"system-ui",minWidth:34,textAlign:"right"}}>{probability}%</div>
        <div style={{fontSize:14,fontWeight:900,color:c}}>{tick}</div>
      </div>
    </div>
  );
};

// ── STYLES ────────────────────────────────────────────────────
const CL={bg:"#07060d",card:"#0e0d18",card2:"#16142a",bdr:"#1f1b3a",acc:"#f6ad3c",grn:"#3dbd7d",red:"#e55050",pur:"#9b7fe6",cyn:"#45d0c8",pnk:"#e879a0",txt:"#e8e4f0",dim:"#6b6580",mut:"#3a3555"};
const vC=(s:number)=>s>30?CL.grn:s>10?"#7ddba3":s>-10?CL.acc:s>-30?"#e5a0a0":CL.red;
const pC=(p:number)=>p>=70?CL.grn:p>=50?CL.acc:p>=35?"#e5a0a0":CL.red;
const fmtD=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtDL=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const SH=({icon,title,sub,color}:any)=>(<div style={{marginBottom:12}}><div style={{fontSize:10,letterSpacing:3,color:color||CL.acc,fontWeight:700,fontFamily:"system-ui"}}>{icon}</div><div style={{fontSize:16,fontWeight:800,color:CL.txt,fontFamily:"system-ui",marginTop:2}}>{title}</div>{sub&&<div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui"}}>{sub}</div>}</div>);
const HR=()=><div style={{height:1,background:CL.bdr,margin:"12px 0"}}/>;

const CITIES:Record<string,{lat:number,lon:number}> = {
  "Sydney":{lat:-33.87,lon:151.21},"Melbourne":{lat:-37.81,lon:144.96},"Brisbane":{lat:-27.47,lon:153.03},
  "Perth":{lat:-31.95,lon:115.86},"London":{lat:51.51,lon:-0.13},"New York":{lat:40.71,lon:-74.01},
  "Los Angeles":{lat:34.05,lon:-118.24},"Tokyo":{lat:35.68,lon:139.69},"Paris":{lat:48.85,lon:2.35},
  "Dubai":{lat:25.20,lon:55.27},"Singapore":{lat:1.35,lon:103.82},"Mumbai":{lat:19.08,lon:72.88},
  "Toronto":{lat:43.65,lon:-79.38},"Amsterdam":{lat:52.37,lon:4.90},"Berlin":{lat:52.52,lon:13.41},
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [dob,setDob]=useState("");
  const [birthTime,setBirthTime]=useState("");
  const [birthCity,setBirthCity]=useState("");
  const [targetDate,setTargetDate]=useState(new Date().toISOString().split("T")[0]);
  const [targetTime,setTargetTime]=useState(new Date().toTimeString().slice(0,5));
  const [tab,setTab]=useState("world");
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [tier,setTier]=useState(1);
  const [deepDiveId,setDeepDiveId]=useState<string|null>(null);
  const [teamMembers,setTeamMembers]=useState<any[]>([]);
  const [newName,setNewName]=useState(""); const [newDob,setNewDob]=useState("");
  const [teamData,setTeamData]=useState<any[]>([]);

  const [chatOpen,setChatOpen]=useState(false);
  const [chatMessages,setChatMessages]=useState<{role:"user"|"oracle",text:string,loading?:boolean}[]>([{role:"oracle",text:"Ask me anything about your reading — I'll give you a straight answer based on what the planets are actually doing today. 🔮"}]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);

  const sendChat=useCallback(async()=>{
    if(!chatInput.trim()||chatLoading)return;
    const userMsg=chatInput.trim();setChatInput("");
    const historyBeforeSend=chatMessages.filter((_,i)=>i>0); // capture before state update
    setChatMessages(m=>[...m,{role:"user",text:userMsg}]);
    setChatLoading(true);
    const ctx=data?`═══ ORACLE FULL READING CONTEXT (${targetDate}) ═══

LUNAR CONDITIONS:
- Moon Phase: ${data.mp?.name} — ${data.mp?.energy}
- Void of Course: ${data.voc?"YES — actions tend to fizzle, delay if possible":"No — lunar energy active"}
- Retrograde planets: ${data.retros?.map((r:any)=>r.name).join(", ")||"None"}

CURRENT PLANETARY POSITIONS (transits):
${data.transit?.map((p:any)=>`- ${p.planet?.sym||""} ${p.name}: ${p.degree?.toFixed(1)}° ${p.sign?.name}${p.retro?" ℞":""}`).join("\n")||"unavailable"}

${dob?`USER NATAL CHART (born ${dob}):
- Sun: ${data.sunSign?.name} — ${data.sunSign?.trait||""}
- Moon: ${data.moonSign?.name}
- Gene Key: ${data.birthGK||"unknown"}
- Natal positions: ${data.natal?.map((p:any)=>`${p.name} ${p.degree?.toFixed(1)}° ${p.sign?.name}`).join(", ")||""}
- Elemental balance: 🔥${data.elements?.fire} 🌍${data.elements?.earth} 💨${data.elements?.air} 💧${data.elements?.water}

PERSONAL DOMAIN PROBABILITIES (your birth chart vs today):
${data.personalDomains?.map((d:any)=>`- ${d.icon} ${d.name}: ${d.probability}% (score: ${d.score?.toFixed(0)}, confidence: ${d.confidence}/10)
  Top signals: ${d.signals?.slice(0,2).map((s:any)=>`${s.text} [${s.val>0?"+":""}${typeof s.val==="number"?s.val.toFixed(1):s.val}]`).join(" | ")||"none"}`).join("\n")||"No personal data"}
`:"NO BIRTH DATE — answering from world energy only.\n"}
WORLD ENERGY DOMAIN PROBABILITIES (collective, affects everyone):
${data.worldDomains?.map((d:any)=>`- ${d.icon} ${d.name}: ${d.probability}% | Top: ${d.signals?.slice(0,2).map((s:any)=>s.text).join(" | ")||""}`).join("\n")||""}

${teamData?.length>0?`TEAM MEMBERS ON FILE:
${teamData.map((m:any)=>`- ${m.name} (born ${m.dob}): Overall ${m.probability}% | ${m.domains?.slice(0,3).map((d:any)=>`${d.icon}${d.probability}%`).join(" ")}`).join("\n")}`:""}

Active aspects: ${data.allAspects?.slice(0,5).map((a:any)=>`${a.p1.name} ${a.asp.name} ${a.p2.name} (${a.exact}% exact)`).join(", ")||""}
Tier: ${tier} (${tier===1?"Basic":tier===2?"Plus":tier===3?"Pro":"Pro+"})
`:"No reading data loaded yet.";
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:600,
        system:`You are the Oracle — a direct astrological prediction tool using multi-system convergence (the same methodology that called the Iran oil strike to within days). You are NOT a friend — you are a precision instrument.

Rules:
- Give a DIRECT answer first: YES / NO / WAIT / DEPENDS
- Then explain WHY in 2-3 short bullet points using the actual planetary data
- Reference specific planets and signals from the context when relevant
- Be blunt and specific — no vague spiritual fluff
- If data is missing (no birth date), say so and answer from world energy only
- Keep responses under 200 words
- Speak as "the Oracle" in third person sparingly, mostly just state facts directly

${ctx}`,
        messages:historyBeforeSend.map(m=>({role:m.role==="oracle"?"assistant":"user",content:m.text})).concat([{role:"user",content:userMsg}])
      })});
      const json=await res.json();
      const reply=json.content?.[0]?.text||"Signal unclear — try rephrasing.";
      setChatMessages(m=>[...m,{role:"oracle",text:reply}]);
    }catch{
      setChatMessages(m=>[...m,{role:"oracle",text:"Connection lost. Check network and try again."}]);
    }
    setChatLoading(false);
  },[chatInput,chatLoading,chatMessages,data,dob,targetDate]);

  const compute=useCallback(()=>{
    setLoading(true);
    setTimeout(()=>{
      const tDate=new Date(targetDate+"T12:00:00");
      const transit=getPlanets(tDate,targetTime||undefined);
      const worldDomains=DOMAINS.map(d=>({...d,...scoreWorldDomain(d,transit,tDate)})).sort((a:any,b:any)=>b.score-a.score);
      const mp=getMoonPhase(transit),voc=isVOC(transit);
      const retros=transit.filter(p=>p.retro&&!["NNode","SNode"].includes(p.name));
      const stellia=getStelliums(transit);
      let personalDomains:any[]=[];
      let natal:PPos[]=[];
      let sunSign:typeof SIGNS[0]|null=null,moonSign:typeof SIGNS[0]|null=null;
      let elements:Record<string,number>={fire:0,earth:0,air:0,water:0};
      let solarArcs:PPos[]=[],progressions:PPos[]=[];
      let birthGK=0,transitGK=0;

      let midpoints:Midpoint[]=[],mutualReceptions:{a:string,b:string}[]=[],antiscia:{natal:string,transit:string,orb:number}[]=[],solarReturnBonus=0,houses:Record<string,number>={},ascLng=0,partOfFortune:number|null=null,hasTime=false,hasPlace=false;

      if(dob){
        const bDate=new Date(dob+"T12:00:00");
        natal=getPlanets(bDate,birthTime||undefined);
        const nowH=parseInt((targetTime||"12:00").split(":")[0])||12;
        const isDay=nowH>=6&&nowH<18;
        solarArcs=getSolarArcs(natal,bDate,tDate);
        progressions=tier>=3?getProgressions(bDate,tDate,birthTime||undefined):[];
        sunSign=natal.find(p=>p.name==="Sun")!.sign;
        moonSign=natal.find(p=>p.name==="Moon")!.sign;
        natal.forEach(p=>{if(p.sign)(elements as any)[p.sign.el]++;});
        const nSun=natal.find(p=>p.name==="Sun")!;
        const tSun=transit.find(p=>p.name==="Sun")!;
        birthGK=gkFromLng(nSun.lng);transitGK=gkFromLng(tSun.lng);
        if(tier>=2){
          midpoints=getMidpoints(natal,transit);
          mutualReceptions=getMutualReceptions(transit);
          antiscia=getAntiscia(natal,transit);
          solarReturnBonus=getSolarReturn(natal,transit);
        }
        if(tier>=3&&birthTime&&birthCity){
          const city=CITIES[birthCity];
          if(city){
            const{asc,mc}=getAscendant(bDate,birthTime,city.lat,city.lon);
            ascLng=asc;hasTime=true;hasPlace=true;
            natal.forEach(p=>{houses[p.name]=getHouseNum(p.lng,asc);});
            partOfFortune=getPartOfFortune(natal,asc,isDay);
          }
        }
        personalDomains=DOMAINS.map(d=>({...d,...scorePersonalDomain(d,natal,transit,tDate,bDate,tier,isDay,solarArcs,progressions,midpoints,mutualReceptions,antiscia,solarReturnBonus,houses,ascLng,partOfFortune)})).sort((a:any,b:any)=>b.score-a.score);
      }

      // 30-day forecast
      const forecast:any[]=[];
      for(let i=0;i<30;i++){
        const d=new Date(tDate);d.setDate(d.getDate()+i);
        const dt=getPlanets(d,targetTime||undefined);
        const wDs=DOMAINS.map(dm=>({...dm,...scoreWorldDomain(dm,dt,d)}));
        const wAvg=wDs.reduce((s:number,x:any)=>s+x.score,0)/wDs.length;
        let pDs:any[]=[],pAvg=0;
        if(dob){
          const bDate=new Date(dob+"T12:00:00");const sa=getSolarArcs(natal,bDate,d);
          const fMid=tier>=2?getMidpoints(natal,dt):[];const fMR=tier>=2?getMutualReceptions(dt):[];
          const fAnti=tier>=2?getAntiscia(natal,dt):[];const fSR=tier>=2?getSolarReturn(natal,dt):0;
          const isD=true;
          pDs=DOMAINS.map(dm=>({...dm,...scorePersonalDomain(dm,natal,dt,d,bDate,tier,isD,sa,[],fMid,fMR,fAnti,fSR,houses,ascLng,partOfFortune)}));
          pAvg=pDs.reduce((s:number,x:any)=>s+x.score,0)/pDs.length;
        }
        forecast.push({date:d,worldOverall:wAvg,personalOverall:pAvg,overall:dob?pAvg:wAvg,worldAvgProb:Math.round(wDs.reduce((s:number,x:any)=>s+x.probability,0)/wDs.length),personalAvgProb:pDs.length?Math.round(pDs.reduce((s:number,x:any)=>s+x.probability,0)/pDs.length):0,moonPhase:getMoonPhase(dt),worldDomains:wDs,personalDomains:pDs});
      }
      const bestDays=DOMAINS.map((dom,di)=>{
        const sorted=[...forecast].sort((a:any,b:any)=>(b.personalDomains[di]?.score||b.worldDomains[di].score)-(a.personalDomains[di]?.score||a.worldDomains[di].score));
        return{domain:dom,top3:sorted.slice(0,3).map(f=>({date:f.date,score:f.personalDomains[di]?.score||f.worldDomains[di].score,prob:f.personalDomains[di]?.probability||f.worldDomains[di].probability})),bottom3:sorted.slice(-3).reverse().map(f=>({date:f.date,score:f.personalDomains[di]?.score||f.worldDomains[di].score}))};
      });
      setData({transit,natal,worldDomains,personalDomains,mp,voc,retros,stellia,sunSign,moonSign,elements,birthGK,transitGK,forecast,bestDays,allAspects:dob?getAspects(transit,natal,tier>=2):[],midpoints,mutualReceptions,antiscia,solarReturnBonus,houses,ascLng,partOfFortune,hasTime,hasPlace});
      setLoading(false);
    },600);
  },[dob,targetDate,targetTime,birthTime,birthCity,tier]);

  useEffect(()=>{compute();},[targetDate,targetTime,dob,birthTime,tier]);

  const computeTeam=(m:any)=>{
    const bDate=new Date(m.dob+"T12:00:00"),tDate=new Date(targetDate+"T12:00:00");
    const nt=getPlanets(bDate),tr=getPlanets(tDate,targetTime);
    const sa=getSolarArcs(nt,bDate,tDate);const voc=isVOC(tr);const retros=tr.filter(p=>p.retro);
    const ds=DOMAINS.map(d=>({...d,...scorePersonalDomain(d,nt,tr,tDate,bDate,tier,true,sa,[])}));
    const overall=ds.reduce((s:number,d:any)=>s+d.score,0)/ds.length;
    const topD=ds.reduce((b:any,x:any)=>x.score>b.score?x:b,ds[0]);const botD=ds.reduce((b:any,x:any)=>x.score<b.score?x:b,ds[0]);
    const prob=Math.max(20,Math.min(90,Math.round(50+overall*0.25)));
    return{...m,overall,probability:prob,topDomain:topD,bottomDomain:botD};
  };
  const addTeam=()=>{if(!newName||!newDob)return;const m={name:newName,dob:newDob,id:Date.now()};const u=[...teamMembers,m];setTeamMembers(u);setNewName("");setNewDob("");setTeamData(u.map(computeTeam));};
  const removeTeam=(id:number)=>{const u=teamMembers.filter((m:any)=>m.id!==id);setTeamMembers(u);setTeamData(u.map(computeTeam));};

  const tierInfo=TIERS.find(t=>t.id===tier)||TIERS[0];
  const SC:any={card:{background:CL.card,border:`1px solid ${CL.bdr}`,borderRadius:14,padding:18,marginBottom:12}};
  const TB=({id,label,icon}:{id:string,label:string,icon:string})=>(<button onClick={()=>setTab(id)} style={{background:tab===id?CL.acc:"transparent",color:tab===id?"#000":CL.dim,border:`1px solid ${tab===id?CL.acc:CL.bdr}`,borderRadius:10,padding:"8px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"system-ui"}}>{icon} {label}</button>);

  const activeDomains=deepDiveId?null:null;
  const deepDomain=deepDiveId?DOMAINS.find(d=>d.id===deepDiveId):null;
  const deepWorldDom=deepDiveId&&data?data.worldDomains.find((d:any)=>d.id===deepDiveId):null;
  const deepPersonalDom=deepDiveId&&data?data.personalDomains.find((d:any)=>d.id===deepDiveId):null;

  return(
    <div style={{background:CL.bg,color:CL.txt,minHeight:"100vh",fontFamily:"'Georgia','Palatino',serif",padding:"10px 14px",maxWidth:720,margin:"0 auto"}}>
      <style>{`@keyframes glow{0%,100%{text-shadow:0 0 15px #f6ad3c44}50%{text-shadow:0 0 30px #f6ad3c88,0 0 60px #9b7fe644}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}input,button{font-family:inherit}input[type="date"]::-webkit-calendar-picker-indicator,input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(0.7)}*{box-sizing:border-box}::-webkit-scrollbar{width:4px;background:#07060d}::-webkit-scrollbar-thumb{background:#1f1b3a;border-radius:2px}`}</style>

      {/* ── HEADER ── */}
      <div style={{textAlign:"center",padding:"18px 0 10px"}}>
        <div style={{fontSize:10,letterSpacing:6,color:CL.pur,fontWeight:700,fontFamily:"system-ui"}}>ORACLE v10</div>
        <h1 style={{fontSize:24,fontWeight:400,margin:"4px 0",fontStyle:"italic",background:`linear-gradient(135deg,${CL.acc},${CL.pnk},${CL.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glow 5s ease infinite"}}>World + Personal Oracle</h1>
        <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",marginBottom:8}}>World Energy · Personal Timing · % Probability · Domain Deep-Dives</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",letterSpacing:1}}>PLAN:</span>
          {TIERS.map(t=>(<button key={t.id} onClick={()=>setTier(t.id)} style={{background:tier===t.id?`${t.color}25`:"transparent",color:tier===t.id?t.color:CL.mut,border:`1px solid ${tier===t.id?t.color:CL.bdr}`,borderRadius:20,padding:"3px 12px",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"system-ui"}}>{t.name} {t.price}</button>))}
        </div>
        <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",marginTop:3}}>{tierInfo.tagline}</div>
      </div>

      {/* ── INPUT PANEL ── */}
      <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#120e24)`,borderColor:CL.pur+"50"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:1,minWidth:130}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>ANALYSE DATE</label>
            <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:14}}/>
          </div>
          <div style={{flex:1,minWidth:130}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>DATE OF BIRTH <span style={{color:CL.pur}}>(for personal)</span></label>
            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} placeholder="Optional" style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:14}}/>
          </div>
          {tier>=3&&<div style={{flex:1,minWidth:100}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>BIRTH TIME <span style={{color:CL.acc}}>PRO</span></label>
            <input type="time" value={birthTime} onChange={e=>setBirthTime(e.target.value)} style={{width:"100%",padding:"10px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:14}}/>
          </div>}
          {tier>=3&&<div style={{flex:1,minWidth:110}}>
            <label style={{fontSize:9,color:CL.dim,display:"block",marginBottom:3,fontFamily:"system-ui",letterSpacing:1}}>BIRTH CITY <span style={{color:CL.acc}}>PRO</span></label>
            <select value={birthCity} onChange={e=>setBirthCity(e.target.value)} style={{width:"100%",padding:"10px 10px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:birthCity?CL.txt:CL.dim,fontSize:13}}>
              <option value="">Select...</option>
              {Object.keys(CITIES).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>}
          <button onClick={compute} disabled={loading} style={{background:`linear-gradient(135deg,${CL.pur},${CL.acc})`,color:"#000",border:"none",borderRadius:10,padding:"11px 20px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"system-ui",letterSpacing:1,opacity:loading?0.6:1}}>
            {loading?"✨ Reading...":"🔮 Oracle"}
          </button>
        </div>
      </div>

      {/* ── DEEP DIVE PAGE ── */}
      {deepDiveId&&deepDomain&&data&&(
        <div>
          <button onClick={()=>setDeepDiveId(null)} style={{background:"transparent",border:`1px solid ${CL.bdr}`,borderRadius:8,padding:"7px 16px",fontSize:11,color:CL.dim,cursor:"pointer",fontFamily:"system-ui",marginBottom:10}}>← Back</button>
          <div style={{...SC.card,borderColor:vC(deepPersonalDom?.score||deepWorldDom?.score||0)+"50"}}>
            <SH icon={deepDomain.icon} title={deepDomain.name} sub={deepDomain.sub} color={vC(deepPersonalDom?.score||deepWorldDom?.score||0)}/>

            {/* World vs Personal side by side */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={{background:CL.card2,borderRadius:10,padding:12,borderTop:`2px solid ${CL.cyn}`}}>
                <div style={{fontSize:8,letterSpacing:2,color:CL.cyn,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>🌍 WORLD ENERGY</div>
                {deepWorldDom&&<ProbTick probability={deepWorldDom.probability} label="Probability favourable"/>}
                <div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui",marginTop:8}}>{deepWorldDom?.score>10?"Globally elevated conditions":"Globally challenged conditions"}</div>
              </div>
              {deepPersonalDom&&<div style={{background:CL.card2,borderRadius:10,padding:12,borderTop:`2px solid ${CL.pur}`}}>
                <div style={{fontSize:8,letterSpacing:2,color:CL.pur,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>✨ YOUR PERSONAL</div>
                <ProbTick probability={deepPersonalDom.probability} label="Probability favourable"/>
                <div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui",marginTop:8}}>{deepPersonalDom.score>10?"Personal conditions aligned":"Personal conditions challenging"}</div>
              </div>}
            </div>

            {/* Verdict */}
            {deepPersonalDom&&<div style={{background:CL.card2,borderRadius:10,padding:14,marginBottom:12,borderLeft:`4px solid ${vC(deepPersonalDom.score)}`}}>
              <div style={{fontSize:8,letterSpacing:2,color:CL.acc,fontWeight:700,fontFamily:"system-ui",marginBottom:6}}>ORACLE VERDICT</div>
              <div style={{fontSize:13,color:CL.txt,lineHeight:1.85,fontFamily:"system-ui"}}>{getVerdict(deepPersonalDom.score,deepDomain.id)}</div>
            </div>}

            {/* What to do / avoid — dynamic based on actual signals, not static list */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{background:`${CL.grn}08`,borderRadius:10,padding:12,border:`1px solid ${CL.grn}20`}}>
                <div style={{fontSize:10,fontWeight:700,color:CL.grn,fontFamily:"system-ui",marginBottom:8}}>✅ TAKE ACTION TODAY</div>
                {(deepPersonalDom?.score||deepWorldDom?.score||0)>5?(
                  deepDomain.deepDive.actions.slice(0,(deepPersonalDom?.score||0)>30?7:4).map((a,i)=>(<div key={i} style={{fontSize:11,color:CL.txt,padding:"4px 0",borderBottom:`1px solid ${CL.bdr}30`,fontFamily:"system-ui",display:"flex",gap:6}}><span style={{color:CL.grn,fontSize:10,marginTop:2}}>→</span><span>{a}</span></div>))
                ):(
                  <div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui",fontStyle:"italic",lineHeight:1.6}}>Conditions not ideal for action in this domain today. Focus on planning and preparation instead — the window will shift.</div>
                )}
              </div>
              <div style={{background:`${CL.red}08`,borderRadius:10,padding:12,border:`1px solid ${CL.red}20`}}>
                <div style={{fontSize:10,fontWeight:700,color:CL.red,fontFamily:"system-ui",marginBottom:8}}>⚠️ WATCH OUT FOR</div>
                {/* Dynamic: pull actual warning signals + static avoid if score is bad */}
                {[
                  ...(deepPersonalDom?.signals||deepWorldDom?.signals||[]).filter((s:any)=>["red","warning","caution"].includes(s.type)).slice(0,2).map((s:any,i:number)=>(
                    <div key={"sig"+i} style={{fontSize:11,color:CL.txt,padding:"4px 0",borderBottom:`1px solid ${CL.bdr}30`,fontFamily:"system-ui",display:"flex",gap:6}}><span style={{color:CL.red,fontSize:10,marginTop:2}}>×</span><span><b style={{color:CL.red}}>{s.text}</b> — {s.detail}</span></div>
                  )),
                  ...(deepPersonalDom?.score||deepWorldDom?.score||0)<5?deepDomain.deepDive.avoid.slice(0,2).map((a,i)=>(<div key={"av"+i} style={{fontSize:11,color:CL.txt,padding:"4px 0",borderBottom:`1px solid ${CL.bdr}30`,fontFamily:"system-ui",display:"flex",gap:6}}><span style={{color:CL.acc,fontSize:10,marginTop:2}}>×</span><span>{a}</span></div>)):[],
                  ...(deepPersonalDom?.signals||deepWorldDom?.signals||[]).filter((s:any)=>["red","warning","caution"].includes(s.type)).length===0&&(deepPersonalDom?.score||deepWorldDom?.score||0)>10?[<div key="clear" style={{fontSize:11,color:CL.grn,fontFamily:"system-ui",fontStyle:"italic"}}>No major warnings active today in this domain. Conditions are clean.</div>]:[],
                ]}</div>
            </div>

            {/* World note — the Iran connection */}
            <div style={{background:`${CL.cyn}08`,borderRadius:10,padding:12,marginBottom:14,border:`1px solid ${CL.cyn}20`}}>
              <div style={{fontSize:10,fontWeight:700,color:CL.cyn,fontFamily:"system-ui",marginBottom:6}}>🌐 WORLD ENERGY NOTE</div>
              <div style={{fontSize:12,color:CL.txt,lineHeight:1.75,fontFamily:"system-ui"}}>{deepDomain.deepDive.worldNote}</div>
            </div>

            {/* Timing guide */}
            <div style={{background:`${CL.acc}08`,borderRadius:10,padding:12,border:`1px solid ${CL.acc}20`}}>
              <div style={{fontSize:10,fontWeight:700,color:CL.acc,fontFamily:"system-ui",marginBottom:6}}>⏰ TIMING GUIDE</div>
              <div style={{fontSize:12,color:CL.txt,lineHeight:1.75,fontFamily:"system-ui"}}>{deepDomain.deepDive.timing}</div>
            </div>

            {/* Signal breakdown — personal first (more specific), then world-only signals */}
            {(deepPersonalDom||deepWorldDom)&&(<>
              <HR/>
              {deepPersonalDom&&tier>=2&&(<>
                <div style={{fontSize:10,letterSpacing:2,color:CL.pur,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>✨ YOUR PERSONAL SIGNALS ({deepPersonalDom.totalSignals})</div>
                {deepPersonalDom.signals.slice(0,8).map((s:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"7px 0",borderBottom:`1px solid ${CL.bdr}20`}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"system-ui",fontSize:12,fontWeight:700,color:s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc}}>{s.text}</div>
                    <div style={{fontFamily:"system-ui",fontSize:10,color:CL.dim,marginTop:2}}>{s.detail} · <span style={{color:CL.mut}}>{s.system}</span></div>
                  </div>
                  <div style={{fontWeight:800,fontSize:12,color:s.val>0?CL.grn:CL.red,fontFamily:"system-ui",flexShrink:0}}>{s.val>0?"+":""}{typeof s.val==="number"?s.val.toFixed(1):s.val}</div>
                </div>))}
              </>)}
              {/* World signals: only show if no personal DOB, OR show just top 3 non-duplicate world-only signals */}
              {deepWorldDom&&(<>
                <div style={{fontSize:10,letterSpacing:2,color:CL.cyn,fontWeight:700,fontFamily:"system-ui",marginBottom:8,marginTop:16}}>🌍 WORLD SIGNALS {deepPersonalDom?"(collective backdrop)":""}</div>
                {(deepPersonalDom?deepWorldDom.signals.slice(0,3):deepWorldDom.signals).map((s:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"7px 0",borderBottom:`1px solid ${CL.bdr}20`}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"system-ui",fontSize:12,fontWeight:700,color:s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc}}>{s.text}</div>
                    <div style={{fontFamily:"system-ui",fontSize:10,color:CL.dim,marginTop:2}}>{s.detail}</div>
                  </div>
                  <div style={{fontWeight:800,fontSize:12,color:s.val>0?CL.grn:CL.red,fontFamily:"system-ui",flexShrink:0}}>{s.val>0?"+":""}{typeof s.val==="number"?s.val.toFixed(1):s.val}</div>
                </div>))}
              </>)}
            </>)}
          </div>
        </div>
      )}

      {/* ── MAIN VIEW (when no deep dive) ── */}
      {!deepDiveId&&data&&(<>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
          <TB id="world" label="World Energy" icon="🌍"/>
          {dob&&<TB id="personal" label="My Reading" icon="✨"/>}
          <TB id="calendar" label="30-Day" icon="📅"/>
          <TB id="bestdays" label="Best Days" icon="⭐"/>
          {dob&&<TB id="chart" label="Chart" icon="🌌"/>}
          {tier===4&&<TB id="team" label="Team" icon="👥"/>}
        </div>

        {/* ══ WORLD ENERGY TAB ══ */}
        {tab==="world"&&(<>
          <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#0a1020)`,borderColor:CL.cyn+"30"}}>
            <SH icon="🌍" title="WORLD ENERGY TODAY" sub={`${fmtDL(new Date(targetDate))} — What the collective is experiencing`} color={CL.cyn}/>
            <div style={{fontSize:12,color:CL.dim,fontFamily:"system-ui",lineHeight:1.7,marginBottom:14,fontStyle:"italic"}}>
              This is the global cosmic weather — independent of your birth date. Like the Iran oil prediction, it uses multi-system convergence: aspect patterns between major planets, their dignities, retrograde status, and moon phase create a % probability for each life domain across the entire world population today.
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:4}}>
              <div style={{background:CL.card2,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.txt}}>
                {data.mp.icon} <b>{data.mp.name}</b> — <span style={{color:CL.dim,fontStyle:"italic"}}>{data.mp.energy}</span>
              </div>
              {data.voc&&<div style={{background:`${CL.red}15`,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.red}}>🚫 Void of Course Moon</div>}
              {data.retros.map((r:any)=>(<div key={r.name} style={{background:`${CL.acc}15`,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.acc}}>{r.planet?.sym}{r.name} ℞ in {r.sign.name}</div>))}
              {data.stellia?.map((s:any)=>(<div key={s.sign} style={{background:`${CL.pur}15`,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.pur}}>⭐ Stellium: {s.sign}</div>))}
            </div>
          </div>

          {data.worldDomains.map((d:any)=>(
            <div key={d.id} style={{background:CL.card,border:`1px solid ${CL.bdr}`,borderRadius:14,padding:16,marginBottom:8,borderLeft:`4px solid ${pC(d.probability)}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{d.icon} {d.name}</div>
                  <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui",marginTop:1}}>{d.sub}</div>
                  <div style={{fontSize:11,color:CL.txt,fontFamily:"system-ui",lineHeight:1.7,marginTop:8}}>{getVerdict(d.score,d.id).split(".")[0]}.</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
                  <ProbTick probability={d.probability}/>
                  <button onClick={()=>setDeepDiveId(d.id)} style={{background:`linear-gradient(135deg,${CL.pur}cc,${CL.acc}cc)`,border:"none",borderRadius:10,padding:"8px 14px",fontSize:11,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"system-ui",letterSpacing:0.5,whiteSpace:"nowrap"}}>🔍 Deep Dive</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",fontFamily:"system-ui",fontSize:10,color:CL.dim}}>
                <span>Convergence: <b style={{color:d.convergence>65?CL.grn:d.convergence>50?CL.acc:CL.red}}>{d.convergence}%</b></span>
                <span>Signals: <b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b></span>
              </div>
            </div>
          ))}
        </>)}

        {/* ══ PERSONAL TAB ══ */}
        {tab==="personal"&&dob&&(<>
          {/* Snapshot */}
          <div style={{...SC.card,background:`linear-gradient(160deg,${CL.card},#0d0a1e)`,borderColor:CL.pur+"30"}}>
            <SH icon="✨" title="YOUR PERSONAL READING" sub={`${fmtDL(new Date(targetDate))} · Personalised to your birth chart`} color={CL.pur}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {data.sunSign&&<div style={{background:CL.card2,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.txt}}>{data.sunSign.sym} Sun in <b>{data.sunSign.name}</b></div>}
              {data.moonSign&&<div style={{background:CL.card2,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.txt}}>{data.moonSign.sym} Moon in <b>{data.moonSign.name}</b></div>}
              {data.birthGK&&<div style={{background:`${CL.pur}15`,borderRadius:8,padding:"5px 12px",fontSize:11,fontFamily:"system-ui",color:CL.pur}}>🔑 Gene Key {data.birthGK}</div>}
            </div>

            {/* World vs Personal divergence note */}
            {data.personalDomains.length>0&&data.worldDomains.length>0&&(()=>{
              const worldTop=data.worldDomains[0];const personalTop=data.personalDomains[0];
              const sameTop=worldTop.id===personalTop.id;
              return(<div style={{background:`${CL.acc}10`,borderRadius:10,padding:12,border:`1px solid ${CL.acc}20`,marginBottom:4}}>
                <div style={{fontSize:10,fontWeight:700,color:CL.acc,fontFamily:"system-ui",marginBottom:4}}>🌍 WORLD vs ✨ YOU</div>
                <div style={{fontSize:12,color:CL.txt,fontFamily:"system-ui",lineHeight:1.7}}>
                  {sameTop?`World energy and your personal chart are aligned — both pointing to ${personalTop.icon} ${personalTop.name} as today's strongest domain. Rare convergence.`:`World energy favours ${worldTop.icon} ${worldTop.name} collectively, but your personal chart shows ${personalTop.icon} ${personalTop.name} as your strongest today. Your unique natal pattern overrides the global weather.`}
                </div>
              </div>);
            })()}
          </div>

          {/* Personal domain breakdown */}
          {data.personalDomains.map((d:any)=>(
            <div key={d.id} style={{background:CL.card,border:`1px solid ${CL.bdr}`,borderRadius:14,padding:16,marginBottom:8,borderLeft:`4px solid ${pC(d.probability)}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{d.icon} {d.name}</div>
                  <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui",marginTop:1}}>{d.sub}</div>
                  <div style={{fontSize:12,color:CL.txt,fontFamily:"system-ui",lineHeight:1.8,marginTop:8}}>{getVerdict(d.score,d.id)}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
                  <ProbTick probability={d.probability}/>
                  <button onClick={()=>setDeepDiveId(d.id)} style={{background:`linear-gradient(135deg,${CL.pur}cc,${CL.acc}cc)`,border:"none",borderRadius:10,padding:"8px 14px",fontSize:11,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"system-ui",whiteSpace:"nowrap"}}>🔍 Deep Dive</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",fontFamily:"system-ui",fontSize:10,color:CL.dim}}>
                <span>Convergence: <b style={{color:d.convergence>65?CL.grn:d.convergence>50?CL.acc:CL.red}}>{d.convergence}%</b></span>
                <span>Confidence: <b style={{color:CL.acc}}>{d.confidence}/10</b></span>
                <span>Signals: <b style={{color:CL.grn}}>▲{d.greenCount}</b>/<b style={{color:CL.red}}>▼{d.redCount}</b></span>
              </div>
              {tier>=2&&<button onClick={()=>setExpanded(expanded===d.id?null:d.id)} style={{marginTop:8,background:"transparent",border:`1px solid ${CL.bdr}30`,borderRadius:6,padding:"4px 10px",fontSize:9,color:CL.dim,cursor:"pointer",fontFamily:"system-ui"}}>{expanded===d.id?"▲ Hide signals":"▼ Show signals"}</button>}
              {expanded===d.id&&tier>=2&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${CL.bdr}`}}>
                  {d.signals.map((s:any,j:number)=>(<div key={j} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"6px 0",borderBottom:`1px solid ${CL.bdr}20`}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"system-ui",fontSize:12,fontWeight:700,color:s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc}}>{s.text}</div>
                      <div style={{fontFamily:"system-ui",fontSize:10,color:CL.dim,marginTop:2}}>{s.detail} · <span style={{color:CL.mut}}>{s.system}</span></div>
                    </div>
                    <div style={{fontWeight:800,fontSize:12,color:s.val>0?CL.grn:CL.red,fontFamily:"system-ui",flexShrink:0}}>{s.val>0?"+":""}{typeof s.val==="number"?s.val.toFixed(1):s.val}</div>
                  </div>))}
                </div>
              )}
            </div>
          ))}
        </>)}

        {/* ══ CALENDAR TAB ══ */}
        {tab==="calendar"&&(
          <div style={SC.card}>
            <SH icon="📅" title="30-DAY COSMIC MAP" sub={dob?"Your personal energy across the month":"World energy — universal for all, no birth date needed"}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:12}}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{d}</div>)}
              {Array.from({length:data.forecast[0].date.getDay()}).map((_,i)=><div key={"e"+i}/>)}
              {data.forecast.map((day:any,i:number)=>{const prob=dob?(day.personalAvgProb||50):(day.worldAvgProb||50);const c=pC(prob);return(<div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab(dob?"personal":"world");}} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",background:c+"12",border:i===0?`2px solid ${CL.acc}`:`1px solid ${c}20`}}><div style={{fontSize:11,fontWeight:700,fontFamily:"system-ui"}}>{day.date.getDate()}</div><div style={{fontSize:7,fontWeight:700,color:c,fontFamily:"system-ui"}}>{prob}%</div><div style={{fontSize:7}}>{day.moonPhase.icon}</div></div>);})}
            </div>
            {data.forecast.slice(0,14).map((day:any,i:number)=>{const score=dob?day.personalOverall:day.worldOverall;const prob=dob?(day.personalAvgProb||50):(day.worldAvgProb||50);return(<div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab(dob?"personal":"world");}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:i%2?"transparent":CL.card2,borderRadius:6,cursor:"pointer",marginBottom:2,fontFamily:"system-ui",fontSize:11}}>
              <div style={{minWidth:85,fontWeight:i===0?700:400,color:i===0?CL.acc:CL.txt}}>{fmtD(day.date)}{i===0?" ★":""}</div>
              <div style={{flex:1,height:5,background:CL.bdr,borderRadius:3,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",left:"50%",width:1,height:"100%",background:CL.mut}}/><div style={{position:"absolute",left:score>0?"50%":`${50+score/2}%`,width:`${Math.abs(score/2)}%`,height:"100%",background:pC(prob),borderRadius:3}}/></div>
              <span style={{fontSize:9}}>{day.moonPhase.icon}</span>
              <ProbTick probability={prob}/>
            </div>);})}
          </div>
        )}

        {/* ══ BEST DAYS TAB ══ */}
        {tab==="bestdays"&&(
          <div style={SC.card}>
            <SH icon="⭐" title="OPTIMAL TIMING" sub="Best & worst windows — next 30 days per domain"/>
            {data.bestDays.map((bd:any)=>(
              <div key={bd.domain.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui"}}>{bd.domain.icon} {bd.domain.name}</div>
                  <button onClick={()=>setDeepDiveId(bd.domain.id)} style={{background:"transparent",border:`1px solid ${CL.bdr}`,borderRadius:8,padding:"3px 8px",fontSize:9,color:CL.dim,cursor:"pointer",fontFamily:"system-ui"}}>Guide →</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:CL.grn,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🟢 BEST WINDOWS</div>
                    {bd.top3.map((d:any,i:number)=>(<div key={i} onClick={()=>{setTargetDate(d.date.toISOString().split("T")[0]);setTab(dob?"personal":"world");}} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.grn+"0d",borderRadius:6,marginBottom:3,cursor:"pointer",fontFamily:"system-ui",fontSize:11}}><span>{fmtD(d.date)}</span><span style={{fontWeight:800,color:CL.grn}}>{d.prob}% ✓</span></div>))}
                  </div>
                  <div>
                    <div style={{fontSize:10,color:CL.red,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🔴 AVOID</div>
                    {bd.bottom3.map((d:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:CL.red+"0d",borderRadius:6,marginBottom:3,fontFamily:"system-ui",fontSize:11}}><span>{fmtD(d.date)}</span><span style={{fontWeight:800,color:CL.red}}>Low %</span></div>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ CHART TAB ══ */}
        {tab==="chart"&&dob&&(
          <div style={SC.card}>
            <SH icon="🌌" title="NATAL CHART + CURRENT TRANSITS"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {["Natal","Transit"].map(type=>(<div key={type}>
                <div style={{fontSize:10,color:type==="Natal"?CL.acc:CL.cyn,letterSpacing:2,fontWeight:700,marginBottom:4,fontFamily:"system-ui"}}>{type.toUpperCase()}</div>
                {(type==="Natal"?data.natal:data.transit).filter((p:any)=>!["NNode","SNode"].includes(p.name)).map((p:any)=>(<div key={p.name} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",fontSize:11,background:CL.card2,borderRadius:5,marginBottom:2,fontFamily:"system-ui",borderLeft:p.dignity==="domicile"||p.dignity==="exaltation"?`2px solid ${CL.grn}`:p.dignity==="detriment"||p.dignity==="fall"?`2px solid ${CL.red}`:"none"}}><span style={{color:p.planet?.c}}>{p.planet?.sym}{p.name}{p.retro?" ℞":""}</span><span style={{color:p.sign.c,fontSize:10}}>{p.sign.sym}{p.degree.toFixed(1)}° {p.dignity!=="peregrine"?<span style={{color:p.dignity==="domicile"||p.dignity==="exaltation"?CL.grn:CL.red,fontWeight:700}}> {p.dignity==="domicile"?"⌂":p.dignity==="exaltation"?"✦":p.dignity==="detriment"?"⚠":"↓"}</span>:""}</span></div>))}
              </div>))}
            </div>
            <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",marginBottom:10}}>⌂ domicile · ✦ exaltation · ⚠ detriment · ↓ fall</div>
            {data.birthGK&&data.transitGK&&<div style={{background:`${CL.pur}10`,borderRadius:10,padding:12,marginBottom:12,border:`1px solid ${CL.pur}20`}}>
              <div style={{fontSize:10,fontWeight:700,color:CL.pur,fontFamily:"system-ui",marginBottom:6}}>🔑 GENE KEYS TODAY</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontFamily:"system-ui",fontSize:11}}>
                <div><div style={{color:CL.dim,fontSize:9,marginBottom:3}}>YOUR BIRTH GK</div><b style={{color:CL.pur}}>#{data.birthGK}</b> — {GK_DATA[data.birthGK]?.gift}<div style={{fontSize:9,color:CL.dim}}>Shadow: {GK_DATA[data.birthGK]?.shadow}</div></div>
                <div><div style={{color:CL.dim,fontSize:9,marginBottom:3}}>TODAY'S TRANSIT GK</div><b style={{color:CL.cyn}}>#{data.transitGK}</b> — {GK_DATA[data.transitGK]?.gift}<div style={{fontSize:9,color:CL.dim}}>Shadow: {GK_DATA[data.transitGK]?.shadow}</div></div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:CL.txt}}>{gkHarmonic(data.birthGK,data.transitGK)==="harmonic"?"🟢 Harmonic resonance — your gifts align with today's universal theme":gkHarmonic(data.birthGK,data.transitGK)==="tension"?"🔴 Tension — your gene key shadow is activated today. Transform it.":"⚪ Neutral — steady, no amplification"}</div>
            </div>}
            <HR/>
            <div style={{fontSize:10,letterSpacing:2,color:CL.pnk,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>TOP TRANSIT ASPECTS</div>
            {data.allAspects.slice(0,10).map((a:any,i:number)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:i%2?"transparent":CL.card2,borderRadius:5,fontSize:11,fontFamily:"system-ui"}}>
              <span style={{fontSize:14,color:a.asp.c}}>{a.asp.sym}</span>
              <span style={{flex:1}}><span style={{color:a.p1.planet?.c}}>{a.p1.name}</span><span style={{color:CL.dim}}> {a.asp.name} </span><span style={{color:a.p2.planet?.c}}>{a.p2.name}</span><span style={{fontSize:9,color:CL.dim}}> {a.applying?" ↑applying":"↓sep"}</span></span>
              <span style={{fontWeight:800,color:a.asp.c}}>{a.exact}%</span>
            </div>))}
          </div>
        )}

        {/* ══ TEAM TAB ══ */}
        {tab==="team"&&tier===4&&(
          <div style={SC.card}>
            <SH icon="👥" title="TEAM ORACLE" sub="Combined reading for your group" color={CL.pnk}/>
            {teamMembers.length<5&&<div style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui",marginBottom:8}}>Add member ({teamMembers.length}/5)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input type="text" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" style={{flex:1,minWidth:100,padding:"8px 12px",background:CL.bg,border:`1px solid ${CL.bdr}`,borderRadius:8,color:CL.txt,fontSize:13}}/>
                <input type="date" value={newDob} onChange={e=>setNewDob(e.target.value)} style={{flex:1,minWidth:130,padding:"8px 12px",background:CL.bg,border:`1px solid ${CL.bdr}`,borderRadius:8,color:CL.txt,fontSize:13}}/>
                <button onClick={addTeam} disabled={!newName||!newDob} style={{background:`linear-gradient(135deg,${CL.pnk},${CL.pur})`,color:"#000",border:"none",borderRadius:8,padding:"8px 18px",fontSize:11,fontWeight:800,cursor:"pointer",opacity:!newName||!newDob?0.4:1}}>+ Add</button>
              </div>
            </div>}
            {teamData.map((m:any)=>(<div key={m.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8,borderLeft:`4px solid ${pC(m.probability)}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui"}}>{m.name}</div>
                  <div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui",marginTop:2}}>Best: <b style={{color:CL.grn}}>{m.topDomain.icon}{m.topDomain.name}</b> · Challenged: <b style={{color:CL.red}}>{m.bottomDomain.icon}{m.bottomDomain.name}</b></div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <ProbTick probability={m.probability}/>
                  <button onClick={()=>removeTeam(m.id)} style={{background:"transparent",border:"none",color:CL.dim,cursor:"pointer",fontSize:14}}>✕</button>
                </div>
              </div>
              <div style={{fontSize:12,color:CL.txt,fontFamily:"system-ui",lineHeight:1.7,marginTop:10,paddingTop:8,borderTop:`1px solid ${CL.bdr}30`}}>
                {m.overall>25?`${m.name} is running strong today — elevated energy and strong planetary support. Put them front and centre.`:m.overall>5?`${m.name} is in solid form — dependable, collaborative, well-placed for mid-level action.`:m.overall>-15?`${m.name} has some headwinds. Support role over leadership today.`:`${m.name}'s energy is significantly challenged. Protect from high-pressure situations.`}
              </div>
            </div>))}
            {teamData.length>1&&(<div style={{...SC.card,marginTop:4,borderColor:CL.pnk+"40"}}><SH icon="🔗" title="TEAM RANKING" color={CL.pnk}/>{[...teamData].sort((a:any,b:any)=>b.overall-a.overall).map((m:any,i:number)=>(<div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${CL.bdr}30`}}><div style={{width:24,height:24,borderRadius:"50%",background:`${pC(m.probability)}20`,border:`2px solid ${pC(m.probability)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:pC(m.probability),fontFamily:"system-ui",flexShrink:0}}>{i+1}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,fontFamily:"system-ui"}}>{m.name}</div><div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>{i===0?"🌟 Lead role today":i===teamData.length-1?"🌿 Rest & support today":"⚖️ Collaborative role"}</div></div><ProbTick probability={m.probability}/></div>))}</div>)}
            {teamData.length===0&&<div style={{textAlign:"center",padding:"30px",color:CL.dim,fontFamily:"system-ui",fontSize:12}}>Add your first team member above.</div>}
          </div>
        )}
      </>)}

      {!data&&!loading&&<div style={{textAlign:"center",padding:"40px 20px",color:CL.dim,fontFamily:"system-ui",fontSize:12,fontStyle:"italic"}}>World energy loads automatically — add your birth date for personalised readings.</div>}

      <div style={{textAlign:"center",padding:"20px 0 10px",fontSize:9,color:CL.mut,fontFamily:"system-ui",lineHeight:1.8}}>
        <i>Oracle v10 · World + Personal Convergence Engine · % probability via multi-system triangulation</i><br/>
        <i>"The stars incline, they do not compel."</i>
      </div>

      {/* ══ ORACLE CHAT BUBBLE ══ */}
      {/* Floating button */}
      <div onClick={()=>setChatOpen(o=>!o)} style={{position:"fixed",bottom:24,right:20,width:54,height:54,borderRadius:"50%",background:`linear-gradient(135deg,${CL.pur},${CL.acc})`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 4px 20px ${CL.pur}60`,zIndex:1000,fontSize:22,transition:"transform 0.2s",transform:chatOpen?"rotate(45deg)":"none"}}>
        {chatOpen?"✕":"🔮"}
      </div>

      {/* Chat panel */}
      {chatOpen&&(
        <div style={{position:"fixed",bottom:90,right:16,width:"min(380px, calc(100vw - 32px))",maxHeight:"70vh",background:CL.card,border:`1px solid ${CL.pur}40`,borderRadius:16,display:"flex",flexDirection:"column",zIndex:999,boxShadow:`0 8px 40px #00000080`,overflow:"hidden",animation:"slideUp 0.2s ease"}}>
          {/* Header */}
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${CL.bdr}`,background:`linear-gradient(135deg,${CL.card},#1a1230)`,flexShrink:0}}>
            <div style={{fontSize:11,fontWeight:800,color:CL.acc,fontFamily:"system-ui",letterSpacing:2}}>🔮 ASK THE ORACLE</div>
            <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",marginTop:2}}>Direct answers · Based on your actual reading data</div>
          </div>
          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            {chatMessages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"10px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?`linear-gradient(135deg,${CL.pur},${CL.acc})`:CL.card2,color:m.role==="user"?"#000":CL.txt,fontSize:12,lineHeight:1.65,fontFamily:"system-ui",whiteSpace:"pre-wrap"}}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"10px 13px",background:CL.card2,borderRadius:"14px 14px 14px 4px",color:CL.dim,fontSize:12,fontFamily:"system-ui"}}>Oracle is consulting the stars<span style={{animation:"blink 1s infinite"}}>...</span></div></div>}
          </div>
          {/* Suggested questions */}
          <div style={{padding:"8px 12px",borderTop:`1px solid ${CL.bdr}20`,display:"flex",gap:6,overflowX:"auto",flexShrink:0}}>
            {["Should I sign today?","Best day this week?","Love energy today?","Career move now?","Financial timing?","Travel safe?"].map(q=>(
              <button key={q} onClick={async()=>{
                if(chatLoading)return;
                const histSnap=[...chatMessages].filter((_,i)=>i>0);
                setChatMessages(m=>[...m,{role:"user",text:q}]);
                setChatLoading(true);
                const qCtx=data?`═══ ORACLE FULL READING CONTEXT (${targetDate}) ═══

LUNAR CONDITIONS:
- Moon Phase: ${data.mp?.name} — ${data.mp?.energy}
- Void of Course: ${data.voc?"YES — actions tend to fizzle":"No — lunar energy active"}
- Retrograde planets: ${data.retros?.map((r:any)=>r.name).join(", ")||"None"}

CURRENT PLANETARY POSITIONS:
${data.transit?.map((p:any)=>`- ${p.planet?.sym||""} ${p.name}: ${p.degree?.toFixed(1)}° ${p.sign?.name}${p.retro?" ℞":""}`).join("\n")||""}

${dob?`USER NATAL CHART (born ${dob}):
- Sun: ${data.sunSign?.name} — Moon: ${data.moonSign?.name}
- Natal: ${data.natal?.map((p:any)=>`${p.name} ${p.degree?.toFixed(1)}° ${p.sign?.name}`).join(", ")||""}

PERSONAL DOMAIN PROBABILITIES:
${data.personalDomains?.map((d:any)=>`- ${d.icon} ${d.name}: ${d.probability}% | Top signals: ${d.signals?.slice(0,2).map((s:any)=>s.text).join(" | ")||""}`).join("\n")||""}
`:"NO BIRTH DATE — world energy only.\n"}
WORLD ENERGY:
${data.worldDomains?.map((d:any)=>`- ${d.icon} ${d.name}: ${d.probability}%`).join("\n")||""}

${teamData?.length>0?`TEAM: ${teamData.map((m:any)=>`${m.name}(${m.probability}%)`).join(", ")}`:""}
`:"No data loaded.";
                try{
                  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
                    model:"claude-sonnet-4-20250514",max_tokens:400,
                    system:`You are the Oracle — a direct astrological prediction tool. Give YES/NO/WAIT first, then 2-3 bullet points using specific planets and percentages from the data. Max 150 words. No fluff.\n\n${qCtx}`,
                    messages:histSnap.map((m:any)=>({role:m.role==="oracle"?"assistant":"user",content:m.text})).concat([{role:"user",content:q}])
                  })});
                  const json=await res.json();
                  setChatMessages(m=>[...m,{role:"oracle",text:json.content?.[0]?.text||"Signal unclear."}]);
                }catch{setChatMessages(m=>[...m,{role:"oracle",text:"Connection lost."}]);}
                setChatLoading(false);
              }} style={{background:`${CL.pur}15`,border:`1px solid ${CL.pur}30`,borderRadius:20,padding:"4px 10px",fontSize:9,color:CL.dim,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"system-ui"}}>{q}</button>
            ))}
          </div>
          {/* Input */}
          <div style={{padding:"10px 12px",borderTop:`1px solid ${CL.bdr}`,display:"flex",gap:8,flexShrink:0}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Ask the Oracle anything..." style={{flex:1,padding:"9px 12px",background:CL.card2,border:`1px solid ${CL.bdr}`,borderRadius:10,color:CL.txt,fontSize:12,outline:"none"}}/>
            <button id="oracle-chat-send" onClick={sendChat} disabled={!chatInput.trim()||chatLoading} style={{background:`linear-gradient(135deg,${CL.pur},${CL.acc})`,color:"#000",border:"none",borderRadius:10,padding:"9px 16px",fontSize:12,fontWeight:800,cursor:"pointer",opacity:!chatInput.trim()||chatLoading?0.4:1}}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
// deploy trigger Thu Mar 12 06:05:28 UTC 2026
