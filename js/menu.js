// ==========================================
// RoastVerse v5
// Sidebar Controller
// ==========================================

export function initMenu() {

    const menuBtn = document.getElementById("menuToggle");
    const closeBtn = document.getElementById("closeMenu");
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");

    if (!menuBtn || !drawer || !overlay) return;

    function openMenu() {
        drawer.classList.add("open");
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeMenu() {
        drawer.classList.remove("open");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
    }

    menuBtn.addEventListener("click", openMenu);

    if (closeBtn) {
        closeBtn.addEventListener("click", closeMenu);
    }

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMenu();
        }
    });

}