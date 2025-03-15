const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let demonio = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    visible: false,
};

let luz = {
    x: 0,
    y: 0,
    radio: 0, // Inicialmente apagada
    activa: false
};



let objetos = [
    { x: 100, y: 150, radio: 15, color: "blue" },
    { x: 300, y: 200, radio: 15, color: "blue" },
    { x: 500, y: 250, radio: 15, color: "blue" },
    { x: 700, y: 100, radio: 15, color: "blue" },
    { x: 900, y: 350, radio: 15, color: "blue" },
    { x: 1200, y: 400, radio: 15, color: "blue" },
    { x: 50, y: 500, radio: 15, color: "blue" },
    { x: 250, y: 600, radio: 15, color: "blue" },
    { x: 450, y: 700, radio: 15, color: "blue" },
    { x: 650, y: 800, radio: 15, color: "blue" },
    { x: 850, y: 900, radio: 15, color: "blue" },
    { x: 1050, y: 550, radio: 15, color: "blue" },
    { x: 1250, y: 250, radio: 15, color: "blue" },
    { x: 200, y: 350, radio: 15, color: "blue" },
    { x: 400, y: 150, radio: 15, color: "blue" },
    { x: 600, y: 450, radio: 15, color: "blue" },
    { x: 800, y: 650, radio: 15, color: "blue" },
    { x: 1000, y: 850, radio: 15, color: "blue" },
    { x: 1100, y: 700, radio: 15, color: "blue" },
    { x: 1300, y: 500, radio: 15, color: "blue" }
];


// Evento para activar la linterna con un clic
canvas.addEventListener("click", (e) => {
    luz.x = e.clientX;
    luz.y = e.clientY;
    luz.radio = 100; // Tamaño de la luz
    luz.activa = true;

    if (luz.activa) {
        let gradiente = ctx.createRadialGradient(luz.x, luz.y, 50, luz.x, luz.y, luz.radio);
        gradiente.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradiente.addColorStop(1, "rgba(0, 0, 0, 0)");
    
        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(luz.x, luz.y, luz.radio, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Apagar la luz después de 3 segundos
    setTimeout(() => {
        luz.radio = 0; // Se apaga la luz
        luz.activa = false;
    }, 3000);
});

// Función para generar una nueva posición del demonio
function nuevaPosicionDemonio() {
    demonio.x = Math.random() * canvas.width;
    demonio.y = Math.random() * canvas.height;
    demonio.visible = true;

    setTimeout(() => {
        demonio.visible = false;
        setTimeout(nuevaPosicionDemonio, Math.random() * 2000 + 1000);
    }, Math.random() * 2000 + 1000);
}

// Dibujar la escena
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los objetos en el canvas (quedarán ocultos por la cortina negra)
    objetos.forEach((objeto) => {
        ctx.fillStyle = objeto.color;
        ctx.beginPath();
        ctx.arc(objeto.x, objeto.y, objeto.radio, 0, Math.PI * 2);
        ctx.fill();
    });

    // Crear la cortina negra encima de todo
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simulación de la linterna solo si está activa
    if (luz.activa) {
        ctx.globalCompositeOperation = "destination-out"; // Hace que la luz recorte la cortina negra
        let gradiente = ctx.createRadialGradient(luz.x, luz.y, 50, luz.x, luz.y, luz.radio);
        gradiente.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradiente.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(luz.x, luz.y, luz.radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over"; // Restaurar el modo normal de dibujo
    }



    // Simulación de la linterna solo si está activa
    if (luz.activa) {
        let gradiente = ctx.createRadialGradient(luz.x, luz.y, 50, luz.x, luz.y, luz.radio);
        gradiente.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradiente.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(luz.x, luz.y, luz.radio, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dibujar el demonio si está en pantalla
    if (demonio.visible) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(demonio.x, demonio.y, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dibujar los objetos en el canvas
    objetos.forEach((objeto) => {
        ctx.fillStyle = objeto.color;
        ctx.beginPath();
        ctx.arc(objeto.x, objeto.y, objeto.radio, 0, Math.PI * 2);
        ctx.fill();
    });



    requestAnimationFrame(draw);
}

// Iniciar el juego
nuevaPosicionDemonio();
draw();
