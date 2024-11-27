// Variable para mantener el estado de grados o radianes
let isDegrees = false;  // Inicia en radianes (por defecto)

// Función para convertir grados a radianes
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Función para convertir radianes a grados
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Función para convertir y evaluar expresiones con soporte para grados/radianes
function sanitizeExpression(expr) {
    // Reemplazar los exponentes (^) por (**)
    expr = expr.replace(/\^/g, '**');

    // Reemplazar las funciones trigonométricas
    expr = expr.replace(/\bsen\b/g, 'Math.sin');
    expr = expr.replace(/\bcos\b/g, 'Math.cos');
    expr = expr.replace(/\btan\b/g, 'Math.tan');
    expr = expr.replace(/\bexp\b/g, 'Math.exp'); // Para exponentiales si se desea

    // Si estamos en grados, convertimos las funciones trigonométricas a radianes
    if (isDegrees) {
        expr = expr.replace(/Math.sin\(([^)]+)\)/g, (match, p1) => `Math.sin(${p1} * Math.PI / 180)`);
        expr = expr.replace(/Math.cos\(([^)]+)\)/g, (match, p1) => `Math.cos(${p1} * Math.PI / 180)`);
        expr = expr.replace(/Math.tan\(([^)]+)\)/g, (match, p1) => `Math.tan(${p1} * Math.PI / 180)`);
    }

    return expr;
}

// Función para evaluar la expresión
function evaluateFunction(expr, x, y) {
    // Sanitizamos la expresión antes de evaluarla
    expr = sanitizeExpression(expr);
    return new Function("x", "y", `return ${expr};`)(x, y);
}

// Función del Método de Euler
function eulerMethod(func, x0, y0, h, xn) {
    let results = [];
    let x = x0, y = y0;

    while (x <= xn) {
        let slope = evaluateFunction(func, x, y); // Evaluar f(x, y)
        let yNext = y + h * slope;               // Calcular y_{i+1}

        results.push({
            xi: x,
            yi: y,
            yPrime: slope,
            yiNext: yNext
        });

        y = yNext;  // Actualizar y para el siguiente paso
        x = x + h;  // Incrementar x por h
    }

    return results;
}

// Evento del botón de calcular
document.getElementById("calculateBtn").addEventListener("click", () => {
    const func = document.getElementById("func").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const y0 = parseFloat(document.getElementById("y0").value);
    const h = parseFloat(document.getElementById("h").value);
    const xn = parseFloat(document.getElementById("xn").value);

    const results = eulerMethod(func, x0, y0, h, xn);

    // Mostrar tabla de resultados
    let tableHTML = `
        <h2>Tabla de Resultados</h2>
        <table>
            <thead>
                <tr>
                    <th>Paso (n)</th>
                    <th>xᵢ</th>
                    <th>yᵢ</th>
                    <th>y' (f(xᵢ, yᵢ))</th>
                    <th>yᵢ₊₁</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach((point, index) => {
        tableHTML += `
            <tr>
                <td>${index}</td>
                <td>${point.xi}</td>
                <td>${point.yi}</td>
                <td>${point.yPrime}</td>
                <td>${point.yiNext}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    // Mostrar resultado final
    const finalResult = results[results.length - 1]; // Último elemento
    const finalY = finalResult.yiNext;
    const finalX = finalResult.xi;

    const resultHTML = `
        <h3>Resultado Final</h3>
        <p>Rta: Y(${finalX}) = ${finalY}</p>
    `;

    document.getElementById("table-container").innerHTML = tableHTML + resultHTML;

    // Preparar datos para el gráfico
    const xData = results.map(p => p.xi);
    const yData = results.map(p => p.yi);

    const trace = {
        x: xData,
        y: yData,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Aproximación (Método de Euler)',
        line: { color: 'blue' }
    };

    const layout = {
        title: 'Método de Euler - Aproximación',
        xaxis: { title: 'x' },
        yaxis: { title: 'y' }
    };

    Plotly.newPlot("graph", [trace], layout);
});

// Evento del botón para cambiar entre grados y radianes
document.getElementById("toggleUnitBtn").addEventListener("click", () => {
    isDegrees = !isDegrees;  // Cambiar estado
    const unitText = isDegrees ? "Radianes" : "Grados";
    document.getElementById("toggleUnitBtn").innerText = `Cambiar a ${unitText}`;
});