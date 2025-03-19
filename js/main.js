
// Almacenar tiempo de inicio cuando el usuario ingrese su nombre
let startTime;

// Esperar hasta que el usuario ingrese su nombre
document.getElementById("start-button").addEventListener("click", function () {
    if (imagesLoaded < allImages.length) {
        alert("Las imágenes aún se están cargando. Por favor, espera unos segundos.");
        return;
    }

    const playerName = document.getElementById("player-name").value.trim();

    if (playerName === "") {
        alert("Por favor, ingrese su nombre.");
        return;
    }

    // Guardar el nombre y el tiempo de inicio
    localStorage.setItem("playerName", playerName);
    startTime = new Date().getTime(); // Guarda el tiempo de inicio en milisegundos

    // 🔹 **Reiniciar variables del juego**
    foundImages.clear();
    isRevealing = false;
    imagePositions = [];
    demonioPosition = null;
    localStorage.setItem("playerLosses", "0"); // Resetear las pérdidas para el nuevo jugador

    // 🔹 **Restaurar miniaturas**
    miniaturas.forEach(img => img.style.opacity = "1");

    // 🔹 **Actualizar posiciones de imágenes**
    updateImagePositions();
    renderScene();

    // 🔹 **Reiniciar música**
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();

    // 🔹 **Restablecer la pantalla del juego**
    document.getElementById("start-screen").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("start-screen").style.display = "none";
    }, 500);
});




const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Cargar sonidos
const backgroundMusic = new Audio("sonidos/music.mp3");
backgroundMusic.loop = true;

const scaryScream = new Audio("sonidos/grito.mp4");


// Iniciar la música de fondo al cargar la página
window.addEventListener("load", () => {
    backgroundMusic.play().catch(error => console.log("Error al reproducir la música:", error));
    iniciarSonidosAleatorios();
});

// Función para reproducir sonidos aleatorios de voz mientras se juega
function iniciarSonidosAleatorios() {
    setInterval(() => {
        const videoContainer = document.getElementById("video-container");
        if (!videoContainer.style.display.includes("flex")) {
            voiceSound.play();
        }
    }, Math.random() * (20000 - 10000) + 10000); // Reproducción aleatoria entre 10-20 segundos
}


// Crear contenedor de "Game Over" (oculto al inicio)
const gameOverContainer = document.createElement("div");
gameOverContainer.id = "game-over-container";
gameOverContainer.style.position = "fixed";
gameOverContainer.style.top = "0";
gameOverContainer.style.left = "0";
gameOverContainer.style.width = "100%";
gameOverContainer.style.height = "100%";
gameOverContainer.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Fondo oscuro
gameOverContainer.style.display = "none";
gameOverContainer.style.justifyContent = "center";
gameOverContainer.style.alignItems = "center";
gameOverContainer.style.zIndex = "1001"; // Sobre todo
gameOverContainer.innerHTML = `
    <div style="color: red; font-size: 50px; font-weight: bold; text-align: center;">
        GAME OVER
    </div>
    <div class="buttons-container">
        <button id="retry-game">Volver a Intentar</button>
        <button id="go-to-home">Inicio</button>
    </div>
`;
document.body.appendChild(gameOverContainer);

// Crear contenedor de "Felicidades" (oculto al inicio)
const winContainer = document.createElement("div");
winContainer.id = "win-container";
winContainer.style.position = "fixed";
winContainer.style.top = "0";
winContainer.style.left = "0";
winContainer.style.width = "100%";
winContainer.style.height = "100%";
winContainer.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Fondo oscuro
winContainer.style.display = "none";
winContainer.style.justifyContent = "center";
winContainer.style.alignItems = "center";
winContainer.style.zIndex = "1001"; // Mismo nivel que Game Over
winContainer.innerHTML = `
    <div style="color: red; font-size: 50px; font-weight: bold; text-align: center;">
        ¡FELICIDADES!
    </div>
    <div style="color: white; font-size: 30px; font-weight: bold; text-align: center; margin-top: 20px;">
        Has encerrado al demonio.
    </div>
    <div class="buttons-container" style="display: flex; gap: 20px; margin-top: 30px;">
       
        <button id="go-to-home-win" style="
            font-size: 20px;
            padding: 10px 20px;
            background-color: white;
            color: black;
            border: none;
            cursor: pointer;
            font-weight: bold;
        ">Inicio</button>
    </div>
`;
document.body.appendChild(winContainer);


// Bandera para controlar los clics
let isRevealing = false;

let losses = 0; // Contador de veces que el jugador ha perdido


// Cargar imagen de fondo
const img = new Image();
img.src = "../../fondo/recama.jpg"; // Ruta de la imagen

