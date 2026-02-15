import fetch from "node-fetch";

const GROQ_ENDPOINT = "https://api.groq.com/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Промпт, задающий «психолога»
const SYSTEM_PROMPT = `
Ты – опытный психолог, умеющий вести эмпатичный диалог, задавать открытые вопросы и поддерживать человека в сложных эмоциональных состояниях. Не давай советов, если не уверен, а лучше уточняй и помогай человеку осознать свои чувства.
`;

export async function getGroqResponse(userMessage) {
  const body = {
    model: "groq-llama3-8b-8192",   // или любой доступный вам
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  };

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
