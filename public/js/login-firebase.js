// FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// CONFIG FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyA7fkpyL421GHAmHzRlBy-ROF5Z4GxTzoQ",
    authDomain: "dunaka-88dd1.firebaseapp.com",
    projectId: "dunaka-88dd1",
    storageBucket: "dunaka-88dd1.firebasestorage.app",
    messagingSenderId: "1069714267589",
    appId: "1:1069714267589:web:c845c76d91df8b9074bfac",
    measurementId: "G-R9H485KF1V"
};

// INICIALIZAR
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// BOTON GOOGLE
document.querySelector(".google").addEventListener("click", async (e) => {
    e.preventDefault();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // GUARDAR EN MYSQL
        const respuesta = await fetch(
            "http://localhost:3000/google-login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: user.displayName,
                    correo: user.email
                })
            }
        );
        
        const data = await respuesta.json();
        
        localStorage.setItem(
            "usuarioData",
            JSON.stringify(data.usuario)
        );
        
        localStorage.setItem(
            "correoUsuario",
            data.usuario.correo
        );
        
        localStorage.setItem(
            "rolUsuario",
            data.usuario.rol
        );
        
        alert("Bienvenido " + user.displayName);
        
        window.location.href = "index.html";
        
    } catch(error){
        console.error(error);
        alert(error.message);
    }
});
