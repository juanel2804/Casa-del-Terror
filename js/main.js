const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Crear contenedor de victoria oculto al inicio
const victoriaContainer = document.createElement("div");
victoriaContainer.id = "victoria-container";
victoriaContainer.style.position = "fixed";
victoriaContainer.style.top = "0";
victoriaContainer.style.left = "0";
victoriaContainer.style.width = "100%";
victoriaContainer.style.height = "100%";
victoriaContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Fondo negro transparente
victoriaContainer.style.display = "none"; // Oculto al inicio
victoriaContainer.style.justifyContent = "center";
victoriaContainer.style.alignItems = "center";
victoriaContainer.style.color = "white";
victoriaContainer.style.fontSize = "24px";
victoriaContainer.style.fontFamily = "Arial, sans-serif";
victoriaContainer.style.textAlign = "center";
victoriaContainer.innerHTML = "<h1>¡Felicidades, encerraste al demonio!</h1>";

// Agregar la pantalla de victoria al cuerpo del documento
document.body.appendChild(victoriaContainer);

// Bandera para controlar los clics
let isRevealing = false;

// Cargar imagen de fondo
const img = new Image();
img.src = "../fondo/recama.jpg"; // Ruta de la imagen

// Cargar imágenes adicionales
const imageFiles = ["c-1.jpg", "c-2.jpg", "c-3.jpg", "c-4.jpg", "c-5.jpg", "c-6.jpg", "c-7.jpg", "c-8.jpg"];

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
}

// Cargar todas las imágenes
imageFiles.forEach((src, index) => {
    images[index] = new Image();
    images[index].src = `../fondo/${src}`;
});

// Función para dibujar la escena completa con imágenes ocultas
function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dibujar todas las imágenes en sus posiciones aleatorias si aún no han sido encontradas
    images.forEach((image, index) => {
        if (!foundImages.has(index)) {
            ctx.drawImage(image, imagePositions[index].x, imagePositions[index].y, imgSize, imgSize);
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

    // Revisar qué imágenes están dentro del área de la linterna
    let imagesToRemove = [];
    images.forEach((image, index) => {
        const imgX = imagePositions[index].x;
        const imgY = imagePositions[index].y;

        // Verificar si TODA la imagen está completamente dentro del radio de revelado
        if (!foundImages.has(index) &&
            x - radio < imgX && x + radio > imgX + imgSize &&
            y - radio < imgY && y + radio > imgY + imgSize) {

            ctx.drawImage(image, imgX, imgY, imgSize, imgSize); // Mostrar imagen
            imagesToRemove.push(index); // Marcar para eliminar después
        }
    });

    ctx.restore();

    // Apagar la linterna después de 500ms
    setTimeout(() => {
        renderScene(); // Redibujar con la capa oscura nuevamente

        // Si se encontró al menos una imagen, eliminarla del canvas 500ms después
        if (imagesToRemove.length > 0) {
            setTimeout(() => {
                imagesToRemove.forEach(index => {
                    foundImages.add(index); // Marcar imagen como encontrada
                    miniaturas[index].style.opacity = "0.3"; // Opacar miniatura
                });

                renderScene(); // Redibujar sin las imágenes encontradas

                // Verificar si el jugador encontró todas las imágenes
                if (foundImages.size === imageFiles.length) {
                    mostrarVictoria();
                }

                isRevealing = false;
            }, 500);
        } else {
            isRevealing = false;
        }
    }, 50);
});

// Función para mostrar la pantalla de victoria
function mostrarVictoria() {
    victoriaContainer.style.display = "flex"; // Mostrar el mensaje de victoria
}

// Ajustar tamaño inicial y actualizar al cambiar la ventana
window.addEventListener("resize", resizeCanvas);
