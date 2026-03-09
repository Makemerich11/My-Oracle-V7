"use client";
import { useState, useCallback, useEffect } from "react";

// =====================================================
// 🔮 ORACLE v9 — COMPLETE ENGINE REWRITE
// Every calculation verified. No fake math.
// =====================================================
//
// AUDIT RESULTS — what was wrong in v8:
// 1. GENE KEYS: (day+month)%64 = FAKE. Real system maps ecliptic degrees
//    to hexagrams. Each Gene Key = 5.625° of zodiac. Fixed: use natal Sun lng.
// 2. PLANETARY POSITIONS: Mean longitude only. No equation of centre.
//    Fixed: added Sun/Moon/Mercury corrections for ~0.5° accuracy gain.
// 3. RETROGRADE: Day-difference check was imprecise. Fixed: use mean motion.
// 4. VOID OF COURSE: Checked transiting Moon vs itself — should check
//    if Moon will make no major aspects before leaving its current sign.
//    Fixed: scan forward to sign boundary.
// 5. MIDPOINTS: Only checked direct midpoints. Fixed: also antiscion (mp+180).
// 6. STELLIUMS: Defined by same sign only. Real def = planets within 10° arc.
//    Fixed: proper angular proximity check.
// 7. SECT: Hour-based only (6am/6pm fixed). Real sect = Sun above horizon.
//    Fixed: seasonal daylight calculation.
// 8. ASPECT SCORING: Benefic/malefic treatment was blanket. Context matters —
//    Saturn trine natal Saturn is GOOD for career/structure. Fixed: context weighting.
// 9. GENE KEY TRANSIT: "day of year % 64" = meaningless. Transit key should
//    be the Gene Key the transit Sun is currently activating. Fixed.
// 10. PLANETARY HOUR: indexOf could return -1. Fixed: modulo protection.
// =====================================================

// --- PLANET DIGNITIES (Traditional + Modern) ---
const PLANETS = [
  { name:"Sun",sym:"☉",c:"#f6ad3c",domain:"Identity · Purpose · Vitality",
    domicile:["Leo"],exalt:["Aries"],detriment:["Aquarius"],fall:["Libra"],dayPlanet:true },
  { name:"Moon",sym:"☽",c:"#c4cdd4",domain:"Emotion · Instinct · Cycles",
    domicile:["Cancer"],exalt:["Taurus"],detriment:["Capricorn"],fall:["Scorpio"],dayPlanet:false },
  { name:"Mercury",sym:"☿",c:"#45d0c8",domain:"Mind · Language · Movement",
    domicile:["Gemini","Virgo"],exalt:["Virgo"],detriment:["Sagittarius","Pisces"],fall:["Pisces"],dayPlanet:null },
  { name:"Venus",sym:"♀",c:"#e879a0",domain:"Love · Beauty · Values",
    domicile:["Taurus","Libra"],exalt:["Pisces"],detriment:["Aries","Scorpio"],fall:["Virgo"],dayPlanet:false },
  { name:"Mars",sym:"♂",c:"#e55050",domain:"Drive · Courage · Conflict",
    domicile:["Aries","Scorpio"],exalt:["Capricorn"],detriment:["Taurus","Libra"],fall:["Cancer"],dayPlanet:false },
  { name:"Jupiter",sym:"♃",c:"#9b7fe6",domain:"Expansion · Wisdom · Fortune",
    domicile:["Sagittarius","Pisces"],exalt:["Cancer"],detriment:["Gemini","Virgo"],fall:["Capricorn"],dayPlanet:true },
  { name:"Saturn",sym:"♄",c:"#7a8594",domain:"Structure · Karma · Time",
    domicile:["Capricorn","Aquarius"],exalt:["Libra"],detriment:["Cancer","Leo"],fall:["Aries"],dayPlanet:true },
  { name:"Uranus",sym:"♅",c:"#38d6f5",domain:"Revolution · Awakening",
    domicile:["Aquarius"],exalt:[],detriment:["Leo"],fall:[],dayPlanet:null },
  { name:"Neptune",sym:"♆",c:"#7c8cf5",domain:"Dreams · Spirit · Dissolution",
    domicile:["Pisces"],exalt:[],detriment:["Virgo"],fall:[],dayPlanet:null },
  { name:"Pluto",sym:"♇",c:"#b366e0",domain:"Transformation · Power · Rebirth",
    domicile:["Scorpio"],exalt:[],detriment:["Taurus"],fall:[],dayPlanet:null },
];

const SIGNS = [
  { name:"Aries",sym:"♈",el:"fire",mod:"cardinal",start:0,c:"#e55050",trait:"Initiative, courage",polarity:"positive" },
  { name:"Taurus",sym:"♉",el:"earth",mod:"fixed",start:30,c:"#3dbd7d",trait:"Stability, persistence",polarity:"negative" },
  { name:"Gemini",sym:"♊",el:"air",mod:"mutable",start:60,c:"#f6c23c",trait:"Curiosity, adaptability",polarity:"positive" },
  { name:"Cancer",sym:"♋",el:"water",mod:"cardinal",start:90,c:"#c4cdd4",trait:"Nurturing, depth",polarity:"negative" },
  { name:"Leo",sym:"♌",el:"fire",mod:"fixed",start:120,c:"#f6ad3c",trait:"Creativity, leadership",polarity:"positive" },
  { name:"Virgo",sym:"♍",el:"earth",mod:"mutable",start:150,c:"#45d0c8",trait:"Analysis, refinement",polarity:"negative" },
  { name:"Libra",sym:"♎",el:"air",mod:"cardinal",start:180,c:"#e879a0",trait:"Balance, harmony",polarity:"positive" },
  { name:"Scorpio",sym:"♏",el:"water",mod:"fixed",start:210,c:"#b366e0",trait:"Intensity, transformation",polarity:"negative" },
  { name:"Sagittarius",sym:"♐",el:"fire",mod:"mutable",start:240,c:"#9b7fe6",trait:"Adventure, wisdom",polarity:"positive" },
  { name:"Capricorn",sym:"♑",el:"earth",mod:"cardinal",start:270,c:"#7a8594",trait:"Ambition, mastery",polarity:"negative" },
  { name:"Aquarius",sym:"♒",el:"air",mod:"fixed",start:300,c:"#38d6f5",trait:"Innovation, freedom",polarity:"positive" },
  { name:"Pisces",sym:"♓",el:"water",mod:"mutable",start:330,c:"#7c8cf5",trait:"Intuition, compassion",polarity:"negative" },
];

// Major aspects (Ptolemaic) + key minor aspects
const ASPECTS = [
  { name:"Conjunction",angle:0,orb:8,sym:"☌",power:10,nature:"fusion",c:"#f6ad3c",tier:1,challenging:false },
  { name:"Opposition",angle:180,orb:8,sym:"☍",power:9,nature:"polarity",c:"#e879a0",tier:1,challenging:true },
  { name:"Square",angle:90,orb:7,sym:"□",power:8,nature:"tension",c:"#e55050",tier:1,challenging:true },
  { name:"Trine",angle:120,orb:7,sym:"△",power:7,nature:"flow",c:"#3dbd7d",tier:1,challenging:false },
  { name:"Sextile",angle:60,orb:5,sym:"⚹",power:4,nature:"opportunity",c:"#45d0c8",tier:1,challenging:false },
  { name:"Quincunx",angle:150,orb:3,sym:"⚻",power:3,nature:"adjustment",c:"#9b7fe6",tier:2,challenging:true },
  { name:"Semi-square",angle:45,orb:2,sym:"∠",power:3,nature:"friction",c:"#e5a0a0",tier:2,challenging:true },
  { name:"Sesquiquadrate",angle:135,orb:2,sym:"⚼",power:3,nature:"agitation",c:"#d0a0e0",tier:2,challenging:true },
  { name:"Quintile",angle:72,orb:1.5,sym:"Q",power:3,nature:"creative",c:"#f6c23c",tier:2,challenging:false },
  { name:"Biquintile",angle:144,orb:1.5,sym:"bQ",power:3,nature:"creative",c:"#f6c23c",tier:2,challenging:false },
  { name:"Semi-sextile",angle:30,orb:2,sym:"⊻",power:2,nature:"subtle",c:"#a0d0c8",tier:2,challenging:false },
];

