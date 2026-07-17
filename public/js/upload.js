const flowerRain = document.getElementById("flowerRain");

const memoryForm = document.getElementById("memoryForm");
const guestNameInput = document.getElementById("guestName");
const messageInput = document.getElementById("message");
const messageCount = document.getElementById("messageCount");

const mediaInput = document.getElementById("media");
const uploadArea = document.getElementById("uploadArea");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const mediaPreview = document.getElementById("mediaPreview");
const removeMediaButton = document.getElementById("removeMediaButton");

const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");
const submitButtonText = document.getElementById("submitButtonText");

const successModal = document.getElementById("successModal");
const shareAnotherButton = document.getElementById("shareAnotherButton");

const footerCredit = document.getElementById("footerCredit");

const flowerColours = [
    "#F8C8DC",
    "#FFE4EC",
    "#F4B8B0",
    "#F9DCC4",
    "#F5E1D3",
    "#FFF5EE",
    "#E8D9E8",
    "#D9E8D5",
    "#FFFFFF"
];

const flowerTypes = [
    "flower-type-one",
    "flower-type-two",
    "flower-type-three"
];

let selectedPreviewUrl = null;
let footerClickCount = 0;
let footerClickTimer;

function randomNumber(minimum, maximum) {

    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;

}

function createFlowerRain() {

    if (!flowerRain) {
        return;
    }

    flowerRain.innerHTML = "";

    let numberOfFlowers = 65;

    if (window.innerWidth <= 480) {
        numberOfFlowers = 60;
        const isMobile = window.innerWidth <= 480;
    } else if (window.innerWidth <= 768) {
        numberOfFlowers = 55;
    }

    for (let i = 0; i < numberOfFlowers; i++) {

        const flower = document.createElement("span");

        const randomFlowerType =
            flowerTypes[
                Math.floor(Math.random() * flowerTypes.length)
            ];

        flower.classList.add(
            "falling-flower",
            randomFlowerType
        );

        const hasStrongWind = Math.random() < 0.12;

        flower.classList.add(
            hasStrongWind
                ? "windy-flower"
                : "normal-flower"
        );

        const size = isMobile
            ? hasStrongWind
                ? randomNumber(22, 38)
                : randomNumber(14, 30)
            : hasStrongWind
                ? randomNumber(15, 28)
                : randomNumber(8, 22);
        const flowerColour =
            flowerColours[
                Math.floor(Math.random() * flowerColours.length)
            ];

        flower.style.left = `${randomNumber(0, 100)}%`;

        flower.style.setProperty(
            "--flower-size",
            `${size}px`
        );

        flower.style.setProperty(
            "--flower-colour",
            flowerColour
        );

        flower.style.setProperty(
            "--flower-opacity",
            isMobile
                ? randomNumber(65, 100) / 100
                : randomNumber(35, 78) / 100
        );

        flower.style.setProperty(
            "--fall-duration",
            `${randomNumber(11, 22)}s`
        );

        flower.style.setProperty(
            "--flower-delay",
            `${randomNumber(-22, 0)}s`
        );

        flower.style.setProperty(
            "--small-drift",
            `${randomNumber(-22, 22)}px`
        );

        flower.style.setProperty(
            "--medium-drift",
            `${randomNumber(-38, 38)}px`
        );

        flower.style.setProperty(
            "--strong-drift",
            `${randomNumber(-100, 100)}px`
        );

        flower.style.setProperty(
            "--flower-blur",
            isMobile
                ? "0px"
                : `${size >= 25 ? 1 : 0}px`
        );

        flowerRain.appendChild(flower);
    }

}

function updateMessageCount() {

    messageCount.textContent = messageInput.value.length;

}

function clearPreview() {

    if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
        selectedPreviewUrl = null;
    }

    mediaInput.value = "";
    mediaPreview.innerHTML = "";

    uploadPlaceholder.classList.remove("hidden");
    mediaPreview.classList.remove("show");
    removeMediaButton.classList.remove("show");
    uploadArea.classList.remove("has-file");
}