// Cargar imágenes adicionales (objetos normales + el demonio)
const imageFiles = ["c-1.jpg", "c-2.jpg", "c-3.jpg", "c-4.jpg", "c-5.jpg", "c-6.jpg", "c-7.jpg", "c-8.jpg"];
const demonioFile = "demonio.jpg"; // Imagen del demonio
const allImages = [...imageFiles, demonioFile]; // Lista con todas las imágenes

// Agregar imágenes en miniatura al contenedor superior
const objetosLista = document.getElementById("objetos-lista");
const miniaturas = [];

imageFiles.forEach((src, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = `../fondo/${src}`;
    imgElement.alt = `Objeto ${index + 1}`;
    imgElement.dataset.index = index;
    objetosLista.appendChild(imgElement);
    miniaturas.push(imgElement);
});

const imgSize = 50;
let imagePositions = [];

let foundImages = new Set(); // Guardará los índices de las imágenes encontradas

// Función para verificar si todas las imágenes han sido encontradas
function checkWinCondition() {
    let indicesEsperados = new Set([...Array(imageFiles.length).keys()]);
    let todasDescubiertas = [...indicesEsperados].every(index => foundImages.has(index));

    if (todasDescubiertas) {
        console.log("🎉 ¡Todas las imágenes han sido encontradas!");
        setTimeout(() => {
            registrarTiempo(true); // ✅ Ahora se registra correctamente solo si gana
            winContainer.style.display = "flex";
        }, 500);
    } else {
        console.log("❌ Aún faltan imágenes por encontrar.");
    }
}



let demonioPosition = null; // Posición del demonio

// Función para ajustar el tamaño del canvas
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 1200);
    canvas.height = Math.min(window.innerHeight * 0.7, 800);

    updateImagePositions();
    renderScene();
}

// Generar posiciones aleatorias para las imágenes sin que se encimen
function updateImagePositions() {
    imagePositions = [];

    for (let i = 0; i < imageFiles.length; i++) {
        let position;
        let overlapping;

        do {
            position = {
                x: Math.random() * (canvas.width - imgSize),
                y: Math.random() * (canvas.height - imgSize)
            };

            overlapping = imagePositions.some(pos =>
                Math.abs(pos.x - position.x) < imgSize && Math.abs(pos.y - position.y) < imgSize
            );
        } while (overlapping);

        imagePositions.push(position);
    }

    // Generar posición del demonio (también sin encimarse)
    let demonioOverlapping;
    do {
        demonioPosition = {
            x: Math.random() * (canvas.width - imgSize),
            y: Math.random() * (canvas.height - imgSize)
        };

        demonioOverlapping = imagePositions.some(pos =>
            Math.abs(pos.x - demonioPosition.x) < imgSize && Math.abs(pos.y - demonioPosition.y) < imgSize
        );
    } while (demonioOverlapping);
}

// Cargar todas las imágenes
const images = [];
let imagesLoaded = 0; // Contador para verificar si todas las imágenes han sido cargadas

allImages.forEach((src, index) => {
    images[index] = new Image();
    images[index].src = `../../fondo/${src}`;

    // Verificar que todas las imágenes se hayan cargado antes de iniciar el juego
    images[index].onload = () => {
        imagesLoaded++; // Incrementar el contador cuando una imagen se carga
        if (imagesLoaded === allImages.length) {
            console.log("✅ Todas las imágenes han sido cargadas.");
            resizeCanvas(); // Ajustar el canvas correctamente
            renderScene(); // Ahora sí dibujamos el juego
        }
    };

    images[index].onerror = () => {
        console.error(`❌ Error al cargar la imagen: ${src}`);
    };
});


// Función para dibujar la escena completa con imágenes ocultas
function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dibujar todas las imágenes en sus posiciones aleatorias si aún no han sido encontradas
    images.forEach((image, index) => {
        if (index < imageFiles.length) {
            if (!foundImages.has(index)) {
                ctx.drawImage(image, imagePositions[index].x, imagePositions[index].y, imgSize, imgSize);
            }
        } else {
            // Dibujar al demonio si aún no se ha encontrado
            if (!foundImages.has("demonio")) {
                ctx.drawImage(image, demonioPosition.x, demonioPosition.y, imgSize, imgSize);
            }
        }
    });

    // Aplicar la capa oscura sobre todo el canvas
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Cargar la imagen de fondo y renderizar la escena inicial
img.onload = function () {
    resizeCanvas();
};

