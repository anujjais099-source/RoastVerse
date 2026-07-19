// ==========================================
// RoastVerse v5
// Roast Controller
// ==========================================

export function initRoast() {

    const roastBtn = document.getElementById("roastBtn");

    if (!roastBtn) return;

    roastBtn.addEventListener("click", generateRoast);

}

async function generateRoast() {

    const photoInput = document.getElementById("photoInput");
    const friendName = document.getElementById("friendName");

    if (!photoInput.files.length) {

        showToast("Please upload a photo.");

        return;

    }

    const file = photoInput.files[0];

    const formData = new FormData();

    formData.append("photo", file);

    formData.append("name", friendName.value.trim());

    showLoading();

    startProgress();

    try {

       const response = await fetch(
           "https://roastverse-api.onrender.com/roast",
           {
               method: "POST",
               body: formData
            }
        );
        const data = await response.json();

        if (!response.ok) {
           throw new Error(data.message || "Failed to generate roast.");
        }

        hideLoading();

        showResult(data);

    } catch (err) {

        hideLoading();

        showToast(err.message);

        console.error(err);

    }

}

// ==========================================
// Loading Screen
// ==========================================

let progressTimer = null;

function showLoading() {

    const loadingSection = document.getElementById("loadingSection");
    const resultCard = document.getElementById("resultCard");

    loadingSection?.classList.remove("hidden");
    resultCard?.classList.add("hidden");

}

function hideLoading() {

    const loadingSection = document.getElementById("loadingSection");

    loadingSection?.classList.add("hidden");

    clearInterval(progressTimer);

}

function startProgress() {

    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");

    let value = 0;

    clearInterval(progressTimer);

    progressFill.style.width = "0%";
    progressPercent.textContent = "0%";

    progressTimer = setInterval(() => {

        if (value >= 95) {

            clearInterval(progressTimer);

            return;

        }

        value += Math.floor(Math.random() * 8) + 2;

        if (value > 95) value = 95;

        progressFill.style.width = value + "%";
        progressPercent.textContent = value + "%";

    }, 180);

}


// ==========================================
// Result
// ==========================================

function showResult(data) {

    clearInterval(progressTimer);

    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");

    progressFill.style.width = "100%";
    progressPercent.textContent = "100%";

    setTimeout(() => {

        hideLoading();

        const resultCard = document.getElementById("resultCard");

        resultCard.classList.remove("hidden");
        resultCard.classList.add("fadeScale");

        document.getElementById("resultPhoto").src =
            data.photo || URL.createObjectURL(
                document.getElementById("photoInput").files[0]
            );

        const friendNameInput = document.getElementById("friendName");

        document.getElementById("resultName").textContent =
            friendNameInput.value.trim() || "Friend";

        document.getElementById("roastText").textContent =
            data.roast || "No roast returned.";

        animateMeter(
            data.score ?? Math.floor(Math.random() * 31) + 70
        );

    }, 300);

}


// ==========================================
// Roast Meter
// ==========================================

function animateMeter(score) {

    const meterFill = document.getElementById("meterFill");
    const roastPercent = document.getElementById("roastPercent");

    let current = 0;

    meterFill.style.width = "0%";
    roastPercent.textContent = "0%";

    const timer = setInterval(() => {

        current++;

        meterFill.style.width = current + "%";
        roastPercent.textContent = current + "%";

        if (current >= score) {

            clearInterval(timer);

        }

    }, 15);

}


// ==========================================
// Toast
// ==========================================

function showToast(message) {

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) {

        alert(message);

        return;

    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ==========================================
// Result Buttons
// ==========================================

document.addEventListener("click", (e) => {

    if (e.target.id === "copyBtn") {

        navigator.clipboard.writeText(
            document.getElementById("roastText").textContent
        );

        showToast("Roast copied!");

    }

    if (e.target.id === "againBtn") {

        location.reload();

    }

});