// groqFallback.ts
// Handles Groq API fallback for text generation

export async function generateWithGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: prompt }
      ],
      temperature: 0.4,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'Unable to respond.';
}