// Evento de clic para mostrar la linterna y revelar imágenes
canvas.addEventListener("click", function (e) {
    if (isRevealing) return;

    isRevealing = true;
    renderScene();

    // Obtener coordenadas del clic con relación al `canvas`
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const radio = Math.min(canvas.width, canvas.height) * 0.12;

    // Dibujar efecto de linterna revelando imágenes
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let imagesToRemove = [];

    images.forEach((image, index) => {
        if (index < imageFiles.length) {
            const imgX = imagePositions[index].x;
            const imgY = imagePositions[index].y;

            if (!foundImages.has(index) &&
                x - radio < imgX && x + radio > imgX + imgSize &&
                y - radio < imgY && y + radio > imgY + imgSize) {

                ctx.drawImage(image, imgX, imgY, imgSize, imgSize);
                imagesToRemove.push(index);
            }
        } else {
            // Si el jugador encuentra al demonio, activar el video de miedo
            if (!foundImages.has("demonio") &&
                x - radio < demonioPosition.x && x + radio > demonioPosition.x + imgSize &&
                y - radio < demonioPosition.y && y + radio > demonioPosition.y + imgSize) {

                // Si el jugador ya encontró todas las imágenes, NO mostrar Game Over
                if ([...foundImages].filter(i => i !== "demonio").length === imageFiles.length) {
                    return;
                }

                foundImages.add("demonio");

                // Reproducir el grito y pausar la música antes de mostrar Game Over
                scaryScream.play();
                backgroundMusic.pause();

                // Esperar 0.3s antes de mostrar la pantalla de Game Over
                setTimeout(() => {
                    losses++; // Aumentar el contador de pérdidas cada vez que pierda
                    localStorage.setItem("playerLosses", losses); // Guardarlo en localStorage

                    gameOverContainer.style.display = "flex"; // Mostrar "Game Over"
                }, 300);
            }

        }
    });

    ctx.restore();

    setTimeout(() => {
        renderScene();
        if (imagesToRemove.length > 0) {
            setTimeout(() => {
                imagesToRemove.forEach(index => {
                    foundImages.add(index);
                    miniaturas[index].style.opacity = "0.3";
                });
    
                console.log("✔️ Se agregaron imágenes al conjunto foundImages:", Array.from(foundImages));
    
                // 🔹 Verificar si todas las imágenes fueron encontradas
                checkWinCondition();
    
                renderScene();
                isRevealing = false;
            }, 500);
        } else {
            isRevealing = false;
        }
    }, 500);
    
    

});
   
// Función para activar el video de miedo
function activarVideoMiedo() {
    scaryScream.play(); // Reproducir el grito
    backgroundMusic.pause(); // Pausar la música de fondo

    // Función para calcular el tiempo transcurrido y guardarlo en la tabla
    function registrarTiempo() {
        const playerName = localStorage.getItem("playerName"); // Obtener nombre del jugador
        if (!playerName) return;
    
        const endTime = new Date().getTime(); // Obtener tiempo final
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Convertir a segundos
    
        // Obtener la cantidad de veces que perdió el jugador antes de ganar
        let playerLosses = parseInt(localStorage.getItem("playerLosses")) || 0;
    
        // Obtener datos previos del localStorage
        let scores = JSON.parse(localStorage.getItem("scores")) || [];
    
        // Agregar la nueva entrada de puntaje
        scores.push({ name: playerName, time: timeTaken, losses: playerLosses });
    
        // Ordenar la tabla por tiempo (menor tiempo es mejor)
        scores.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
    
        // Guardar la lista de puntajes actualizada en localStorage
        localStorage.setItem("scores", JSON.stringify(scores));
    
        
    
        // Actualizar la tabla en pantalla
        actualizarTabla();
    }
    
    



    // Llamar a la función cuando el jugador gana
    registrarTiempo();

    videoContainer.style.display = "flex"; // Mostrar el video
}

// Ajustar tamaño inicial y actualizar al cambiar la ventana
window.addEventListener("resize", resizeCanvas);

// Función para actualizar la tabla de puntuaciones
function actualizarTabla() {
    const tbody = document.querySelector("#score-table tbody");
    tbody.innerHTML = ""; 

    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    let playerLosses = parseInt(localStorage.getItem("playerLosses")) || 0;

    scores.forEach((score) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${score.name}</td>
            <td>${score.time ? `${score.time} s` : "-"}</td>
            <td>${score.losses}</td>
        `;
        tbody.appendChild(row);
    });

    // Agregar la cantidad de derrotas del jugador actual si aún no ha ganado
    const playerName = localStorage.getItem("playerName");
    if (playerName && playerLosses > 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${playerName}</td>
            <td>-</td>
            <td>${playerLosses}</td>
        `;
        tbody.appendChild(row);
    }

    console.log("📊 Tabla de puntajes actualizada.");
}




