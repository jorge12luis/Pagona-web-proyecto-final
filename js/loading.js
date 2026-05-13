document.addEventListener("DOMContentLoaded", () => {

    const rutaLogo =
        window.location.pathname.includes("/page/") ||
        window.location.pathname.includes("/pages_nav/")
            ? "../dunaka.png"
            : "dunaka.png";

    const loadingScreen = document.createElement("div");

    loadingScreen.classList.add("loading-screen");

    loadingScreen.innerHTML = `
        <div class="loading-container">

            <img src="${rutaLogo}" 
                 alt="Dunaka"
                 class="loading-logo">

            <h2 class="loading-text">
                DUNAKA
            </h2>

            <p class="loading-subtext">
                Cargando experiencia premium...
            </p>

            <div class="loading-bar-container">
                <div class="loading-bar"></div>
            </div>

            <div class="loading-percent">
                0%
            </div>

        </div>
    `;

    document.body.appendChild(loadingScreen);

    const bar = document.querySelector(".loading-bar");
    const percent = document.querySelector(".loading-percent");

    let progreso = 0;

    const intervalo = setInterval(() => {

        progreso += Math.floor(Math.random() * 10) + 5;

        if (progreso >= 100) {
            progreso = 100;
        }

        bar.style.width = progreso + "%";
        percent.textContent = progreso + "%";

        if (progreso === 100) {

            clearInterval(intervalo);

            setTimeout(() => {
                loadingScreen.classList.add("hidden");
            }, 400);
        }

    }, 120);
});