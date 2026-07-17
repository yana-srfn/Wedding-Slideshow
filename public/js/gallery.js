const flowerRain = document.getElementById("flowerRain");

const slideshowEmpty =
    document.getElementById("slideshowEmpty");

const slideshowSlide =
    document.getElementById("slideshowSlide");

const slideshowMedia =
    document.getElementById("slideshowMedia");

const slideshowMessage =
    document.getElementById("slideshowMessage");

const slideshowGuest =
    document.getElementById("slideshowGuest");

const currentSlideNumber =
    document.getElementById("currentSlideNumber");

const totalSlideNumber =
    document.getElementById("totalSlideNumber");

let memories = [];
let currentMemoryIndex = 0;
let slideshowTimer = null;

const PHOTO_DURATION = 8000;
const REFRESH_INTERVAL = 5000;

const result = await response.json();

if (!response.ok) {
    throw new Error(
        result.message ||
        "Could not load memories."
    );
}

const updatedMemories =
    Array.isArray(result.data)
        ? result.data.filter(function (memory) {

            const fileType =
                memory.fileType ||
                memory.mimeType ||
                "";

            return fileType.startsWith("image/");

        })
        : [];

const currentMemoryId =
    memories[currentMemoryIndex]?.memoryId;

memories = updatedMemories;

function showEmptyState() {

    clearTimeout(slideshowTimer);

    slideshowMedia.innerHTML = "";

    slideshowSlide.classList.remove("show");
    slideshowEmpty.classList.add("show");

    currentSlideNumber.textContent = "0";
    totalSlideNumber.textContent = "0";

}

function showCurrentMemory() {

    if (memories.length === 0) {
        showEmptyState();
        return;
    }

    clearTimeout(slideshowTimer);

    const memory =
        memories[currentMemoryIndex];

    slideshowEmpty.classList.remove("show");
    slideshowSlide.classList.remove("show");

    setTimeout(function () {

        displayMemory(memory);

        slideshowSlide.classList.add("show");
        const mediaUrl =`/api/memories/${memory.memoryId}/media`;

    }, 350);

}

function displayMemory(memory) {

    slideshowMedia.innerHTML = "";

    const mediaUrl =
        `/api/memories/${memory.memoryId}/media`;

    const image =
        document.createElement("img");

    image.src = mediaUrl;

    image.alt =
        memory.message ||
        `Memory shared by ${memory.guestName}`;

    image.addEventListener(
        "load",
        function () {
            scheduleNextMemory(
                PHOTO_DURATION
            );
        }
    );

    image.addEventListener(
        "error",
        function () {

            console.error(
                "The gallery image could not be loaded."
            );

            scheduleNextMemory(
                PHOTO_DURATION
            );
        }
    );

    slideshowMedia.appendChild(image);

    slideshowMessage.textContent =
        memory.message ||
        "A beautiful memory from today.";

    slideshowGuest.textContent =
        memory.guestName ||
        "A wedding guest";

    currentSlideNumber.textContent =
        currentMemoryIndex + 1;

    totalSlideNumber.textContent =
        memories.length;
}

function scheduleNextMemory(delay) {

    clearTimeout(slideshowTimer);

    slideshowTimer = setTimeout(
        showNextMemory,
        delay
    );

}

function showNextMemory() {

    if (memories.length === 0) {
        return;
    }

    currentMemoryIndex =
        (currentMemoryIndex + 1) %
        memories.length;

    showCurrentMemory();

}

function randomNumber(minimum, maximum) {

    return Math.floor(
        Math.random() *
        (maximum - minimum + 1)
    ) + minimum;

}

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "ArrowRight") {
            showNextMemory();
        }

        if (event.key === "ArrowLeft") {

            currentMemoryIndex =
                (
                    currentMemoryIndex -
                    1 +
                    memories.length
                ) %
                memories.length;

            showCurrentMemory();

        }

        if (event.key.toLowerCase() === "f") {

            document.documentElement
                .requestFullscreen()
                .catch(function () {
                    // Fullscreen may be blocked.
                });

        }

    }
);

loadMemories();

setInterval(
    loadMemories,
    REFRESH_INTERVAL
);