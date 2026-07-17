const openingScreen =
    document.getElementById("openingScreen");

const mediaStage =
    document.getElementById("mediaStage");

const slideshowImage =
    document.getElementById("slideshowImage");

const slideshowVideo =
    document.getElementById("slideshowVideo");

const blurredBackground =
    document.getElementById("blurredBackground");

const quoteScreen =
    document.getElementById("quoteScreen");

const quoteText =
    document.getElementById("quoteText");

const emptyScreen =
    document.getElementById("emptyScreen");

const bloomNotification =
    document.getElementById("bloomNotification");

const slideshowControls =
    document.getElementById("slideshowControls");

const previousButton =
    document.getElementById("previousButton");

const pauseButton =
    document.getElementById("pauseButton");

const nextButton =
    document.getElementById("nextButton");

const fullscreenButton =
    document.getElementById("fullscreenButton");

const flowerLayer =
    document.getElementById("flowerLayer");


const PHOTO_DURATION = 8000;
const QUOTE_DURATION = 5000;
const OPENING_DURATION = 5000;
const REFRESH_INTERVAL = 5000;
const CONTROLS_HIDE_DELAY = 5000;
const QUOTE_INTERVAL = 15;


let memories = [];
let slideshowItems = [];
let currentIndex = 0;
let slideshowTimer = null;
let controlsTimer = null;
let knownMemoryIds = new Set();
let hasLoadedInitialMemories = false;
let isPaused = false;


const quotes = [
    "Every flower in this garden represents a memory shared with us today.",

    "Love grows through the little moments.",

    "Thank you for helping our Memory Garden bloom.",

    "Every memory is a piece of our story.",

    "Thank you for celebrating our beginning."
];


/* ========================================
   LOAD MEMORIES
======================================== */

async function loadMemories() {
    try {
        const response =
            await fetch("/api/memories", {
                cache: "no-store"
            });


        if (!response.ok) {
            throw new Error(
                "Unable to load memories."
            );
        }


        const result =
            await response.json();


        const loadedMemories =
            Array.isArray(result)
                ? result
                : result.data;


        if (!Array.isArray(loadedMemories)) {
            memories = [];
            return;
        }


        detectNewMemories(loadedMemories);

        memories = loadedMemories;

        buildSlideshowItems();
    }
    catch (error) {
        console.error(
            "Slideshow loading error:",
            error
        );
    }
}


/* ========================================
   DETECT NEW MEMORIES
======================================== */

function detectNewMemories(loadedMemories) {
    const currentIds =
        new Set(
            loadedMemories.map(
                memory => memory.memoryId
            )
        );


    if (hasLoadedInitialMemories) {
        const hasNewMemory =
            loadedMemories.some(
                memory =>
                    !knownMemoryIds.has(
                        memory.memoryId
                    )
            );


        if (hasNewMemory) {
            showBloomNotification();
        }
    }


    knownMemoryIds = currentIds;
    hasLoadedInitialMemories = true;
}


function showBloomNotification() {
    bloomNotification.classList.add(
        "visible"
    );


    setTimeout(() => {
        bloomNotification.classList.remove(
            "visible"
        );
    }, 3500);
}


/* ========================================
   BUILD ROTATION
======================================== */

function buildSlideshowItems() {
    const shuffledMemories =
        shuffleArray([...memories]);


    const newItems = [];


    shuffledMemories.forEach(
        (memory, index) => {

            newItems.push({
                type: "memory",
                memory
            });


            const shouldAddQuote =
                (index + 1) % QUOTE_INTERVAL === 0;


            if (shouldAddQuote) {
                const quoteIndex =
                    Math.floor(
                        index / QUOTE_INTERVAL
                    ) % quotes.length;


                newItems.push({
                    type: "quote",
                    text: quotes[quoteIndex]
                });
            }
        }
    );


    slideshowItems = newItems;


    if (
        slideshowItems.length > 0 &&
        currentIndex >= slideshowItems.length
    ) {
        currentIndex = 0;
    }
}


function shuffleArray(items) {
    for (
        let index = items.length - 1;
        index > 0;
        index--
    ) {
        const randomIndex =
            Math.floor(
                Math.random() * (index + 1)
            );


        [
            items[index],
            items[randomIndex]
        ] = [
            items[randomIndex],
            items[index]
        ];
    }


    return items;
}


