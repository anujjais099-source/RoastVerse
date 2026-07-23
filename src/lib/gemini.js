// Wrapper around Google's Gemini API (generateContent), replacing the
// Anthropic API bridge that was available inside the Claude artifact sandbox.
//
// Get a key from https://aistudio.google.com/apikey and put it in .env as
// VITE_GEMINI_API_KEY=your_key_here (copy .env.example to .env first).

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// `content` is either:
//   - a plain string (text-only prompt), or
//   - an array of Claude-style content blocks, e.g.
//     [{ type: "image", source: { type: "base64", media_type, data } }, { type: "text", text }]
// Keeping that shape (rather than Gemini's native shape) throughout the app
// means the rest of the codebase doesn't need to know which provider it's
// talking to — only this file does the translation.
function toGeminiParts(content) {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  return content.map((block) => {
    if (block.type === "image") {
      return { inlineData: { mimeType: block.source.media_type, data: block.source.data } };
    }
    return { text: block.text };
  });
}

export function dataUrlToImageBlock(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) return null;
  return { type: "image", source: { type: "base64", media_type: match[1], data: match[2] } };
}

export async function callGemini(content) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key — add VITE_GEMINI_API_KEY to your .env file");
  }

  const response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: toGeminiParts(content) }],
      generationConfig: { maxOutputTokens: 200 },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini API error ${response.status}`);
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text).filter(Boolean).join("").trim();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}
