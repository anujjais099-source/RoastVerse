// ==========================================
// RoastVerse v5
// Upload Controller
// ==========================================

export function initUpload() {

    const photoInput = document.getElementById("photoInput");
    const uploadArea = document.getElementById("uploadArea");
    const previewContainer = document.getElementById("previewContainer");
    const previewImage = document.getElementById("previewImage");
    const uploadPlaceholder = document.getElementById("uploadPlaceholder");
    const removePhoto = document.getElementById("removePhoto");

    if (
        !photoInput ||
        !uploadArea ||
        !previewContainer ||
        !previewImage ||
        !uploadPlaceholder
    ) {
        return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;

    const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    // ==========================
    // File Selected
    // ==========================

    photoInput.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file) return;

        handleFile(file);

    });

    // ==========================
    // Remove Image
    // ==========================

    if (removePhoto) {

        removePhoto.addEventListener("click", (e) => {

            e.preventDefault();
            e.stopPropagation();

            resetUpload();

        });

    }

    // ==========================
    // Drag Events
    // ==========================

    ["dragenter", "dragover"].forEach(event => {

        uploadArea.addEventListener(event, (e) => {

            e.preventDefault();

            uploadArea.classList.add("dragging");

        });

    });

    ["dragleave", "dragend"].forEach(event => {

        uploadArea.addEventListener(event, () => {

            uploadArea.classList.remove("dragging");

        });

    });

    uploadArea.addEventListener("drop", (e) => {

        e.preventDefault();

        uploadArea.classList.remove("dragging");

        const file = e.dataTransfer.files[0];

        if (file) {

            handleFile(file);

        }

    });
 
     // ==========================
    // Handle File
    // ==========================

    function handleFile(file) {

        // File type validation
        if (!ALLOWED_TYPES.includes(file.type)) {

            showToast("Please upload JPG, PNG or WEBP image.");

            resetUpload();

            return;

        }

        // File size validation
        if (file.size > MAX_SIZE) {

            showToast("Maximum image size is 10 MB.");

            resetUpload();

            return;

        }

        const reader = new FileReader();

        reader.onload = (event) => {

            previewImage.src = event.target.result;

            uploadPlaceholder.classList.add("hidden");

            previewContainer.classList.remove("hidden");

            previewContainer.classList.add("fadeScale");

        };

        reader.readAsDataURL(file);

    }


    // ==========================
    // Reset Upload
    // ==========================

    function resetUpload() {

        photoInput.value = "";

        previewImage.src = "";

        previewContainer.classList.add("hidden");

        uploadPlaceholder.classList.remove("hidden");

        uploadArea.classList.remove("dragging");

    }


    // ==========================
    // Toast Helper
    // ==========================

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

}

