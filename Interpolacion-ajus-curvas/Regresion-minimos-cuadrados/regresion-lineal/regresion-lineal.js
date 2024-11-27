let regressionChart; // Variable global para el gráfico

function addRow() {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    cell1.innerHTML = '<input type="number" name="x">';
    cell2.innerHTML = '<input type="number" name="y">';
    cell3.innerHTML = '<button onclick="deleteRow(this)">Eliminar</button>';
}

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function calculateRegression() {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    let x = [], y = [];
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        x.push(parseFloat(cells[0].getElementsByTagName('input')[0].value));
        y.push(parseFloat(cells[1].getElementsByTagName('input')[0].value));
    }

    // Cálculos de regresión
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

    const a1 = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a0 = (sumY - a1 * sumX) / n;

    // Validar signos
    const a1Str = validarSignos(a1.toFixed(4));
    const a0Str = validarSignos(a0.toFixed(4));

    // Mostrar resultados detallados
    const resultDiv = document.getElementById('result');
    const meanX = (sumX / n).toFixed(4);
    const meanY = (sumY / n).toFixed(4);
    resultDiv.innerHTML = `
        <p><strong>Cálculo de a1:</strong> \\( a_1 = \\frac{${n} \\cdot (${sumXY}) - (${sumX}) \\cdot (${sumY})}{${n} \\cdot (${sumX2}) - (${sumX})^2} = ${a1Str} \\)</p>
        <p><strong>Cálculo de a0:</strong> \\( a_0 = ${meanY} - (${a1Str} \\cdot ${meanX}) = ${a0Str} \\)</p>
        <p><strong>Cálculo de \\( \\bar{x} \\):</strong> \\( \\bar{x} = \\frac{${sumX}}{${n}} = ${meanX} \\)</p>
        <p><strong>Cálculo de \\( \\bar{y} \\):</strong> \\( \\bar{y} = \\frac{${sumY}}{${n}} = ${meanY} \\)</p>
        <p><strong>Ecuación final:</strong> \\( y = ${a0Str} + (${a1Str}x) \\)</p>
    `;
    MathJax.typeset();

    // Mostrar resumen de valores
    const summaryDiv = document.getElementById('summary');
    summaryDiv.innerHTML = `
        <p><strong>n:</strong> ${n}</p>
        <p><strong>Σx:</strong> ${sumX}</p>
        <p><strong>Σy:</strong> ${sumY}</p>
        <p><strong>Σxy:</strong> ${sumXY}</p>
        <p><strong>Σ(x^2):</strong> ${sumX2}</p>
    `;

    // Graficar resultados
    const ctx = document.getElementById('regressionChart').getContext('2d');
    if (regressionChart) {
        regressionChart.destroy(); // Destruir el gráfico anterior
    }
    regressionChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos',
                data: x.map((xi, i) => ({ x: xi, y: y[i] })),
                backgroundColor: 'rgba(75, 192, 192, 1)'
            }, {
                label: 'Línea de Regresión',
                data: x.map(xi => ({ x: xi, y: a0 + a1 * xi })),
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                }
            }
        }
    });
}

function validarSignos(valor) {
    valor = valor.replace(/\s+/g, ''); // Eliminar espacios en blanco
    valor = valor.replace(/- -/g, '+'); // Reemplazar - - por +
    valor = valor.replace(/--/g, '+'); // Reemplazar -- por +
    valor = valor.replace(/\+ -/g, '-'); // Reemplazar + - por -
    valor = valor.replace(/\+-/g, '-'); // Reemplazar +- por -
    valor = valor.replace(/-\(-/g, '+'); // Reemplazar -(- por +
    valor = valor.replace(/- \(-/g, '+'); // Reemplazar - (- por +
    valor = valor.replace(/\+ \(-/g, '-'); // Reemplazar + (- por -
    valor = valor.replace(/\+\(-/g, '-'); // Reemplazar +(- por -
    return valor;
}