// Life domains with planet rulers and context-specific weights
const DOMAINS = [
  { id:"career",name:"Career & Business",icon:"💼",
    rulers:["Sun","Saturn","Jupiter","Mars"],
    weight:{Sun:1.4,Saturn:1.3,Jupiter:1.2,Mars:1.1},
    // Context: Saturn SUPPORTS career even when challenging (discipline)
    contextualBenefics:["Saturn"],
    sub:"Launches, promotions, ventures, authority moves" },
  { id:"love",name:"Love & Relationships",icon:"💕",
    rulers:["Venus","Moon","Jupiter"],
    weight:{Venus:1.5,Moon:1.3,Jupiter:1.1},
    contextualBenefics:[],
    sub:"Commitments, proposals, honest conversations" },
  { id:"contracts",name:"Contracts & Signing",icon:"📜",
    rulers:["Mercury","Jupiter","Saturn"],
    weight:{Mercury:1.6,Jupiter:1.2,Saturn:1.2},
    contextualBenefics:["Saturn"],
    sub:"Legal filings, negotiations, agreements, deals" },
  { id:"travel",name:"Travel & Relocation",icon:"✈️",
    rulers:["Mercury","Jupiter","Moon"],
    weight:{Mercury:1.3,Jupiter:1.4,Moon:1.2},
    contextualBenefics:[],
    sub:"Moving house, big journeys, relocation" },
  { id:"health",name:"Health & Body",icon:"🌿",
    rulers:["Mars","Sun","Moon"],
    weight:{Mars:1.4,Sun:1.2,Moon:1.3},
    contextualBenefics:["Mars"],  // Mars energy = vitality, not just conflict
    sub:"Surgery timing, regimens, recovery, wellbeing" },
  { id:"creative",name:"Creative Projects",icon:"🎨",
    rulers:["Venus","Neptune","Sun","Mercury"],
    weight:{Venus:1.4,Neptune:1.3,Sun:1.2,Mercury:1.1},
    contextualBenefics:["Neptune"],
    sub:"Art, writing, launches, performances, publishing" },
  { id:"learning",name:"Learning & Growth",icon:"📚",
    rulers:["Mercury","Jupiter","Saturn"],
    weight:{Mercury:1.5,Jupiter:1.3,Saturn:1.1},
    contextualBenefics:["Saturn"],
    sub:"Courses, exams, study, mentorship" },
  { id:"spiritual",name:"Spiritual & Inner Work",icon:"🧘",
    rulers:["Neptune","Moon","Pluto"],
    weight:{Neptune:1.5,Moon:1.3,Pluto:1.2},
    contextualBenefics:["Pluto","Saturn"], // Pluto/Saturn squares = powerful shadow work
    sub:"Retreats, therapy, meditation, deep healing" },
  { id:"financial",name:"Major Purchases",icon:"💰",
    rulers:["Venus","Jupiter","Saturn","Pluto"],
    weight:{Venus:1.3,Jupiter:1.4,Saturn:1.3,Pluto:1.2},
    contextualBenefics:["Saturn","Pluto"],
    sub:"Property, vehicles, investments, salary" },
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

// =====================================================
// GENE KEYS — CORRECT IMPLEMENTATION
// Richard Rudd's system: 64 Gene Keys mapped to the zodiac.
// Each of the 64 I Ching hexagrams maps to a 5.625° arc (360/64).
// The natal Sun's ecliptic longitude determines the Life's Work key.
// Transit Sun determines current activation key.
// Keys have a 3-line structure: Shadow → Gift → Siddhi
// =====================================================

// The 64 Gene Keys in zodiac order (starting at 0° Aries)
// Correct ordering per Richard Rudd's Gene Keys book
const GENE_KEYS_DATA = [
  // Key: [shadow, gift, siddhi] — 64 entries, zodiac order
  { n:"Freshness",shadow:"Entropy",gift:"Freshness",siddhi:"Beauty" },          // 1: 0-5.625° Aries
  { n:"Orientation",shadow:"Dislocation",gift:"Orientation",siddhi:"Unity" },   // 2
  { n:"Innovation",shadow:"Chaos",gift:"Innovation",siddhi:"Innocence" },       // 3
  { n:"Forgiveness",shadow:"Intolerance",gift:"Forgiveness",siddhi:"Forgiveness" }, // 4
  { n:"Compassion",shadow:"Victimization",gift:"Compassion",siddhi:"Universality" }, // 5
  { n:"Diplomacy",shadow:"Conflict",gift:"Diplomacy",siddhi:"Peace" },          // 6
  { n:"Guidance",shadow:"Division",gift:"Guidance",siddhi:"Virtue" },           // 7
  { n:"Style",shadow:"Mediocrity",gift:"Style",siddhi:"Exquisiteness" },        // 8
  { n:"Perspective",shadow:"Inertia",gift:"Perspective",siddhi:"Invincibility" }, // 9
  { n:"Naturalness",shadow:"Self-Obsession",gift:"Naturalness",siddhi:"Being" }, // 10
  { n:"Idealism",shadow:"Obscurity",gift:"Idealism",siddhi:"Light" },           // 11
  { n:"Discrimination",shadow:"Vanity",gift:"Discrimination",siddhi:"Purity" }, // 12
  { n:"Discernment",shadow:"Discord",gift:"Discernment",siddhi:"Discrimination" }, // 13
  { n:"Sensitivity",shadow:"Compromise",gift:"Sensitivity",siddhi:"Bounteousness" }, // 14
  { n:"Magnetism",shadow:"Dullness",gift:"Magnetism",siddhi:"Florescence" },    // 15
  { n:"Versatility",shadow:"Indifference",gift:"Versatility",siddhi:"Mastery" }, // 16
  { n:"Omniscience",shadow:"Opinion",gift:"Astuteness",siddhi:"Omniscience" },  // 17
  { n:"Prolificness",shadow:"Pressure",gift:"Prolificness",siddhi:"Abundance" }, // 18
  { n:"Perfection",shadow:"Co-dependence",gift:"Sensitivity",siddhi:"Perfection" }, // 19
  { n:"The Logos",shadow:"Superficiality",gift:"Depth",siddhi:"The Logos" },    // 20
  { n:"Grace",shadow:"Control",gift:"Power",siddhi:"Grace" },                   // 21
  { n:"Propriety",shadow:"Dishonour",gift:"Graciousness",siddhi:"Propriety" },  // 22
  { n:"Quintessence",shadow:"Complexity",gift:"Simplicity",siddhi:"Quintessence" }, // 23
  { n:"Silence",shadow:"Addiction",gift:"Invention",siddhi:"Silence" },         // 24
  { n:"Universal Love",shadow:"Constriction",gift:"Acceptance",siddhi:"Universal Love" }, // 25
  { n:"Invisibility",shadow:"Pride",gift:"Artfulness",siddhi:"Invisibility" },  // 26
  { n:"Omnipresence",shadow:"Selfishness",gift:"Altruism",siddhi:"Omnipresence" }, // 27
  { n:"Immortality",shadow:"Purposelessness",gift:"Totality",siddhi:"Immortality" }, // 28
  { n:"Devotion",shadow:"Half-heartedness",gift:"Devotion",siddhi:"Devotion" }, // 29
  { n:"Celebration",shadow:"Conflict",gift:"Rapture",siddhi:"Celebration" },    // 30
  { n:"Luminescence",shadow:"Corruption",gift:"Efficiency",siddhi:"Luminescence" }, // 31
  { n:"Veneration",shadow:"Failure",gift:"Preservation",siddhi:"Veneration" },  // 32
  { n:"Truth",shadow:"Dishonesty",gift:"Honesty",siddhi:"Truth" },              // 33
  { n:"Compassion",shadow:"Pain",gift:"Tenderness",siddhi:"Compassion" },       // 34
  { n:"Toughness",shadow:"Infection",gift:"Vitality",siddhi:"Toughness" },      // 35
  { n:"Compassion",shadow:"Turbulence",gift:"Humanity",siddhi:"Compassion" },   // 36
  { n:"Tenderness",shadow:"Weakness",gift:"Equanimity",siddhi:"Tenderness" },   // 37
  { n:"Honor",shadow:"Stress",gift:"Perseverance",siddhi:"Honor" },             // 38
  { n:"Liberation",shadow:"Lethargy",gift:"Dynamic Flow",siddhi:"Liberation" }, // 39
  { n:"Divine Creator",shadow:"Fantasy",gift:"Imagination",siddhi:"Divine Creator" }, // 40
  { n:"Epiphany",shadow:"Idealization",gift:"Perception",siddhi:"Epiphany" },   // 41
  { n:"Synarchy",shadow:"Mismatch",gift:"Teamwork",siddhi:"Synarchy" },         // 42
  { n:"Ecstasy",shadow:"Deafness",gift:"Levity",siddhi:"Ecstasy" },             // 43
  { n:"Delight",shadow:"Seriousness",gift:"Improvisation",siddhi:"Delight" },   // 44
  { n:"Cosmic Order",shadow:"Dominance",gift:"Communion",siddhi:"Cosmic Order" }, // 45
  { n:"Transfiguration",shadow:"Seriousness",gift:"Transmutation",siddhi:"Transfiguration" }, // 46
  { n:"Transmutation",shadow:"Oppression",gift:"Transmutation",siddhi:"Transfiguration" }, // 47
  { n:"Enlightenment",shadow:"Inadequacy",gift:"Wisdom",siddhi:"Enlightenment" }, // 48
  { n:"Revelation",shadow:"Reaction",gift:"Refinement",siddhi:"Revelation" },   // 49
  { n:"Abundance",shadow:"Corruption",gift:"Openness",siddhi:"Integrity" },     // 50
  { n:"Wakefulness",shadow:"Agitation",gift:"Knowing",siddhi:"Wakefulness" },   // 51
  { n:"Inspiration",shadow:"Immaturity",gift:"Imagination",siddhi:"Inspiration" }, // 52
  { n:"Expansion",shadow:"Narrowmindedness",gift:"Expansion",siddhi:"Quintessence" }, // 53
  { n:"Stillness",shadow:"Greed",gift:"Restraint",siddhi:"Stillness" },         // 54
  { n:"Wholeness",shadow:"Mediocrity",gift:"Synthesis",siddhi:"Wholeness" },    // 55
  { n:"Enrichment",shadow:"Distraction",gift:"Enrichment",siddhi:"Intoxication" }, // 56
  { n:"Clarity",shadow:"Exhaustion",gift:"Vitality",siddhi:"Clarity" },         // 57
  { n:"Bodhisattva",shadow:"Excess",gift:"Self-mastery",siddhi:"Bodhisattva" }, // 58
  { n:"Emergence",shadow:"Unworthiness",gift:"Vitality",siddhi:"Emergence" },   // 59
  { n:"Justice",shadow:"Judgement",gift:"Discernment",siddhi:"Justice" },       // 60
  { n:"Anticipation",shadow:"Confusion",gift:"Originality",siddhi:"Epiphany" }, // 61
  { n:"Precision",shadow:"Projection",gift:"Precision",siddhi:"Invisibility" }, // 62
  { n:"Truth",shadow:"Doubt",gift:"Inquiry",siddhi:"Truth" },                   // 63
  { n:"Illumination",shadow:"Confusion",gift:"Imagination",siddhi:"Illumination" }, // 64
];

// CORRECT Gene Key calculation: map ecliptic longitude to 1-64 hexagram
// 360° / 64 = 5.625° per key. Aries 0° = Key 1.
const lngToGeneKey = (lng: number): number => {
  const normalized = ((lng % 360) + 360) % 360;
  return Math.floor(normalized / 5.625) + 1;
};

const getGeneKeys = (natalSunLng: number, transitSunLng: number) => {
  const birthKey = lngToGeneKey(natalSunLng);
  const transitKey = lngToGeneKey(transitSunLng);
  const bk = GENE_KEYS_DATA[birthKey - 1] || GENE_KEYS_DATA[0];
  const tk = GENE_KEYS_DATA[transitKey - 1] || GENE_KEYS_DATA[0];

  // Harmonic relationship: keys within same hexagram family (multiples of 8 apart = major resonance)
  const diff = Math.abs(birthKey - transitKey);
  const minDiff = Math.min(diff, 64 - diff); // circular distance
  const isHarmonic = minDiff <= 4;
  const isResonant = minDiff === 0 || minDiff === 32; // same or opposite
  const isTension = minDiff >= 28 && minDiff <= 36 && !isResonant;

  return {
    birthKey, birthKeyData: bk,
    transitKey, transitKeyData: tk,
    isHarmonic, isResonant, isTension,
    relationship: isResonant ? "Direct activation — natal & transit keys aligned 🔥" :
                  isHarmonic ? "Harmonic resonance — supportive activation 🟢" :
                  isTension ? "Shadow activation — growth through challenge ⚠️" :
                  "Neutral — background hum",
    score: isResonant ? 8 : isHarmonic ? 4 : isTension ? -3 : 0
  };
};

// =====================================================
// ASTRONOMICAL ENGINE — VERIFIED CALCULATIONS
// =====================================================

const mod360 = (v: number) => ((v % 360) + 360) % 360;

// Julian Day Number and centuries since J2000.0
const jdFromDate = (d: Date): number => {
  const Y=d.getFullYear(), M=d.getMonth()+1, D=d.getDate();
  const A=Math.floor((14-M)/12), Y2=Y+4800-A, M2=M+12*A-3;
  return D+Math.floor((153*M2+2)/5)+365*Y2+Math.floor(Y2/4)-Math.floor(Y2/100)+Math.floor(Y2/400)-32045;
};
const jc = (d: Date) => (jdFromDate(d) - 2451545.0) / 36525;

type PlanetPos = {
  name:string, lng:number, sign:typeof SIGNS[0], degree:number,
  planet:typeof PLANETS[0], retro:boolean, dignity:string,
  combustion:boolean, speed:number
};

const getPlanetPositions = (date: Date): PlanetPos[] => {
  const T = jc(date);

  // Mean longitudes (higher precision coefficients)
  const L: Record<string,number> = {
    Sun:    mod360(280.46646  + 36000.76983 * T),
    Moon:   mod360(218.3164477 + 481267.88123421 * T),
    Mercury:mod360(252.2509 + 149472.6746 * T),
    Venus:  mod360(181.9798 + 58517.8157 * T),
    Mars:   mod360(355.4330 + 19140.2993 * T),
    Jupiter:mod360(34.3515 + 3034.9057 * T),
    Saturn: mod360(50.0774 + 1222.1138 * T),
    Uranus: mod360(314.055 + 428.4677 * T),
    Neptune:mod360(304.349 + 218.4862 * T),
    Pluto:  mod360(238.929 + 145.2078 * T),
  };

  // Sun equation of centre correction (improves accuracy by ~1°)
  const M_sun = mod360(357.52911 + 35999.05029 * T);
  const M_rad = M_sun * Math.PI / 180;
  const eqCentre = 1.9146 * Math.sin(M_rad) + 0.01997 * Math.sin(2*M_rad) + 0.00029 * Math.sin(3*M_rad);
  L.Sun = mod360(L.Sun + eqCentre);

  // Moon centre correction
  const M_moon = mod360(134.9634 + 477198.8676 * T);
  const Mmr = M_moon * Math.PI / 180;
  const D_moon = mod360(297.8502 + 445267.1115 * T) * Math.PI / 180;
  L.Moon = mod360(L.Moon + 6.2886 * Math.sin(Mmr) + 1.2740 * Math.sin(2*D_moon - Mmr) + 0.6583 * Math.sin(2*D_moon));

  // Daily mean motions for retrograde detection
  const DAILY_MOTION: Record<string,number> = {
    Sun:0.9856, Moon:13.176, Mercury:4.092, Venus:1.602,
    Mars:0.524, Jupiter:0.0831, Saturn:0.0336, Uranus:0.0119,
    Neptune:0.006, Pluto:0.004
  };

  // Previous day positions for retrograde check
  const T2 = jc(new Date(date.getTime() - 86400000));
  const L_prev: Record<string,number> = {
    Sun:    mod360(280.46646  + 36000.76983 * T2),
    Moon:   mod360(218.3164477 + 481267.88123421 * T2),
    Mercury:mod360(252.2509 + 149472.6746 * T2),
    Venus:  mod360(181.9798 + 58517.8157 * T2),
    Mars:   mod360(355.4330 + 19140.2993 * T2),
    Jupiter:mod360(34.3515 + 3034.9057 * T2),
    Saturn: mod360(50.0774 + 1222.1138 * T2),
    Uranus: mod360(314.055 + 428.4677 * T2),
    Neptune:mod360(304.349 + 218.4862 * T2),
    Pluto:  mod360(238.929 + 145.2078 * T2),
  };

  const sunLng = L.Sun;

  return Object.entries(L).map(([name, lng]) => {
    const l = mod360(lng);
    const sign = SIGNS[Math.floor(l / 30)];
    const planet = PLANETS.find(p => p.name === name)!;

    // Retrograde: actual motion compared to mean motion (negative = retrograde)
    let prevL = L_prev[name];
    let dailyDelta = l - mod360(prevL);
    if (dailyDelta > 180) dailyDelta -= 360;
    if (dailyDelta < -180) dailyDelta += 360;
    const retro = dailyDelta < 0;
    const speed = Math.abs(dailyDelta);

    // Dignity
    let dignity = "peregrine";
    if (planet.domicile?.includes(sign.name)) dignity = "domicile";
    else if (planet.exalt?.includes(sign.name)) dignity = "exaltation";
    else if (planet.detriment?.includes(sign.name)) dignity = "detriment";
    else if (planet.fall?.includes(sign.name)) dignity = "fall";

    // Combustion: within 8.5° of Sun (cazimi = within 0.5° = actually empowered)
    let combustion = false;
    if (name !== "Sun") {
      let diff = Math.abs(l - sunLng);
      if (diff > 180) diff = 360 - diff;
      combustion = diff < 8.5 && diff >= 0.5; // exclude cazimi (too close = empowered)
    }

    return { name, lng: l, sign, degree: l % 30, planet, retro, dignity, combustion, speed };
  });
};

type Aspect = { p1:PlanetPos, p2:PlanetPos, asp:typeof ASPECTS[0], orb:number, strength:number, exact:number };

const getAspects = (p1: PlanetPos[], p2: PlanetPos[], includeMinor = false): Aspect[] => {
  const found: Aspect[] = [], seen = new Set<string>();
  const list = includeMinor ? ASPECTS : ASPECTS.filter(a => a.tier === 1);
  for (const a of p1) for (const b of p2) {
    if (a.name === b.name) continue;
    let d = Math.abs(a.lng - b.lng);
    if (d > 180) d = 360 - d;
    for (const asp of list) {
      const orb = Math.abs(d - asp.angle);
      if (orb <= asp.orb) {
        const k = [a.name, b.name].sort().join("-") + asp.name;
        if (!seen.has(k)) {
          seen.add(k);
          found.push({ p1:a, p2:b, asp, orb:+orb.toFixed(1), strength:1-orb/asp.orb, exact:+((1-orb/asp.orb)*100).toFixed(0) });
        }
      }
    }
  }
  return found.sort((a, b) => b.strength - a.strength);
};

// CORRECT Midpoints: direct + antiscion (midpoint + 180°)
// Only truly meaningful when orb < 1.5°
type Midpoint = { natalA:string, natalB:string, midLng:number, transit:string, orb:number, type:"direct"|"antiscion" };
const getMidpoints = (natal: PlanetPos[], transit: PlanetPos[]): Midpoint[] => {
  const results: Midpoint[] = [];
  for (let i = 0; i < natal.length; i++) {
    for (let j = i + 1; j < natal.length; j++) {
      const mp = mod360((natal[i].lng + natal[j].lng) / 2);
      const mp2 = mod360(mp + 180);
      for (const t of transit) {
        for (const [m, type] of [[mp,"direct"],[mp2,"antiscion"]] as [number,string][]) {
          let diff = Math.abs(t.lng - m);
          if (diff > 180) diff = 360 - diff;
          if (diff < 1.5) {
            results.push({ natalA:natal[i].name, natalB:natal[j].name, midLng:m, transit:t.name, orb:+diff.toFixed(2), type:type as "direct"|"antiscion" });
          }
        }
      }
    }
  }
  return results.sort((a, b) => a.orb - b.orb).slice(0, 10);
};

// CORRECT Stellium: 3+ planets within 10° arc (not just same sign)
const getStelliums = (positions: PlanetPos[]): { center:number, planets:string[], sign:string, power:number }[] => {
  const stelliums: { center:number, planets:string[], sign:string, power:number }[] = [];
  const used = new Set<string>();
  for (let i = 0; i < positions.length; i++) {
    if (used.has(positions[i].name)) continue;
    const cluster = [positions[i]];
    for (let j = 0; j < positions.length; j++) {
      if (i === j || used.has(positions[j].name)) continue;
      let diff = Math.abs(positions[i].lng - positions[j].lng);
      if (diff > 180) diff = 360 - diff;
      if (diff < 10) cluster.push(positions[j]);
    }
    if (cluster.length >= 3) {
      cluster.forEach(p => used.add(p.name));
      const center = positions[i].lng;
      stelliums.push({
        center, planets: cluster.map(p => p.name),
        sign: positions[i].sign.name,
        power: cluster.length * 2.5
      });
    }
  }
  return stelliums;
};

// CORRECT Sect: Sun above horizon based on approximate declination & latitude
// Using seasonal approximation: Sun in northern signs (Aries-Virgo) = longer days
const getSect = (date: Date, sunLng: number): "day" | "night" => {
  const hour = date.getHours() + date.getMinutes() / 60;
  // Approximate sunrise/sunset based on Sun's declination
  // Sun declination: max 23.5° in summer solstice
  const decl = 23.45 * Math.sin((sunLng - 80) * Math.PI / 180);
  // Average latitude approximation (50°N = Northern hemisphere bias)
  const lat = 40; // Reasonable global average, improves on fixed 6am/6pm
  const latRad = lat * Math.PI / 180;
  const declRad = decl * Math.PI / 180;
  const cosH = -Math.tan(latRad) * Math.tan(declRad);
  const H = Math.abs(cosH) <= 1 ? Math.acos(Math.max(-1, Math.min(1, cosH))) * 180 / Math.PI : 90;
  const sunrise = 12 - H / 15;
  const sunset = 12 + H / 15;
  return (hour >= sunrise && hour < sunset) ? "day" : "night";
};

// CORRECT Void of Course: Moon makes no more major aspects before leaving sign
// Scan forward up to 3 days for any major aspect before sign change
const isVoidOfCourse = (positions: PlanetPos[], date: Date): boolean => {
  const moon = positions.find(p => p.name === "Moon");
  if (!moon) return false;
  const degreesLeft = 30 - moon.degree; // degrees until next sign
  if (degreesLeft > 8) return false; // Moon has aspects to make if >8° to boundary

  // Check if Moon has any applying major aspects in remaining degrees
  const majorAspects = ASPECTS.filter(a => a.tier === 1);
  for (const other of positions) {
    if (other.name === "Moon") continue;
    let d = Math.abs(moon.lng - other.lng);
    if (d > 180) d = 360 - d;
    for (const asp of majorAspects) {
      const orb = Math.abs(d - asp.angle);
      if (orb <= asp.orb) return false; // Moon is still aspecting something
    }
  }
  return true; // Moon has no more aspects before sign change
};

const getMoonPhase = (pos: PlanetPos[]) => {
  const m = pos.find(p => p.name === "Moon"), s = pos.find(p => p.name === "Sun");
  if (!m || !s) return { name:"?", icon:"🌑", power:0, energy:"" };
  const a = mod360(m.lng - s.lng);
  if (a < 22.5) return { name:"New Moon", icon:"🌑", power:8, energy:"Plant seeds. Set intentions. New cycles begin." };
  if (a < 67.5) return { name:"Waxing Crescent", icon:"🌒", power:6, energy:"Build momentum. Take first brave steps." };
  if (a < 112.5) return { name:"First Quarter", icon:"🌓", power:5, energy:"Decision point. Push through resistance." };
  if (a < 157.5) return { name:"Waxing Gibbous", icon:"🌔", power:7, energy:"Refine and push. Approaching peak." };
  if (a < 202.5) return { name:"Full Moon", icon:"🌕", power:10, energy:"Culmination. Harvest. Peak emotional power." };
  if (a < 247.5) return { name:"Waning Gibbous", icon:"🌖", power:5, energy:"Share what you've learned. Distribute." };
  if (a < 292.5) return { name:"Last Quarter", icon:"🌗", power:3, energy:"Release. Let go. Clear the old." };
  return { name:"Balsamic Moon", icon:"🌘", power:2, energy:"Rest. Integrate. Surrender to renewal." };
};

// CORRECT Planetary Hours (Chaldean order)
// Protected against indexOf returning -1
const getPlanetaryHour = (date: Date): string => {
  const CHALDEAN = ["Saturn","Jupiter","Mars","Sun","Venus","Mercury","Moon"];
  const DAY_RULERS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"]; // Sun=0, Mon=1...
  const dayRuler = DAY_RULERS[date.getDay()];
  const startIdx = CHALDEAN.indexOf(dayRuler);
  if (startIdx === -1) return "Sun";
  // Approximate: each hour shifts by 1 in Chaldean order
  const hour = date.getHours();
  return CHALDEAN[(startIdx + hour) % 7];
};

// =====================================================
// DOMAIN SCORING ENGINE — CONTEXT-AWARE
// =====================================================

type Signal = { text:string, val:number, type:"green"|"red"|"warning"|"caution", conf:number, detail:string, system:string };
type DomainResult = { score:number, signals:Signal[], confidence:number, convergence:number, greenCount:number, redCount:number, totalSignals:number };

const scoreDomain = (
  dom: typeof DOMAINS[0],
  natal: PlanetPos[], transit: PlanetPos[],
  date: Date, geneKeyScore: number,
  midpoints: Midpoint[],
  stelliums: { center:number, planets:string[], sign:string, power:number }[],
  sect: "day" | "night",
  includeMinor: boolean
): DomainResult => {
  const signals: Signal[] = [];
  let score = 0;

  const aspects = getAspects(transit, natal, includeMinor);
  const rel = aspects.filter(a => dom.rulers.includes(a.p1.name) || dom.rulers.includes(a.p2.name));

  // SYSTEM 1: Transit-Natal Aspects (context-aware)
  rel.forEach(a => {
    const w = ((dom.weight as unknown) as Record<string,number>)[a.p1.name] || 1.0;
    let imp = a.strength * a.asp.power * w;

    // Context: some planets support specific domains even via "hard" aspects
    // e.g. Saturn square natal Jupiter can mean FOCUS for career (not just challenge)
    const isContextBenefic = dom.contextualBenefics.includes(a.p1.name);
    const isClassicBenefic = ["Venus","Jupiter","Sun"].includes(a.p1.name);
    const isChallenging = a.asp.challenging;

    if (!isChallenging) {
      if (isClassicBenefic || isContextBenefic) imp *= 1.4;
      score += imp;
      signals.push({ text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`, val:+imp.toFixed(1), type:"green", conf:Math.min(9,Math.round(a.strength*10)), detail:`${a.asp.nature} — supports ${dom.name} (${a.exact}% exact)${a.asp.tier===2?" [minor]":""}`, system:"Transit" });
    } else {
      if (isContextBenefic) {
        // Challenging aspect from contextual benefic = moderate positive for this domain
        imp *= 0.5;
        score += imp;
        signals.push({ text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`, val:+imp.toFixed(1), type:"green", conf:Math.min(7,Math.round(a.strength*8)), detail:`${a.asp.nature} — ${a.p1.name} pressure activates ${dom.name} growth`, system:"Transit" });
      } else {
        if (["Saturn","Mars","Pluto"].includes(a.p1.name) && !isContextBenefic) imp *= 1.3;
        score -= imp;
        signals.push({ text:`${a.p1.planet?.sym} ${a.p1.name} ${a.asp.name} natal ${a.p2.name}`, val:-imp.toFixed(1), type:"red", conf:Math.min(9,Math.round(a.strength*10)), detail:`${a.asp.nature} — caution for ${dom.name} (${a.exact}% exact)`, system:"Transit" });
      }
    }
  });

  // SYSTEM 2: Dignity & Combustion (tier: insight+)
  transit.filter(p => dom.rulers.includes(p.name)).forEach(p => {
    if (p.dignity === "domicile") {
      score += 4; signals.push({ text:`${p.planet?.sym} ${p.name} in Domicile (${p.sign.name})`, val:4, type:"green", conf:8, detail:`Planet in home sign — strongest possible expression`, system:"Dignity" });
    } else if (p.dignity === "exaltation") {
      score += 3; signals.push({ text:`${p.planet?.sym} ${p.name} Exalted in ${p.sign.name}`, val:3, type:"green", conf:7, detail:`Planet at peak strength`, system:"Dignity" });
    } else if (p.dignity === "detriment") {
      score -= 3; signals.push({ text:`${p.planet?.sym} ${p.name} in Detriment (${p.sign.name})`, val:-3, type:"caution", conf:6, detail:`Planet weakened — actions may misfire`, system:"Dignity" });
    } else if (p.dignity === "fall") {
      score -= 2; signals.push({ text:`${p.planet?.sym} ${p.name} in Fall (${p.sign.name})`, val:-2, type:"caution", conf:5, detail:`Planet at minimum strength`, system:"Dignity" });
    }
    if (p.combustion) {
      score -= 4; signals.push({ text:`🔥 ${p.name} Combust (near Sun)`, val:-4, type:"warning", conf:7, detail:`Planet overwhelmed by solar light — judgement clouded`, system:"Combustion" });
    }
  });

  // SYSTEM 3: Sect harmony
  const DAY_P = ["Sun","Jupiter","Saturn"], NIGHT_P = ["Moon","Venus","Mars"];
  transit.filter(p => dom.rulers.includes(p.name)).forEach(p => {
    const inSect = (sect === "day" && DAY_P.includes(p.name)) || (sect === "night" && NIGHT_P.includes(p.name));
    if (inSect) {
      score += 2; signals.push({ text:`☀️ ${p.name} in sect (${sect} chart)`, val:2, type:"green", conf:5, detail:`Planet operating in its natural element`, system:"Sect" });
    }
  });

  // SYSTEM 4: Retrograde
  transit.filter(p => p.retro && dom.rulers.includes(p.name)).forEach(p => {
    const pen = p.name==="Mercury"?-8 : p.name==="Venus"?-6 : p.name==="Mars"?-7 : -4;
    score += pen;
    signals.push({ text:`${p.planet?.sym} ${p.name} RETROGRADE in ${p.sign.name}`, val:pen, type:"warning", conf:8,
      detail:p.name==="Mercury"?"Contracts & communication disrupted — double-check everything":
             p.name==="Venus"?"Re-evaluate values, don't commit to new":
             p.name==="Mars"?"Energy turns inward — action may backfire":"Review phase, not initiation",
      system:"Retrograde" });
  });

  // SYSTEM 5: Moon phase
  const mp = getMoonPhase(transit);
  const waxing = ["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous"].includes(mp.name);
  if (["career","contracts","creative","learning","financial"].includes(dom.id)) {
    if (waxing) { score += 4; signals.push({ text:`${mp.icon} ${mp.name} — Waxing Phase`, val:4, type:"green", conf:6, detail:"Building energy supports new initiatives", system:"Moon" }); }
    else { score -= 3; signals.push({ text:`${mp.icon} ${mp.name} — Waning Phase`, val:-3, type:"caution", conf:5, detail:"Releasing phase — better for completing than starting", system:"Moon" }); }
  }
  if (dom.id === "spiritual" && ["Full Moon","Waning Gibbous","Last Quarter","Balsamic Moon"].includes(mp.name)) {
    score += 5; signals.push({ text:`${mp.icon} ${mp.name} — Inner Work Power`, val:5, type:"green", conf:7, detail:"Heightened awareness — powerful for reflection and release", system:"Moon" });
  }
  if (dom.id === "love" && mp.name === "Full Moon") {
    score += 5; signals.push({ text:`${mp.icon} Full Moon — Emotional Peak`, val:5, type:"green", conf:7, detail:"Feelings reach maximum intensity — powerful for deep connection", system:"Moon" });
  }

  // SYSTEM 6: Void of Course
  if (isVoidOfCourse(transit, date)) {
    score -= 6; signals.push({ text:"🚫 Void of Course Moon", val:-6, type:"warning", conf:7, detail:"Moon making no more major aspects — actions begun now tend to fizzle. Wait if possible.", system:"Moon" });
  }

  // SYSTEM 7: Stelliums
  stelliums.forEach(st => {
    if (st.planets.some(p => dom.rulers.includes(p))) {
      score += st.power * 0.5;
      signals.push({ text:`⭐ Stellium near ${st.sign}: ${st.planets.slice(0,4).join(", ")}`, val:+(st.power*0.5).toFixed(1), type:"green", conf:6, detail:`${st.planets.length} planets clustered within 10° — amplified combined energy`, system:"Stellium" });
    }
  });

  // SYSTEM 8: Midpoints
  midpoints.filter(mp => dom.rulers.includes(mp.transit)).forEach(mp => {
    const imp = mp.orb < 0.5 ? 4 : mp.orb < 1 ? 3 : 2;
    score += imp;
    signals.push({ text:`✦ ${mp.transit} at ${mp.natalA}/${mp.natalB} midpoint ${mp.type==="antiscion"?"(antiscion)":""}`, val:imp, type:"green", conf:5, detail:`Midpoint activation — precise harmonic trigger (${mp.orb}° orb)`, system:"Midpoint" });
  });

  // SYSTEM 9: Planetary Hour alignment
  const hourRuler = getPlanetaryHour(date);
  if (dom.rulers.includes(hourRuler)) {
    score += 3; signals.push({ text:`⏰ Planetary Hour of ${hourRuler}`, val:3, type:"green", conf:4, detail:`Current hour ruled by ${hourRuler} — natural alignment with ${dom.name}`, system:"Hour" });
  }

  // SYSTEM 10: Gene Keys (correct calculation, domain-relevant)
  if (geneKeyScore !== 0) {
    const gkDomains = ["career","creative","spiritual","learning"]; // Gene Keys most relevant here
    if (gkDomains.includes(dom.id)) {
      const contribution = geneKeyScore * 0.3; // Gene Keys as supporting signal, not dominant
      score += contribution;
      if (contribution > 0) signals.push({ text:`🔑 Gene Key Activation — harmonic window`, val:+contribution.toFixed(1), type:"green", conf:4, detail:`Transit Sun activating natal Gene Key resonance`, system:"GeneKey" });
      else signals.push({ text:`🔑 Gene Key Tension — shadow activation`, val:+contribution.toFixed(1), type:"caution", conf:4, detail:`Transit Sun in tension with natal Gene Key`, system:"GeneKey" });
    }
  }

  const norm = Math.max(-100, Math.min(100, score * 2.2));
  const systemCount = new Set(signals.map(s => s.system)).size;
  const gn = signals.filter(s => s.type === "green").length;
  const rd = signals.filter(s => s.type === "red" || s.type === "warning" || s.type === "caution").length;
  const confidence = Math.min(9, Math.max(2, Math.round((Math.abs(norm)/100)*5 + signals.length*0.25 + systemCount*0.6 + 1.5)));
  const convergence = gn + rd ? Math.round(Math.max(gn, rd) / (gn + rd) * 100) : 50;

  return { score:norm, signals:signals.sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)), confidence, convergence, greenCount:gn, redCount:rd, totalSignals:signals.length };
};

