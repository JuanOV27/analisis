document.getElementById('polynomial-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener el polinomio ingresado por el usuario
    const polynomial = document.getElementById('polynomial').value.trim();
    
    try {
        // Convertir el string a un array de coeficientes
        const coefficients = polynomial.split(' ').map(Number);
        
        if (coefficients.some(isNaN)) {
            throw new Error('Por favor, ingresa solo números válidos');
        }

        // Función para obtener los divisores enteros de un número
        function divisors(num) {
            let divs = [];
            for (let i = 1; i <= Math.abs(num); i++) {
                if (num % i === 0) {
                    divs.push(i);
                    if (i !== Math.abs(num) / i) {
                        divs.push(-i); // Agregar divisor negativo
                    }
                }
            }
            return divs;
        }

        // Aplicar el Teorema de las Raíces Racionales para encontrar las raíces posibles
        const leadingCoefficient = coefficients[0]; // Coeficiente principal (mayor grado)
        const constantTerm = coefficients[coefficients.length - 1]; // Término independiente

        // Divisores del término constante y del coeficiente principal
        const possibleNumerators = divisors(constantTerm);
        const possibleDenominators = divisors(leadingCoefficient);

        // Combinar las raíces posibles
        const possibleRoots = [];
        for (let numerator of possibleNumerators) {
            for (let denominator of possibleDenominators) {
                possibleRoots.push(numerator / denominator);
            }
        }

        // Filtrar raíces que realmente son enteras
        const integerRoots = possibleRoots.filter(root => Number.isInteger(root));

        // Mostrar resultados en una tabla
        const resultsElement = document.getElementById('results');
        if (integerRoots.length > 0) {
            let tableHTML = `
                <h3>Raíces Enteras Posibles:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Raíz</th>
                            <th>X₀</th>
                            <th>Xₙ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            integerRoots.forEach((root, index) => {
                tableHTML += `
                    <tr>
                        <td>${root}</td>
                        <td>X${index}</td>
                        <td>X${index+1}</td>
                    </tr>
                `;
            });
            
            tableHTML += `</tbody></table>`;
            resultsElement.innerHTML = tableHTML;
        } else {
            resultsElement.innerHTML = `<h3>No se encontraron raíces enteras.</h3>`;
        }
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
});
