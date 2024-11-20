function evaluateFunction(expr, x, y) {
    // Asegurarse de que se evalúe correctamente la función ingresada
    try {
        const parsedExpr = expr
            .replace(/(\bx\b)/g, `(${x})`) // Reemplazar "x" por su valor
            .replace(/(\by\b)/g, `(${y})`); // Reemplazar "y" por su valor
        return eval(parsedExpr);
    } catch (error) {
        console.error("Error al evaluar la función: ", error);
        alert("Revisa la función ingresada. Asegúrate de que sea válida.");
        return NaN;
    }
}

function rungeKuttaMethod(func, x0, y0, h, xn) {
    let results = [];
    let x = x0, y = y0;

    while (x <= xn) {
        let k1 = h * evaluateFunction(func, x, y);
        let k2 = h * evaluateFunction(func, x + h / 2, y + k1 / 2);
        let k3 = h * evaluateFunction(func, x + h / 2, y + k2 / 2);
        let k4 = h * evaluateFunction(func, x + h, y + k3);

        if (isNaN(k1) || isNaN(k2) || isNaN(k3) || isNaN(k4)) {
            alert("Ocurrió un error al calcular. Revisa los valores ingresados.");
            return [];
        }

        let yNext = y + (1 / 6) * (k1 + 2 * k2 + 2 * k3 + k4);

        results.push({
            xn: x,
            yn: y,
            k1: k1,
            k2: k2,
            k3: k3,
            k4: k4,
            ynNext: yNext
        });

        y = yNext;
        x = x + h;
    }

    return results;
}

document.getElementById("calculateBtn").addEventListener("click", () => {
    const func = document.getElementById("func").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const y0 = parseFloat(document.getElementById("y0").value);
    const h = parseFloat(document.getElementById("h").value);
    const xn = parseFloat(document.getElementById("xn").value);

    if (!func || isNaN(x0) || isNaN(y0) || isNaN(h) || isNaN(xn)) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    const results = rungeKuttaMethod(func, x0, y0, h, xn);

    if (results.length === 0) return;

    // Mostrar tabla
    let tableHTML = `
        <h2>Tabla de Resultados</h2>
        <table>
            <thead>
                <tr>
                    <th>xᵢ</th>
                    <th>yᵢ</th>
                    <th>k₁</th>
                    <th>k₂</th>
                    <th>k₃</th>
                    <th>k₄</th>
                    <th>yᵢ₊₁</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(point => {
        tableHTML += `
            <tr>
                <td>${point.xn.toFixed(6)}</td>
                <td>${point.yn.toFixed(6)}</td>
                <td>${point.k1.toFixed(6)}</td>
                <td>${point.k2.toFixed(6)}</td>
                <td>${point.k3.toFixed(6)}</td>
                <td>${point.k4.toFixed(6)}</td>
                <td>${point.ynNext.toFixed(6)}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    const finalResult = results[results.length - 1];
    const resultHTML = `<p>Rta: Y(${finalResult.xn.toFixed(6)}) = ${finalResult.yn.toFixed(6)}</p>`;  // Modificación aquí

    document.getElementById("table-container").innerHTML = tableHTML + resultHTML;

    // Preparar gráfico
    const xData = results.map(p => p.xn);
    const yData = results.map(p => p.yn);

    const trace = {
        x: xData,
        y: yData,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Aproximación (Runge-Kutta)',
        line: { color: 'orange' }
    };

    const layout = {
        title: 'Método de Runge-Kutta - Aproximación',
        xaxis: { title: 'x' },
        yaxis: { title: 'y' }
    };

    Plotly.newPlot("graph", [trace], layout);
});