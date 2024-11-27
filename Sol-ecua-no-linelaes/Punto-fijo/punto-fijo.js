document.getElementById("puntoFijoForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener valores del formulario
    const funcionG = document.getElementById("funcionG").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const maxIter = parseInt(document.getElementById("maxIter").value);

    // Validar entrada de la función
    try {
        // Convertir la función g(x) del input en una función ejecutable
        const g = new Function("x", `return ${funcionG};`);
        
        // Validar que la función sea evaluable en x0
        if (isNaN(g(x0))) {
            throw new Error("La función ingresada no es válida o no devuelve un número en el punto inicial.");
        }

        // Inicializar variables
        let x = x0;
        let iteraciones = [];
        let convergencia = false;

        iteraciones.push(`Iteración 0: x = ${x.toFixed(6)}`);

        // Implementar el método de punto fijo con criterio de parada mejorado
        for (let iter = 1; iter <= maxIter; iter++) {
            const xNext = g(x); // Calcular la siguiente iteración

            iteraciones.push(`Iteración ${iter}: x = ${xNext.toFixed(6)}`);

            // Verificar si el valor diverge (crece sin límite)
            if (Math.abs(xNext) > 1e6) {
                iteraciones.push(`\nDivergencia detectada. El método no converge.`);
                convergencia = false;
                break;
            }

            // Verificar criterio de parada
            if (Math.abs(xNext - x) < tol || Math.abs(g(xNext) - xNext) < tol) {
                iteraciones.push(`\nConvergencia alcanzada en ${iter} iteraciones: x = ${xNext.toFixed(6)}`);
                convergencia = true;
                break;
            }

            x = xNext; // Actualizar x para la siguiente iteración
        }

        if (!convergencia) {
            iteraciones.push(`\nNo se alcanzó la convergencia después de ${maxIter} iteraciones.`);
        }

        // Mostrar resultado en la página
        document.getElementById("output").textContent = iteraciones.join("\n");

    } catch (error) {
        // Manejar errores y mostrar mensaje al usuario
        document.getElementById("output").textContent = `Error: ${error.message}`;
    }
});
