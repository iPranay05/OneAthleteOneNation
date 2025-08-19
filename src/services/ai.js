// Simple AI service for generating training plans via Google Gemini API
// Reads API key from EXPO_PUBLIC_GEMINI_API_KEY at runtime.

// Robustly extract JSON from a model text response
function extractJson(text) {
  let cleaned = (text || '').trim();

  // Remove code fences like ```json ... ```
  cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');

  // Slice from the first { or [ to the last } or ]
  const braceIdx = cleaned.indexOf('{');
  const bracketIdx = cleaned.indexOf('[');
  let start = cleaned.length;
  if (braceIdx !== -1) start = Math.min(start, braceIdx);
  if (bracketIdx !== -1) start = Math.min(start, bracketIdx);
  let candidate = start < cleaned.length ? cleaned.slice(start) : cleaned;

  const lastBrace = candidate.lastIndexOf('}');
  const lastBracket = candidate.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);
  if (endIdx !== -1) candidate = candidate.slice(0, endIdx + 1);

  // Remove comment lines that break JSON
  candidate = candidate
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      return !(t.startsWith('//') || t.startsWith('#'));
    })
    .join('\n');

  // Normalize curly quotes to straight quotes
  candidate = candidate.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // Attempt 1: raw
  try { return JSON.parse(candidate); } catch (e1) {}

  // Attempt 2: remove trailing commas
  let tmp = candidate.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(tmp); } catch (e2) {}

  // Attempt 3: quote unquoted keys
  tmp = tmp.replace(/([,{\s\n\r\t])([A-Za-z_][A-Za-z0-9_\-]*)\s*:/g, '$1"$2":');
  try { return JSON.parse(tmp); } catch (e3) {}

  // Attempt 4: convert single-quoted strings to double quotes
  tmp = tmp.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  return JSON.parse(tmp);
}

// Career development guidance
export async function generateCareerGuidance({ sport, age, level = 'amateur', goals = '', location = '', education = '', interests = '' }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      summary: `Career roadmap suggestions for a ${level} ${sport} athlete in ${location || 'your area'}.`,
      recommendedPaths: ['Athlete progression', 'Coaching certifications', 'Sports management/analytics', 'Content creation/brand'],
      skillsToDevelop: ['Networking', 'Strength & conditioning basics', 'Communication', 'Video analysis'],
      nextSteps: ['Create athlete CV and highlight reel', 'Enroll in a relevant certification', 'Attend 1-2 meets/workshops monthly', 'Set up LinkedIn and portfolio'],
      resources: [
        { name: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning' },
        { name: 'Coursera Sports Courses', url: 'https://www.coursera.org' },
        { name: 'Khelo India', url: 'https://kheloindia.gov.in' }
      ],
    };
  }

  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const system = [
    'You are a sports career counselor for athletes. Return STRICT JSON only with keys:',
    '{summary, recommendedPaths[], skillsToDevelop[], nextSteps[], resources:[{name, url}]}.',
    'Keep advice practical for the athlete profile provided. No extra text, only JSON.'
  ].join(' ');
  const user = `Sport: ${sport}\nAge: ${age}\nLevel: ${level}\nGoals: ${goals}\nLocation: ${location}\nEducation: ${education || 'N/A'}\nInterests: ${interests || 'N/A'}`;

  try {
    const body = { contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 400 } };
    let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return extractJson(text);
  } catch (e) {
    return {
      summary: 'High-level career guidance (fallback).',
      recommendedPaths: ['Coaching', 'Strength & Conditioning', 'Sports management', 'Content creation'],
      skillsToDevelop: ['Networking', 'Certifications', 'Public speaking'],
      nextSteps: ['Draft CV/portfolio', 'Reach out to 3 mentors', 'Enroll in 1 cert course'],
      resources: [
        { name: 'NSCA (S&C)', url: 'https://www.nsca.com' },
        { name: 'World Athletics Learning', url: 'https://www.worldathletics.org' }
      ],
    };
  }
}

