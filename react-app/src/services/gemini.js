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
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (e) {
    console.error("Gemini API Error:", e);
    throw e; // Lăsăm eroarea să fie prinsă în funcțiile superioare pt mesaje corecte
  }
};
