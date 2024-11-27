document.getElementById('reglaFalsaForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar recargar la página

    // Obtener valores del formulario
    const funcInput = document.getElementById('function').value;
    const aInput = parseFloat(document.getElementById('a').value);
    const bInput = parseFloat(document.getElementById('b').value);
    const tolInput = parseFloat(document.getElementById('tol').value);
    const maxIterInput = parseInt(document.getElementById('maxIter').value);

    // Definir la función con eval
    const f = (x) => eval(funcInput);

    // Método de Regla Falsa
    function reglaFalsa(f, a, b, tol, maxIter) {
        let c;
        let iter = 0;
        let output = '';

        if (f(a) * f(b) >= 0) {
            output += "El intervalo inicial no cumple f(a) * f(b) < 0\n";
            return output;
        }

        while (iter < maxIter) {
            c = b - (f(b) * (b - a)) / (f(b) - f(a));

            output += `Iteración ${iter + 1}: c = ${c.toFixed(6)}, f(c) = ${f(c).toFixed(6)}\n`;

            if (Math.abs(f(c)) < tol) {
                output += `\nLa raíz es aproximadamente c = ${c.toFixed(6)}\n`;
                output += `Número de iteraciones: ${iter + 1}\n`;
                return output;
            }

            if (f(a) * f(c) < 0) {
                b = c;
            } else {
                a = c;
            }

            iter++;
        }

        output += `El método no converge después de ${maxIter} iteraciones.\n`;
        return output;
    }

    // Calcular y mostrar resultado
    const result = reglaFalsa(f, aInput, bInput, tolInput, maxIterInput);
    document.getElementById('output').textContent = result;
});
