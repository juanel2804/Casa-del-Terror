const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Ajustar tamaño del canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Bandera para controlar los clics
let isRevealing = false;

// Cargar imagen de fondo
const img = new Image();
img.src = "../fondo/recama.jpg"; // Ruta de la imagen

// Cargar imágenes adicionales (c-1 a c-8)
const imageFiles = ["c-1.jpg", "c-2.jpg", "c-3.jpg", "c-4.jpg", "c-5.jpg", "c-6.jpg", "c-7.jpg", "c-8.jpg"];
const images = [];
const imgSize = 50; // Tamaño reducido de las imágenes

// Generar posiciones aleatorias para las imágenes
const imagePositions = imageFiles.map(() => ({
    x: Math.random() * (canvas.width - imgSize), // Posición aleatoria en X
    y: Math.random() * (canvas.height - imgSize) // Posición aleatoria en Y
}));

// Cargar todas las imágenes
imageFiles.forEach((src, index) => {
    images[index] = new Image();
    images[index].src = `../fondo/${src}`;
});

// Función para dibujar la escena completa con imágenes ocultas
function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar todo antes de redibujar

    // Dibujar la imagen de fondo
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dibujar todas las imágenes en sus posiciones aleatorias (pero ocultas por la capa oscura)
    images.forEach((image, index) => {
        ctx.drawImage(image, imagePositions[index].x, imagePositions[index].y, imgSize, imgSize);
    });

    // Aplicar la capa oscura sobre todo el canvas
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Cargar la imagen de fondo y renderizar la escena inicial
img.onload = function () {
    renderScene();
    console.log("Imagen y rectángulo oscuro cargados.");
};

// Evento de clic para mostrar la linterna y revelar imágenes
canvas.addEventListener("click", function (e) {
    if (isRevealing) return; // Evita múltiples clics seguidos

    isRevealing = true; // Bloquea más clics hasta que se restaure

    // Redibujar la escena completa antes de mostrar la linterna
    renderScene();

    // Obtener coordenadas del clic
    const x = e.clientX;
    const y = e.clientY;
    const radio = 60; // Tamaño del círculo revelado

    // Dibujar efecto de linterna en el fondo y las imágenes
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Revelar el fondo

    // Revelar imágenes dentro del área de la linterna
    images.forEach((image, index) => {
        const imgX = imagePositions[index].x;
        const imgY = imagePositions[index].y;

        // Si la imagen está dentro del radio de revelado, mostrarla
        if (Math.hypot(x - (imgX + imgSize / 2), y - (imgY + imgSize / 2)) < radio) {
            ctx.drawImage(image, imgX, imgY, imgSize, imgSize);
        }
    });

    ctx.restore();

    // Después de 1 segundo, restaurar completamente la pantalla
    setTimeout(() => {
        renderScene(); // Vuelve a dibujar todo como si fuera el inicio
        isRevealing = false;
    }, 1000);
});
