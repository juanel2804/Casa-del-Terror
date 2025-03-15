const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Bandera para controlar los clics
let isRevealing = false;

// Cargar imagen de fondo
const img = new Image();
img.src = "../fondo/recama.jpg"; // Ruta de la imagen

// Cargar imágenes adicionales
const imageFiles = ["c-1.jpg", "c-2.jpg", "c-3.jpg", "c-4.jpg", "c-5.jpg", "c-6.jpg", "c-7.jpg", "c-8.jpg"];

// Agregar imágenes en miniatura al contenedor superior
const objetosLista = document.getElementById("objetos-lista");
imageFiles.forEach((src, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = `../fondo/${src}`;
    imgElement.alt = `Objeto ${index + 1}`;
    objetosLista.appendChild(imgElement);
});

const images = [];
const imgSize = 50; // Tamaño reducido de las imágenes
let imagePositions = []; // Almacenará las posiciones de las imágenes

// Función para ajustar el tamaño del canvas
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 1200);
    canvas.height = Math.min(window.innerHeight * 0.7, 800);

    updateImagePositions();
    renderScene();
}

// Generar posiciones aleatorias para las imágenes
function updateImagePositions() {
    imagePositions = imageFiles.map(() => ({
        x: Math.random() * (canvas.width - imgSize),
        y: Math.random() * (canvas.height - imgSize)
    }));
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

    // Dibujar todas las imágenes en sus posiciones aleatorias
    images.forEach((image, index) => {
        ctx.drawImage(image, imagePositions[index].x, imagePositions[index].y, imgSize, imgSize);
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

    // Dibujar efecto de linterna
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Revelar imágenes dentro del área de la linterna
    images.forEach((image, index) => {
        const imgX = imagePositions[index].x;
        const imgY = imagePositions[index].y;

        if (Math.hypot(x - (imgX + imgSize / 2), y - (imgY + imgSize / 2)) < radio) {
            ctx.drawImage(image, imgX, imgY, imgSize, imgSize);
        }
    });

    ctx.restore();

    // Restaurar la escena después de 1 segundo
    setTimeout(() => {
        renderScene();
        isRevealing = false;
    }, 1000);
});

// Ajustar tamaño inicial y actualizar al cambiar la ventana
window.addEventListener("resize", resizeCanvas);