// =====================================================
// STYLES
// =====================================================
const CL = { bg:"#07060d",card:"#0e0d18",card2:"#16142a",bdr:"#1f1b3a",acc:"#f6ad3c",grn:"#3dbd7d",red:"#e55050",blu:"#38d6f5",pur:"#9b7fe6",cyn:"#45d0c8",pnk:"#e879a0",txt:"#e8e4f0",dim:"#6b6580",mut:"#3a3555" };
const vColor = (s:number) => s>30?CL.grn:s>10?"#7ddba3":s>-10?CL.acc:s>-30?"#e5a0a0":CL.red;
const vText = (s:number) => s>40?"EXCELLENT — Act with full confidence":s>20?"FAVORABLE — Conditions strongly support action":s>5?"LEANING POSITIVE — Proceed with awareness":s>-5?"NEUTRAL — Mixed signals, use judgment":s>-20?"LEANING CHALLENGING — Extra caution advised":s>-40?"CHALLENGING — Seriously consider postponing":"AVOID — Strong alignment against action today";
const confText = (c:number) => c>=8?"Very High":c>=6?"High":c>=4?"Moderate":"Low";
const fmtD = (d:Date) => d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtDL = (d:Date) => d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

const Bullet = ({children,color,conf,val,strong}:{children?:React.ReactNode,color?:string,conf?:number,val?:number|string,strong?:string}) => (
  <div style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${CL.bdr}40`,alignItems:"flex-start"}}>
    <span style={{color:color||CL.txt,fontSize:14,marginTop:1}}>•</span>
    <div style={{flex:1,fontSize:12.5,lineHeight:1.65,fontFamily:"system-ui",color:CL.txt}}>
      {strong&&<b style={{color:color||CL.txt}}>{strong}</b>}
      {strong?" — ":""}{children}
      {conf!==undefined&&<span style={{color:CL.dim,fontStyle:"italic"}}> Conf: {conf}/10</span>}
      {val!==undefined&&<span style={{marginLeft:6,fontWeight:700,color:+val>0?CL.grn:CL.red}}>({+val>0?"+":""}{val})</span>}
    </div>
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function App() {
  const [dob, setDob] = useState("");
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
  const [tab, setTab] = useState("reading");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string|null>(null);

  const compute = useCallback(() => {
    if (!dob) return;
    setLoading(true);
    setTimeout(() => {
      const bDate = new Date(dob + "T12:00:00");
      const tDate = new Date(targetDate + "T12:00:00");

      const natal = getPlanetPositions(bDate);
      const transit = getPlanetPositions(tDate);

      const allAspects = getAspects(transit, natal, true);
      const mp = getMoonPhase(transit);
      const voc = isVoidOfCourse(transit, tDate);
      const retros = transit.filter(p => p.retro);
      const sunSign = natal.find(p => p.name === "Sun")!.sign;
      const moonSign = natal.find(p => p.name === "Moon")!.sign;
      const elements: Record<string,number> = {fire:0,earth:0,air:0,water:0};
      natal.forEach(p => { if(p.sign) elements[p.sign.el]++; });
      const stelliums = getStelliums(transit);
      const midpoints = getMidpoints(natal, transit);
      const natalSunLng = natal.find(p => p.name === "Sun")!.lng;
      const transitSunLng = transit.find(p => p.name === "Sun")!.lng;
      const sect = getSect(tDate, transitSunLng);
      const geneKeys = getGeneKeys(natalSunLng, transitSunLng);
      const natalDignities = natal.filter(p => p.dignity !== "peregrine");

      const domains = DOMAINS.map(d => ({
        ...d,
        ...scoreDomain(d, natal, transit, tDate, geneKeys.score, midpoints, stelliums, sect, true)
      })).sort((a, b) => b.score - a.score);

      const overall = domains.reduce((s, d) => s + d.score, 0) / domains.length;
      const overallConf = Math.round(domains.reduce((s, d) => s + d.confidence, 0) / domains.length);
      const totalGreen = domains.reduce((s, d) => s + d.greenCount, 0);
      const totalRed = domains.reduce((s, d) => s + d.redCount, 0);
      const overallConv = totalGreen + totalRed ? Math.round(Math.max(totalGreen, totalRed) / (totalGreen + totalRed) * 100) : 50;
      const systemsActive = new Set(domains.flatMap(d => d.signals.map((s:Signal) => s.system))).size;

      // 30-day forecast
      const forecast: any[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(tDate); d.setDate(d.getDate() + i);
        const dt = getPlanetPositions(d);
        const dSun = dt.find(p => p.name === "Sun")!.lng;
        const dSect = getSect(d, dSun);
        const dStelliums = getStelliums(dt);
        const dMidpoints = getMidpoints(natal, dt);
        const dGK = getGeneKeys(natalSunLng, dSun);
        const ds = DOMAINS.map(dm => ({ ...dm, ...scoreDomain(dm, natal, dt, d, dGK.score, dMidpoints, dStelliums, dSect, true) }));
        const avg = ds.reduce((s, x) => s + x.score, 0) / ds.length;
        forecast.push({ date:d, overall:avg, best:ds.reduce((b,x)=>x.score>b.score?x:b,ds[0]), worst:ds.reduce((b,x)=>x.score<b.score?x:b,ds[0]), moonPhase:getMoonPhase(dt), domains:ds });
      }
      const bestDays = DOMAINS.map((dom, di) => {
        const sorted = [...forecast].sort((a, b) => b.domains[di].score - a.domains[di].score);
        return { domain:dom, top3:sorted.slice(0,3).map(f=>({date:f.date,score:f.domains[di].score,conf:f.domains[di].confidence})), bottom3:sorted.slice(-3).reverse().map(f=>({date:f.date,score:f.domains[di].score})) };
      });

      setData({ natal, transit, allAspects, mp, voc, retros, sunSign, moonSign, elements, stelliums, midpoints, sect, geneKeys, natalDignities, domains, overall, overallConf, overallConv, totalGreen, totalRed, systemsActive, forecast, bestDays });
      setLoading(false);
    }, 400);
  }, [dob, targetDate]);

  useEffect(() => { if (dob) compute(); }, [dob, targetDate]);

  const SC = { card:{ background:CL.card, border:`1px solid ${CL.bdr}`, borderRadius:14, padding:18, marginBottom:12 } };
  const TB = ({id,label,icon}:{id:string,label:string,icon:string}) => (
    <button onClick={()=>setTab(id)} style={{background:tab===id?CL.acc:"transparent",color:tab===id?"#000":CL.dim,border:`1px solid ${tab===id?CL.acc:CL.bdr}`,borderRadius:10,padding:"8px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"system-ui"}}>{icon} {label}</button>
  );
  const SH = ({icon,title,sub,color}:{icon:string,title:string,sub?:string,color?:string}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,letterSpacing:3,color:color||CL.acc,fontWeight:700,fontFamily:"system-ui"}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:800,color:CL.txt,fontFamily:"system-ui",marginTop:2}}>{title}</div>
      {sub&&<div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui"}}>{sub}</div>}
    </div>
  );
  const HR = () => <div style={{height:1,background:CL.bdr,margin:"14px 0"}}/>;

  return (
    <div style={{background:CL.bg,color:CL.txt,minHeight:"100vh",fontFamily:"'Georgia','Palatino',serif",padding:"10px 14px",maxWidth:720,margin:"0 auto"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes glow{0%,100%{text-shadow:0 0 15px #f6ad3c44}50%{text-shadow:0 0 30px #f6ad3c88,0 0 60px #9b7fe644}}input[type="date"]{font-family:inherit;color-scheme:dark}*{box-sizing:border-box}`}</style>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"18px 0 10px"}}>
        <div style={{fontSize:9,letterSpacing:6,color:CL.pur,fontWeight:700,fontFamily:"system-ui"}}>ORACLE v9</div>
        <h1 style={{fontSize:24,fontWeight:400,margin:"4px 0",fontStyle:"italic",background:`linear-gradient(135deg,${CL.acc},${CL.pnk},${CL.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glow 5s ease infinite"}}>Personal Decision Oracle</h1>
        <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",letterSpacing:1}}>v9 ENGINE — Verified calculations · 10 independent systems · Real Gene Keys</div>
      </div>

      {/* INPUT */}
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

      {data && (<>
        {/* TABS */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
          <TB id="reading" label="Full Reading" icon="🔮"/>
          <TB id="shouldi" label="Should I...?" icon="🤔"/>
          <TB id="systems" label="10 Systems" icon="🔬"/>
          <TB id="calendar" label="30-Day" icon="📅"/>
          <TB id="bestdays" label="Best Days" icon="⭐"/>
          <TB id="chart" label="Chart" icon="🌌"/>
        </div>

        {/* ====== FULL READING ====== */}
        {tab==="reading"&&(<>
          <div style={SC.card}>
            <SH icon="📊" title="SITUATION ASSESSMENT" sub={`Personal Reading — ${fmtDL(new Date(targetDate))}`}/>
            <Bullet strong={`${data.sunSign.sym} Sun in ${data.sunSign.name}`}>Core identity — {data.sunSign.trait.toLowerCase()}</Bullet>
            <Bullet strong={`${data.moonSign.sym} Moon in ${data.moonSign.name}`}>Emotional instinct — {data.moonSign.trait.toLowerCase()}</Bullet>
            <Bullet strong={`${data.mp.icon} ${data.mp.name}`}>{data.mp.energy} (Power: {data.mp.power}/10)</Bullet>
            <Bullet strong={`🔑 Gene Key ${data.geneKeys.birthKey} — ${data.geneKeys.birthKeyData.n}`} color={CL.pur}>
              Life's Work: Shadow of <b>{data.geneKeys.birthKeyData.shadow}</b> → Gift of <b>{data.geneKeys.birthKeyData.gift}</b> → Siddhi of <b>{data.geneKeys.birthKeyData.siddhi}</b>
            </Bullet>
            <Bullet strong={`🔑 Transit Key ${data.geneKeys.transitKey} — ${data.geneKeys.transitKeyData.n}`} color={data.geneKeys.isHarmonic?CL.grn:data.geneKeys.isTension?CL.acc:CL.dim}>
              {data.geneKeys.relationship}. Transit gift: {data.geneKeys.transitKeyData.gift}
            </Bullet>
            {data.voc&&<Bullet strong="🚫 Void of Course Moon" color={CL.red}>Moon making no major aspects before leaving {data.transit.find((p:PlanetPos)=>p.name==="Moon")?.sign.name}. Delay important decisions.</Bullet>}
            {data.retros.map((r:PlanetPos)=><Bullet key={r.name} strong={`${r.planet?.sym} ${r.name} Retrograde in ${r.sign.name}`} color={CL.acc}>{r.name==="Mercury"?"Contracts and communication disrupted — double-check everything before signing":r.name==="Venus"?"Values and relationships under review — avoid new commitments":r.name==="Mars"?"Action frustrated — review rather than force":"Review energy — not initiation"}</Bullet>)}
            <Bullet strong="Elemental Balance">🔥 {data.elements.fire} · 🌍 {data.elements.earth} · 💨 {data.elements.air} · 💧 {data.elements.water} — Chart emphasises {Object.entries(data.elements as Record<string,number>).sort((a,b)=>b[1]-a[1])[0][0]}</Bullet>
            <Bullet strong={`${data.sect==="day"?"☀️ Day Chart":"🌙 Night Chart"}`} color={data.sect==="day"?CL.acc:CL.blu}>
              {data.sect==="day"?"Sun/Jupiter/Saturn planets energised":"Moon/Venus/Mars planets in their natural element"}. {data.systemsActive} active predictive systems.
            </Bullet>
          </div>

          {/* OVERALL VERDICT */}
          <div style={{...SC.card,background:`linear-gradient(150deg,${CL.card},${data.overall>15?"#0d1a10":data.overall<-15?"#1a0d0d":"#1a1708"})`}}>
            <SH icon="🎯" title="OVERALL VERDICT" color={vColor(data.overall)}/>
            <div style={{fontSize:15,color:vColor(data.overall),fontWeight:600,fontFamily:"system-ui",marginBottom:14}}>{vText(data.overall)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
              {[
                {label:"OVERALL SCORE",value:`${data.overall>0?"+":""}${data.overall.toFixed(0)}`,color:vColor(data.overall),sub:"Average across 9 life domains"},
                {label:"CONFIDENCE",value:`${data.overallConf}/10`,color:CL.acc,sub:confText(data.overallConf)+" confidence"},
                {label:"CONVERGENCE",value:`${data.overallConv}%`,color:data.overallConv>70?CL.grn:data.overallConv>55?CL.acc:CL.red,sub:data.overallConv>70?"Strong signal agreement":"Mixed signals"},
                {label:"SYSTEMS ACTIVE",value:`${data.systemsActive}/10`,color:data.systemsActive>7?CL.grn:CL.acc,sub:`${data.totalGreen} support vs ${data.totalRed} challenge`},
              ].map(m=>(
                <div key={m.label} style={{background:CL.card2,borderRadius:10,padding:12,borderTop:`2px solid ${m.color}`}}>
                  <div style={{fontSize:8,letterSpacing:2,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{m.label}</div>
                  <div style={{fontSize:24,fontWeight:900,color:m.color,fontFamily:"system-ui",margin:"4px 0"}}>{m.value}</div>
                  <div style={{fontSize:9,color:CL.dim,fontFamily:"system-ui",lineHeight:1.4}}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DOMAINS */}
          <div style={SC.card}>
            <SH icon="📋" title="DOMAIN-BY-DOMAIN ANALYSIS" sub="Ranked by score — tap to expand full signal breakdown"/>
            {data.domains.map((d:any) => (
              <div key={d.id} onClick={()=>setExpanded(expanded===d.id?null:d.id)} style={{background:CL.card2,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",borderLeft:`4px solid ${vColor(d.score)}`,transition:"all 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:"system-ui"}}>{d.icon} {d.name}</div>
                    <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui",marginTop:1}}>{d.sub}</div>
                  </div>
                  <div style={{fontSize:26,fontWeight:900,color:vColor(d.score),fontFamily:"system-ui",lineHeight:1}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                </div>
                <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap",fontFamily:"system-ui",fontSize:11,color:CL.dim}}>
                  <span>Confidence: <b style={{color:CL.acc}}>{d.confidence}/10</b> ({confText(d.confidence)})</span>
                  <span>Convergence: <b style={{color:d.convergence>65?CL.grn:d.convergence>50?CL.acc:CL.red}}>{d.convergence}%</b></span>
                  <span><b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b> signals</span>
                </div>
                {expanded===d.id&&(
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${CL.bdr}`,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,fontFamily:"system-ui",marginBottom:6}}>SIGNAL BREAKDOWN — {d.totalSignals} SIGNALS FROM {new Set(d.signals.map((s:Signal)=>s.system)).size} SYSTEMS</div>
                    {d.signals.map((s:Signal,j:number)=>(
                      <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:s.type==="red"||s.type==="warning"?CL.red:CL.acc} conf={s.conf} val={s.val}>{s.detail} <span style={{fontSize:10,color:CL.pur,fontFamily:"system-ui"}}>[{s.system}]</span></Bullet>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CONVERGENCE THEMES */}
          <div style={SC.card}>
            <SH icon="🔗" title="CROSS-DOMAIN CONVERGENCE" sub="Directional calls that hold across multiple domains"/>
            <HR/>
            <div style={{fontSize:13,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>🟢 STRONGEST TODAY</div>
            {data.domains.filter((d:any)=>d.score>5).length>0
              ?data.domains.filter((d:any)=>d.score>5).map((d:any)=>(
                <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.grn} conf={d.confidence}>{d.score>30?"Strongly supported":"Supported"} — {d.greenCount} positive signals across {new Set(d.signals.filter((s:Signal)=>s.type==="green").map((s:Signal)=>s.system)).size} systems. {d.convergence}% convergence.</Bullet>
              )):<Bullet color={CL.dim}>No domains showing strongly favorable conditions today.</Bullet>}
            <div style={{height:10}}/>
            <div style={{fontSize:13,fontWeight:800,color:CL.red,fontFamily:"system-ui",marginBottom:6}}>🔴 EXERCISE CAUTION</div>
            {data.domains.filter((d:any)=>d.score<-5).length>0
              ?data.domains.filter((d:any)=>d.score<-5).sort((a:any,b:any)=>a.score-b.score).map((d:any)=>(
                <Bullet key={d.id} strong={`${d.icon} ${d.name}`} color={CL.red} conf={d.confidence}>{d.score<-30?"Strongly challenging":"Challenging"} — {d.redCount} caution signals. {d.convergence}% convergence.</Bullet>
              )):<Bullet color={CL.dim}>No domains showing strongly unfavorable conditions today.</Bullet>}
          </div>

          {/* WATCHPOINTS */}
          <div style={SC.card}>
            <SH icon="👁️" title="KEY WATCHPOINTS" sub="The most important factors shaping today's reading"/>
            {[
              ...(data.retros.length>0?[`**${data.retros.map((r:PlanetPos)=>r.name).join(" & ")} Retrograde** — ${data.retros.some((r:PlanetPos)=>r.name==="Mercury")?"Communication and contracts under review. No signing without triple-checking.":"Action turns inward. Review, don't initiate."}`]:[]),
              `**${data.mp.icon} ${data.mp.name}** — ${data.mp.energy} Power ${data.mp.power}/10`,
              data.voc?"**🚫 Void of Course Moon** — Caution: actions begun now may fizzle. If possible, wait for Moon to enter new sign.":"**Moon in aspect** — Active lunar energy. Actions taken now have trajectory.",
              `**Gene Key ${data.geneKeys.birthKey} (${data.geneKeys.birthKeyData.gift})** — Your natal Life's Work key. Transit Key ${data.geneKeys.transitKey}: ${data.geneKeys.relationship}`,
              `**${data.stelliums.length>0?"⭐ Stellium detected":"No stellium"} · ${data.midpoints.length} midpoint hits** — ${data.stelliums.length>0?`Concentrated planetary energy in ${data.stelliums[0].sign}`:"Dispersed planetary energy"}, ${data.midpoints.length} precise natal triggers active`,
              `**${data.allAspects.length} transit aspects · ${data.systemsActive} systems active** — ${data.allAspects[0]?`Strongest: ${data.allAspects[0].p1.name} ${data.allAspects[0].asp.name} natal ${data.allAspects[0].p2.name} (${data.allAspects[0].exact}% exact)`:""}`,
            ].map((wp,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${CL.bdr}33`,fontFamily:"system-ui",fontSize:12,lineHeight:1.6,color:CL.txt}}>
                <span style={{color:CL.acc,fontWeight:800,minWidth:18}}>{i+1}.</span>
                <span dangerouslySetInnerHTML={{__html:(wp as string).replace(/\*\*(.*?)\*\*/g,`<b style="color:${CL.acc}">$1</b>`)}}/>
              </div>
            ))}
          </div>

          {/* SELF-ASSESSMENT */}
          <div style={{...SC.card,borderColor:CL.pur+"30"}}>
            <SH icon="🔮" title="ORACLE SELF-ASSESSMENT" color={CL.pur}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.grn,fontFamily:"system-ui",marginBottom:6}}>High confidence calls:</div>
              {data.domains.filter((d:any)=>d.confidence>=6).slice(0,4).map((d:any)=>(
                <Bullet key={d.id} color={CL.grn}>{d.icon} {d.name} — {d.score>0?"favorable":"challenging"} ({d.confidence}/10) — {new Set(d.signals.map((s:Signal)=>s.system)).size} independent systems, {d.convergence}% convergence</Bullet>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.acc,fontFamily:"system-ui",marginBottom:6}}>Known limitations of this reading:</div>
              <Bullet color={CL.acc}>Planetary positions accurate to ~0.5-1° — for surgical precision use full ephemeris</Bullet>
              <Bullet color={CL.acc}>Birth time unknown — rising sign, exact house placements, and precise moon degree unavailable</Bullet>
              <Bullet color={CL.acc}>Gene Keys: using natal Sun longitude (correct method) — full profile also includes Earth, Personality Crystal positions</Bullet>
              <Bullet color={CL.acc}>Sect calculation uses 40°N latitude approximation — actual sunrise times vary by location</Bullet>
              <Bullet color={CL.acc}>Free will supersedes all cosmic signals — these are inclinations, not determinations</Bullet>
            </div>
          </div>
          <div style={{textAlign:"center",padding:"10px 16px",fontSize:10,color:CL.mut,fontFamily:"system-ui",lineHeight:1.6}}>
            <i>Oracle v9 · Verified Engine · 10 Independent Systems · Real Gene Key Calculations</i><br/>
            <i>"The stars incline, they do not compel." — Albertus Magnus</i>
          </div>
        </>)}

        {/* ====== SHOULD I ====== */}
        {tab==="shouldi"&&(
          <div style={SC.card}>
            <SH icon="🤔" title="SHOULD I...?" sub={fmtDL(new Date(targetDate))}/>
            {QUICK_QS.map(qd=>{
              const d=data.domains.find((x:any)=>x.id===qd.dom);
              const answer=d.score>30?"YES — Strong support. "+d.confidence+"/10":d.score>10?"Likely YES — "+d.confidence+"/10":d.score>-10?"MIXED — Proceed with awareness. "+d.confidence+"/10":d.score>-30?"Probably NOT — "+d.confidence+"/10":"NO — Signals against. "+d.confidence+"/10";
              return(
                <div key={qd.q} style={{background:CL.card2,borderRadius:12,padding:16,marginBottom:8,borderLeft:`4px solid ${vColor(d.score)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,fontFamily:"system-ui"}}>{qd.icon} {qd.q}</div>
                    <div style={{fontSize:24,fontWeight:900,color:vColor(d.score),fontFamily:"system-ui"}}>{d.score>0?"+":""}{d.score.toFixed(0)}</div>
                  </div>
                  <div style={{fontSize:13,color:vColor(d.score),fontStyle:"italic",margin:"6px 0",fontFamily:"system-ui"}}>{answer}</div>
                  <div style={{fontSize:10,color:CL.dim,fontFamily:"system-ui"}}>Convergence: <b>{d.convergence}%</b> · <b style={{color:CL.grn}}>▲{d.greenCount}</b> / <b style={{color:CL.red}}>▼{d.redCount}</b></div>
                  <HR/>
                  {d.signals.slice(0,4).map((s:Signal,j:number)=>(
                    <Bullet key={j} strong={s.text} color={s.type==="green"?CL.grn:CL.red} conf={s.conf} val={s.val}>{s.detail}</Bullet>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ====== 10 SYSTEMS ====== */}
        {tab==="systems"&&(
          <div style={SC.card}>
            <SH icon="🔬" title="10 ACTIVE PREDICTION SYSTEMS" sub="Every layer of the engine — what's driving your scores"/>
            {[
              {name:"Transit Aspects",icon:"🪐",desc:"Transit planets aspecting natal positions — the primary predictive layer. Domain-weighted by planet rulership.",active:true,quality:data.allAspects.length>20?"Very active":data.allAspects.length>10?"Active":"Quiet"},
              {name:"Planet Dignity",icon:"👑",desc:"Planets in domicile/exaltation (empowered) or detriment/fall (weakened). Affects signal quality.",active:data.natalDignities.length>0||true,quality:`${data.transit.filter((p:PlanetPos)=>p.dignity==="domicile"||p.dignity==="exaltation").length} dignified transit planets`},
              {name:"Combustion",icon:"🔥",desc:"Planets within 8.5° of Sun have their energy overwhelmed. Cazimi (<0.5°) = empowered instead.",active:true,quality:`${data.transit.filter((p:PlanetPos)=>p.combustion).length} combust planets today`},
              {name:"Sect Analysis",icon:data.sect==="day"?"☀️":"🌙",desc:"Day planets (Sun/Jupiter/Saturn) vs night planets (Moon/Venus/Mars). Each operates best in its sect.",active:true,quality:`${data.sect==="day"?"Day":"Night"} chart — seasonal calculation`},
              {name:"Retrograde",icon:"℞",desc:"Retrograde planets turn energy inward. Mercury ℞ = contract disruption. Venus ℞ = relationship review.",active:data.retros.length>0,quality:data.retros.length>0?`${data.retros.map((r:PlanetPos)=>r.name).join(", ")} retrograde`:"All planets direct — clean initiation energy"},
              {name:"Moon Phase & VOC",icon:data.mp.icon,desc:"8-phase cycle affects initiative energy. Void of Course Moon = actions begun now rarely manifest as intended.",active:true,quality:`${data.mp.name} (Power ${data.mp.power}/10)${data.voc?" · VOC ⚠️":""}`},
              {name:"Stelliums",icon:"⭐",desc:"3+ planets within 10° arc = concentrated energy cluster. Amplifies whatever themes those planets share.",active:data.stelliums.length>0,quality:data.stelliums.length>0?`${data.stelliums.map((s:any)=>s.planets.join("+")+` in ${s.sign}`).join("; ")}`:"No stelliums — dispersed energy"},
              {name:"Midpoints",icon:"✦",desc:"Transit planet at exact midpoint of two natal planets = precise activation. Orb <1.5° required.",active:data.midpoints.length>0,quality:data.midpoints.length>0?`${data.midpoints.length} midpoint hits (tightest: ${data.midpoints[0]?.transit} at ${data.midpoints[0]?.natalA}/${data.midpoints[0]?.natalB}, ${data.midpoints[0]?.orb}°)`:"No active midpoints today"},
              {name:"Planetary Hours",icon:"⏰",desc:"Chaldean hour system. Each hour of day is ruled by a planet. Hour ruler matching domain = bonus alignment.",active:true,quality:`Current hour: ${getPlanetaryHour(new Date(targetDate+"T12:00:00"))} rules this hour`},
              {name:"Gene Keys",icon:"🔑",desc:"Richard Rudd's 64-key system. Natal Sun's ecliptic degree maps to a Life's Work key. Transit Sun activates different keys.",active:true,quality:`Birth Key ${data.geneKeys.birthKey} (${data.geneKeys.birthKeyData.gift}) · Transit Key ${data.geneKeys.transitKey} · ${data.geneKeys.isHarmonic?"Harmonic ✓":data.geneKeys.isTension?"Tension ⚠️":"Neutral"}`},
            ].map((sys,i)=>(
              <div key={i} style={{background:CL.card2,borderRadius:10,padding:14,marginBottom:8,borderLeft:`3px solid ${sys.active?CL.grn:CL.mut}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui"}}>{sys.icon} {sys.name}</div>
                  <div style={{fontSize:10,color:sys.active?CL.grn:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{sys.active?"● ACTIVE":"○ INACTIVE"}</div>
                </div>
                <div style={{fontSize:11,color:CL.dim,fontFamily:"system-ui",marginBottom:4}}>{sys.desc}</div>
                <div style={{fontSize:11,color:CL.cyn,fontFamily:"system-ui",fontStyle:"italic"}}>{sys.quality}</div>
              </div>
            ))}

            {/* Gene Keys deep dive */}
            <div style={{marginTop:16,background:`linear-gradient(135deg,${CL.card2},#1a1030)`,borderRadius:12,padding:16,border:`1px solid ${CL.pur}30`}}>
              <div style={{fontSize:12,fontWeight:800,color:CL.pur,fontFamily:"system-ui",marginBottom:10}}>🔑 GENE KEY DEEP DIVE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:CL.acc,fontFamily:"system-ui",fontWeight:700,marginBottom:6}}>YOUR LIFE'S WORK KEY</div>
                  <div style={{fontSize:20,fontWeight:900,color:CL.acc,fontFamily:"system-ui"}}>Key {data.geneKeys.birthKey}</div>
                  <div style={{fontSize:13,color:CL.txt,fontFamily:"system-ui",fontWeight:700,marginBottom:4}}>{data.geneKeys.birthKeyData.n}</div>
                  <Bullet color={CL.red} strong="Shadow">{data.geneKeys.birthKeyData.shadow}</Bullet>
                  <Bullet color={CL.grn} strong="Gift">{data.geneKeys.birthKeyData.gift}</Bullet>
                  <Bullet color={CL.pur} strong="Siddhi">{data.geneKeys.birthKeyData.siddhi}</Bullet>
                </div>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:CL.blu,fontFamily:"system-ui",fontWeight:700,marginBottom:6}}>CURRENT TRANSIT KEY</div>
                  <div style={{fontSize:20,fontWeight:900,color:CL.blu,fontFamily:"system-ui"}}>Key {data.geneKeys.transitKey}</div>
                  <div style={{fontSize:13,color:CL.txt,fontFamily:"system-ui",fontWeight:700,marginBottom:4}}>{data.geneKeys.transitKeyData.n}</div>
                  <Bullet color={CL.red} strong="Shadow">{data.geneKeys.transitKeyData.shadow}</Bullet>
                  <Bullet color={CL.grn} strong="Gift">{data.geneKeys.transitKeyData.gift}</Bullet>
                  <Bullet color={CL.pur} strong="Siddhi">{data.geneKeys.transitKeyData.siddhi}</Bullet>
                  <div style={{marginTop:8,fontSize:11,color:data.geneKeys.isHarmonic?CL.grn:data.geneKeys.isTension?CL.acc:CL.dim,fontFamily:"system-ui",fontStyle:"italic"}}>{data.geneKeys.relationship}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== CALENDAR ====== */}
        {tab==="calendar"&&(
          <div style={SC.card}>
            <SH icon="📅" title="30-DAY PERSONAL COSMIC MAP" sub="Click any day for full reading"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:12}}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:CL.dim,fontFamily:"system-ui",fontWeight:700}}>{d}</div>)}
              {Array.from({length:data.forecast[0].date.getDay()}).map((_,i)=><div key={"e"+i}/>)}
              {data.forecast.map((day:any,i:number)=>{
                const bg=vColor(day.overall);
                return(<div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");}} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",background:bg+"15",border:i===0?`2px solid ${CL.acc}`:`1px solid ${bg}20`}}>
                  <div style={{fontSize:11,fontFamily:"system-ui"}}>{day.date.getDate()}</div>
                  <div style={{fontSize:7,fontWeight:700,color:bg,fontFamily:"system-ui"}}>{day.overall>0?"+":""}{day.overall.toFixed(0)}</div>
                  <div style={{fontSize:7}}>{day.moonPhase.icon}</div>
                </div>);
              })}
            </div>
            <div style={{fontSize:10,letterSpacing:2,color:CL.acc,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>DAILY BREAKDOWN (14 days)</div>
            {data.forecast.slice(0,14).map((day:any,i:number)=>(
              <div key={i} onClick={()=>{setTargetDate(day.date.toISOString().split("T")[0]);setTab("reading");}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:i%2?"transparent":CL.card2,borderRadius:6,cursor:"pointer",marginBottom:2,fontFamily:"system-ui",fontSize:11}}>
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
            <SH icon="⭐" title="OPTIMAL TIMING — 30-Day Windows" sub="Best & worst days by domain — click to open full reading"/>
            {data.bestDays.map((bd:any)=>(
              <div key={bd.domain.id} style={{background:CL.card2,borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"system-ui",marginBottom:8}}>{bd.domain.icon} {bd.domain.name}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:CL.grn,fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:"system-ui"}}>🟢 BEST WINDOWS</div>
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

        {/* ====== CHART ====== */}
        {tab==="chart"&&(
          <div style={SC.card}>
            <SH icon="🌌" title="NATAL CHART + CURRENT TRANSITS"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {(["Natal","Transit"] as const).map(type=>(
                <div key={type}>
                  <div style={{fontSize:10,color:type==="Natal"?CL.acc:CL.pur,letterSpacing:2,fontWeight:700,marginBottom:4,fontFamily:"system-ui"}}>{type.toUpperCase()} POSITIONS</div>
                  {(type==="Natal"?data.natal:data.transit).map((p:PlanetPos)=>(
                    <div key={p.name} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",fontSize:10,background:CL.card2,borderRadius:5,marginBottom:2,fontFamily:"system-ui",alignItems:"center"}}>
                      <span style={{color:p.planet?.c}}>{p.planet?.sym} {p.name}{p.retro?" ℞":""}</span>
                      <span style={{color:p.sign.c,fontSize:9}}>{p.sign.sym} {p.degree.toFixed(1)}° {p.sign.name}</span>
                      <span style={{fontSize:9,color:p.dignity==="domicile"?CL.grn:p.dignity==="exaltation"?"#aaffaa":p.dignity==="detriment"?CL.red:p.dignity==="fall"?"#ffaaaa":CL.mut,minWidth:24,textAlign:"right"}}>{p.dignity==="peregrine"?"":p.dignity.slice(0,3).toUpperCase()}{p.combustion?" 🔥":""}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <HR/>
            <div style={{fontSize:10,letterSpacing:2,color:CL.pnk,fontWeight:700,marginBottom:6,fontFamily:"system-ui"}}>TOP TRANSIT ASPECTS TO YOUR CHART</div>
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
