document.addEventListener("DOMContentLoaded", () => {

    const botones =
        document.querySelectorAll(
            ".filtros-notificaciones button"
        );

    const notificaciones =
        document.querySelectorAll(
            ".notificacion"
        );

    const contador =
        document.getElementById(
            "contador-notificaciones"
        );

    function actualizarContador() {

        const pendientes =
            document.querySelectorAll(
                ".notificacion.no-leida"
            ).length;

        contador.textContent =
            `${pendientes} notificaciones sin leer`;
    }

    actualizarContador();

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            botones.forEach(btn => {

                btn.classList.remove("activo");

            });

            boton.classList.add("activo");

            const filtro =
                boton.textContent.trim();

            notificaciones.forEach(card => {

                const categoria =
                    card.dataset.categoria;

                if (
                    filtro === "Todas" ||
                    categoria === filtro
                ) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });

    notificaciones.forEach(card => {

        card.addEventListener("click", () => {

            card.classList.remove("no-leida");

            actualizarContador();

            guardarEstado();

        });

    });

    function guardarEstado() {

        const estados = [];

        document
            .querySelectorAll(".notificacion")
            .forEach(card => {

                estados.push({

                    titulo:
                        card.querySelector("h3")
                        .textContent,

                    leida:
                        !card.classList.contains(
                            "no-leida"
                        )

                });

            });

        localStorage.setItem(
            "estadoNotificaciones",
            JSON.stringify(estados)
        );

    }

    function cargarEstado() {

        const datos =
            JSON.parse(
                localStorage.getItem(
                    "estadoNotificaciones"
                )
            );

        if (!datos) return;

        document
            .querySelectorAll(".notificacion")
            .forEach(card => {

                const titulo =
                    card.querySelector("h3")
                    .textContent;

                const guardada =
                    datos.find(
                        item =>
                        item.titulo === titulo
                    );

                if (
                    guardada &&
                    guardada.leida
                ) {

                    card.classList.remove(
                        "no-leida"
                    );

                }

            });

        actualizarContador();

    }

    cargarEstado();

});