// Financial help and budgeting guidance
export async function generateFinancialHelp({ sport, age, location = '', income = 0, expenses = 0, goal = '', situation = '', sponsorshipType = '', achievementLevel = '', socialMedia = '' }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      summary: 'Budget and funding suggestions (mock).',
      budgetTips: ['Track expenses weekly', 'Aim 10-15% savings', 'Prioritize essentials around training'],
      fundingOptions: ['Local sponsorships', 'State federation grants', 'Crowdfunding', 'Part-time coaching'],
      scholarships: ['Khelo India', 'State sports scholarships'],
      nextSteps: ['Make 3 sponsor outreach emails', 'Apply to 2 grants', 'Set monthly budget'],
      warnings: ['Avoid high-interest loans'],
      sponsorshipAdvice: ['Build social media presence', 'Document achievements', 'Create athlete portfolio'],
    };
  }

  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const system = [
    'You are a financial advisor for athletes. Provide practical budgeting, funding advice, and sponsorship guidance.',
    'Return JSON with structure:',
    '{summary, budgetTips[], fundingOptions[], scholarships[], sponsorshipAdvice[], nextSteps[], warnings[]}.',
    'Include specific sponsorship strategies if sponsorship info is provided. Make it actionable and region-aware if location is provided. Only JSON.'
  ].join(' ');
  const sponsorshipInfo = sponsorshipType || achievementLevel || socialMedia ? 
    `\nSponsorship type needed: ${sponsorshipType || 'N/A'}\nAchievement level: ${achievementLevel || 'N/A'}\nSocial media presence: ${socialMedia || 'N/A'}` : '';
  const user = `Sport: ${sport}\nAge: ${age}\nLocation: ${location}\nMonthly income: ${income}\nMonthly expenses: ${expenses}\nPrimary goal: ${goal}\nCurrent situation: ${situation || 'N/A'}${sponsorshipInfo}`;

  try {
    const body = { contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 360 } };
    let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return extractJson(text);
  } catch (e) {
    return {
      summary: 'Fallback financial help guidance.',
      budgetTips: ['50/30/20 rule as a starting point', 'Automate savings'],
      fundingOptions: ['Local sponsors', 'Grants', 'Crowdfunding'],
      scholarships: ['Regional federation programs'],
      nextSteps: ['Draft simple monthly budget', 'Prepare sponsor pitch'],
      warnings: ['Beware of predatory loans'],
    };
  }
}

