// Supabase Edge Function: proxies requests to Gemini so the API key never
// has to be shipped to the browser. Deploy with:
//   supabase functions deploy roast
// and set the secret with:
//   supabase secrets set GEMINI_API_KEY=your_real_key_here

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// content is either a plain string, or an array of blocks:
// [{ type: "image", source: { type: "base64", media_type, data } }, { type: "text", text }]
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY secret on the server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content } = await req.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: toGeminiParts(content) }],
          generationConfig: { maxOutputTokens: 200 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || `Gemini API error ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text).filter(Boolean).join("").trim();

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
