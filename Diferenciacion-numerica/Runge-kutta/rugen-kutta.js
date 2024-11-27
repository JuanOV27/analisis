let isRadians = false; // Establecemos el modo inicial como grados

// Función para convertir grados a radianes
function gradosARadianes(grados) {
    return grados * Math.PI / 180;
}

// Función para evaluar la expresión de la función con la conversión de π y manejo de grados/radianes
function evaluateFunction(expr, x, y) {
    try {
        // Reemplazar "pi" por el valor de Math.PI
        expr = expr.replace(/pi/g, Math.PI);  // Reemplaza 'pi' por el valor real de π

        // Si estamos en grados, convertimos los valores
        if (!isRadians) {
            // Convertimos x e y a radianes si están en grados
            x = gradosARadianes(x);
            y = gradosARadianes(y);
        }

        // Reemplazar las funciones trigonométricas en la expresión por las funciones de JavaScript
        expr = expr
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/asin/g, 'Math.asin')
            .replace(/acos/g, 'Math.acos')
            .replace(/atan/g, 'Math.atan')
            .replace(/log/g, 'Math.log')
            .replace(/exp/g, 'Math.exp')
            .replace(/sqrt/g, 'Math.sqrt');

        // Reemplazar las variables x e y en la expresión
        const parsedExpr = expr
            .replace(/(\bx\b)/g, `(${x})`)
            .replace(/(\by\b)/g, `(${y})`);

        // Evaluamos la expresión como código JavaScript
        return eval(parsedExpr);
    } catch (error) {
        console.error("Error al evaluar la función: ", error);
        alert("Revisa la función ingresada. Asegúrate de que sea válida.");
        return NaN;
    }
}

// Función para ejecutar el método de Runge-Kutta
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

// Evento para cambiar entre grados y radianes
document.getElementById("toggleModeBtn").addEventListener("click", () => {
    isRadians = !isRadians;
    const modeText = isRadians ? "Grados" : "Radianes";
    document.getElementById("toggleModeBtn").textContent = `Cambiar a ${modeText}`;
});

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
    const resultHTML = `<p>Rta = y(${finalResult.xn.toFixed(6)}) = ${finalResult.ynNext.toFixed(6)}</p>`;

    document.getElementById("table-container").innerHTML = tableHTML + resultHTML;

    // Generar gráfico
    const plotData = [{
        x: results.map(point => point.xn),
        y: results.map(point => point.ynNext),
        mode: 'lines+markers',
        type: 'scatter'
    }];

    const layout = {
        title: 'Método de Runge-Kutta',
        xaxis: {
            title: 'x'
        },
        yaxis: {
            title: 'y'
        }
    };

    Plotly.newPlot("graph", plotData, layout);
});