document.getElementById("calculate-button").addEventListener("click", calculateTaylor);

function calculateTaylor() {
    const funcInput = document.getElementById("function").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const y0 = parseFloat(document.getElementById("y0").value);
    const xTarget = parseFloat(document.getElementById("xTarget").value);
    const h = parseFloat(document.getElementById("stepSize").value);
    const angleUnit = document.getElementById("angleUnit").value;

    if (isNaN(x0) || isNaN(y0) || isNaN(xTarget) || isNaN(h) || h <= 0) {
        alert("Por favor, ingrese valores válidos.");
        return;
    }

    const resultsTable = document.querySelector("#results-table tbody");
    resultsTable.innerHTML = "";

    let xn = x0;
    let yn = y0;
    let iteration = 0;

    const xData = [];
    const yData = [];

    while (xn <= xTarget) {
        try {
            const f = (x, y) => evaluateExpression(funcInput, x, y, angleUnit);

            // Calculamos Y'(Xn) = F(x, y)
            const ynPrime = f(xn, yn);

            // Calculamos Y''(Xn)
            const ynDoublePrime = secondDerivative(funcInput, xn, yn, ynPrime, h, angleUnit);

            // Fórmula de Taylor: Yn+1 = Yn + Yn' * h + Yn'' * (h^2) / 2
            const ynNext = yn + ynPrime * h + (ynDoublePrime / 2) * Math.pow(h, 2);

            // Guardar datos para la gráfica
            xData.push(xn);
            yData.push(yn);

            // Agregar valores a la tabla
            resultsTable.innerHTML += `
                <tr>
                    <td>${iteration}</td>
                    <td>${xn.toFixed(4)}</td>
                    <td>${yn.toFixed(4)}</td>
                    <td>${ynPrime.toFixed(4)}</td>
                    <td>${ynDoublePrime.toFixed(4)}</td>
                    <td>${ynNext.toFixed(4)}</td>
                </tr>
            `;

            // Actualizar valores para la siguiente iteración
            xn += h;
            yn = ynNext;
            iteration++;
        } catch (error) {
            console.error("Error al calcular:", error);
            alert("Ocurrió un error al evaluar la función. Revisa la sintaxis.");
            return;
        }
    }

    // Generar gráfica
    const trace = {
        x: xData,
        y: yData,
        mode: "lines+markers",
        type: "scatter",
        name: "Aproximación (Taylor)",
        line: { color: "blue" },
    };

    const layout = {
        title: "Método de Taylor (3 términos) - Aproximación",
        xaxis: { title: "x" },
        yaxis: { title: "y" },
    };

    Plotly.newPlot("graph", [trace], layout);
}

// Función para evaluar la entrada del usuario
function evaluateExpression(expr, x, y, angleUnit) {
    expr = expr.replace(/\^/g, "**");
    const convertedX = angleUnit === "deg" ? (x * Math.PI) / 180 : x;
    return Function("x", "y", `return ${expr};`)(convertedX, y);
}

// Función para calcular la segunda derivada
function secondDerivative(func, x, y, yPrime, h, angleUnit) {
    const partialFx = (evaluateExpression(func, x + h, y, angleUnit) -
        evaluateExpression(func, x - h, y, angleUnit)) / (2 * h);

    const partialFy = (evaluateExpression(func, x, y + h, angleUnit) -
        evaluateExpression(func, x, y - h, angleUnit)) / (2 * h);

    return partialFx + partialFy * yPrime;
}
