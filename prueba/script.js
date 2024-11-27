document.getElementById("plotButton").addEventListener("click", () => {
    const functionInput = document.getElementById("functionInput").value;
    const rangeStart = parseFloat(document.getElementById("rangeStart").value);
    const rangeEnd = parseFloat(document.getElementById("rangeEnd").value);
    const step = parseFloat(document.getElementById("step").value);

    if (!functionInput) {
        alert("Por favor, ingresa una función.");
        return;
    }

    const xValues = [];
    const yValues = [];
    for (let x = rangeStart; x <= rangeEnd; x += step) {
        try {
            const y = eval(functionInput.replace(/x/g, `(${x})`));
            xValues.push(x);
            yValues.push(y);
        } catch (error) {
            alert("Error al evaluar la función. Asegúrate de que la sintaxis sea correcta.");
            return;
        }
    }

    plotGraph(xValues, yValues);
});

function plotGraph(xValues, yValues) {
    const ctx = document.getElementById("functionChart").getContext("2d");
    if (window.chart) {
        window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: 'y = f(x)',
                data: yValues,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            }
        }
    });
}
