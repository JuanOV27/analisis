// Función para limpiar signos dobles, considerando espacios entre los negativos
function limpiarSignos(expresion) {
    return expresion.replace(/-\s*-/g, '+');
}

// Variables y funciones para agregar filas dinámicamente en la tabla
const tablaValores = document.querySelector("#tablaValores tbody");
const agregarFilaBtn = document.getElementById("agregarFila");
const calcularBtn = document.getElementById("calcular");

// Agregar fila de entrada para x y f(x)
agregarFilaBtn.addEventListener("click", () => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td><input type="number" class="x" step="any"></td>
        <td><input type="number" class="fx" step="any"></td>
        <td><button class="eliminarFila">Eliminar</button></td>
    `;
    tablaValores.appendChild(fila);

    // Eliminar una fila de la tabla
    fila.querySelector(".eliminarFila").addEventListener("click", () => {
        fila.remove();
    });
});

// Función para calcular la interpolación de Lagrange
function calcularInterpolacion() {
    const xInputs = Array.from(document.querySelectorAll(".x")).map(input => parseFloat(input.value));
    const fxInputs = Array.from(document.querySelectorAll(".fx")).map(input => parseFloat(input.value));

    if (xInputs.some(isNaN) || fxInputs.some(isNaN) || xInputs.length < 2) {
        alert("Por favor, ingresa al menos dos puntos válidos.");
        return;
    }

    // Lagrange - Calcular cada L_n(x)
    let polinomiosOriginales = '';
    let polinomiosSimplificados = '';
    let pX = '';
    let pXFinal = '';

    for (let i = 0; i < xInputs.length; i++) {
        let L = ``;
        let numerador = '';
        let denominador = '';

        // Generar la fórmula para L_n(x)
        for (let j = 0; j < xInputs.length; j++) {
            if (i !== j) {
                numerador += `(x - ${xInputs[j]}) `;
                denominador += `(${xInputs[i]} - ${xInputs[j]}) `;
            }
        }

        numerador = limpiarSignos(numerador.trim());
        denominador = limpiarSignos(denominador.trim());

        L = `\\frac{(${numerador})}{(${denominador})}`;

        // Agregar a los polinomios originales
        polinomiosOriginales += `L_{${i}}(x) = ${L} \\\\`;

        // Simplificar el polinomio L_n(x)
        let simplificado = math.simplify(numerador).toString() + ' / ' + math.simplify(denominador).toString();
        polinomiosSimplificados += `L_{${i}}(x) = ${simplificado} \\\\`;

        // Construir p(x) con los polinomios simplificados
        pX += `${fxInputs[i]} * ${simplificado} + `;
    }

    // Mostrar las fórmulas originales Lagrange usando KaTeX
    const polinomiosOriginalesElement = document.getElementById("polinomiosOriginales");
    polinomiosOriginalesElement.innerHTML = `
        <span>Fórmulas Originales Lagrange:</span>
        <div id="formulasOriginales">${polinomiosOriginales}</div>
    `;
    katex.render(polinomiosOriginales, document.getElementById("formulasOriginales"));

    // Mostrar las fórmulas simplificadas Lagrange usando KaTeX
    const polinomiosSimplificadosElement = document.getElementById("polinomiosSimplificados");
    polinomiosSimplificadosElement.innerHTML = `
        <span>Fórmulas Simplificadas Lagrange:</span>
        <div id="formulasSimplificadas">${polinomiosSimplificados}</div>
    `;
    katex.render(polinomiosSimplificados, document.getElementById("formulasSimplificadas"));

    // Calcular el polinomio final p(x) simplificado
    pX = limpiarSignos(pX.slice(0, -3)); // Eliminar la última coma y espacio
    pXFinal = math.simplify(pX).toString();
    const polinomioFinalElement = document.getElementById("polinomioFinal");
    polinomioFinalElement.innerHTML = `Polinomio Final:<br>p(x) = ${pX} <br><br>p(x)= ${pXFinal}`;

    // Graficar el polinomio final
    graficarPolinomio(xInputs, fxInputs, pXFinal);
}

// Evento para calcular la interpolación
calcularBtn.addEventListener("click", calcularInterpolacion);

// Función para graficar el polinomio final
let chart = null; // Variable global para el gráfico

function graficarPolinomio(xInputs, fxInputs, pXFinal) {
    const ctx = document.getElementById('graficoPolinomio').getContext('2d');

    // Validar que existan al menos dos puntos
    if (xInputs.length < 2 || fxInputs.some(isNaN) || xInputs.some(isNaN)) {
        alert("No se puede generar el gráfico: asegúrate de ingresar al menos dos puntos válidos.");
        return;
    }

    // Si ya existe un gráfico, destrúyelo antes de crear uno nuevo
    if (chart) {
        chart.destroy();
    }

    // Crear una función para el polinomio final
    const polinomioFunc = (x) => {
        return fxInputs.reduce((sum, fx, i) => {
            let term = fx;
            for (let j = 0; j < xInputs.length; j++) {
                if (i !== j) {
                    term *= (x - xInputs[j]) / (xInputs[i] - xInputs[j]);
                }
            }
            return sum + term;
        }, 0);
    };

    // Generar puntos para el gráfico
    const puntosX = [];
    const puntosY = [];
    for (let i = Math.min(...xInputs) - 5; i <= Math.max(...xInputs) + 5; i += 0.1) {
        puntosX.push(i);
        puntosY.push(polinomioFunc(i));
    }

    // Crear el gráfico con Chart.js
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: puntosX,
            datasets: [
                {
                    label: 'Polinomio Final',
                    data: puntosY,
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                },
                {
                    label: 'Puntos Ingresados',
                    data: xInputs.map((x, index) => ({ x, y: fxInputs[index] })),
                    type: 'scatter',
                    backgroundColor: '#FF5722',
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#333',
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x',
                        color: '#333',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'f(x)',
                        color: '#333',
                    },
                },
            },
        },
    });
}
