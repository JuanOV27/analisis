document.getElementById("secanteForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener valores del formulario
    const funcionF = document.getElementById("funcionF").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const x1 = parseFloat(document.getElementById("x1").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const maxIter = parseInt(document.getElementById("maxIter").value);

    try {
        // Parsear la función f(x) usando math.js
        const f = x => math.evaluate(funcionF, { x });

        // Validar que las funciones sean evaluables
        if (isNaN(f(x0)) || isNaN(f(x1))) {
            throw new Error("La función f(x) no es válida o no devuelve números para los valores iniciales.");
        }

        // Inicializar variables
        let iteraciones = [];
        let convergencia = false;
        let prevX = x0;
        let currX = x1;

        iteraciones.push(`Iteración 0: x_0 = ${prevX.toFixed(6)}`);
        iteraciones.push(`Iteración 1: x_1 = ${currX.toFixed(6)}`);

        // Implementar el método iterativo
        for (let iter = 2; iter <= maxIter; iter++) {
            const fPrev = f(prevX);
            const fCurr = f(currX);

            // Verificar si hay división por cero
            if (Math.abs(fCurr - fPrev) < 1e-8) {
                iteraciones.push(`\nError: División por cero en la iteración ${iter}.`);
                break;
            }

            // Calcular el siguiente valor usando la fórmula de la secante
            const nextX = currX - fCurr * (currX - prevX) / (fCurr - fPrev);

            iteraciones.push(`Iteración ${iter}: x = ${nextX.toFixed(6)}`);

            // Verificar criterio de convergencia
            if (Math.abs(nextX - currX) < tol) {
                iteraciones.push(`\nConvergencia alcanzada en ${iter} iteraciones: x = ${nextX.toFixed(6)}`);
                convergencia = true;
                break;
            }

            // Actualizar valores para la siguiente iteración
            prevX = currX;
            currX = nextX;
        }

        if (!convergencia) {
            iteraciones.push(`\nNo se alcanzó la convergencia después de ${maxIter} iteraciones.`);
        }

        // Mostrar resultado en la página
        document.getElementById("output").textContent = iteraciones.join("\n");

    } catch (error) {
        // Mostrar errores en la página
        document.getElementById("output").textContent = `Error: ${error.message}`;
    }
});
