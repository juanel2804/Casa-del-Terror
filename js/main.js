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
winContainer.style.zIndex = "1001"; // Sobre todo
winContainer.innerHTML = `
    <div style="color: white; font-size: 40px; font-weight: bold; text-align: center;">
        ¡FELICIDADES! <br> Has encerrado al demonio.
    </div>
`;
document.body.appendChild(winContainer);

// Bandera para controlar los clics
let isRevealing = false;

// Cargar imagen de fondo
const img = new Image();
img.src = "../fondo/recama.jpg"; // Ruta de la imagen

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

const images = [];
const imgSize = 50;
let imagePositions = [];
let foundImages = new Set(); // Guardará los índices de las imágenes encontradas
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
allImages.forEach((src, index) => {
    images[index] = new Image();
    images[index].src = `../fondo/${src}`;
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

                renderScene();
                isRevealing = false;

                // Comprobar si todas las imágenes han sido encontradas
                if ([...foundImages].filter(i => i !== "demonio").length === imageFiles.length) {
                    setTimeout(() => {
                        winContainer.style.display = "flex"; // Mostrar "Felicidades"
                    }, 500);
                }

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
    videoContainer.style.display = "flex"; // Mostrar el video
}

// Ajustar tamaño inicial y actualizar al cambiar la ventana
window.addEventListener("resize", resizeCanvas);
