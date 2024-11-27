let isRadians = false;

function toggleMode() {
    isRadians = !isRadians;
    const button = document.getElementById("toggle-mode");
    button.textContent = isRadians ? "Radianes" : "Grados";
}

function evaluateFunction(expr, x, y) {
    try {
        const parsedExpr = expr
            .replace(/\bpi\b/g, Math.PI)
            .replace(/\be\b/g, Math.E)
            .replace(/\^/g, "**")
            .replace(/sen/g, isRadians ? "Math.sin" : "Math.sin(x * Math.PI / 180)")
            .replace(/cos/g, isRadians ? "Math.cos" : "Math.cos(x * Math.PI / 180)")
            .replace(/tan/g, isRadians ? "Math.tan" : "Math.tan(x * Math.PI / 180)");
        
        return eval(parsedExpr.replace(/x/g, `(${x})`).replace(/y/g, `(${y})`));
    } catch (error) {
        console.error("Error al evaluar la función: ", error);
        alert("Revisa la función ingresada.");
        return NaN;
    }
}

function eulerMejorado(func, x0, y0, h, xn) {
    let results = [];
    let x = x0, y = y0;

    while (x <= xn) {
        const yStar = y + h * evaluateFunction(func, x, y);
        const yNext = y + (h / 2) * (evaluateFunction(func, x, y) + evaluateFunction(func, x + h, yStar));

        results.push({ xn: x, yn: y, yStar: yStar, ynNext: yNext });

        y = yNext;
        x = x + h;
    }

    return results;
}

function plotGraph(results) {
    const xValues = results.map(point => point.xn);
    const yValues = results.map(point => point.ynNext);

    const trace = {
        x: xValues,
        y: yValues,
        mode: "lines+markers",
        name: "Aproximación",
        line: { shape: "spline", color: "#4CAF50" },
        marker: { color: "#4CAF50" }
    };

    const layout = {
        title: "Gráfica de la Solución Aproximada",
        xaxis: { title: "x" },
        yaxis: { title: "y" }
    };

    Plotly.newPlot("graph", [trace], layout);
}

document.getElementById("calculateBtn").addEventListener("click", () => {
    const func = document.getElementById("func").value;

    // Reemplazar "pi" o "π" por Math.PI en los valores ingresados
    const x0 = parseFloat(document.getElementById("x0").value.replace(/pi|π/g, Math.PI));
    const y0 = parseFloat(document.getElementById("y0").value.replace(/pi|π/g, Math.PI));
    const h = parseFloat(document.getElementById("h").value.replace(/pi|π/g, Math.PI));
    const xn = parseFloat(document.getElementById("xn").value.replace(/pi|π/g, Math.PI));

    if (!func || isNaN(x0) || isNaN(y0) || isNaN(h) || isNaN(xn)) {
        alert("Completa todos los campos correctamente.");
        return;
    }

    const results = eulerMejorado(func, x0, y0, h, xn);

    if (results.length === 0) return;

    let tableHTML = `
        <h2>Tabla de Resultados</h2>
        <table>
            <thead>
                <tr>
                    <th>x_n</th>
                    <th>y_n</th>
                    <th>y*_{n+1}</th>
                    <th>y_{n+1}</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(point => {
        tableHTML += `
            <tr>
                <td>${point.xn.toFixed(6)}</td>
                <td>${point.yn.toFixed(6)}</td>
                <td>${point.yStar.toFixed(6)}</td>
                <td>${point.ynNext.toFixed(6)}</td>
            </tr>
        `;
    });

    tableHTML += "</tbody></table>";
    document.getElementById("table-container").innerHTML = tableHTML;

    // Llamar a la función para graficar
    plotGraph(results);
});

document.getElementById("toggle-mode").addEventListener("click", toggleMode);