document.getElementById("newtonDoubleForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener valores del formulario
    const funcionF = document.getElementById("funcionF").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const maxIter = parseInt(document.getElementById("maxIter").value);

    try {
        // Derivar automáticamente f(x) y f'(x) usando math.js
        const fParsed = math.parse(funcionF); // Parsear la función f(x)
        const fPrimeParsed = math.derivative(fParsed, 'x'); // Primera derivada f'(x)
        const fDoublePrimeParsed = math.derivative(fPrimeParsed, 'x'); // Segunda derivada f''(x)

        // Mostrar derivadas calculadas automáticamente
        console.log(`Primera derivada: ${fPrimeParsed.toString()}`);
        console.log(`Segunda derivada: ${fDoublePrimeParsed.toString()}`);

        // Convertir las funciones a ejecutables
        const f = x => math.evaluate(funcionF, { x });
        const fPrime = x => math.evaluate(fPrimeParsed.toString(), { x });
        const fDoublePrime = x => math.evaluate(fDoublePrimeParsed.toString(), { x });

        // Validar que las funciones sean evaluables
        if (isNaN(f(x0)) || isNaN(fPrime(x0)) || isNaN(fDoublePrime(x0))) {
            throw new Error("La función f(x), su primera derivada o su segunda derivada no son válidas.");
        }

        // Inicializar variables
        let x = x0;
        let iteraciones = [];
        let convergencia = false;

        iteraciones.push(`Iteración 0: x = ${x.toFixed(6)}`);

        // Implementar el método iterativo
        for (let iter = 1; iter <= maxIter; iter++) {
            const fx = f(x);
            const fpx = fPrime(x);
            const fppx = fDoublePrime(x);

            // Verificar si la derivada es cero o muy pequeña
            if (Math.abs(fpx) < 1e-8) {
                iteraciones.push(`\nError: Primera derivada demasiado pequeña en x = ${x.toFixed(6)}. No se puede continuar.`);
                break;
            }

            // Fórmula modificada de Newton-Raphson con doble derivada
            const denominator = (fpx * fpx) - (fx * fppx);

            if (Math.abs(denominator) < 1e-8) {
                iteraciones.push(`\nError: Denominador demasiado pequeño en la iteración ${iter}. No se puede continuar.`);
                break;
            }

            const xNext = x - (fx * fpx) / denominator;

            iteraciones.push(`Iteración ${iter}: x = ${xNext.toFixed(6)}`);

            // Verificar criterio de convergencia
            if (Math.abs(xNext - x) < tol) {
                iteraciones.push(`\nConvergencia alcanzada en ${iter} iteraciones: x = ${xNext.toFixed(6)}`);
                convergencia = true;
                break;
            }

            // Actualizar x para la siguiente iteración
            x = xNext;
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
