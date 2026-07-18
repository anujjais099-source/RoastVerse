// ==========================================
// RoastVerse v5
// Theme Controller
// ==========================================

export function initTheme() {

    const body = document.body;

    const btn = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    const text = document.getElementById("themeText");

    if (!btn) return;

    let theme = localStorage.getItem("theme") || "dark";

    applyTheme(theme);

    btn.addEventListener("click", () => {

        theme = theme === "dark"
            ? "light"
            : "dark";

        localStorage.setItem("theme", theme);

        applyTheme(theme);

    });

    function applyTheme(mode) {

        body.classList.remove("dark", "light");

        body.classList.add(mode);

        if (mode === "dark") {

            icon.textContent = "🌙";
            text.textContent = "Dark Mode";

        } else {

            icon.textContent = "☀️";
            text.textContent = "Light Mode";

        }

    }

}