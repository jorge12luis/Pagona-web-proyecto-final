document.addEventListener("DOMContentLoaded", () => {

    const checkboxes =
        document.querySelectorAll("input[type='checkbox']");

    const btnGuardar =
        document.querySelector(".btn-guardar");

    const mensaje =
        document.getElementById("mensajePreferencias");

    const preferenciasGuardadas =
        JSON.parse(localStorage.getItem("preferencias"));

    if(preferenciasGuardadas){

        checkboxes.forEach(check => {

            const nombre = check.id;

            if(preferenciasGuardadas[nombre] !== undefined){

                check.checked =
                    preferenciasGuardadas[nombre];
            }

        });

    }

    btnGuardar.addEventListener("click", () => {

        const preferencias = {};

        checkboxes.forEach(check => {

            preferencias[check.id] =
                check.checked;

        });

        localStorage.setItem(
            "preferencias",
            JSON.stringify(preferencias)
        );

        mensaje.textContent =
            "Preferencias guardadas correctamente.";

        setTimeout(() => {

            mensaje.textContent = "";

        }, 3000);

    });

});