function showSelectedMedia() {

    const selectedFile = mediaInput.files[0];

    if (!selectedFile) {
        clearPreview();
        return;
    }

    if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
    }

    selectedPreviewUrl = URL.createObjectURL(selectedFile);

    mediaPreview.innerHTML = "";

    let previewElement;

    if (selectedFile.type.startsWith("image/")) {

        previewElement = document.createElement("img");

        previewElement.src = selectedPreviewUrl;
        previewElement.alt = "Selected memory preview";

    } else if (selectedFile.type.startsWith("video/")) {

        previewElement = document.createElement("video");

        previewElement.src = selectedPreviewUrl;
        previewElement.controls = true;
        previewElement.playsInline = true;

    } else {

        setFormStatus(
            "Please choose an image or video file.",
            "error"
        );

        clearPreview();
        return;
    }

    mediaPreview.appendChild(previewElement);

    uploadPlaceholder.classList.add("hidden");
    mediaPreview.classList.add("show");
    removeMediaButton.classList.add("show");
    uploadArea.classList.add("has-file");

    setFormStatus("", "");
}

function setFormStatus(message, statusType) {

    formStatus.textContent = message;

    formStatus.className = "form-status";

    if (statusType) {
        formStatus.classList.add(statusType);
    }

}

function setSubmittingState(isSubmitting) {

    submitButton.disabled = isSubmitting;

    submitButtonText.textContent = isSubmitting
        ? "Sharing Memory..."
        : "Share Memory";

    submitButton.classList.toggle(
        "loading",
        isSubmitting
    );

}

function resetForm() {

    memoryForm.reset();

    updateMessageCount();
    clearPreview();
    setFormStatus("", "");
    setSubmittingState(false);

}

async function submitMemory(event) {

    event.preventDefault();

    const selectedFile = mediaInput.files[0];

    if (!guestNameInput.value.trim()) {

        setFormStatus(
            "Please enter your name.",
            "error"
        );

        guestNameInput.focus();
        return;
    }

    if (!selectedFile) {

        setFormStatus(
            "Please choose a photo or video.",
            "error"
        );

        return;
    }

    setSubmittingState(true);
    setFormStatus("Uploading your memory...", "loading");

    const formData = new FormData();

    formData.append(
        "guestName",
        guestNameInput.value.trim()
    );

    formData.append(
        "message",
        messageInput.value.trim()
    );

    formData.append(
        "media",
        selectedFile
    );

    try {

        const response = await fetch(
            "/api/memories",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "The memory could not be uploaded."
            );

        }

        setFormStatus("", "");
        successModal.classList.add("show");

    } catch (error) {

        console.error(error);

        setFormStatus(
            error.message ||
            "Something went wrong. Please try again.",
            "error"
        );

    } finally {

        setSubmittingState(false);

    }

}

function handleFooterClick() {

    footerClickCount++;

    clearTimeout(footerClickTimer);

    footerClickTimer = setTimeout(function () {
        footerClickCount = 0;
    }, 2500);

    if (footerClickCount === 5) {

        alert(
            "Memory Garden\n\nDesigned & developed by Dayana Sharafeena\n\n2026 ♡"
        );

        footerClickCount = 0;
    }

}

messageInput.addEventListener(
    "input",
    updateMessageCount
);

mediaInput.addEventListener(
    "change",
    showSelectedMedia
);

removeMediaButton.addEventListener(
    "click",
    clearPreview
);

memoryForm.addEventListener(
    "submit",
    submitMemory
);

shareAnotherButton.addEventListener(
    "click",
    function () {

        successModal.classList.remove("show");

        resetForm();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

footerCredit.addEventListener(
    "click",
    handleFooterClick
);

successModal.addEventListener(
    "click",
    function (event) {

        if (event.target === successModal) {
            successModal.classList.remove("show");
        }

    }
);

createFlowerRain();
updateMessageCount();