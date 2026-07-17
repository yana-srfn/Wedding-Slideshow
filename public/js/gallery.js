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

async function loadMemories() {

    try {

        const response = await fetch(
            "/api/memories",
            {
                cache: "no-store"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Could not load memories."
            );
        }

        const updatedMemories =
            Array.isArray(result.data)
                ? result.data
                : [];

        const currentMemoryId =
            memories[currentMemoryIndex]?.memoryId;

        memories = updatedMemories;

        if (memories.length === 0) {

            showEmptyState();
            return;

        }

        if (currentMemoryId) {

            const matchingIndex =
                memories.findIndex(function (memory) {
                    return memory.memoryId === currentMemoryId;
                });

            if (matchingIndex !== -1) {
                currentMemoryIndex = matchingIndex;
            }

        }

        if (
            currentMemoryIndex >= memories.length
        ) {
            currentMemoryIndex = 0;
        }

        totalSlideNumber.textContent =
            memories.length;

        if (
            !slideshowSlide.classList.contains("show")
        ) {
            showCurrentMemory();
        }

    } catch (error) {

        console.error(
            "Slideshow refresh error:",
            error
        );

    }

}

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

    const isVideo =
        memory.fileType?.startsWith("video/");

    const mediaUrl =
        `/api/memories/${memory.memoryId}/media`;

    if (isVideo) {

        const video =
            document.createElement("video");

        video.src = mediaUrl;

        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.controls = false;

        video.addEventListener(
            "ended",
            showNextMemory
        );

        video.addEventListener(
            "error",
            function () {
                scheduleNextMemory(
                    PHOTO_DURATION
                );
            }
        );

        slideshowMedia.appendChild(video);

        video.play().catch(function () {

            video.controls = true;

            scheduleNextMemory(
                PHOTO_DURATION
            );

        });

    } else {

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
                "The slideshow image could not be loaded."
            );

            scheduleNextMemory(
                PHOTO_DURATION
            );

        }
    );

    slideshowMedia.appendChild(image);

}

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

function createFlowerRain() {

    if (!flowerRain) {
        return;
    }

    flowerRain.innerHTML = "";

    const isMobile =
        window.innerWidth <= 480;

    const flowerCount =
        isMobile ? 25 : 45;

    const flowerColours = [
        "#F8C8DC",
        "#FFE4EC",
        "#F4B8B0",
        "#F9DCC4",
        "#F5E1D3",
        "#FFF5EE",
        "#E8D9E8",
        "#D9E8D5"
    ];

    for (let i = 0; i < flowerCount; i++) {

        const flower =
            document.createElement("span");

        flower.classList.add(
            "falling-flower",
            `flower-type-${
                ["one", "two", "three"][
                    Math.floor(
                        Math.random() * 3
                    )
                ]
            }`
        );

        const hasStrongWind =
            Math.random() < 0.1;

        flower.classList.add(
            hasStrongWind
                ? "windy-flower"
                : "normal-flower"
        );

        const size = isMobile
            ? hasStrongWind
                ? randomNumber(22, 38)
                : randomNumber(14, 30)
            : randomNumber(9, 24);

        flower.style.left =
            `${randomNumber(0, 100)}%`;

        flower.style.setProperty(
            "--flower-size",
            `${size}px`
        );

        flower.style.setProperty(
            "--flower-colour",
            flowerColours[
                Math.floor(
                    Math.random() *
                    flowerColours.length
                )
            ]
        );

        flower.style.setProperty(
            "--flower-opacity",
            isMobile
                ? randomNumber(65, 100) / 100
                : randomNumber(25, 58) / 100
        );

        flower.style.setProperty(
            "--fall-duration",
            `${randomNumber(20, 34)}s`
        );

        flower.style.setProperty(
            "--flower-delay",
            `${randomNumber(-25, 0)}s`
        );

        flower.style.setProperty(
            "--small-drift",
            `${randomNumber(-18, 18)}px`
        );

        flower.style.setProperty(
            "--medium-drift",
            `${randomNumber(-32, 32)}px`
        );

        flower.style.setProperty(
            "--strong-drift",
            `${randomNumber(-90, 90)}px`
        );

        flower.style.setProperty(
            "--flower-blur",
            isMobile
                ? "0px"
                : "0px"
        );

        flowerRain.appendChild(flower);
    }
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

createFlowerRain();
loadMemories();

setInterval(
    loadMemories,
    REFRESH_INTERVAL
);