export async function generatePlanWithAI({ sport, goal, weeks = 4, daysPerWeek = 5, injuries = '' }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const title = `${weeks}-week ${sport} Plan: ${goal}`;

  // Fallback: no key, return a mock plan
  if (!apiKey) {
    return {
      title,
      detail: `AI-generated mock plan for ${sport}. Goal: ${goal}. Duration: ${weeks} weeks, ${daysPerWeek} days/week.`,
      status: 'Planned',
      schedule: [
        { day: 'Mon', items: ['Warm-up mobility', 'Acceleration drills', '3x200m @ 75%'] },
        { day: 'Tue', items: ['Strength (Lower)', 'Core 10m'] },
        { day: 'Wed', items: ['Tempo run 4km', 'Stretch 15m'] },
        { day: 'Thu', items: ['Plyometrics', '4x150m @ 80%'] },
        { day: 'Fri', items: ['Strength (Upper)', 'Mobility 15m'] },
        { day: 'Sat', items: ['Easy run 3km', 'Foam roll'] },
        { day: 'Sun', items: ['Rest'] },
      ],
    };
  }
  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const system = [
    'You are an expert athletic coach. Create a concise weekly training plan.',
    'Return STRICT JSON only with keys: title (string), detail (string), status (string="Planned"),',
    'schedule (array of 7 objects: {day: string (Mon..Sun), items: string[]}).',
    'No code fences. No extra commentary. JSON only.'
  ].join(' ');

  const user = `Sport: ${sport}\nGoal: ${goal}\nWeeks: ${weeks}\nDays per week: ${daysPerWeek}\nInjuries/constraints: ${injuries || 'None'}`;

  try {
    const body = {
      contents: [
        { role: 'user', parts: [{ text: `${system}\n\n${user}` }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    };

    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      parsed = extractJson(text);
    } catch (e) {
      // Very defensive fallback: try to coerce a minimal structure
      parsed = {
        title,
        detail: `Generated plan for ${sport}. Goal: ${goal}.`,
        status: 'Planned',
        schedule: [
          { day: 'Mon', items: ['Easy run 3km', 'Mobility 10m'] },
          { day: 'Tue', items: ['Strength (Full body)'] },
          { day: 'Wed', items: ['Intervals 6x400m @ 80%'] },
          { day: 'Thu', items: ['Cross-training 30m'] },
          { day: 'Fri', items: ['Strength (Upper)'] },
          { day: 'Sat', items: ['Long easy run 5-7km'] },
          { day: 'Sun', items: ['Rest'] },
        ],
      };
    }

    // Normalize fields
    if (!parsed.title) parsed.title = title;
    if (!parsed.detail) parsed.detail = `AI plan for ${sport} - ${goal}`;
    if (!parsed.status) parsed.status = 'Planned';
    if (!Array.isArray(parsed.schedule)) parsed.schedule = [];
    parsed.schedule = parsed.schedule.map((d) => ({
      day: d?.day || 'Day',
      items: Array.isArray(d?.items) ? d.items : (d?.items ? [String(d.items)] : []),
    }));

    return parsed;
  } catch (err) {
    // On any failure, return a safe mock plan
    return {
      title,
      detail: `Fallback plan due to error. ${err?.message || 'Unknown error.'}`,
      status: 'Planned',
      schedule: [
        { day: 'Mon', items: ['Mobility 10m', 'Easy jog 2km'] },
        { day: 'Tue', items: ['Strength (Lower)'] },
        { day: 'Wed', items: ['Tempo 3km'] },
        { day: 'Thu', items: ['Cross-training 20m'] },
        { day: 'Fri', items: ['Strength (Upper)'] },
        { day: 'Sat', items: ['Intervals 6x200m @ 80%'] },
        { day: 'Sun', items: ['Rest'] },
      ],
    };
  }
}

// AI Workout Generation
export async function generateWorkout({ sport, level, duration, goals, equipment, disability, focusArea }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  // Fallback workout when no API key
  if (!apiKey) {
    return {
      title: `${sport} Workout - ${level} Level`,
      duration: parseInt(duration) || 45,
      difficulty: level || 'beginner',
      focusArea: focusArea || 'general',
      exercises: [
        {
          name: 'Warm-up',
          sets: 1,
          reps: '5-10 minutes',
          description: 'Light cardio and dynamic stretching',
          adaptations: disability ? `Adapted for ${disability}: Use seated movements or assistive devices as needed` : 'Standard warm-up routine'
        },
        {
          name: 'Main Exercise 1',
          sets: 3,
          reps: '8-12',
          description: `${sport}-specific movement pattern`,
          adaptations: disability ? `Modified for ${disability}: Adjust range of motion and use supportive equipment` : 'Standard execution'
        },
        {
          name: 'Main Exercise 2',
          sets: 3,
          reps: '10-15',
          description: 'Strength building exercise',
          adaptations: disability ? `Accessible version for ${disability}: Focus on functional movements` : 'Standard form'
        },
        {
          name: 'Cool-down',
          sets: 1,
          reps: '5-10 minutes',
          description: 'Static stretching and relaxation',
          adaptations: 'Gentle stretching suitable for all ability levels'
        }
      ],
      notes: [
        'Listen to your body and adjust intensity as needed',
        disability ? `Special considerations for ${disability}: Ensure proper support and safety measures` : 'Maintain proper form throughout',
        equipment ? `Equipment used: ${equipment}` : 'Bodyweight exercises',
        'Stay hydrated and take breaks when necessary'
      ]
    };
  }

  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const system = [
    'You are an adaptive fitness coach specializing in inclusive workouts for athletes with disabilities.',
    'Create a detailed workout plan that considers accessibility needs.',
    'Return STRICT JSON only with keys:',
    '{title, duration (number), difficulty, focusArea, exercises: [{name, sets, reps, description, adaptations}], notes: []}.',
    'Include specific adaptations for the disability type mentioned.',
    'No code fences. No extra commentary. JSON only.'
  ].join(' ');

  const disabilityInfo = disability ? `\nDisability considerations: ${disability}` : '';
  const equipmentInfo = equipment ? `\nAvailable equipment: ${equipment}` : '\nEquipment: Bodyweight/minimal equipment';
  
  const user = `Sport: ${sport}\nLevel: ${level}\nDuration: ${duration} minutes\nGoals: ${goals}\nFocus area: ${focusArea}${disabilityInfo}${equipmentInfo}`;

  try {
    const body = {
      contents: [
        { role: 'user', parts: [{ text: `${system}\n\n${user}` }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return extractJson(text);
  } catch (error) {
    // Return fallback workout on any error
    return {
      title: `${sport} Workout - ${level} Level (Fallback)`,
      duration: parseInt(duration) || 45,
      difficulty: level || 'beginner',
      focusArea: focusArea || 'general',
      exercises: [
        {
          name: 'Dynamic Warm-up',
          sets: 1,
          reps: '8-10 minutes',
          description: 'Prepare body for workout with light movements',
          adaptations: disability ? `Adapted for ${disability}: Use chair-based or supported movements` : 'Full range of motion'
        },
        {
          name: `${sport} Skill Practice`,
          sets: 4,
          reps: '6-10',
          description: 'Sport-specific technique work',
          adaptations: disability ? `Modified technique for ${disability}` : 'Standard technique focus'
        },
        {
          name: 'Strength Circuit',
          sets: 3,
          reps: '8-15',
          description: 'Build functional strength',
          adaptations: disability ? `Accessible strength exercises for ${disability}` : 'Progressive overload'
        },
        {
          name: 'Recovery Stretch',
          sets: 1,
          reps: '10-15 minutes',
          description: 'Cool down and flexibility work',
          adaptations: 'Gentle stretching for all abilities'
        }
      ],
      notes: [
        `Workout generated due to API error: ${error.message}`,
        'Always prioritize safety and proper form',
        disability ? `Special attention needed for ${disability} considerations` : 'Standard safety protocols',
        'Modify intensity based on energy levels and comfort'
      ]
    };
  }
}

// Generic chat with Gemini
export async function chatWithAI({ messages = [], system = 'You are a helpful fitness assistant.' }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const model = 'gemini-1.5-flash';
  
  console.log('API Key check:', apiKey ? `Found key: ${apiKey.substring(0, 10)}...` : 'No API key found');
  console.log('Environment variables:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
  
  if (!apiKey) {
    const last = messages[messages.length - 1]?.content || '';
    return `No API key detected. Check .env file format: EXPO_PUBLIC_GEMINI_API_KEY=your_key`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  // Transform messages to Gemini format
  // Accept roles: 'user' | 'assistant'
  const contents = [
    { role: 'user', parts: [{ text: system }] },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const body = { contents, generationConfig: { temperature: 0.6, maxOutputTokens: 320 } };
  try {
    let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text.trim() || 'I do not have a response at the moment.';
  } catch (e) {
    console.log('Detailed API error:', e);
    console.log('Error message:', e.message);
    console.log('Error status:', e.status);
    
    const msg = String(e?.message || 'error');
    if (msg.includes('429')) {
      return 'The AI is rate-limited right now. Please wait a few seconds and try again.';
    }
    if (msg.includes('403')) {
      return 'API key is invalid or doesn\'t have permission. Check your Gemini API key.';
    }
    if (msg.includes('400')) {
      return 'Bad request to API. The request format may be incorrect.';
    }
    return `API Error: ${msg}. Check console for details.`;
  }
}

// Diet planning
export async function generateDietPlan({ age, sex, heightCm, weightKg, sport, goal = 'performance', restrictions = '' }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      title: 'Sample Balanced Diet Plan',
      calories: 2600,
      macros: { protein: '160g', carbs: '320g', fat: '86g' },
      meals: [
        { name: 'Breakfast', items: ['Oats + milk', 'Banana', 'Eggs'], calories: 650 },
        { name: 'Lunch', items: ['Grilled chicken', 'Rice', 'Salad'], calories: 800 },
        { name: 'Snack', items: ['Greek yogurt', 'Berries'], calories: 300 },
        { name: 'Dinner', items: ['Salmon', 'Sweet potato', 'Veggies'], calories: 850 },
      ],
      notes: 'Hydrate well. Adjust portions per training load.',
    };
  }

  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const system = [
    'You are a sports nutritionist. Return STRICT JSON only with keys:',
    'title, calories (number), macros {protein, carbs, fat},',
    'meals (array of {name, items[], calories}), notes.',
    'No extra text, only JSON.'
  ].join(' ');
  const user = `Age: ${age}\nSex: ${sex}\nHeight: ${heightCm} cm\nWeight: ${weightKg} kg\nSport: ${sport}\nGoal: ${goal}\nRestrictions: ${restrictions || 'None'}`;

  try {
    const body = { contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 500 } };
    let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return extractJson(text);
  } catch (e) {
    return {
      title: 'Diet Plan (Fallback)',
      calories: 2400,
      macros: { protein: '150g', carbs: '300g', fat: '80g' },
      meals: [
        { name: 'Breakfast', items: ['Oats', 'Milk', 'Eggs'], calories: 600 },
        { name: 'Lunch', items: ['Chicken', 'Rice', 'Veggies'], calories: 800 },
        { name: 'Snack', items: ['Peanut butter toast'], calories: 300 },
        { name: 'Dinner', items: ['Paneer/Tofu', 'Quinoa', 'Salad'], calories: 700 },
      ],
      notes: `Fallback due to error: ${e?.message || 'Unknown'}`,
    };
  }
}

// Injury advice
export async function generateInjuryAdvice({ area, duration, painScale, description }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      summary: `Likely soft-tissue strain around ${area}. Monitor and avoid aggravating movements.`,
      immediateCare: ['Rest', 'Ice 15-20m', 'Compression wrap', 'Elevate if swollen'],
      recommendedActions: ['Light mobility within pain-free range', 'NSAIDs if allowed', 'If worsening after 48-72h, consult physician'],
      warningSigns: ['Severe swelling/deformity', 'Numbness/tingling', 'Inability to bear weight'],
      seeDoctor: false,
    };
  }
  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const system = [
    'You are a licensed sports physio assistant. Return STRICT JSON only:',
    '{summary, immediateCare[], recommendedActions[], warningSigns[], seeDoctor:boolean}.',
    'Do not include medical diagnosis; provide guidance and red flags. JSON only.'
  ].join(' ');
  const user = `Area: ${area}\nDuration: ${duration}\nPain scale (0-10): ${painScale}\nDescription: ${description}`;
  try {
    const body = { contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 400 } };
    let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return extractJson(text);
  } catch (e) {
    return {
      summary: 'Generic rest and evaluation advice.',
      immediateCare: ['Rest', 'Ice', 'Compression', 'Elevation'],
      recommendedActions: ['If no improvement in 2-3 days, seek medical advice'],
      warningSigns: ['Severe pain, swelling, deformity'],
      seeDoctor: false,
    };
  }
}

// Symptom assessment (non-diagnostic guidance)
export async function assessSymptoms({ symptoms }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      possibleCauses: ['Overuse', 'Minor strain'],
      urgency: 'low',
      advice: 'Rest, hydrate, monitor. If symptoms persist/worsen, consult a professional.',
    };
  }
  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const system = [
    'You are a cautious medical triage assistant (not a doctor). Return STRICT JSON only:',
    '{possibleCauses[], urgency:"low|medium|high", advice}. Keep suggestions safe and general.'
  ].join(' ');
  const user = `Symptoms: ${symptoms}`;
  try {
    const body = { contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 240 } };
    let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 900));
      res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return extractJson(text);
  } catch (e) {
    return {
      possibleCauses: ['Unknown - needs evaluation'],
      urgency: 'medium',
      advice: 'If symptoms are concerning or persistent, seek professional medical advice promptly.',
    };
  }
}

