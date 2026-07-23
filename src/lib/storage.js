// A minimal localStorage-backed stand-in for the Claude-artifact `window.storage`
// API this project was originally built against.
//
// IMPORTANT LIMITATION: localStorage is per-browser only. Accounts created
// here can only be logged into from the SAME browser/device they were
// created on — there is no real cross-device account system without a
// backend. For a real product, replace this file with calls to your own
// API (Supabase, Firebase, a Node/Express + database, etc.) while keeping
// the same get/set/delete(key, shared) function signatures so nothing else
// in the app has to change.

const NS = "roastverse";

const fullKey = (key, shared) => `${NS}:${shared ? "shared" : "personal"}:${key}`;

export const storage = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(fullKey(key, shared));
    if (raw === null) return null;
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(fullKey(key, shared), raw);
    return { key, value: raw, shared };
  },

  async delete(key, shared = false) {
    localStorage.removeItem(fullKey(key, shared));
    return { key, deleted: true, shared };
  },

  async list(prefix = "", shared = false) {
    const base = `${NS}:${shared ? "shared" : "personal"}:`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(base + prefix)) keys.push(k.slice(base.length));
    }
    return { keys, prefix, shared };
  },
};
