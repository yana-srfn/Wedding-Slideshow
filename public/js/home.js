const footerCredit = document.getElementById("footerCredit");
const creditModal = document.getElementById("creditModal");
const modalClose = document.getElementById("modalClose");

let footerClickCount = 0;
let clickResetTimer;

footerCredit.addEventListener("click", function () {

    footerClickCount++;

    clearTimeout(clickResetTimer);

    clickResetTimer = setTimeout(function () {
        footerClickCount = 0;
    }, 2500);

    if (footerClickCount === 5) {
        creditModal.classList.add("show");

        footerClickCount = 0;
    }

});

modalClose.addEventListener("click", function () {
    creditModal.classList.remove("show");
});

creditModal.addEventListener("click", function (event) {

    if (event.target === creditModal) {
        creditModal.classList.remove("show");
    }

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        creditModal.classList.remove("show");
    }

});

const flowerRain = document.getElementById("flowerRain");

const flowerColours = [
    "#F8C8DC", // blush pink
    "#FFE4EC", // light pink
    "#F4B8B0", // dusty pink
    "#F9DCC4", // peach
    "#F5E1D3", // champagne
    "#FFF5EE", // cream
    "#E8D9E8", // light lavender
    "#D9E8D5", // sage
    "#FFFFFF"  // white
];

const flowerTypes = [
    "flower-type-one",
    "flower-type-two",
    "flower-type-three"
];

function createFlowerRain() {

    if (!flowerRain) {
        return;
    }

    flowerRain.innerHTML = "";

    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 480;

    let numberOfFlowers = 65;

    if (isMobile) {
        numberOfFlowers = 25;
    } else if (screenWidth <= 768) {
        numberOfFlowers = 55;
    }

    for (let i = 0; i < numberOfFlowers; i++) {

        const flower = document.createElement("span");

        const randomFlowerType =
            flowerTypes[
                Math.floor(
                    Math.random() *
                    flowerTypes.length
                )
            ];

        flower.classList.add(
            "falling-flower",
            randomFlowerType
        );

        const hasStrongWind =
            Math.random() < 0.15;

        flower.classList.add(
            hasStrongWind
                ? "windy-flower"
                : "normal-flower"
        );

        const size = isMobile
            ? hasStrongWind
                ? randomNumber(16, 28)
                : randomNumber(10, 20)
            : hasStrongWind
                ? randomNumber(16, 30)
                : randomNumber(8, 23);

        const opacity = isMobile
            ? randomNumber(65, 100) / 100
            : randomNumber(35, 82) / 100;

        const fallDuration =
            randomNumber(11, 22);

        const spinDuration =
            randomNumber(5, 12);

        const startingPosition =
            randomNumber(0, 100);

        const animationDelay =
            randomNumber(-22, 0);

        const smallDrift =
            randomNumber(-25, 25);

        const mediumDrift =
            randomNumber(-40, 40);

        const strongDrift =
            randomNumber(-110, 110);

        const blurAmount = isMobile
            ? 0
            : size >= 26
                ? randomNumber(1, 2)
                : randomNumber(0, 1);

        const flowerColour =
            flowerColours[
                Math.floor(
                    Math.random() *
                    flowerColours.length
                )
            ];

        flower.style.left =
            `${startingPosition}%`;

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
            opacity
        );

        flower.style.setProperty(
            "--fall-duration",
            `${fallDuration}s`
        );

        flower.style.setProperty(
            "--spin-duration",
            `${spinDuration}s`
        );

        flower.style.setProperty(
            "--flower-delay",
            `${animationDelay}s`
        );

        flower.style.setProperty(
            "--small-drift",
            `${smallDrift}px`
        );

        flower.style.setProperty(
            "--medium-drift",
            `${mediumDrift}px`
        );

        flower.style.setProperty(
            "--strong-drift",
            `${strongDrift}px`
        );

        flower.style.setProperty(
            "--flower-blur",
            `${blurAmount}px`
        );

        flowerRain.appendChild(flower);
    }
}

function randomNumber(minimum, maximum) {

    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;

}

createFlowerRain();