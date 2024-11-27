document.getElementById('bisection-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Inputs
    const func = document.getElementById('function').value;
    const xi = parseFloat(document.getElementById('xi').value);
    const xs = parseFloat(document.getElementById('xs').value);
    const errorMax = parseFloat(document.getElementById('error').value);
    const maxIter = parseInt(document.getElementById('iterations').value);
    const mode = document.getElementById('mode').value;

    const resultsTable = document.querySelector('#results-table tbody');
    resultsTable.innerHTML = ""; // Clear previous results

    let f = math.parse(func).compile(); // Parse the function
    const toRadians = (x) => (mode === 'degrees' ? (x * Math.PI) / 180 : x);

    // Bisection Method Variables
    let a = xi, b = xs, xr, ea = Number.MAX_VALUE, iter = 0;

    // Results Storage
    const results = [];

    while (ea > errorMax && iter < maxIter) {
        const fa = f.evaluate({ x: toRadians(a) });
        const fb = f.evaluate({ x: toRadians(b) });
        xr = (a + b) / 2;
        const fr = f.evaluate({ x: toRadians(xr) });

        if (fa * fr < 0) {
            b = xr;
        } else {
            a = xr;
        }

        ea = iter === 0 ? Number.MAX_VALUE : Math.abs(xr - results[iter - 1].xr);
        results.push({ iter: iter + 1, xi: a, xs: b, xr, fa, fb, fr, ea });
        iter++;
    }

    // Fill Table
    results.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.iter}</td>
            <td>${row.xi.toFixed(6)}</td>
            <td>${row.xs.toFixed(6)}</td>
            <td>${row.xr.toFixed(6)}</td>
            <td>${row.fa.toFixed(6)}</td>
            <td>${row.fb.toFixed(6)}</td>
            <td>${row.fr.toFixed(6)}</td>
            <td>${row.ea.toFixed(6)}</td>
        `;
        resultsTable.appendChild(tr);
    });

    // Generate Graph
    const ctx = document.getElementById('function-graph').getContext('2d');
    const points = Array.from({ length: 100 }, (_, i) => {
        const x = a + (b - a) * (i / 99);
        return { x, y: f.evaluate({ x: toRadians(x) }) };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'f(x)',
                data: points.map(p => ({ x: p.x, y: p.y })),
                borderColor: 'blue',
                fill: false,
            }]
        },
        options: {
            scales: {
                x: { type: 'linear', title: { display: true, text: 'x' } },
                y: { title: { display: true, text: 'f(x)' } }
            }
        }
    });
});