// Nutrition analysis from food photos
export async function analyzeNutrition({ imageBase64, foodDescription = '' }) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  // Fallback nutrition data when no API key
  if (!apiKey) {
    return {
      foodName: foodDescription || 'Mixed Food Items',
      totalCalories: 450,
      servingSize: '1 plate',
      macros: {
        protein: '25g',
        carbs: '55g',
        fat: '18g',
        fiber: '8g'
      },
      micronutrients: {
        calcium: '150mg',
        iron: '3mg',
        vitaminC: '25mg',
        sodium: '680mg'
      },
      healthScore: 7.5,
      recommendations: [
        'Good protein content for muscle recovery',
        'Consider adding more vegetables for vitamins',
        'Watch sodium intake if you have blood pressure concerns'
      ],
      allergens: ['May contain gluten', 'Dairy products detected'],
      confidence: 'mock'
    };
  }

  const model = 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const system = [
    'You are a sports nutritionist AI. Analyze the food image and provide detailed nutrition information.',
    'Return STRICT JSON only with keys:',
    '{foodName, totalCalories (number), servingSize, macros: {protein, carbs, fat, fiber},',
    'micronutrients: {calcium, iron, vitaminC, sodium}, healthScore (1-10),',
    'recommendations: [], allergens: [], confidence: "high|medium|low"}.',
    'Focus on athletic nutrition needs. Be specific about portions and nutrients.',
    'No code fences. No extra commentary. JSON only.'
  ].join(' ');

  const userPrompt = foodDescription ? 
    `Analyze this food image. Additional context: ${foodDescription}` : 
    'Analyze this food image and provide detailed nutrition information for an athlete.';

  try {
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: system },
            { text: userPrompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600
      }
    };

    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return extractJson(text);
  } catch (error) {
    // Return fallback nutrition analysis on error
    return {
      foodName: foodDescription || 'Food Analysis',
      totalCalories: 380,
      servingSize: '1 serving',
      macros: {
        protein: '20g',
        carbs: '45g',
        fat: '15g',
        fiber: '6g'
      },
      micronutrients: {
        calcium: '120mg',
        iron: '2.5mg',
        vitaminC: '15mg',
        sodium: '520mg'
      },
      healthScore: 7.0,
      recommendations: [
        'Analysis unavailable - manual estimation provided',
        'Consider consulting a nutritionist for precise tracking',
        'Focus on balanced meals with protein, carbs, and vegetables'
      ],
      allergens: ['Unable to detect allergens from image'],
      confidence: 'low',
      error: `Analysis failed: ${error.message}`
    };
  }
}
