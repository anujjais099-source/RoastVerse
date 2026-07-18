import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================
// Multer (Image Upload)
// ==========================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});

// ==========================
// Gemini AI
// ==========================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ==========================
// Test Route
// ==========================

app.get("/", (req, res) => {
    res.send("RoastVerse API Running 🚀");
});

// ==========================
// Roast API
// ==========================

app.post("/roast", upload.single("photo"), async (req, res) => {

    try {

        // Check image
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image."
            });
        }

        const friendName = req.body.name || "Friend";

        const prompt = `
You are RoastVerse AI.

Roast the person in this image.

Their name is ${friendName}.

Rules:
- Funny
- Savage
- Maximum 2 sentences
- No hate speech
- No racism
- No sexual jokes
- Return ONLY the roast.
`;

        // ===============================
        // Gemini Request
        // ===============================

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });

        const roast = response.text;

        return res.json({
            success: true,
            roast
        });

    } catch (err) {

        console.error("\n==============================");
        console.error("🔥 GEMINI ERROR");
        console.error("==============================");
        console.error(err);
        console.error("==============================\n");

        // Rate Limit
        if (
            err.status === 429 ||
            err.code === 429 ||
            err?.error?.code === 429
        ) {
            return res.status(429).json({
                success: false,
                type: "RATE_LIMIT",
                message: "Too many requests. Please wait a minute and try again."
            });
        }

        // Invalid API Key
        if (
            err.status === 401 ||
            err.code === 401
        ) {
            return res.status(401).json({
                success: false,
                type: "INVALID_API_KEY",
                message: "AI service configuration error."
            });
        }

        // Timeout
        if (
            err.name === "AbortError" ||
            err.code === "ETIMEDOUT"
        ) {
            return res.status(504).json({
                success: false,
                type: "TIMEOUT",
                message: "AI took too long to respond."
            });
        }

        // Network Error
        if (
            err.code === "ECONNRESET" ||
            err.code === "ENOTFOUND" ||
            err.code === "ECONNREFUSED"
        ) {
            return res.status(503).json({
                success: false,
                type: "NETWORK",
                message: "Unable to connect to AI service."
            });
        }

        // Unknown Error
        return res.status(500).json({
            success: false,
            type: "UNKNOWN",
            message: "Something went wrong while generating the roast."
        });

    }

});

// ==========================
// Start Server
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

});