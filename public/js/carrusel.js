const slides = document.querySelectorAll(".slide");
const indicatorsContainer = document.querySelector(".indicators");
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === index);
    });

    document.querySelectorAll(".indicator").forEach((indicator, indicatorIndex) => {
        indicator.classList.toggle("active", indicatorIndex === index);
    });
}

if (slides.length > 0 && indicatorsContainer) {
    slides.forEach((_, index) => {
        const indicator = document.createElement("button");
        indicator.className = "indicator";
        indicator.type = "button";
        indicator.setAttribute("aria-label", `Ver imagen ${index + 1}`);
        indicator.addEventListener("click", () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
        indicatorsContainer.appendChild(indicator);
    });

    showSlide(currentSlide);

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}
