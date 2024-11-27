let chartInstance; // Variable global para almacenar la instancia del gráfico

document.querySelector('.add-row').addEventListener('click', function () {
    const tableBody = document.querySelector('#tabla tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="number" step="any" name="x[]" required></td>
        <td><input type="number" step="any" name="f[]" required></td>
        <td><button type="button" class="remove-row">Eliminar</button></td>
    `;
    tableBody.appendChild(newRow);

    newRow.querySelector('.remove-row').addEventListener('click', function () {
        newRow.remove();
    });
});

function corregirSignos(expresion) {
    return expresion.replace(/\+\s*-/g, '-').replace(/-\s*-/g, '+');
}

function calcular() {
    const formulario = document.getElementById('formulario');
    const xValues = Array.from(formulario.querySelectorAll('input[name="x[]"]')).map(input => parseFloat(input.value));
    const fValues = Array.from(formulario.querySelectorAll('input[name="f[]"]')).map(input => parseFloat(input.value));

    if (xValues.length < 2) {
        alert("Por favor, ingrese al menos dos puntos.");
        return;
    }

    let diferencias = [];
    for (let i = 0; i < xValues.length; i++) {
        diferencias.push([fValues[i]]);
    }

    for (let j = 1; j < xValues.length; j++) {
        for (let i = 0; i < xValues.length - j; i++) {
            const diff = (diferencias[i + 1][j - 1] - diferencias[i][j - 1]) / (xValues[i + j] - xValues[i]);
            diferencias[i].push(diff);
        }
    }

    const formulasDiv = document.getElementById('formulas');
    const resultadosDiv = document.getElementById('resultados');
    formulasDiv.innerHTML = "";
    resultadosDiv.innerHTML = "";

    // Mostrar las fórmulas en el contenedor
    for (let j = 1; j < diferencias[0].length; j++) {
        for (let i = 0; i < xValues.length - j; i++) {
            const indices = [];
            for (let k = i; k <= i + j; k++) {
                indices.push(`x${k}`);
            }
            const formula = `f(${indices.join(', ')}) = (${diferencias[i + 1][j - 1]} - ${diferencias[i][j - 1]}) / (${xValues[i + j]} - ${xValues[i]})`;
            formulasDiv.innerHTML += `<p>${corregirSignos(formula)}</p>`;
            resultadosDiv.innerHTML += `<p>f(${indices.join(', ')}) = ${math.format(diferencias[i][j], { precision: 5 })}</p>`;
        }
    }

    let polinomio = `${fValues[0]}`;
    for (let j = 1; j < diferencias[0].length; j++) {
        let termino = `${diferencias[0][j]}`;
        for (let k = 0; k < j; k++) {
            termino += ` * (x - ${xValues[k]})`;
        }
        polinomio += ` + (${termino})`;
    }

    document.getElementById('polinomio-reemplazado').innerText = `P(x) = ${corregirSignos(polinomio)}`;
    document.getElementById('polinomio').innerText = `P(x) = ${math.simplify(polinomio).toString()}`;

    graficar(xValues, fValues, math.simplify(polinomio).toString());
}

function graficar(xValues, fValues, polinomio) {
    const ctx = document.getElementById('graficoPolinomio').getContext('2d');
    const xPuntos = math.range(math.min(xValues) - 1, math.max(xValues) + 1, 0.1).toArray();
    const yPuntos = xPuntos.map(x => math.evaluate(polinomio, { x }));

    // Destruye el gráfico previo si existe
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Crea una nueva instancia del gráfico
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xPuntos,
            datasets: [
                {
                    label: 'Polinomio Interpolante',
                    data: yPuntos,
                    borderColor: 'blue',
                    fill: false
                },
                {
                    label: 'Puntos Ingresados',
                    data: xValues.map((x, i) => ({ x, y: fValues[i] })),
                    type: 'scatter',
                    backgroundColor: 'red'
                }
            ]
        }
    });
}
