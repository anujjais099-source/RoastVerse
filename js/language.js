// ==========================================
// RoastVerse v5
// Language Controller
// Part 1
// ==========================================

const translations = {

    en: {

        currentLanguage: "English",

        home: "Home",
        roast: "Roast",

        tagline: "AI Roasts. Real Savage.",

        uploadTitle: "Upload Your Friend",
        uploadSubtitle: "Drop a photo and let AI deliver a legendary roast.",

        dragPhoto: "Click to Upload",
        uploadHint: "JPG • PNG • WEBP",

        friendName: "Friend's Name",
        friendPlaceholder: "Enter your friend's name",

        roastButton: "Roast Now",

        loadingTitle: "Cooking the Perfect Roast...",
        loadingText: "AI is analyzing your friend's face and preparing something savage.",

        resultTitle: "DAMAGE DELIVERED",
        roastLevel: "Roast Level",

        copy: "Copy",
        share: "Share",
        again: "Roast Again",

        tips: "Tips",

        tip1: "Upload a clear face photo.",
        tip2: "AI generates funny but safe roasts.",
        tip3: "Share your roast with friends."

    },



    hi: {

        currentLanguage: "हिन्दी",

        home: "होम",
        roast: "रोस्ट",

        tagline: "AI रोस्ट्स। असली सैवेज।",

        uploadTitle: "अपने दोस्त की फोटो अपलोड करें",
        uploadSubtitle: "फोटो डालें और AI को काम करने दें।",

        dragPhoto: "फोटो चुनें",
        uploadHint: "JPG • PNG • WEBP",

        friendName: "दोस्त का नाम",
        friendPlaceholder: "दोस्त का नाम लिखें",

        roastButton: "रोस्ट करें",

        loadingTitle: "रोस्ट तैयार हो रहा है...",
        loadingText: "AI आपके दोस्त का विश्लेषण कर रहा है...",

        resultTitle: "डैमेज डिलीवर",

        roastLevel: "रोस्ट लेवल",

        copy: "कॉपी",

        share: "शेयर",

        again: "फिर से रोस्ट",

        tips: "सुझाव",

        tip1: "साफ़ चेहरा अपलोड करें।",

        tip2: "AI सुरक्षित और मजेदार रोस्ट बनाता है।",

        tip3: "अपने दोस्तों के साथ शेयर करें।"

    },



    es: {

        currentLanguage: "Español",

        home: "Inicio",

        roast: "Roast",

        tagline: "IA. Bromas. Sin Piedad.",

        uploadTitle: "Sube la Foto",

        uploadSubtitle: "La IA hará un roast legendario.",

        dragPhoto: "Haz clic para subir",

        uploadHint: "JPG • PNG • WEBP",

        friendName: "Nombre",

        friendPlaceholder: "Escribe un nombre",

        roastButton: "Hacer Roast",

        loadingTitle: "Preparando el roast...",

        loadingText: "La IA está analizando la imagen...",

        resultTitle: "DAÑO ENTREGADO",

        roastLevel: "Nivel",

        copy: "Copiar",

        share: "Compartir",

        again: "Otra vez",

        tips: "Consejos",

        tip1: "Sube una foto clara.",

        tip2: "Los roasts son seguros y divertidos.",

        tip3: "Compártelo con tus amigos."

    },

        fr: {

        currentLanguage: "Français",

        home: "Accueil",

        roast: "Roast",

        tagline: "L'IA. Des Roasts. Sans Pitié.",

        uploadTitle: "Téléchargez une Photo",

        uploadSubtitle: "Laissez l'IA créer un roast légendaire.",

        dragPhoto: "Cliquez pour télécharger",

        uploadHint: "JPG • PNG • WEBP",

        friendName: "Nom",

        friendPlaceholder: "Entrez un nom",

        roastButton: "Lancer le Roast",

        loadingTitle: "Préparation du roast...",

        loadingText: "L'IA analyse la photo...",

        resultTitle: "ROAST TERMINÉ",

        roastLevel: "Niveau",

        copy: "Copier",

        share: "Partager",

        again: "Recommencer",

        tips: "Conseils",

        tip1: "Téléchargez une photo nette.",

        tip2: "Les roasts sont amusants et respectueux.",

        tip3: "Partagez avec vos amis."

    },



    de: {

        currentLanguage: "Deutsch",

        home: "Startseite",

        roast: "Roast",

        tagline: "KI. Echte Savage-Roasts.",

        uploadTitle: "Foto Hochladen",

        uploadSubtitle: "Lass die KI einen legendären Roast erstellen.",

        dragPhoto: "Zum Hochladen klicken",

        uploadHint: "JPG • PNG • WEBP",

        friendName: "Name",

        friendPlaceholder: "Name eingeben",

        roastButton: "Jetzt Roasten",

        loadingTitle: "Roast wird vorbereitet...",

        loadingText: "Die KI analysiert das Bild...",

        resultTitle: "ROAST FERTIG",

        roastLevel: "Roast-Level",

        copy: "Kopieren",

        share: "Teilen",

        again: "Erneut Roasten",

        tips: "Tipps",

        tip1: "Lade ein klares Foto hoch.",

        tip2: "Die KI erstellt lustige und sichere Roasts.",

        tip3: "Mit Freunden teilen."

    }

};


// ==========================================
// Apply Language
// ==========================================

function applyLanguage(lang) {

    const dictionary = translations[lang];

    if (!dictionary) return;

    document.querySelectorAll("[data-lang]").forEach((element) => {

        const key = element.dataset.lang;

        if (dictionary[key]) {
            element.textContent = dictionary[key];
        }

    });

    const friendInput = document.getElementById("friendName");

    if (friendInput) {
        friendInput.placeholder = dictionary.friendPlaceholder;
    }

    const currentLanguage = document.getElementById("currentLanguage");

    if (currentLanguage) {
        currentLanguage.textContent = dictionary.currentLanguage;
    }

    localStorage.setItem("language", lang);

}


// ==========================================
// Export
// ==========================================

export function initLanguage() {

    const savedLanguage = localStorage.getItem("language") || "en";

    applyLanguage(savedLanguage);

    const languageToggle = document.getElementById("languageToggle");
    const languageMenu = document.getElementById("languageMenu");

    if (!languageToggle || !languageMenu) return;

    languageToggle.addEventListener("click", (e) => {

        e.stopPropagation();

        languageMenu.classList.toggle("show");

    });

    languageMenu.querySelectorAll("button").forEach((button) => {

        button.addEventListener("click", () => {

            const language = button.dataset.language;

            applyLanguage(language);

            languageMenu.classList.remove("show");

        });

    });

    document.addEventListener("click", (e) => {

        if (!languageMenu.contains(e.target) &&
            !languageToggle.contains(e.target)) {

            languageMenu.classList.remove("show");

        }

    });

}

