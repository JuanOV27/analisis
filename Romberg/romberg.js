// Variables globales para el gráfico
let integrationChart;

// Función para calcular Romberg
function calculateRomberg() {
    const func = document.getElementById('function').value;
    const lowerLimit = parseInput(document.getElementById('lower-limit').value);
    const upperLimit = parseInput(document.getElementById('upper-limit').value);
    const maxIterations = parseInt(document.getElementById('intervals').value);
    const angleUnit = document.getElementById('angle-unit').value;

    if (isNaN(lowerLimit) || isNaN(upperLimit) || isNaN(maxIterations) || maxIterations <= 0) {
        alert("Por favor, ingrese valores válidos.");
        return;
    }

    const rombergTable = rombergIntegration(func, lowerLimit, upperLimit, maxIterations, angleUnit);
displayRombergTable(rombergTable);
displayRombergChart(rombergTable); // Llama a la función para mostrar la gráfica
displayFunctionTable(func, lowerLimit, upperLimit, maxIterations, angleUnit);


    // Mostrar resultado final en R(4,4)
    const finalResult = rombergTable[4][4];
    document.getElementById('final-value').textContent = finalResult.toFixed(6);
}


// Evaluar la función ingresada
function evaluateFunction(func, x, angleUnit) {
    try {
        // Convertir x a radianes o grados según la unidad de ángulo seleccionada
        const radians = angleUnit === 'rad' ? x : (x * Math.PI) / 180;

        // Reemplazar funciones matemáticas y constantes
        let parsedFunc = func
            .replace(/ln/g, "Math.log")              // Logaritmo natural
            .replace(/cos/g, "Math.cos")             // Coseno
            .replace(/sin/g, "Math.sin")             // Seno
            .replace(/tan/g, "Math.tan")             // Tangente
            .replace(/sqrt/g, "Math.sqrt")           // Raíz cuadrada
            .replace(/e/g, "Math.E")                 // Constante e de Euler
            .replace(/exp\(([^)]+)\)/g, "Math.exp($1)"); // Exponencial e^(x)

        // Reemplazar el operador de potencia '^' con Math.pow(a, b)
        parsedFunc = parsedFunc.replace(/(\b\w+|\([^)]+\))\s*\^\s*(\b\w+|\([^)]+\))/g, "Math.pow($1, $2)");

        // Asegurar que el valor de x se reemplaza correctamente
        parsedFunc = parsedFunc.replace(/x/g, `(${radians})`);

        // Evaluar la función con el valor de x reemplazado
        const result = eval(parsedFunc);

        // Verificar si el resultado es un número válido
        return typeof result === 'number' && !isNaN(result) ? result : NaN;
    } catch (error) {
        console.error("Error evaluando la función:", error);
        return NaN;
    }
}







// Implementación de la regla del trapecio
function trapezoidalRule(func, a, b, n, angleUnit) {
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        sum += evaluateFunction(func, x, angleUnit);
    }
    return (h / 2) * (evaluateFunction(func, a, angleUnit) + evaluateFunction(func, b, angleUnit) + 2 * sum);
}

// Construir la tabla de Romberg
function rombergIntegration(func, a, b, maxIterations, angleUnit) {
    const R = []; 
    for (let i = 0; i < maxIterations; i++) {
        R[i] = [];
        const n = Math.pow(2, i); 
        R[i][0] = trapezoidalRule(func, a, b, n, angleUnit);
        for (let j = 1; j <= i; j++) {
            R[i][j] = R[i][j - 1] + (R[i][j - 1] - R[i - 1][j - 1]) / (Math.pow(4, j) - 1);
        }
    }
    return R;
}

// Mostrar solo los valores específicos de R(i, j) en la tabla de Romberg
function displayRombergTable(R) {
    const tbody = document.querySelector("#romberg-table tbody");
    tbody.innerHTML = ""; // Limpiar tabla previa

    // Lista de posiciones específicas a mostrar
    const indices = [
        [1, 1], [2, 1], [3, 1], [4, 1],
        [2, 2], [3, 2], [4, 2],
        [3, 3], [4, 3],
        [4, 4]
    ];

    // Generar filas solo para las posiciones específicas
    indices.forEach(([i, j]) => {
        if (R[i] && R[i][j] !== undefined) { // Verifica que el valor exista
            const tr = document.createElement("tr");
            
            const cellPosition = document.createElement("td");
            cellPosition.textContent = `R(${i}, ${j})`;
            
            const cellValue = document.createElement("td");
            cellValue.textContent = R[i][j].toFixed(6);

            tr.appendChild(cellPosition);
            tr.appendChild(cellValue);
            tbody.appendChild(tr);
        }
    });
}



// Mostrar tabla de x y f(x) según el número de intervalos ingresados y el valor inferior
function displayFunctionTable(func, lowerLimit, upperLimit, intervals, angleUnit) {
    const tbody = document.querySelector("#result-table tbody");
    tbody.innerHTML = ""; // Limpiar tabla previa

    // Longitud de cada subintervalo
    const h = (upperLimit - lowerLimit) / intervals;

    // Iterar desde el valor inferior hasta el superior, con el número de intervalos especificado
    for (let i = 0; i <= intervals; i++) {
        const x = lowerLimit + i * h;  // Aseguramos que el primer valor de x sea el límite inferior
        const fx = evaluateFunction(func, x, angleUnit);

        // Crear fila para x y f(x)
        const tr = document.createElement("tr");
        const xCell = document.createElement("td");
        xCell.textContent = x.toFixed(6);
        const fxCell = document.createElement("td");
        fxCell.textContent = fx.toFixed(6);

        tr.appendChild(xCell);
        tr.appendChild(fxCell);
        tbody.appendChild(tr);
    }
}



// Convertir entradas como "pi" o "e" a sus valores numéricos
function parseInput(input) {
    if (input.toLowerCase() === "pi") return Math.PI;
    if (input.toLowerCase() === "e") return Math.E;
    return parseFloat(input);
}

function displayRombergChart(R) {
    const labels = [];
    const datasets = [];

    // Preparar etiquetas y valores por iteración
    for (let i = 0; i < R.length; i++) {
        labels.push(`Iteración ${i + 1}`);
        const iterationValues = R[i].filter(value => value !== undefined);
        datasets.push({
            label: `Iteración ${i + 1}`,
            data: iterationValues,
            borderColor: `hsl(${(i * 50) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(i * 50) % 360}, 70%, 50%, 0.3)`,
            fill: false,
        });
    }

    // Destruir gráfico existente si existe
    if (integrationChart) {
        integrationChart.destroy();
    }

    // Crear el gráfico
    const ctx = document.getElementById("rombergChart").getContext("2d");
    integrationChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Iteraciones",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Valor Aproximado",
                    },
                },
            },
        },
    });
}
