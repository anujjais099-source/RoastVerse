// ==========================
// RoastVerse v3
// App Logic
// ==========================

// Elements
const photoInput = document.getElementById("photoInput");
const previewImage = document.getElementById("previewImage");
const uploadContent = document.getElementById("uploadContent");

const friendName = document.getElementById("friendName");

const roastBtn = document.getElementById("roastBtn");

const loadingSection = document.getElementById("loadingSection");
const resultCard = document.getElementById("resultCard");

const roastText = document.getElementById("roastText");

const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const againBtn = document.getElementById("againBtn");

import { initMenu } from "./menu.js";
import { initTheme } from "./theme.js";
import { initUpload } from "./upload.js";
import { initRoast } from "./roast.js";
import { initShare } from "./share.js";
import { initLanguage } from "./language.js";
initLanguage();


console.log("🔥 RoastVerse Started");

initMenu();
initTheme();
initUpload();
initRoast();
initShare();