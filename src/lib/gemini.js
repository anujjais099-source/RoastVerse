// Calls the Gemini API through a Supabase Edge Function instead of calling
// Google directly from the browser — this keeps the Gemini API key on the
// server, out of the client bundle entirely. See supabase/functions/roast/.

import { supabase } from "./supabase";

export function dataUrlToImageBlock(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) return null;
  return { type: "image", source: { type: "base64", media_type: match[1], data: match[2] } };
}

export async function callGemini(content) {
  const { data, error } = await supabase.functions.invoke("roast", {
    body: { content },
  });

  if (error) {
    throw new Error(error.message || "Couldn't reach the roast function");
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.text) {
    throw new Error("Empty response from Gemini");
  }
  return data.text;
}
