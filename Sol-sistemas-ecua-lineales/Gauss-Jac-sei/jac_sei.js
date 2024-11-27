function parseMatrix(input) {
    return input.trim().split('\n').map(row => row.split(',').map(Number));
}

function parseVector(input) {
    return input.trim().split(',').map(Number);
}

function renderTableHeader(n) {
    let header = '<tr><th>Iteración</th>';
    for (let i = 0; i < n; i++) {
        header += `<th>x<sub>${i + 1}</sub></th>`;
    }
    header += '</tr>';
    return header;
}

function addRowToTable(iteration, values) {
    const tableBody = document.querySelector("#result-table tbody");
    let row = `<tr><td>${iteration}</td>`;
    values.forEach(value => {
        row += `<td>${value.toFixed(6)}</td>`;
    });
    row += '</tr>';
    tableBody.innerHTML += row;
}

function jacobi(A, b, x0, tol, maxIter) {
    const n = b.length;
    let x = [...x0];
    let xNew = Array(n).fill(0);

    document.querySelector("#result-table tbody").innerHTML = ""; 
    document.querySelector("#result-table thead").innerHTML = renderTableHeader(n);

    for (let k = 0; k < maxIter; k++) {
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    sum += A[i][j] * x[j];
                }
            }
            xNew[i] = (b[i] - sum) / A[i][i];
        }

        addRowToTable(k + 1, xNew);

        const diff = xNew.map((xi, idx) => Math.abs(xi - x[idx]));
        if (Math.max(...diff) < tol) {
            return { solution: xNew, iterations: k + 1, converged: true };
        }

        x = [...xNew];
    }

    return { solution: xNew, iterations: maxIter, converged: false };
}

function gaussSeidel(A, b, x0, tol, maxIter) {
    const n = b.length;
    let x = [...x0];

    document.querySelector("#result-table tbody").innerHTML = ""; 
    document.querySelector("#result-table thead").innerHTML = renderTableHeader(n);

    for (let k = 0; k < maxIter; k++) {
        const xOld = [...x];
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    sum += A[i][j] * x[j];
                }
            }
            x[i] = (b[i] - sum) / A[i][i];
        }

        addRowToTable(k + 1, x);

        const diff = x.map((xi, idx) => Math.abs(xi - xOld[idx]));
        if (Math.max(...diff) < tol) {
            return { solution: x, iterations: k + 1, converged: true };
        }
    }

    return { solution: x, iterations: maxIter, converged: false };
}

function solve() {
    const matrixInput = document.getElementById('matrix').value;
    const vectorBInput = document.getElementById('vector-b').value;
    const vectorX0Input = document.getElementById('vector-x0').value;
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIterations = parseInt(document.getElementById('max-iterations').value);
    const method = document.getElementById('method').value;

    try {
        const A = parseMatrix(matrixInput);
        const b = parseVector(vectorBInput);
        const x0 = parseVector(vectorX0Input);

        if (A.length !== b.length || A.some(row => row.length !== A.length)) {
            throw new Error("La matriz A debe ser cuadrada y su tamaño debe coincidir con el vector b.");
        }

        let result;
        if (method === 'jacobi') {
            result = jacobi(A, b, x0, tolerance, maxIterations);
        } else if (method === 'seidel') {
            result = gaussSeidel(A, b, x0, tolerance, maxIterations);
        }

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <p>${result.converged ? "Convergió" : "No convergió"} después de ${result.iterations} iteraciones.</p>
            <p><strong>Solución final:</strong> [${result.solution.map(xi => xi.toFixed(6)).join(', ')}]</p>
        `;

        document.getElementById("result-table").style.display = "table";
    } catch (error) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<p id="error">Error: ${error.message}</p>`;
        document.getElementById("result-table").style.display = "none";
    }
}
