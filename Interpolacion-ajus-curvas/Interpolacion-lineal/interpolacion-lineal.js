const tablaValores = document.querySelector("#tablaValores tbody");
const agregarFilaBtn = document.getElementById("agregarFila");

// Agregar una fila editable
agregarFilaBtn.addEventListener("click", () => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td><input type="number" step="any" class="x"></td>
        <td><input type="number" step="any" class="y"></td>
        <td><button class="eliminarFila">Eliminar</button></td>
    `;
    tablaValores.appendChild(fila);

    // Agregar funcionalidad para eliminar filas
    fila.querySelector(".eliminarFila").addEventListener("click", () => {
        fila.remove();
    });
});

// Cálculo y actualización de resultados
const calcularInterpolacion = () => {
    // Obtener valores ingresados
    const xInputs = Array.from(document.querySelectorAll(".x")).map(input => parseFloat(input.value));
    const yInputs = Array.from(document.querySelectorAll(".y")).map(input => parseFloat(input.value));

    if (xInputs.length !== 2 || yInputs.length !== 2 || xInputs.includes(NaN) || yInputs.includes(NaN)) {
        alert("Por favor, ingrese exactamente dos pares de valores válidos.");
        return;
    }

    // Extraer valores
    const [x0, x1] = xInputs;
    const [f0, f1] = yInputs;

    // Calcular la pendiente y simplificar en forma de fracción
    const num = f1 - f0; // Numerador
    const den = x1 - x0; // Denominador
    const m = `${num}/${den}`; // Pendiente como fracción

    // Ecuación inicial
    let ecuacion = `f(x) = (${num}) / (${den}) * (x - (${x0})) + ${f0}`;

    // Simplificar ecuación eliminando signos dobles
    ecuacion = ecuacion.replace(/--/g, "+").replace(/\+-/g, "-");

    // Ecuación simplificada
    const simplified = `f(x) = ${f0 * den + num * -x0}/${den} + ${-num}/${den}x`;

    // Mostrar ecuación
    document.getElementById("ecuacion").innerText = `Ecuación: ${simplified}`;

    // Generar el gráfico
    graficar(x0, x1, f0, f1, m, xInputs, yInputs);
};

// Graficar interpolación con puntos
const graficar = (x0, x1, f0, f1, m, xInputs, yInputs) => {
    const canvas = document.getElementById("grafico");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configuración del gráfico
    const padding = 50;
    const scaleX = (canvas.width - 2 * padding) / (x1 - x0);
    const scaleY = (canvas.height - 2 * padding) / Math.max(f0, f1);

    // Dibujar línea de interpolación
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding - f0 * scaleY);
    ctx.lineTo(canvas.width - padding, canvas.height - padding - f1 * scaleY);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar puntos y valores
    ctx.fillStyle = "red";
    xInputs.forEach((x, i) => {
        const px = padding + (x - x0) * scaleX;
        const py = canvas.height - padding - yInputs[i] * scaleY;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(`(${x.toFixed(2)}, ${yInputs[i].toFixed(2)})`, px + 10, py - 10);
    });
};

// Botón para calcular
const calcularBtn = document.createElement("button");
calcularBtn.textContent = "Calcular";
calcularBtn.addEventListener("click", calcularInterpolacion);
document.querySelector("#tablaInputs").appendChild(calcularBtn);