/* ========================================
   START SLIDESHOW
======================================== */

async function startSlideshow() {
    createFlowers();

    await loadMemories();


    setTimeout(() => {
        openingScreen.classList.add(
            "hidden"
        );


        showCurrentItem();
    }, OPENING_DURATION);


    setInterval(
        loadMemories,
        REFRESH_INTERVAL
    );
}


/* ========================================
   DISPLAY CURRENT ITEM
======================================== */

function showCurrentItem() {
    clearTimeout(slideshowTimer);

    hideAllScreens();


    if (slideshowItems.length === 0) {
        showEmptyScreen();
        return;
    }


    const item =
        slideshowItems[currentIndex];


    if (item.type === "quote") {
        showQuote(item.text);
        return;
    }


    showMemory(item.memory);
}


function hideAllScreens() {
    mediaStage.classList.remove("visible");
    quoteScreen.classList.remove("visible");
    emptyScreen.classList.remove("visible");

    slideshowImage.className =
        "slideshow-media slideshow-image";

    slideshowVideo.className =
        "slideshow-media slideshow-video";

    slideshowImage.removeAttribute("src");

    slideshowVideo.pause();
    slideshowVideo.removeAttribute("src");
    slideshowVideo.load();

    blurredBackground.classList.remove(
        "visible"
    );
}


/* ========================================
   SHOW MEMORY
======================================== */

function showMemory(memory) {
    const mediaUrl =
        `/api/memories/${memory.memoryId}/media`;


    const mimeType =
        memory.mimeType ||
        memory.fileType ||
        "";


    const isVideo =
        mimeType.startsWith("video/") ||
        memory.mediaType === "video";


    if (isVideo) {
        showVideo(mediaUrl);
    }
    else {
        showImage(mediaUrl);
    }
}


/* ========================================
   SHOW IMAGE
======================================== */

function showImage(mediaUrl) {
    slideshowImage.onload = () => {
        const isPortrait =
            slideshowImage.naturalHeight >
            slideshowImage.naturalWidth;


        slideshowImage.classList.add(
            isPortrait ? "contain" : "cover"
        );


        applyKenBurnsEffect();

        blurredBackground.style.backgroundImage =
            `url("${mediaUrl}")`;


        blurredBackground.classList.add(
            "visible"
        );


        slideshowImage.classList.add(
            "active"
        );


        mediaStage.classList.add(
            "visible"
        );


        if (!isPaused) {
            slideshowTimer = setTimeout(
                showNextItem,
                PHOTO_DURATION
            );
        }
    };


    slideshowImage.onerror = () => {
        console.error(
            "Unable to display image:",
            mediaUrl
        );

        showNextItem();
    };


    slideshowImage.src = mediaUrl;
}


function applyKenBurnsEffect() {
    const effects = [
        "ken-burns-one",
        "ken-burns-two",
        "ken-burns-three"
    ];


    const selectedEffect =
        effects[
            Math.floor(
                Math.random() *
                effects.length
            )
        ];


    slideshowImage.classList.add(
        selectedEffect
    );
}


/* ========================================
   SHOW VIDEO
======================================== */

function showVideo(mediaUrl) {
    blurredBackground.style.backgroundImage =
        "linear-gradient(#1a1715, #0f0e0d)";


    blurredBackground.classList.add(
        "visible"
    );


    slideshowVideo.src = mediaUrl;

    slideshowVideo.classList.add(
        "active"
    );


    mediaStage.classList.add(
        "visible"
    );


    slideshowVideo.onended = () => {
        if (!isPaused) {
            showNextItem();
        }
    };


    slideshowVideo.onerror = () => {
        console.error(
            "Unable to display video:",
            mediaUrl
        );

        showNextItem();
    };


    slideshowVideo.play()
        .catch(error => {
            console.error(
                "Video autoplay error:",
                error
            );

            slideshowTimer = setTimeout(
                showNextItem,
                PHOTO_DURATION
            );
        });
}


/* ========================================
   SHOW QUOTE
======================================== */

