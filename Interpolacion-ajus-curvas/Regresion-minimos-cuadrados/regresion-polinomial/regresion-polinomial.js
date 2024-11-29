document.addEventListener('DOMContentLoaded', function() {
    const addRowButton = document.getElementById('add-row');
    const calculateButton = document.getElementById('calculate');
    const dataTable = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const valuesContainer = document.getElementById('values');
    const initialMatrixContainer = document.getElementById('initial-matrix');
    const finalMatrixContainer = document.getElementById('final-matrix');
    const coefficientsContainer = document.getElementById('coefficients');
    const polynomialContainer = document.getElementById('polynomial');
    const polynomialChart = document.getElementById('polynomial-chart');

    // Variable para almacenar la instancia del gráfico
    let chartInstance = null;

    // Función para agregar una fila a la tabla
    addRowButton.addEventListener('click', function() {
        const newRow = dataTable.insertRow();
        newRow.innerHTML = `
            <td><input type="number" class="x-value" placeholder="X"></td>
            <td><input type="number" class="y-value" placeholder="Y"></td>
            <td><button class="delete-row">Eliminar</button></td>
        `;
        // Agregar evento para eliminar la fila
        newRow.querySelector('.delete-row').addEventListener('click', function() {
            dataTable.deleteRow(newRow.rowIndex - 1);
        });
    });

    // Función para obtener los datos de la tabla
    function getTableData() {
        const rows = dataTable.getElementsByTagName('tr');
        const data = [];
        for (let row of rows) {
            const x = row.querySelector('.x-value').value;
            const y = row.querySelector('.y-value').value;
            if (x && y) {
                data.push({ x: parseFloat(x), y: parseFloat(y) });
            }
        }
        return data;
    }

    // Función para calcular regresión polinomial y construir la matriz
    calculateButton.addEventListener('click', function() {
        const data = getTableData();
        const n = data.length;
        const grado = n - 1; // Grado del polinomio (modificar si se permite cambiar el grado dinámicamente)

        if (n < grado + 1) {
            alert("Por favor ingrese al menos tres puntos de datos para un polinomio de grado 2.");
            return;
        }

        // Inicializar sumas para la matriz
        const sums = Array(grado + 1).fill(0).map(() => Array(grado + 1).fill(0));
        const sumY = Array(grado + 1).fill(0);

        // Calcular las sumas necesarias para la matriz
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= grado; j++) {
                for (let k = 0; k <= grado; k++) {
                    sums[j][k] += Math.pow(data[i].x, j + k);
                }
                sumY[j] += data[i].y * Math.pow(data[i].x, j);
            }
        }

        // Mostrar los valores calculados
        valuesContainer.innerHTML = `<p>n = ${n}</p>`;
        for (let i = 0; i <= grado; i++) {
            valuesContainer.innerHTML += `<p>Σx^${i} = ${sums[i][i]}</p>`;
        }

        // Crear la matriz inicial
        let initialMatrix = "\\[ \\begin{pmatrix}";
        for (let i = 0; i <= grado; i++) {
            initialMatrix += sums[i].join(" & ") + " & " + sumY[i];
            if (i < grado) initialMatrix += " \\\\ ";
        }
        initialMatrix += " \\end{pmatrix} \\]";
        initialMatrixContainer.innerHTML = initialMatrix;
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, initialMatrixContainer]);

        // Resolver la matriz con el método de Gauss (adaptar para matrices más grandes)
        const matrixSolution = solveMatrix(sums, sumY);

        // Mostrar la matriz final
        let finalMatrix = "\\[ \\begin{pmatrix}";
        for (let i = 0; i < matrixSolution.length; i++) {
            finalMatrix += matrixSolution[i];
            if (i < matrixSolution.length - 1) finalMatrix += " \\\\ ";
        }
        finalMatrix += " \\end{pmatrix} \\]";
        finalMatrixContainer.innerHTML = finalMatrix;
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, finalMatrixContainer]);

        // Mostrar los coeficientes a_n
        let coefficients = "";
        for (let i = 0; i < matrixSolution.length; i++) {
            coefficients += `<p>a<sub>${i}</sub> = ${matrixSolution[i]}</p>`;
        }
        coefficientsContainer.innerHTML = coefficients;

        // Mostrar la fórmula del polinomio
        let polynomial = "Y = ";
        for (let i = 0; i < matrixSolution.length; i++) {
            polynomial += `${matrixSolution[i]} * x^${i}`;
            if (i < matrixSolution.length - 1) {
                polynomial += " + ";
            }
        }
        polynomialContainer.innerHTML = polynomial;

        // Generar gráfico del polinomio
        generatePolynomialChart(data, matrixSolution);
    });

    // Función para resolver la matriz con el método de Gauss (eliminación gaussiana)
    function solveMatrix(matrix, vector) {
        const n = matrix.length;
        let augmentedMatrix = matrix.map((row, i) => [...row, vector[i]]);
        
        for (let i = 0; i < n; i++) {
            // Hacer que el pivote sea 1
            let pivot = augmentedMatrix[i][i];
            for (let j = i; j <= n; j++) {
                augmentedMatrix[i][j] /= pivot;
            }

            // Eliminar los elementos debajo del pivote
            for (let j = i + 1; j < n; j++) {
                let factor = augmentedMatrix[j][i];
                for (let k = i; k <= n; k++) {
                    augmentedMatrix[j][k] -= augmentedMatrix[i][k] * factor;
                }
            }
        }

        // Sustitución hacia atrás para obtener los coeficientes
        const result = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            result[i] = augmentedMatrix[i][n];
            for (let j = i + 1; j < n; j++) {
                result[i] -= augmentedMatrix[i][j] * result[j];
            }
        }

        return result;
    }

    // Función para generar el gráfico del polinomio
    function generatePolynomialChart(data, coefficients) {
        const chartData = {
            labels: data.map(d => d.x),
            datasets: [{
                label: 'Datos Ingresados',
                data: data.map(d => d.y),
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        };

        // Calcular los valores del polinomio
        const polynomialValues = data.map(d => {
            return coefficients.reduce((sum, coef, idx) => sum + coef * Math.pow(d.x, idx), 0);
        });

        chartData.datasets.push({
            label: 'Polinomio Ajustado',
            data: polynomialValues,
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false
        });

        const ctx = polynomialChart.getContext('2d');

        // Si ya existe un gráfico, destruirlo antes de crear uno nuevo
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Crear el nuevo gráfico
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    }
                }
            }
        });
    }
});