// Función para reiniciar el juego sin perder el nombre y los datos
function restartGame() {
    setTimeout(() => {
        let playerLosses = parseInt(localStorage.getItem("playerLosses")) || 0;
        playerLosses++; // Incrementar derrotas
        localStorage.setItem("playerLosses", playerLosses); // Guardar en localStorage

        console.log(`💀 ${localStorage.getItem("playerName")} ha perdido ${playerLosses} veces.`);

        gameOverContainer.style.display = "none";
        winContainer.style.display = "none";

        foundImages.clear();
        isRevealing = false;
        imagePositions = [];
        demonioPosition = null;

        updateImagePositions();
        renderScene();

        miniaturas.forEach(img => img.style.opacity = "1");

        backgroundMusic.currentTime = 0;
        backgroundMusic.play();

        startTime = new Date().getTime();
        actualizarTabla(); // Asegurar que la tabla se actualiza con las derrotas
    }, 500);
}


function registrarTiempo() {
    const playerName = localStorage.getItem("playerName"); // Obtener nombre del jugador
    if (!playerName) return;

    const endTime = new Date().getTime(); // Obtener tiempo final
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Convertir a segundos

    // Obtener la cantidad de veces que perdió el jugador antes de ganar
    let playerLosses = parseInt(localStorage.getItem("playerLosses")) || 0;

    // Obtener datos previos del localStorage
    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    // Agregar la nueva entrada de puntaje
    scores.push({ name: playerName, time: timeTaken, losses: playerLosses });

    // Ordenar la tabla por tiempo (menor tiempo es mejor)
    scores.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    // Guardar la lista de puntajes actualizada en localStorage
    localStorage.setItem("scores", JSON.stringify(scores));

    // Actualizar la tabla en pantalla
    actualizarTabla();
}




function limpiarTodoLocalStorage() {
    localStorage.clear(); // 🧹 Borra todo el almacenamiento local
    actualizarTabla(); // Refresca la tabla en la pantalla si existe
    console.log("🚀 LocalStorage completamente limpiado.");
    alert("Todos los datos han sido eliminados.");
}


// Función para regresar a la pantalla de inicio sin borrar datos
function goToHome() {
    setTimeout(() => {
        // Mostrar pantalla de inicio correctamente
        const startScreen = document.getElementById("start-screen");
        startScreen.style.display = "flex";  
        startScreen.style.opacity = "1"; // Asegurar visibilidad completa

        // Ocultar pantallas de Game Over y Felicidades
        gameOverContainer.style.display = "none";
        winContainer.style.display = "none";

        // Limpiar el campo de nombre
        document.getElementById("player-name").value = "";
    }, 500);
}


document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        // Obtener los botones de Game Over
        const retryGameBtn = document.getElementById("retry-game");
        const goToHomeBtn = document.getElementById("go-to-home");

        // Obtener los botones de Felicidades
        const retryWinBtn = document.getElementById("retry-win");
        const goToHomeWinBtn = document.getElementById("go-to-home-win");

        // Asegurar que todos los botones tengan las mismas funciones
        if (retryGameBtn) retryGameBtn.addEventListener("click", restartGame);
        if (goToHomeBtn) goToHomeBtn.addEventListener("click", goToHome);
        if (retryWinBtn) retryWinBtn.addEventListener("click", restartGame); // ✅ Ahora funciona bien
        if (goToHomeWinBtn) goToHomeWinBtn.addEventListener("click", goToHome);
    }, 300); // Pequeño retraso para asegurar que los elementos están cargados
});



// Esperar a que el DOM esté cargado para agregar los eventos a los botones
document.addEventListener("DOMContentLoaded", function () {
    // Esperar un pequeño tiempo para asegurar que los elementos existen
    setTimeout(() => {
        // Botones de Game Over
        const retryGameBtn = document.getElementById("retry-game");
        const goToHomeBtn = document.getElementById("go-to-home");

        // Botones de Felicidades
        const retryWinBtn = document.getElementById("retry-win");
        const goToHomeWinBtn = document.getElementById("go-to-home-win");

        // Verificar si los botones existen antes de asignar eventos
        if (retryGameBtn) retryGameBtn.addEventListener("click", restartGame);
        if (goToHomeBtn) goToHomeBtn.addEventListener("click", goToHome);
        if (retryWinBtn) retryWinBtn.addEventListener("click", restartGame);
        if (goToHomeWinBtn) goToHomeWinBtn.addEventListener("click", goToHome);
    }, 300); // Pequeño retraso para asegurar que los elementos están cargados
});

document.addEventListener("DOMContentLoaded", function () {
    actualizarTabla(); // Cargar los puntajes almacenados al inicio
});


// Llamar a la función para cargar los datos al inicio
actualizarTabla();