function showQuote(text) {
    quoteText.textContent = text;

    quoteScreen.classList.add(
        "visible"
    );


    if (!isPaused) {
        slideshowTimer = setTimeout(
            showNextItem,
            QUOTE_DURATION
        );
    }
}


/* ========================================
   EMPTY SCREEN
======================================== */

function showEmptyScreen() {
    emptyScreen.classList.add(
        "visible"
    );
}


/* ========================================
   NAVIGATION
======================================== */

function showNextItem() {
    if (slideshowItems.length === 0) {
        showEmptyScreen();
        return;
    }


    currentIndex++;


    if (
        currentIndex >=
        slideshowItems.length
    ) {
        currentIndex = 0;

        buildSlideshowItems();
    }


    showCurrentItem();
}


function showPreviousItem() {
    if (slideshowItems.length === 0) {
        return;
    }


    currentIndex--;


    if (currentIndex < 0) {
        currentIndex =
            slideshowItems.length - 1;
    }


    showCurrentItem();
}


/* ========================================
   PAUSE
======================================== */

function togglePause() {
    isPaused = !isPaused;


    pauseButton.textContent =
        isPaused ? "Play" : "Pause";


    clearTimeout(slideshowTimer);


    if (isPaused) {
        slideshowVideo.pause();
    }
    else {
        if (
            slideshowVideo.classList.contains(
                "active"
            )
        ) {
            slideshowVideo.play()
                .catch(error => {
                    console.error(error);
                });
        }
        else {
            showCurrentItem();
        }
    }
}


/* ========================================
   FULLSCREEN
======================================== */

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement
                .requestFullscreen();
        }
        else {
            await document.exitFullscreen();
        }
    }
    catch (error) {
        console.error(
            "Fullscreen error:",
            error
        );
    }
}


/* ========================================
   CONTROLS AND CURSOR
======================================== */

function showControlsTemporarily() {
    slideshowControls.classList.remove(
        "hidden"
    );

    document.body.classList.remove(
        "hide-cursor"
    );


    clearTimeout(controlsTimer);


    controlsTimer = setTimeout(() => {
        slideshowControls.classList.add(
            "hidden"
        );

        document.body.classList.add(
            "hide-cursor"
        );
    }, CONTROLS_HIDE_DELAY);
}


/* ========================================
   FLOWERS
======================================== */

function createFlowers() {
    const flowerSymbols = [
        "✿",
        "❀",
        "✾",
        "❁"
    ];


    const flowerCount = 10;


    for (
        let index = 0;
        index < flowerCount;
        index++
    ) {
        const flower =
            document.createElement("span");


        flower.className =
            "falling-flower";


        flower.textContent =
            flowerSymbols[
                Math.floor(
                    Math.random() *
                    flowerSymbols.length
                )
            ];


        flower.style.left =
            `${Math.random() * 100}%`;


        flower.style.fontSize =
            `${0.7 + Math.random() * 1.2}rem`;


        flower.style.animationDuration =
            `${18 + Math.random() * 18}s`;


        flower.style.animationDelay =
            `${Math.random() * -30}s`;


        flower.style.setProperty(
            "--drift",
            `${-60 + Math.random() * 120}px`
        );


        flowerLayer.appendChild(flower);
    }
}


/* ========================================
   EVENTS
======================================== */

previousButton.addEventListener(
    "click",
    showPreviousItem
);


nextButton.addEventListener(
    "click",
    showNextItem
);


pauseButton.addEventListener(
    "click",
    togglePause
);


fullscreenButton.addEventListener(
    "click",
    toggleFullscreen
);


document.addEventListener(
    "mousemove",
    showControlsTemporarily
);


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "ArrowRight") {
            showNextItem();
        }


        if (event.key === "ArrowLeft") {
            showPreviousItem();
        }


        if (event.key === " ") {
            event.preventDefault();
            togglePause();
        }


        if (
            event.key.toLowerCase() === "f"
        ) {
            toggleFullscreen();
        }
    }
);


document.addEventListener(
    "fullscreenchange",
    () => {
        fullscreenButton.textContent =
            document.fullscreenElement
                ? "Exit Fullscreen"
                : "Fullscreen";
    }
);


/* ========================================
   BEGIN
======================================== */

showControlsTemporarily();
startSlideshow();