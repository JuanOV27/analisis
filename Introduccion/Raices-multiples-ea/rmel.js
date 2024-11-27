document.getElementById('polynomial-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const input = document.getElementById('polynomial').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpiar resultados previos

  try {
      // Convertir la entrada en un array de coeficientes
      const coefficients = input.split(' ').map(Number);

      // Verificar que los coeficientes sean válidos
      if (coefficients.some(isNaN)) {
          throw new Error('Ingresa solo números separados por espacios.');
      }

      // Encontrar raíces exactas y calcular sus multiplicidades
      const rootsWithMultiplicity = calculateRootsWithMultiplicity(coefficients);

      // Mostrar resultados
      resultsDiv.innerHTML = rootsWithMultiplicity
          .map(({ root, multiplicity }) => `Raíz: ${math.round(root, 5)}, Multiplicidad: ${multiplicity}`)
          .join('<br>');
  } catch (error) {
      resultsDiv.textContent = error.message || 'Error al procesar el polinomio. Asegúrate de ingresarlo correctamente.';
  }
});

// Función para calcular raíces exactas y sus multiplicidades
function calculateRootsWithMultiplicity(coefficients) {
  const roots = [];
  let currentCoefficients = coefficients.slice();

  while (currentCoefficients.length > 1) {
      // Buscar una raíz exacta entre los divisores del coeficiente constante
      const constant = currentCoefficients[currentCoefficients.length - 1];
      const leading = currentCoefficients[0];
      const possibleRoots = findPossibleRoots(constant, leading);

      let foundRoot = null;
      for (const candidate of possibleRoots) {
          if (Math.abs(evaluatePolynomial(currentCoefficients, candidate)) < 1e-5) {
              foundRoot = candidate;
              break;
          }
      }

      if (foundRoot === null) break; // No hay más raíces exactas

      // Calcular la multiplicidad de la raíz
      let multiplicity = 0;
      while (currentCoefficients.length > 1) {
          const valueAtRoot = evaluatePolynomial(currentCoefficients, foundRoot);
          if (Math.abs(valueAtRoot) < 1e-5) {
              multiplicity++;
              currentCoefficients = syntheticDivision(currentCoefficients, foundRoot);
          } else {
              break;
          }
      }

      roots.push({ root: foundRoot, multiplicity });
  }

  return roots;
}

// Encontrar posibles raíces utilizando divisores del coeficiente constante y principal
function findPossibleRoots(constant, leading) {
  const constantFactors = findFactors(Math.abs(constant));
  const leadingFactors = findFactors(Math.abs(leading));
  const possibleRoots = [];

  constantFactors.forEach(c => {
      leadingFactors.forEach(l => {
          possibleRoots.push(c / l, -c / l);
      });
  });

  return [...new Set(possibleRoots)]; // Eliminar duplicados
}

// Encontrar divisores enteros de un número
function findFactors(num) {
  const factors = [];
  for (let i = 1; i <= num; i++) {
      if (num % i === 0) factors.push(i);
  }
  return factors;
}

// Evaluar un polinomio dado sus coeficientes y un valor
function evaluatePolynomial(coefficients, x) {
  return coefficients.reduce((acc, coef, index) => acc + coef * Math.pow(x, coefficients.length - index - 1), 0);
}

// Realizar división sintética para eliminar una raíz
function syntheticDivision(coefficients, root) {
  const result = [];
  let carry = 0;

  for (const coef of coefficients) {
      const value = coef + carry;
      result.push(value);
      carry = value * root;
  }

  result.pop(); // Eliminar el último término (resto)
  return result;
}
