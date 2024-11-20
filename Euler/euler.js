function evaluateFunction(expr, x, y) {
    return new Function("x", "y", `return ${expr};`)(x, y);
}

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