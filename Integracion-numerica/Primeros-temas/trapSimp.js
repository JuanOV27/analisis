function parseFunctionInput(func) {
    func = func.toLowerCase()
        .replace(/ln\(/g, "Math.log(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/pi/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/(\([^\)]+\)|\w+)\^(-?\d+(\.\d+)?)/g, "Math.pow($1,$2)"); // Detecta exponentes negativos y decimales

    return func;
}

function parseInput(input) {
    input = input.toLowerCase()
        .replace(/pi/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sqrt\(/g, "Math.sqrt(");
    
    try {
        return eval(input);
    } catch (error) {
        alert("Error: Entrada no válida. Verifique los límites de integración.");
        return NaN;
    }
}

function calculateIntegration() {
    const funcInput = document.getElementById("function").value;
    const parsedFunc = parseFunctionInput(funcInput);
    const lowerLimitInput = document.getElementById("lower-limit").value;
    const upperLimitInput = document.getElementById("upper-limit").value;
    const intervals = parseInt(document.getElementById("intervals").value);
    const angleUnit = document.getElementById("angle-unit").value;

    // Convertir los límites a valores numéricos usando parseInput
    const lowerLimit = parseInput(lowerLimitInput);
    const upperLimit = parseInput(upperLimitInput);

    // Verificar si los límites son números válidos y si los intervalos son positivos
    if (isNaN(lowerLimit) || isNaN(upperLimit) || isNaN(intervals) || intervals <= 0) {
        alert("Error: Asegúrese de ingresar límites válidos y un número entero positivo de intervalos.");
        return;
    }

    try {
        // Crear la función dinámica para evaluar f(x)
        const f = new Function("x", ` 
            x = ${angleUnit === "deg" ? "x * Math.PI / 180" : "x"}; 
            return ${parsedFunc};
        `);

        // Evaluar f(x) para todos los valores de x dentro del rango
        const xValues = [];
        const fValues = [];
        for (let i = 0; i <= intervals; i++) {
            const x = lowerLimit + i * ((upperLimit - lowerLimit) / intervals);
            const fx = f(x);
            
            // Verificar si f(x) es un valor válido
            if (isNaN(fx)) {
                console.error(`Error: f(${x}) no es un valor válido (NaN).`);
                return;
            }

            xValues.push(x);
            fValues.push(fx);
        }

        // Calcular los resultados de los métodos de integración
        const trapResult = calculateTrapezoidal(f, lowerLimit, upperLimit, intervals);
        const simpson13Result = calculateSimpson13(f, lowerLimit, upperLimit, intervals);
        const simpson38Result = calculateSimpson38(f, lowerLimit, upperLimit, intervals);
        // Mostrar los resultados en la tabla y en el área de resultados
        displayResults(xValues, fValues, trapResult.result, simpson13Result, simpson38Result);
        // Dibujar el gráfico de f(x) en el intervalo
        drawChart(xValues, fValues, lowerLimit, upperLimit);

    } catch (error) {
        alert("Error al evaluar la función. Verifique la sintaxis.");
    }
}



function calculateTrapezoidal(f, lowerLimit, upperLimit, intervals) {
    // Verificamos si lowerLimit es negativo, si es así, convertimos la resta en una suma.
    const h = lowerLimit < 0
        ? (upperLimit + Math.abs(lowerLimit)) / intervals
        : (upperLimit - lowerLimit) / intervals
        ;

    let xValues = [];
    let fValues = [];
    let result = 0;

    for (let i = 0; i <= intervals; i++) {
        const x = lowerLimit + i * h;
        const fx = f(x);
        xValues.push(x);
        fValues.push(fx);

        if (i === 0 || i === intervals) {
            result += fx;
        } else {
            result += 2 * fx;
        }
    }

    result = (h / 2) * result;
    return { xValues, fValues, result };
}


function calculateSimpson13(f, lowerLimit, upperLimit, intervals) {
    if (intervals % 2 !== 0) {
        alert("Para Simpson 1/3, el número de intervalos debe ser par. Aumente o disminuya el valor de 'n'.");
        return "Intervalo no válido";
    }

    const h = (upperLimit - lowerLimit) / intervals;
    let result = f(lowerLimit) + f(upperLimit);

    for (let i = 1; i < intervals; i++) {
        const x = lowerLimit + i * h;
        result += (i % 2 === 0 ? 2 : 4) * f(x);
    }

    result = (h / 3) * (result);
    return result.toPrecision(10);
}

function calculateSimpson38(f, lowerLimit, upperLimit, intervals) {
    const h = (upperLimit - lowerLimit) / intervals;
    let xValues = [];
    let fValues = [];
    let result = 0;

    for (let i = 0; i <= intervals; i++) {
        const x = lowerLimit + i * h;
        const fx = f(x);
        xValues.push(x);
        fValues.push(fx);

        if (i === 0 || i === intervals) {
            result += fx;
        } else {
            result += 3 * fx;
        }
    }
    
    result = (3 *h / 8) * result;
    return result;
}



function displayResults(xValues, fValues, trapResult, simpson13Result, simpson38Result) {
    const tableBody = document.querySelector("#result-table tbody");
    tableBody.innerHTML = "";

    for (let i = 0; i < xValues.length; i++) {
        const row = `<tr><td>${xValues[i].toFixed(4)}</td><td>${fValues[i].toFixed(4)}</td></tr>`;
        tableBody.innerHTML += row;
    }

    document.getElementById("result").innerHTML = `
        <p>Área aproximada por el método del Trapecio: ${trapResult.toPrecision(10)}</p>
        <p>Área aproximada por el método de Simpson 1/3: ${simpson13Result}</p>
        <p>Área aproximada por el método de Simpson 3/8: ${simpson38Result.toPrecision(10)}</p>
    `;
}

function generateMethodPoints(f, lowerLimit, upperLimit, result, intervals, method) {
    const h = (upperLimit - lowerLimit) / intervals;
    const points = [];
    for (let i = 0; i <= intervals; i++) {
        const x = lowerLimit + i * h;
        points.push({ x: x, y: f(x) });
    }
    return points;
}

function drawChart(xValues, fValues, lowerLimit, upperLimit) {
    const ctx = document.getElementById("function-chart").getContext("2d");

    // Destruir la gráfica anterior si ya existe
    if (window.chart) {
        window.chart.destroy();
    }

    // Crear una nueva gráfica
    window.chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: xValues.map(x => x.toFixed(4)), // Etiquetas en el eje X
            datasets: [
                {
                    label: "f(x)",
                    data: fValues,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `f(${context.label}) = ${context.raw.toFixed(4)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "x",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "f(x)",
                    },
                },
            },
        },
    });
}

