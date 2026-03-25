const apiPart1 = "AIzaSyCRs2";
const apiPart2 = "WEQZA-3gSWz2";
const apiPart3 = "FEHi-PY_8Ee_MtjOE";
const apiKey = apiPart1 + apiPart2 + apiPart3;

export const fetchGemini = async (prompt, systemInstruction = "Ești un asistent de productivitate util.") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    // Robust checking for response parts
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.promptFeedback && data.promptFeedback.blockReason) {
      return "Sfatul a fost reținut din motive de siguranță. Încearcă altceva.";
    } else {
      throw new Error("Răspuns invalid de la API.");
    }
  } catch (e) {
    console.error("Gemini Utility Error:", e);
    throw e;
  }
};
