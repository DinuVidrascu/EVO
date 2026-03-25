const apiPart1 = "AIzaSyCRs2";
const apiPart2 = "WEQZA-3gSWz2";
const apiPart3 = "FEHi-PY_8Ee_MtjOE";
const apiKey = apiPart1 + apiPart2 + apiPart3;

// Modele disponibile in 2025 (in ordine de prioritate)
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

// Rate limiter: min 1.5s intre cereri
let lastCallTime = 0;
const MIN_INTERVAL_MS = 1500;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const fetchGemini = async (
  prompt,
  systemInstruction = "Ești un asistent de productivitate util.",
  retries = 2
) => {
  // Rate limiting global
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await sleep(MIN_INTERVAL_MS - elapsed);
  }
  lastCallTime = Date.now();

  for (let modelIdx = 0; modelIdx < MODELS.length; modelIdx++) {
    const model = MODELS[modelIdx];
    // gemini-2.0 merge pe v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
            }
          })
        });

        // 429 = prea multe cereri → asteapta + retry
        if (response.status === 429) {
          const waitMs = Math.pow(2, attempt + 1) * 1500;
          console.warn(`[Gemini] 429 Rate limit (${model}). Retry in ${waitMs}ms`);
          if (attempt < retries) { await sleep(waitMs); continue; }
          else break; // incearca modelul urmator
        }

        // 5xx server errors → retry
        if (response.status >= 500) {
          if (attempt < retries) { await sleep(1500); continue; }
          break;
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Gemini] HTTP ${response.status}:`, errText);
          break; // trece la modelul urmator
        }

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        if (data.promptFeedback?.blockReason) {
          return "Răspunsul a fost filtrat din motive de siguranță. Încearcă altă formulare.";
        }
        throw new Error("Răspuns invalid de la API.");

      } catch (e) {
        console.error(`[Gemini] Eroare model ${model}, attempt ${attempt}:`, e.message);
        if (attempt < retries) await sleep(1000);
      }
    }
  }

  throw new Error(
    "Serviciul AI este suprasolicitat momentan. Așteaptă 30 de secunde și încearcă din nou."
  );
};
